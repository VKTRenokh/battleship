import { RequestTypes } from "./RequestTypes";

export type Message =
  | string
  | number
  | number[]
  | string[]
  | { [key: string]: Message };

export interface IncomingMessage {
  type: RequestTypes;
  data: Record<string, Message>;
}

export interface ResponseMessage {
  type: RequestTypes;
  data?: string;
  id?: number;
}

export const isMessage = (message: object): message is IncomingMessage => {
  return "type" in message && "data" in message;
};
