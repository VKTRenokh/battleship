import { Message, ResponseMessage } from "@/http_server/types/Message";
import { Ship } from "@/http_server/types/Ships";
import { WebSocket } from "ws";

export class Player {
  ships: Ship[];
  isReady: boolean;

  constructor(
    public connection: WebSocket,
    public id: number,
    public username: string
  ) {
    this.ships = [];
    this.isReady = false;
  }

  setShips(ships: Ship[]) {
    this.ships = ships;
  }

  send(data: ResponseMessage) {
    this.connection.send(JSON.stringify(data));
  }
}
