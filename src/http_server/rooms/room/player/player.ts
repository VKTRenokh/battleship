import { HitStatus } from "@/http_server/types/HitStatus";
import { Message, ResponseMessage } from "@/http_server/types/Message";
import { Ship } from "@/http_server/types/Ships";
import { WebSocket } from "ws";

export class Player {
  ships: Ship[];
  isReady: boolean;

  constructor(
    public connection: WebSocket,
    public id: number,
    public username: string,
  ) {
    this.ships = [];
    this.isReady = false;
  }

  setShips(ships: Ship[]) {
    console.log(ships);
    this.ships = ships;
  }

  send(data: ResponseMessage) {
    this.connection.send(JSON.stringify(data));
  }

  getHittedPositon(x: number, y: number): undefined | Ship {
    const ship = this.ships.find((ship, index) => {
      const range =
        (ship.direction ? ship.position.y : ship.position.x) +
        (ship.length - 1);

      console.log(
        `range ${range}, x ${x} y ${y} direction ${
          ship.direction ? "vertical" : "horizontal"
        } length ${this.ships.length} current ${index}`,
      );

      if (ship.direction) {
        return y >= ship.position.y && y <= range && x === ship.position.x;
      }

      return x >= ship.position.x && x <= range && y === ship.position.y;
    });

    return ship;
  }

  getStatus(x: number, y: number) {
    const hittedShip = this.getHittedPositon(x, y);

    console.log(hittedShip);

    if (!hittedShip) {
      return "miss";
    }

    hittedShip.length--;

    if (!hittedShip.length) {
      return "kill";
    }

    return "hit";
  }

  attack(x: number, y: number) {
    return this.getStatus(x, y);
  }
}
