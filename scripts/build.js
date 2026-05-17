/**
 * Builds static HTML pages from partials + page content.
 * Writes deployable site to public/ (Vercel outputDirectory).
 * Run: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

/** Production URL — set SITE_URL in Vercel env if the domain differs */
const SITE_URL = (process.env.SITE_URL || 'https://www.manessa.lv').replace(/\/$/, '');

const partials = (name) => fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8');
const pageContent = (name) => fs.readFileSync(path.join(ROOT, 'pages', name), 'utf8');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
}

function copyFileIfExists(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

const PAGES = [
    {
        out: 'index.html',
        pageId: 'home',
        bodyClass: 'page-home',
        title: 'Manessa - meža apsaimniekošana Latvijā',
        description:
            'SIA Manessa - profesionāla meža apsaimniekošana, mežizstrāde, cirsmu iegāde un kokmateriālu sagatavošana Siguldā un visā Latvijā.',
        content: 'home.html',
    },
    {
        out: 'par-mums.html',
        pageId: 'about',
        bodyClass: 'page-inner',
        title: 'Par mums | Manessa',
        description: 'Par SIA Manessa - Siguldas mežsaimniecības uzņēmums Vidzemē un Latgalē.',
        content: 'par-mums.html',
    },
    {
        out: 'pakalpojumi.html',
        pageId: 'services',
        bodyClass: 'page-inner',
        title: 'Pakalpojumi | Manessa',
        description: 'Mežizstrāde, cirsmu iegāde, meža atjaunošana, transports un konsultācijas.',
        content: 'pakalpojumi.html',
    },
    {
        out: 'process.html',
        pageId: 'process',
        bodyClass: 'page-inner',
        title: 'Darba process | Manessa',
        description: 'Četri soļi sadarbībai ar Manessa - no apskates līdz meža atjaunošanai.',
        content: 'process.html',
    },
    {
        out: 'projekti.html',
        pageId: 'projects',
        bodyClass: 'page-inner',
        title: 'Projekti | Manessa',
        description: 'Nesen paveiktie mežizstrādes un atjaunošanas projekti Vidzemē un Latgalē.',
        content: 'projekti.html',
    },
    {
        out: 'suveniri.html',
        pageId: 'suveniri',
        bodyClass: 'page-inner',
        title: 'Suvenīri | Manessa',
        description: 'Koka dēlīši un suvenīri no Manessa - drīzumā pieejami.',
        content: 'suveniri.html',
    },
    {
        out: 'pieteikt-cirsmu.html',
        pageId: 'apply',
        bodyClass: 'page-inner',
        title: 'Pieteikt cirsmu | Manessa',
        description:
            'Iesniedziet pieteikumu ciršanai vai konsultācijai - SIA Manessa Siguldā un visā Latvijā.',
        content: 'pieteikt-cirsmu.html',
    },
    {
        out: 'kontakti.html',
        pageId: 'contact',
        bodyClass: 'page-inner',
        title: 'Kontakti | Manessa',
        description:
            'Manessa komanda, kontaktinformācija un uzņēmuma rekvizīti - Siguldā un visā Latvijā.',
        content: 'kontakti.html',
    },
];

/** Public routes for sitemap (matches cleanUrls + nav; excludes redirects) */
const SITEMAP_ROUTES = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/par-mums', changefreq: 'monthly', priority: '0.9' },
    { path: '/pakalpojumi', changefreq: 'monthly', priority: '0.9' },
    { path: '/process', changefreq: 'monthly', priority: '0.8' },
    { path: '/projekti', changefreq: 'weekly', priority: '0.8' },
    { path: '/pieteikt-cirsmu', changefreq: 'monthly', priority: '0.8' },
    { path: '/kontakti', changefreq: 'monthly', priority: '0.8' },
    { path: '/suveniri', changefreq: 'monthly', priority: '0.6' },
];

function writeRobotsTxt() {
    const content = `User-agent: *
Allow: /

# Redirect-only legacy page
Disallow: /sazinies.html

Sitemap: ${SITE_URL}/sitemap.xml
`;
    return content;
}

function writeSitemapXml() {
    const lastmod = new Date().toISOString().slice(0, 10);
    const urlEntries = SITEMAP_ROUTES.map(
        ({ path: routePath, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${routePath === '/' ? '/' : routePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

function renderHead({ title, description, pageId, bodyClass }) {
    return partials('head.html')
        .replace('{{title}}', title)
        .replace('{{description}}', description)
        .replace('{{pageId}}', pageId)
        .replace('{{bodyClass}}', bodyClass);
}

const header = partials('header.html');
const footer = partials('footer.html');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

['css', 'js', 'assets', 'images'].forEach((dir) => {
    copyDir(path.join(ROOT, dir), path.join(OUT, dir));
});

['favicon.ico', 'sazinies.html', 'logo.png'].forEach((file) => {
    copyFileIfExists(path.join(ROOT, file), path.join(OUT, file));
});

for (const page of PAGES) {
    const html =
        renderHead(page) +
        header +
        '\n    <main class="page-main" id="top">\n' +
        pageContent(page.content) +
        '\n    </main>\n\n' +
        footer;

    const outPublic = path.join(OUT, page.out);
    const outRoot = path.join(ROOT, page.out);
    fs.writeFileSync(outPublic, html, 'utf8');
    fs.writeFileSync(outRoot, html, 'utf8');
    console.log('Built', page.out, '→ public/ + repo root');
}

const robotsTxt = writeRobotsTxt();
const sitemapXml = writeSitemapXml();
for (const name of ['robots.txt', 'sitemap.xml']) {
    const body = name === 'robots.txt' ? robotsTxt : sitemapXml;
    fs.writeFileSync(path.join(OUT, name), body, 'utf8');
    fs.writeFileSync(path.join(ROOT, name), body, 'utf8');
}
console.log('Built robots.txt + sitemap.xml → public/ + repo root');

const notFound = {
    out: '404.html',
    pageId: '404',
    bodyClass: 'page-inner page-404',
    title: 'Lapa nav atrasta | Manessa',
    description: 'Pieprasītā lapa netika atrasta. Atgriezieties Manessa sākumlapā vai sazinieties ar mums.',
    content: '404.html',
};

const notFoundHtml =
    renderHead(notFound).replace(
        '</head>',
        '    <meta name="robots" content="noindex, nofollow" />\n</head>'
    ) +
    header +
    '\n    <main class="page-main" id="top">\n' +
    pageContent(notFound.content) +
    '\n    </main>\n\n' +
    footer;

for (const base of [OUT, ROOT]) {
    fs.writeFileSync(path.join(base, notFound.out), notFoundHtml, 'utf8');
}
console.log('Built', notFound.out, '→ public/ + repo root');

console.log('Done -', PAGES.length, 'pages + 404 →', path.relative(ROOT, OUT));
