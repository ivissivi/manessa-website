# Manessa — meža apsaimniekošanas portfolio mājaslapa

Statiska, viena lapas mājaslapa SIA "Manessa" (reģ. nr. 40203720328) — Siguldas mežizstrādes uzņēmumam.

## Krāsu palete (no logo)

| Krāsa            | HEX       | Pielietojums                          |
| ---------------- | --------- | ------------------------------------- |
| Piparmētru zaļā  | `#6FC9B5` | Akcenti, pogas, ikonas, „accent" teksts |
| Smilškrāsa       | `#C9B59A` | Sekundārie akcenti, fons              |
| Tumši brūnā      | `#3D332E` | Pamatteksts, navigācija, footer       |
| Krēms            | `#FAF7F2` | Pamatfons                             |

## Struktūra

```
manessa-website/
├── index.html              # sākums (hero + statistika)
├── par-mums.html           # /par-mums
├── pakalpojumi.html        # /pakalpojumi
├── process.html            # /process
├── komanda.html            # /komanda
├── projekti.html           # /projekti
├── suveniri.html           # /suveniri
├── kontakti.html           # /kontakti
├── partials/               # kopīgais header/footer (build avots)
├── pages/                  # lapu saturs (build avots)
├── scripts/build.js        # ģenerē HTML no partials + pages
├── css/styles.css
├── js/script.js
└── assets/logo.png
```

## Maršruti

| URL | Lapa |
|-----|------|
| `/` | Sākums |
| `/par-mums` | Par mums |
| `/pakalpojumi` | Pakalpojumi |
| `/process` | Darba process |
| `/komanda` | Komanda |
| `/projekti` | Projekti + atsauksme |
| `/suveniri` | Suvenīri |
| `/kontakti` | Kontakti |

## Palaišana

```bash
npm run build   # pēc izmaiņām partials/ vai pages/
npm run dev     # http://localhost:3000
```

Vai: `npx serve .` pēc `npm run build`.

## Tehnoloģijas

- HTML5, CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (IntersectionObserver, requestAnimationFrame)
- Google Fonts: Inter + Cormorant Garamond
- Unsplash attēli (placeholder; aizstājiet ar reāliem mežu attēliem)

## Pielāgojumi

- Tālrunis, e-pasts un tīkla saites: meklē `+371 2000 0000`, `matiss@manessa.lv` failā `index.html`
- Krāsas: maini CSS mainīgos `:root` blokā failā `css/styles.css`
- Saturs: visas tekstuālās vērtības atrodas tieši `index.html` (vienkārši rediģējams)
