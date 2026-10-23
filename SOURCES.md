# Source register

Checked 22 October 2026. Every row records what was opened, what it showed and what the site uses it for. The 42 rows in `data/sample42.csv` are the authority for every number in the explorer.

| ID | What it is | Exact URL / DOI | Publisher | Version or vintage | Access date | Licence | Used for | Status |
|---|---|---|---|---|---|---|---|---|
| S1 | GDP per capita, PPP (constant 2021 international $), indicator `NY.GDP.PCAP.PP.KD` | https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD | World Bank | WDI, last updated 8 October 2026; 2019 observations | 22 Oct 2026 | CC BY 4.0 | `gdp_pc_ppp` for all 42 rows; income ratios, models, inverse, sensitivity | Verified. Indicator page HTTP 200. Every row has a country/year API URL. `scripts/verify-data.ts` re-downloads all values. |
| S2 | Life expectancy at birth, total (years), indicator `SP.DYN.LE00.IN` | https://data.worldbank.org/indicator/SP.DYN.LE00.IN | World Bank | WDI, last updated 8 October 2026; 2019 observations | 22 Oct 2026 | CC BY 4.0 | `life_exp` for all 42 rows; models, gap, inverse, sensitivity | Verified. Indicator page HTTP 200 with a browser user agent. Singapore API query returned 83.5951219512195 for 2019. `scripts/verify-data.ts` re-downloads all values. |
| S3 | World Bank country and lending groups, current classification | https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups | World Bank | FY2027, July 2026 | 22 Oct 2026 | CC BY 4.0 | `income_group` today; box-plot toggle; four-group counts | Verified. HTTP 200. All 42 labels match the current API classification. |
| S4 | Historical classification of countries by income (`OGHIST.xlsx`) | https://ddh-openapi.worldbank.org/resources/DR0095334/download | World Bank | FY2020 column `AH` is July 2019; FY2027 column `AO` is July 2026 | 22 Oct 2026 | CC BY 4.0 | `income_group_2019`; the 2019 comparison; list of changed countries | Verified. Workbook downloaded (HTTP 200) and read locally. Four sample countries changed: Nepal (Low to Lower middle); Indonesia, the Philippines and Vietnam (Lower middle to Upper middle). |
| S5 | Preston, S. H. (1975). The changing relation between mortality and level of economic development. *Population Studies*, 29(2), 231–248 | https://doi.org/10.1080/00324728.1975.10410201 | Taylor & Francis for the Population Investigation Committee | Volume 29, issue 2, July 1975, pages 231–248 | 22 Oct 2026 | Publisher copyright; citation only | The sentence that Preston described a concave mortality–income relationship that shifts upward over time, and the connection to the logarithmic model | Metadata verified through the Crossref API: title, author, journal, volume, issue, pages and DOI all match. DOI resolves to the publisher page. Crossref record accessed 22 Oct 2026. |
| S6 | NASA Blue Marble: Next Generation, December 2004, topography and bathymetry | https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x21600x10800.jpg | NASA Earth Observatory | File `world.topo.bathy.200412.3x21600x10800.jpg`, December 2004, 21,600 × 10,800, with topography and bathymetry; rendered at 8192 × 4096, 4096 × 2048 and 2048 × 1024 | 22 Oct 2026 | Public domain (NASA); attribution shown | Globe basemap only. Not a 2019 data layer. | Verified. Master file HTTP 200 at 21,600 × 10,800; rendered locally at 8K, 4K and 2K. Credit: “NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation”. |
| S7 | Natural Earth, Admin 0 – Countries, 1:110m | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ | Natural Earth | Admin 0 Countries, 1:110m; shipped through `world-atlas` `countries-110m.json` | 22 Oct 2026 | Public domain | Thin country borders on the globe | Verified. Dataset page HTTP 200; terms page HTTP 200. The exact Natural Earth point release is not printed by `world-atlas`, so the site names the dataset and scale rather than inventing a version. |
| S8 | Natural Earth, Populated Places, 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/ | Natural Earth | 1:10m populated places, capital-city points | 22 Oct 2026 | Public domain | Approximate capital-city `lat` and `lon` for globe placement | Verified. Page HTTP 200. Coordinates are approximate and are not World Bank country-endpoint coordinates. They do not enter the regression. |
| S9 | Blas, E., Sivasankara Kurup, A., & World Health Organization. (2010). *Equity, social determinants and public health programmes* | https://iris.who.int/handle/10665/44289 | World Health Organization | WHO IRIS record, 2010, ISBN 9789241563970 | 22 Oct 2026 | WHO IRIS terms; citation only | The statement that health spending, education, conflict and disease also matter | Verified. IRIS page HTTP 200 and returned the full citation. The old `who.int/health-topics/social-determinants-of-health` URL returned HTTP 403 to automated clients, so it was replaced by the stable IRIS record. |
| S10 | Our World in Data, life expectancy vs GDP per capita grapher | https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita | Our World in Data | Current grapher, accessed 22 Oct 2026 | 22 Oct 2026 | CC BY 4.0 | Background reading and visual sanity check only; listed under “Further reading”, not used in a calculation | Verified. HTTP 200. Not a source for any number on the site. |
| S11 | Software and typefaces shipped | three.js https://threejs.org/ · react-three-fiber https://docs.pmnd.rs/react-three-fiber · D3 https://d3js.org/ · Instrument Sans https://fonts.google.com/specimen/Instrument+Sans · Lucide https://lucide.dev/ | Three.js authors, Poimandres, Mike Bostock, Instrument Sans authors, Lucide contributors | Versions pinned in `package.json` and `package-lock.json` | 22 Oct 2026 | MIT (three.js, react-three-fiber, drei, Lucide); ISC (D3); SIL OFL 1.1 (Instrument Sans) | Credits block | Verified from the package metadata and each project’s licence page. KaTeX is **not** bundled and is not credited as shipped software; see `DECISIONS.md`. |
| S12 | Font and icon licences | https://openfontlicense.org/ · https://lucide.dev/license | SIL / Lucide | OFL 1.1; ISC | 22 Oct 2026 | OFL 1.1; ISC | Instrument Sans and Lucide attribution | Verified. Both licences permit embedding and redistribution with attribution. |

