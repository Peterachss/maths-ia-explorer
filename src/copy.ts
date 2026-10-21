// src/copy.ts : all interface text in one place. British spelling. No em dashes.
export const copy = {
  title: 'Life Expectancy Explorer',
  brand: 'Maths AA SL · Internal Assessment',
  subtitle:
    'How well do straight and curved models link income to life expectancy across 42 countries in 2019?',
  nav: [
    { id: 'h-two', label: 'Places' },
    { id: 'h-sample', label: 'Sample' },
    { id: 'h-models', label: 'Models' },
    { id: 'h-gap', label: 'Gap' },
    { id: 'h-rate', label: 'Rate' },
    { id: 'h-inv', label: 'Inverse' },
    { id: 'h-sens', label: 'Sensitivity' },
    { id: 'h-limits', label: 'Limits' }
  ],
  controls: {
    search: 'Search countries',
    searchPlaceholder: 'Type a country name',
    clear: 'Clear selection',
    anchors: 'Compare Zimbabwe and Singapore',
    linear: 'Straight line',
    log: 'Logarithmic',
    both: 'Both models',
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
    reset: 'Reset to Zimbabwe and Singapore',
    legend: 'Life expectancy',
    low: '61.1',
    high: '83.6 years',
    hint: 'Drag to rotate · Scroll to zoom',
    hintTouch: 'Drag to rotate · Pinch to zoom',
    imagery: 'Basemap: NASA Blue Marble (illustrative), Natural Earth. Data: World Bank 2019.'
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
      'Income groups are the World Bank classification today, which can differ from the 2019 groups.',
      'A model that fits well describes a pattern. It does not show that income causes longer life. Health spending, education, conflict and disease also matter.',
      'Results outside the observed range of incomes are extrapolations and are marked.'
    ]
  },
  sources: [
    'World Bank, World Development Indicators: NY.GDP.PCAP.PP.KD and SP.DYN.LE00.IN, year 2019, accessed 6 October 2026.',
    'Preston, S. H. (1975). The changing relation between mortality and level of economic development. Population Studies, 29(2), 231 to 248.',
    'Our World in Data. Life expectancy vs. GDP per capita.',
    'World Bank country and lending groups.'
  ],
  imagery:
    'Basemap: NASA Blue Marble Next Generation (December 2004), Natural Earth boundaries and the three.js Earth relief maps. The imagery is a visual basemap, not a 2019 data layer.'
} as const;
