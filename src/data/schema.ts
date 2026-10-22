export type IncomeGroup = 'Low' | 'Lower middle' | 'Upper middle' | 'High';

export interface Country {
  iso3: string;
  name: string;
  region: string;
  incomeGroup: IncomeGroup;
  /** World Bank FY2020 classification, the group in force in July 2019. */
  incomeGroup2019: IncomeGroup;
  lat: number;
  lon: number;
  gdp: number; // x, constant 2021 international dollars
  life: number; // y, years
  sourceUrl: string; // life expectancy API URL for this country and year
  gdpSourceUrl: string; // GDP per capita API URL for this country and year
  lifeSourceUrl: string; // life expectancy API URL for this country and year
  indicatorCode: string;
  retrievedOn: string;
  vintageNote: string;
}