## Texture provenance

The five old textures (`earth-day.jpg`, `earth-specular.jpg`, `earth-normal.jpg`, `earth-clouds.png`, `earth-preview.jpg`) had no traceable source. They were deleted. The globe now ships four files, all derived from S6:

- `public/textures/earth-day-8k.jpg` — 8192 × 4096, desktop globe (4.46 MB).
- `public/textures/earth-day-4k.jpg` — 4096 × 2048, GPUs capped below 8K (1.52 MB).
- `public/textures/earth-day-2k.jpg` — 2048 × 1024, phones and tablets (416 kB).
- `public/textures/earth-poster.jpg` — 512 × 256, first-paint poster while the 3D canvas is deferred.

There is no cloud, normal or specular texture. Shading is a quiet emissive/ambient treatment; the border and graticule overlay is generated at runtime from S7, so no third-party texture is used.

## Checks

- `scripts/verify-data.ts`: re-downloads all 84 values and fails on drift. PASS on 22 Oct 2026.
- `scripts/verify-stats.ts`: recomputes 68 rendered statistics and fails on drift. PASS on 22 Oct 2026.
- `npm test`: 46 tests pass.
- `scripts/anchor_check.mjs`: 11 IA anchors pass.
- `scripts/crosscheck.py`: independent Python recomputation agrees.

## Known limitations of this register

- The DOI and WHO pages return HTTP 403 to `curl` because of bot protection. Their metadata was verified through Crossref and the WHO IRIS record instead; both are recorded above.
- Natural Earth’s exact point release is not printed by `world-atlas`. The site names the dataset, scale and build rather than guessing a version.
- World Bank WDI values can be revised. The Appendix A values remain authoritative; the live pull is a check and does not overwrite them.
