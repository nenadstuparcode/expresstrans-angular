import {IBusLine} from "@app/tab2/tab2.interface";

export interface ICreateTicketPayload {
  ticketBusLineId: string;
  ticketEmail: string;
  ticketNote: string;
  ticketOnName: string;
  ticketPhone: string;
  ticketRoundTrip: boolean;
  ticketStartDate: string;
  ticketValid: number;
}

export interface ICreateTicketResponse {
  id: string;
  ticketOnName: string;
  ticketPhone: string;
  ticketEmail: string;
  ticketNote: string;
  ticketValid: number;
  ticketBusLineId: string;
  ticketRoundTrip: boolean;
  ticketStartDate: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ITicket {
  _id: string;
  ticketOnName: string;
  ticketPhone: string;
  ticketEmail: string;
  ticketNote: string;
  ticketValid: number;
  ticketBusLineId: string;
  ticketRoundTrip: boolean;
  ticketStartDate: string;
  createdAt: string;
  modifiedAt: string;
  busLineData?: IBusLine;
}
