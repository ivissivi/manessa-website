/**
 * Builds static HTML pages from partials + page content.
 * Writes deployable site to public/ (Vercel outputDirectory).
 * Run: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public');

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
        out: 'pieteikt-cirsmai.html',
        pageId: 'apply',
        bodyClass: 'page-inner',
        title: 'Pieteikt cirsmu | Manessa',
        description:
            'Iesniedziet pieteikumu ciršanai vai konsultācijai — SIA Manessa Siguldā un visā Latvijā.',
        content: 'pieteikt-cirsmai.html',
    },
    {
        out: 'kontakti.html',
        pageId: 'contact',
        bodyClass: 'page-inner',
        title: 'Kontakti | Manessa',
        description:
            'Manessa komanda, kontaktinformācija un uzņēmuma rekvizīti — Siguldā un visā Latvijā.',
        content: 'kontakti.html',
    },
];

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

console.log('Done —', PAGES.length, 'pages →', path.relative(ROOT, OUT));
