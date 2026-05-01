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
manessa_website/
├── index.html          # galvenā lapa (Latvian)
├── css/styles.css      # stili ar Manessa krāsu paleti
├── js/script.js        # animācijas, scroll reveal, skaitītāji, mobilā nav.
├── assets/logo.png     # uzņēmuma logo
└── README.md
```

## Sadaļas

1. **Hero** — galvenais banneris ar saukli un statistiku
2. **Par mums** — uzņēmuma stāsts un priekšrocības
3. **Pakalpojumi** — 6 mežsaimniecības pakalpojumu kartiņas
4. **Process** — 4 soļu sadarbības process
5. **Statistika** — animēti skaitītāji (hektāri, klienti, stādi)
6. **Projekti** — portfolio režģis ar nesen paveiktiem darbiem
7. **Atsauksme** — meža īpašnieka citāts
8. **Kontakti** — kontaktinformācija + pieteikuma forma
9. **Footer** — UR rekvizīti un ātrās saites

## Palaišana

Atver `index.html` pārlūkprogrammā vai palaid jebkuru statisko serveri:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Pēc tam atver `http://localhost:8000`.

## Tehnoloģijas

- HTML5, CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (IntersectionObserver, requestAnimationFrame)
- Google Fonts: Inter + Cormorant Garamond
- Unsplash attēli (placeholder; aizstājiet ar reāliem mežu attēliem)

## Pielāgojumi

- Tālrunis, e-pasts un tīkla saites: meklē `+371 2000 0000`, `info@manessa.lv` failā `index.html`
- Krāsas: maini CSS mainīgos `:root` blokā failā `css/styles.css`
- Saturs: visas tekstuālās vērtības atrodas tieši `index.html` (vienkārši rediģējams)
