export interface ICreateBusLinePayload {
  lineCityStart: string;
  lineCityEnd: string;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineCountryStart: CountryStart;
  lineArray: any[];
  busLineNr: number;
}

export interface ICreateBusLineResponse {
  createdAt: string;
  modifiedAt: string;
  id: string;
  lineCityEnd: string;
  lineCityStart: string;
  lineCountryStart: CountryStart;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineArray: any[];
}

export interface IBusLine {
  _id: string;
  lineCityStart: string;
  lineCityEnd: string;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineCountryStart: CountryStart;
  lineArray: any[];
  createdAt: string;
  modifiedAt: string;
}

export enum CountryStart {
  bih = 'bih',
  de = 'de',
}
