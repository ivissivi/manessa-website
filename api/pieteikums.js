const { Resend } = require('resend');

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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX.email;
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

    if (!name)               errors.name  = 'Vārds ir obligāts.';
    if (!phone)              errors.phone = 'Tālrunis ir obligāts.';
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

async function sendViaResend({ name, phone, email, service, kadastrs, message }) {
    const apiKey = process.env.RESEND_API_KEY;
    const to     = process.env.CONTACT_TO_EMAIL;
    const from   = process.env.CONTACT_FROM_EMAIL || 'Manessa <info@manessa.lv>';

    if (!apiKey || !to) {
        const err = new Error('Resend is not configured');
        err.code = 'NOT_CONFIGURED';
        throw err;
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from,
        to,
        replyTo: email || undefined,
        subject: `Pieteikums: ${service} - ${name}`,
        text: buildEmailText({ name, phone, email, service, kadastrs, message }),
    });

    if (error) {
        const err = new Error(error.message || 'Resend error');
        err.resendError = error;
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
        await sendViaResend(result.data);
        return json(res, 200, { ok: true, message: 'Paldies! Jūsu pieteikums ir nosūtīts.' });
    } catch (err) {
        console.error('[pieteikums]', err.message, err.resendError || err.code || '');

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
