/**
 * POST /api/pieteikums — pieteikuma formas apstrāde (Vercel serverless).
 *
 * E-pasts: Microsoft 365 / Outlook SMTP (smtp.office365.com)
 *
 * Env (Vercel → Settings → Environment Variables):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (neobligāti — noklus. SMTP_USER)
 *   SITE_URL — origin pārbaudei
 *
 * CSP (vēlāk): connect-src 'self' (šis endpoints).
 */

const nodemailer = require('nodemailer');

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

    if (!origin) {
        return Boolean(host);
    }

    if (siteUrl && origin === siteUrl) {
        return true;
    }

    if (host) {
        const httpsHost = `https://${host}`;
        if (origin === httpsHost || origin === `http://${host}`) {
            return true;
        }
    }

    if (process.env.VERCEL_ENV === 'preview' && origin.includes('.vercel.app')) {
        return true;
    }

    return false;
}

function normalizeString(value, maxLen) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().slice(0, maxLen);
}

function isValidEmail(value) {
    if (!value) {
        return true;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX.email;
}

function validatePayload(body) {
    const errors = {};

    if (body && body.website) {
        return { ok: false, spam: true };
    }

    const name = normalizeString(body?.name, MAX.name);
    const phone = normalizeString(body?.phone, MAX.phone);
    const email = normalizeString(body?.email, MAX.email);
    const service = normalizeString(body?.service, 80);
    const message = normalizeString(body?.message, MAX.message);

    if (!name) {
        errors.name = 'Vārds ir obligāts.';
    }
    if (!phone) {
        errors.phone = 'Tālrunis ir obligāts.';
    }
    if (!isValidEmail(email)) {
        errors.email = 'Nepareizs e-pasta formāts.';
    }
    if (service && !SERVICES.includes(service)) {
        errors.service = 'Nepareizs pakalpojums.';
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        data: {
            name,
            phone,
            email,
            service: service || SERVICES[0],
            message,
        },
    };
}

function buildEmailText({ name, phone, email, service, message }) {
    const lines = [
        'Jauns pieteikums no manessa.lv',
        '',
        `Vārds: ${name}`,
        `Tālrunis: ${phone}`,
        `E-pasts: ${email || '—'}`,
        `Pakalpojums: ${service}`,
        '',
        'Ziņa:',
        message || '—',
    ];
    return lines.join('\n');
}

function getSmtpConfig() {
    const host = process.env.SMTP_HOST || 'smtp.office365.com';
    const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.CONTACT_TO_EMAIL || user;
    const from = process.env.CONTACT_FROM_EMAIL || user;

    return { host, port, user, pass, to, from };
}

async function sendViaOutlookSmtp({ name, phone, email, service, message }) {
    const { host, port, user, pass, to, from } = getSmtpConfig();

    if (!user || !pass || !to || !from) {
        const err = new Error('SMTP is not configured');
        err.code = 'NOT_CONFIGURED';
        throw err;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        requireTLS: port === 587,
    });

    await transporter.sendMail({
        from: from.includes('<') ? from : `Manessa <${from}>`,
        to,
        replyTo: email || undefined,
        subject: `Pieteikums: ${service} — ${name}`,
        text: buildEmailText({ name, phone, email, service, message }),
    });
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
        if (result.spam) {
            return json(res, 200, { ok: true, message: 'Paldies! Drīz sazināsimies.' });
        }
        return json(res, 400, { ok: false, errors: result.errors });
    }

    try {
        await sendViaOutlookSmtp(result.data);
        return json(res, 200, {
            ok: true,
            message: 'Paldies! Jūsu pieteikums ir nosūtīts.',
        });
    } catch (err) {
        console.error('[pieteikums]', err.message, err.response || err.code || '');

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
