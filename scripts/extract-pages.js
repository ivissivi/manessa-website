/** One-time helper: extract sections from monolithic index into pages/*.html */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function between(startMarker, endMarker) {
    const start = src.indexOf(startMarker);
    const end = src.indexOf(endMarker, start);
    if (start === -1 || end === -1) throw new Error('Marker not found: ' + startMarker);
    let chunk = src.slice(start, end).trim();
    chunk = chunk.replace(/^\s*<!--[^>]+-->\s*/m, '');
    const lines = chunk.split('\n');
    if (lines[0].trim().startsWith('<section')) {
        lines[0] = '        ' + lines[0].trim();
    }
    return lines.map((l, i) => (i === 0 ? l : '        ' + l.trimStart())).join('\n').trimEnd();
}

const map = {
    'par-mums.html': ['<!-- About -->', '<!-- Services -->'],
    'pakalpojumi.html': ['<!-- Services -->', '<!-- Process -->'],
    'process.html': ['<!-- Process -->', '<!-- Team -->'],
    'komanda.html': ['<!-- Team -->', '<!-- Stats / Counter -->'],
    'projekti.html': ['<!-- Projects -->', '<!-- Testimonial -->', '<!-- Suvenīri'],
    'suveniri.html': ['<!-- Suvenīri', '<!-- Contact -->'],
    'kontakti.html': ['<!-- Contact -->', '<!-- Footer -->'],
};

for (const [file, markers] of Object.entries(map)) {
    let content;
    if (markers.length === 3) {
        const a = between(markers[0], markers[1]);
        const b = between(markers[1], markers[2]);
        content = a + '\n\n        ' + b.trimStart();
    } else {
        content = between(markers[0], markers[1]);
    }
    content = content
        .replace(/href="#services"/g, 'href="/pakalpojumi"')
        .replace(/href="#contact"/g, 'href="/kontakti"')
        .replace(/href="#about"/g, 'href="/par-mums"');
    fs.writeFileSync(path.join(ROOT, 'pages', file), content + '\n');
    console.log('Extracted', file);
}
