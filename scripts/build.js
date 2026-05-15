/**
 * Builds static HTML pages from partials + page content.
 * Run: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const partials = (name) => fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8');
const pageContent = (name) => fs.readFileSync(path.join(ROOT, 'pages', name), 'utf8');

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

for (const page of PAGES) {
    const html =
        renderHead(page) +
        header +
        '\n    <main class="page-main" id="top">\n' +
        pageContent(page.content) +
        '\n    </main>\n\n' +
        footer;

    const outPath = path.join(ROOT, page.out);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log('Built', page.out);
}

console.log('Done —', PAGES.length, 'pages');
