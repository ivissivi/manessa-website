# Manessa — mājaslapa

Statiska mājaslapa SIA "Manessa" (reģ. nr. 40203720328) — Siguldas mežizstrādes uzņēmumam.

## Struktūra

Katra lapa ir viens pašpietiekams `.html` fails saknes mapē. Nav build soļa, nav `pages/`/`partials/` mapju.

```
manessa-website/
├── index.html                  # /
├── par-mums.html               # /par-mums
├── pakalpojumi.html            # /pakalpojumi
├── process.html                # /process
├── projekti.html               # /projekti
├── pieteikt-cirsmu.html        # /pieteikt-cirsmu
├── kontakti.html               # /kontakti
├── suveniri.html               # /suveniri
├── privatuma-politika.html     # /privatuma-politika
├── lietotaju-noteikumi.html    # /lietotaju-noteikumi
├── 404.html                    # kļūdas lapa
├── sazinies.html               # legacy redirect → /pieteikt-cirsmu
├── css/styles.css
├── js/script.js
├── assets/                     # logo.png, es-ngeu-nap-logo.png
├── images/
├── api/pieteikums.js           # Vercel serverless — formas iesniegšana
└── scripts/server.js           # lokālais dev serveris
```

## Lokālā izstrāde

```bash
npm run dev     # palaiž http://localhost:3000
```

Serveris atbalsta tīras URL adreses (`/par-mums` → `par-mums.html`). Saglabā failu — pārlādē pārlūku, izmaiņas uzreiz redzamas.

## Lapas rediģēšana

Katrs `.html` fails satur visu: `<head>`, navigāciju, saturu un footer. Vienkārši atver failu un rediģē.

**Ja maini navigāciju vai footer** — tie ir katrā failā atsevišķi. Izmanto VS Code **Find & Replace across files** (`Ctrl+Shift+H`), lai mainītu visās lapās uzreiz.

## Izvietošana (Vercel)

Vercel kalpo tieši no saknes mapes — nav build komandas, nav `outputDirectory`. Konfigurācija: `vercel.json`.

## Pagaidu sekcijas (drīzumā)

Divās lapās saturs pagaidām aizstāts ar "Drīzumā" bloku. Vecais HTML ir izkomenēts — lai atjaunotu, izņem `<!-- -->` un dzēš `.coming-soon-block`:

**`process.html`** — process soļi izkomenēti, redzams tikai "Drīzumā" bloks.

**`projekti.html`** — projektu galerija un atsauksmes izkomenētas, redzams tikai "Drīzumā" bloks.

## Krāsu palete

| Krāsa           | HEX       | Pielietojums                            |
|-----------------|-----------|-----------------------------------------|
| Piparmētru zaļā | `#6FC9B5` | Akcenti, pogas, ikonas, "accent" teksts |
| Smilškrāsa      | `#C9B59A` | Sekundārie akcenti                      |
| Tumši brūnā     | `#3D332E` | Pamatteksts, navigācija, footer         |
| Krēms           | `#FAF7F2` | Pamatfons                               |

Maini CSS mainīgos `:root` blokā failā `css/styles.css`.

## Tehnoloģijas

- HTML5, CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (IntersectionObserver, scroll efekti, forma)
- Google Fonts: Josefin Sans
- Vercel serverless (`api/pieteikums.js`) — pieteikuma formas iesniegšana uz e-pastu
