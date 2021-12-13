export interface ICreateBusLinePayload {
  lineCityStart: string;
  lineCityEnd: string;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineStartTime: string;
  lineCountryStart: CountryStart;
  lineStartDay1: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  lineStartDay2: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  busLineNr: number;
}

export interface ICreateBusLineResponse {
  createdAt: string;
  modifiedAt: string;
  id: string;
  lineCityEnd: string;
  lineCityStart: string;
  lineStartTime: string;
  lineCountryStart: CountryStart;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineStartDay1: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  lineStartDay2: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface IBusLine {
  _id: string;
  lineCityStart: string;
  lineCityEnd: string;
  linePriceOneWay: number;
  linePriceRoundTrip: number;
  lineStartTime: string;
  lineCountryStart: CountryStart;
  lineStartDay1: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  lineStartDay2: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  createdAt: string;
  modifiedAt: string;
}

export enum CountryStart {
  bih = 'bih',
  de = 'de',
}
