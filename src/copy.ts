// src/copy.ts : all interface text in one place. British spelling. No em dashes.
export const copy = {
  title: 'Life Expectancy Explorer',
  brand: 'Maths AA SL · Internal Assessment',
  subtitle:
    'How well do straight and curved models link income to life expectancy across 42 countries in 2019?',
  chapters: [
    { id: 'data', no: '01', title: 'Data', purpose: 'What did I measure, and for which countries?' },
    { id: 'models', no: '02', title: 'Models', purpose: 'Which model fits better, and how much of the gap does it explain?' },
    { id: 'use', no: '03', title: 'Using the model', purpose: 'What does the model say about extra income?' },
    { id: 'reliability', no: '04', title: 'Reliability', purpose: 'How far can these results be trusted?' }
  ],
  nav: [
    { id: 'h-two', label: 'Places', chapter: 'data' },
    { id: 'h-sample', label: 'Sample', chapter: 'data' },
    { id: 'h-models', label: 'Models', chapter: 'models' },
    { id: 'h-gap', label: 'Gap', chapter: 'models' },
    { id: 'h-rate', label: 'Rate', chapter: 'use' },
    { id: 'h-inv', label: 'Inverse', chapter: 'use' },
    { id: 'h-sens', label: 'Sensitivity', chapter: 'reliability' },
    { id: 'h-limits', label: 'Limits', chapter: 'reliability' },
    { id: 'h-glossary', label: 'Glossary', chapter: 'reliability' },
    { id: 'h-work', label: 'Working', chapter: 'reliability' },
    { id: 'h-sources', label: 'Sources', chapter: 'reliability' }
  ],
  controls: {
    search: 'Search countries',
    searchPlaceholder: 'Type a country name',
    clear: 'Clear selection',
    anchors: 'Compare Zimbabwe and Singapore',
    linear: 'Straight line',
    log: 'Logarithmic',
    linearAxis: 'Linear x axis',
    logAxis: 'Log x axis',
    showWorking: 'Show working',
    hideWorking: 'Hide working',
    globe: 'Globe',
    bowl: 'Least squares bowl',
    reset: 'Reset view'
  },
  map: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Frame the selected countries',
    legend: 'Life expectancy, 2019',
    hint: 'Drag to rotate · Scroll to zoom · Click a country for its stats',
    hintTouch: 'Drag to rotate · Pinch to zoom · Tap a country for its stats',
    imagery:
      'Blue Marble Next Generation, December 2004, with topography and bathymetry (NASA Earth Observatory / Reto Stöckli). Borders: Natural Earth Admin 0, 1:110m. Visual basemap, not a 2019 data layer.'
  },
  empty: { selection: 'Select a country on the globe, in a chart, or in the list to compare it with the model.' },
  errors: {
    data: 'The data file could not be loaded. Check your connection and reload the page.',
    webgl: 'This browser could not start 3D graphics. The charts and tables below still work.'
  },
  limits: {
    heading: 'What this shows, and what it does not',
    items: [
      'The sample is 42 selected countries, not every country, and it was not chosen at random.',
      'The data are for one year, 2019, so this is a snapshot, not a change over time.',
      'Income groups can be shown as the FY2020 classification, in force in July 2019, or the FY2027 classification, from July 2026. Four countries changed: Nepal moved from Low to Lower middle; Indonesia, the Philippines and Vietnam moved from Lower middle to Upper middle.',
      'A model that fits well describes a pattern. It does not show that income causes longer life. Health spending, education, conflict and disease also matter.',
      'GDP per capita is an average. It says nothing about how income is shared within a country.',
      'Life expectancy at birth is a period measure built from current mortality rates, not a forecast for a particular baby.',
      'The t test in the working assumes independent observations from a random sample. These countries are purposive, so the p-value is indicative, not a claim about all countries.',
      'Results outside the observed range of incomes are extrapolations and are marked.'
    ]
  },
  sources: {
    heading: 'Sources and checks',
    lede:
      'The 42 rows in Appendix A are the authority for every number in this explorer. Each statistic is recomputed from those rows. The World Bank series was pulled again on 22 October 2026 and all 42 rows matched the appendix at the printed precision.',
    provenance: [
      { label: 'Data', value: 'World Bank World Development Indicators, 2019' },
      { label: 'GDP per capita', value: 'NY.GDP.PCAP.PP.KD, constant 2021 international $' },
      { label: 'Life expectancy', value: 'SP.DYN.LE00.IN, total, years' },
      { label: 'Sample', value: '42 countries, chosen for the IA. Not a random sample.' },
      { label: 'Income groups', value: 'FY2027 (July 2026) today; FY2020 (July 2019) for the 2019 comparison' },
      { label: 'Coordinates', value: 'Approximate capital-city positions. Used for the globe only.' },
      { label: 'Live check', value: '42 of 42 rows matched on 22 October 2026' }
    ],
    references: [
      {
        n: 1,
        id: 'wb-gdp',
        kind: 'source',
        apa:
          'World Bank. (2026). GDP per capita, PPP (constant 2021 international $) [Data set]. World Development Indicators. https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD',
        short: 'GDP per capita, 2019',
        detail:
          'Indicator NY.GDP.PCAP.PP.KD, 2019 values. Retrieved 6 October 2026 and re-checked 22 October 2026. Licence CC BY 4.0. Every row has a country- and year-specific API URL in the CSV.',
        url: 'https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD',
        licence: 'CC BY 4.0',
        accessed: '22 October 2026'
      },
      {
        n: 2,
        id: 'wb-life',
        kind: 'source',
        apa:
          'World Bank. (2026). Life expectancy at birth, total (years) [Data set]. World Development Indicators. https://data.worldbank.org/indicator/SP.DYN.LE00.IN',
        short: 'Life expectancy, 2019',
        detail:
          'Indicator SP.DYN.LE00.IN, 2019 values. Retrieved 6 October 2026 and re-checked 22 October 2026. Licence CC BY 4.0. The series is compiled from UN World Population Prospects and national statistics.',
        url: 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN',
        licence: 'CC BY 4.0',
        accessed: '22 October 2026'
      },
      {
        n: 3,
        id: 'wb-groups',
        kind: 'source',
        apa:
          'World Bank. (2026). World Bank country and lending groups. https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups',
        short: 'Income groups today',
        detail:
          'Current income classification, FY2027 (July 2026), accessed 22 October 2026. The app normalises the four labels to Low, Lower middle, Upper middle and High.',
        url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups',
        licence: 'CC BY 4.0',
        accessed: '22 October 2026'
      },
      {
        n: 4,
        id: 'wb-oghist',
        kind: 'source',
        apa:
          'World Bank. (2026). Historical classification of countries by income (OGHIST) [Data set]. https://ddh-openapi.worldbank.org/resources/DR0095334/download',
        short: 'Income groups in 2019',
        detail:
          'FY2020 column AH is the classification in force during July 2019; FY2027 column AO is today. Accessed 22 October 2026. Four sample countries changed group between the two columns.',
        url: 'https://ddh-openapi.worldbank.org/resources/DR0095334/download',
        licence: 'CC BY 4.0',
        accessed: '22 October 2026'
      },
      {
        n: 5,
        id: 'preston',
        kind: 'source',
        apa:
          'Preston, S. H. (1975). The changing relation between mortality and level of economic development. Population Studies, 29(2), 231–248. https://doi.org/10.1080/00324728.1975.10410201',
        short: 'Preston (1975)',
        detail:
          'A concave relationship between mortality and income that shifts upward over time. The logarithmic model is a simple cross-sectional representation of that diminishing-returns idea; no Preston coefficients are reused.',
        url: 'https://doi.org/10.1080/00324728.1975.10410201',
        licence: 'Publisher DOI page; citation only',
        accessed: '22 October 2026'
      },
      {
        n: 6,
        id: 'nasa',
        kind: 'source',
        apa:
          'NASA Earth Observatory. (2005). Blue Marble: Next generation (December 2004, topography and bathymetry, 21,600 × 10,800) [Image]. https://visibleearth.nasa.gov/collection/1484/blue-marble',
        short: 'Blue Marble basemap',
        detail:
          'Image credit: NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation. The master file is world.topo.bathy.200412.3x21600x10800.jpg, rendered at 8K for the globe, with 4K and 2K fallbacks. Visual basemap only, not a 2019 data layer. NASA imagery is public domain; attribution is shown.',
        url: 'https://visibleearth.nasa.gov/collection/1484/blue-marble',
        licence: 'Public domain (NASA); attribution shown',
        accessed: '22 October 2026'
      },
      {
        n: 7,
        id: 'natural-earth',
        kind: 'source',
        apa:
          'Natural Earth. (2025). Admin 0 – Countries (1:110m) [Data set]. https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/',
        short: 'Country boundaries',
        detail:
          'Boundary file shipped through the world-atlas 1:110m build (`countries-110m.json`). Public domain. Illustrative, not a statistical source.',
        url: 'https://www.naturalearthdata.com/about/terms-of-use/',
        licence: 'Public domain',
        accessed: '22 October 2026'
      },
      {
        n: 8,
        id: 'natural-earth-places',
        kind: 'source',
        apa:
          'Natural Earth. (2025). Populated places (1:10m) [Data set]. https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/',
        short: 'Capital coordinates',
        detail:
          'Source for the approximate capital-city positions in the lat and lon columns. Public domain. The coordinates place the pillars; they are not World Bank country-endpoint coordinates and do not enter the regression.',
        url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/',
        licence: 'Public domain',
        accessed: '22 October 2026'
      },
      {
        n: 9,
        id: 'who',
        kind: 'source',
        apa:
          'Blas, E., Sivasankara Kurup, A., & World Health Organization. (2010). Equity, social determinants and public health programmes. World Health Organization. https://iris.who.int/handle/10665/44289',
        short: 'Other determinants',
        detail:
          'Supports the statement that health spending, education, conflict and disease also matter. Used as context, not as an input to the model. The older WHO health-topics URL returned HTTP 403 to automated clients, so the stable IRIS record is cited.',
        url: 'https://iris.who.int/handle/10665/44289',
        licence: 'WHO IRIS terms; citation only',
        accessed: '22 October 2026'
      },
      {
        n: 10,
        id: 'owid',
        kind: 'reading',
        apa:
          'Our World in Data. (2026). Life expectancy vs. GDP per capita [Interactive chart]. https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita',
        short: 'Further reading',
        detail:
          'Background reading and a visual sanity check only. Not used to calculate any value in this explorer. The grapher is published under CC BY 4.0; attribution is shown here.',
        url: 'https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita',
        licence: 'CC BY 4.0',
        accessed: '22 October 2026'
      }
    ],
    checks: [
      '42 rows, 42 unique ISO3 codes, no missing values.',
      'Live World Bank pull: maximum GDP difference 0.0004 percent; maximum life-expectancy difference 0.000463 years.',
      '11 printed IA anchors pass in scripts/anchor_check.mjs.',
      'Automated tests pass, including the data contract.',
      'A separate Python implementation recomputes every statistic in scripts/crosscheck.py.',
      'Income groups: all 42 match FY2027; four differ from FY2020 and are named in Limits.',
      'Every row has country- and year-specific API URLs for both indicators.',
      'scripts/verify-data.ts re-downloads all 84 values; scripts/verify-stats.ts recomputes the rendered statistics.'
    ],
    imagery:
      'The globe uses NASA Earth Observatory / Reto Stöckli, Blue Marble Next Generation (December 2004, topography and bathymetry, rendered at 8K, 4K or 2K), with Natural Earth Admin 0 boundaries at 1:110m. It is a visual basemap, not a 2019 data layer. The pillars carry the data.',
    cite:
      'Life Expectancy Explorer. (2026). Life expectancy and GDP per capita, 2019 [Interactive data visualisation]. https://peterachss.github.io/maths-ia-explorer/'
  },
  credits: [
    { name: 'three.js', licence: 'MIT', url: 'https://threejs.org/' },
    { name: 'react-three-fiber', licence: 'MIT', url: 'https://docs.pmnd.rs/react-three-fiber' },
    { name: '@react-three/drei', licence: 'MIT', url: 'https://github.com/pmndrs/drei' },
    { name: 'D3 (d3-array, d3-scale, d3-shape, d3-geo)', licence: 'ISC', url: 'https://d3js.org/' },
    { name: 'Instrument Sans', licence: 'SIL Open Font License 1.1', url: 'https://fonts.google.com/specimen/Instrument+Sans' },
    { name: 'Lucide', licence: 'ISC', url: 'https://lucide.dev/' },
    { name: 'Native MathML', licence: 'Web platform', url: 'https://developer.mozilla.org/docs/Web/MathML' }
  ],
  creditsNote:
    'KaTeX (MIT) was evaluated for the Working section but is not bundled: its browser bundle is larger than the 50 kB gzipped approval threshold in the brief. The formulas use native MathML instead.',
  aiNote:
    'This explorer was built with AI assistance as a companion to the IA. The data, the IA and its argument are the student\'s own work.'
} as const;
