export interface Country {
  iso3: string;
  name: string;
  region: string;
  incomeGroup: 'Low' | 'Lower middle' | 'Upper middle' | 'High';
  lat: number;
  lon: number;
  gdp: number; // x, constant 2021 international dollars
  life: number; // y, years
  sourceUrl: string;
  indicatorCode: string;
  retrievedOn: string;
  vintageNote: string;
}
