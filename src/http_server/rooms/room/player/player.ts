import { WebSocket } from "ws";

export class Player {
  ships: number[][];

  constructor(
    public connection: WebSocket,
    public id: number,
    public username: string
  ) {
    this.ships = [];
  }

  setShips() {
    throw new Error("not implemented");
  }
}
