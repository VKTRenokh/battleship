import { WebSocket } from "ws";

export interface Player {
  name: string;
  connection: WebSocket;
  index: number;
}
