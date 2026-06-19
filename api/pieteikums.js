const SERVICES = [
    'Mežizstrāde',
    'Cirsmas pārdošana',
    'Meža atjaunošana',
    'Konsultācija',
    'Cits',
];

const MAX = {
    name: 200,
    phone: 50,
    email: 254,
    kadastrs: 14,
    message: 5000,
};

function json(res, status, body) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(status).json(body);
}

function isAllowedRequest(req) {
    const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
    const origin = req.headers.origin;
    const host = req.headers.host;

    if (!origin) return Boolean(host);
    if (siteUrl && origin === siteUrl) return true;
    if (host) {
        if (origin === `https://${host}` || origin === `http://${host}`) return true;
    }
    if (process.env.VERCEL_ENV === 'preview' && origin.includes('.vercel.app')) return true;
    return false;
}

function normalizeString(value, maxLen) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLen);
}

function isValidEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= MAX.email;
}

function isValidPhone(value) {
    if (!/^[\d\s+()-]+$/.test(value)) return false;
    return value.replace(/\D/g, '').length >= 1;
}

function validatePayload(body) {
    const errors = {};

    if (body && body.website) return { ok: false, spam: true };

    const name     = normalizeString(body?.name,     MAX.name);
    const phone    = normalizeString(body?.phone,    MAX.phone);
    const email    = normalizeString(body?.email,    MAX.email);
    const service  = normalizeString(body?.service,  80);
    const kadastrs = normalizeString(body?.kadastrs, MAX.kadastrs);
    const message  = normalizeString(body?.message,  MAX.message);

    if (!name)                errors.name  = 'Vārds ir obligāts.';
    if (!phone)               errors.phone = 'Tālrunis ir obligāts.';
    else if (!isValidPhone(phone)) errors.phone = 'Nederīgs tālruņa numurs (tikai cipari).';
    if (!isValidEmail(email)) errors.email = 'Nepareizs e-pasta formāts.';
    if (service && !SERVICES.includes(service)) errors.service = 'Nepareizs pakalpojums.';

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        data: { name, phone, email, service: service || SERVICES[0], kadastrs, message },
    };
}

function buildEmailText({ name, phone, email, service, kadastrs, message }) {
    return [
        'Jauns pieteikums no manessa.lv',
        '',
        `Vārds: ${name}`,
        `Tālrunis: ${phone}`,
        `E-pasts: ${email || '-'}`,
        `Pakalpojums: ${service}`,
        `Kadastra apzīmējums: ${kadastrs || '-'}`,
        '',
        'Ziņa:',
        message || '-',
    ].join('\n');
}

function parseSender(value) {
    // Accepts "Name <email@domain>" or plain "email@domain"
    const match = /^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/.exec(value);
    if (match) return { name: match[1] || 'Manessa', email: match[2] };
    return { name: 'Manessa', email: value.trim() };
}

async function sendViaBrevo({ name, phone, email, service, kadastrs, message }) {
    const apiKey = process.env.BREVO_API_KEY;
    const to     = process.env.CONTACT_TO_EMAIL;
    const sender = parseSender(process.env.CONTACT_FROM_EMAIL || 'Manessa <info@manessa.lv>');

    if (!apiKey || !to) {
        const err = new Error('Brevo is not configured');
        err.code = 'NOT_CONFIGURED';
        throw err;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            sender,
            to: [{ email: to }],
            replyTo: email ? { email } : undefined,
            subject: `Pieteikums: ${service} - ${name}`,
            textContent: buildEmailText({ name, phone, email, service, kadastrs, message }),
        }),
    });

    if (!response.ok) {
        let detail = '';
        try { detail = JSON.stringify(await response.json()); } catch { detail = await response.text().catch(() => ''); }
        const err = new Error(`Brevo error ${response.status}`);
        err.brevoError = detail;
        throw err;
    }
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return json(res, 405, { ok: false, error: 'Method not allowed' });
    }

    if (!isAllowedRequest(req)) {
        return json(res, 403, { ok: false, error: 'Forbidden' });
    }

    const result = validatePayload(req.body);

    if (!result.ok) {
        if (result.spam) return json(res, 200, { ok: true, message: 'Paldies! Drīz sazināsimies.' });
        return json(res, 400, { ok: false, errors: result.errors });
    }

    try {
        await sendViaBrevo(result.data);
        return json(res, 200, { ok: true, message: 'Paldies! Jūsu pieteikums ir nosūtīts.' });
    } catch (err) {
        console.error('[pieteikums]', err.message, err.brevoError || err.code || '');

        if (err.code === 'NOT_CONFIGURED') {
            return json(res, 503, {
                ok: false,
                error: 'Forma īslaicīgi nav pieejama. Lūdzu zvaniet vai rakstiet uz e-pastu.',
            });
        }

        return json(res, 502, {
            ok: false,
            error: 'Neizdevās nosūtīt pieteikumu. Mēģiniet vēlāk vai sazinieties tieši.',
        });
    }
};
