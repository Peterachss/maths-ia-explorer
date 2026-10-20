// src/copy.ts : all interface text in one place. British spelling. No em dashes.
export const copy = {
  title: 'Life Expectancy Explorer',
  subtitle:
    'How well do straight and curved models describe the link between income and life expectancy in 42 countries in 2019?',
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
  ]
} as const;
