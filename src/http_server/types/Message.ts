import { RequestTypes } from "./RequestTypes";

export interface IncomingMessage {
  type: RequestTypes;
  data: Record<string, any>;
}

export interface ResponseMessage {
  type: RequestTypes;
  data?: string;
  id?: number;
}

export const isMessage = (message: any): message is IncomingMessage => {
  return "type" in message && "data" in message;
};
