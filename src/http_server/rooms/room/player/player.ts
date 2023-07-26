import { HitStatus } from "@/http_server/types/HitStatus";
import { ResponseMessage } from "@/http_server/types/Message";
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
    this.ships = ships.map((ship) => {
      ship.hittedPositions = [];
      return ship;
    });
  }

  send(data: ResponseMessage) {
    this.connection.send(JSON.stringify(data));
  }

  getHittedShip(x: number, y: number): undefined | Ship {
    return this.ships.find((ship) => {
      const range =
        (ship.direction ? ship.position.y : ship.position.x) + ship.length;

      if (ship.direction) {
        return y >= ship.position.y && y <= range && x === ship.position.x;
      }

      return x >= ship.position.x && x <= range && y === ship.position.y;
    });
  }

  getStatus(x: number, y: number): HitStatus {
    const hittedShip = this.getHittedShip(x, y);

    if (!hittedShip) {
      return {
        status: "miss",
      };
    }

    hittedShip.hittedPositions?.push({ x, y });

    if (hittedShip.hittedPositions?.length === hittedShip.length) {
      return {
        status: "killed",
        ship: hittedShip,
      };
    }

    return {
      status: "hit",
    };
  }

  attack(x: number, y: number) {
    return this.getStatus(x, y);
  }

  isAllShipsKilled() {
    return this.ships.every((ship) => {
      if (!ship.hittedPositions) {
        return;
      }

      return ship.hittedPositions.length === ship.length;
    });
  }
}
