import { ResponseMessage } from "@/http_server/types/Message";
import { User } from "@/http_server/types/User";
import { WebSocket } from "ws";
import { Message } from "@/http_server/types/Message";
import { Player } from "./player/player";
import { Ship, isShipArray } from "../../types/Ships";

export class Room {
  players: Player[];
  ships: number[][];
  currentPlayerId: number;
  onFinish: ((winner: Player) => void) | null = null;

  constructor(
    public id: number,
    public name: string,
  ) {
    this.players = [];
    this.ships = [];
    this.currentPlayerId = 0;
  }

  addPlayer(connection: WebSocket, playerData: User) {
    const player = new Player(connection, this.players.length, playerData.name);

    this.players.push(player);

    if (this.players.length !== 2) {
      return;
    }

    this.players.forEach((player, id) => {
      const response: ResponseMessage = { type: "create_game" };
      const responseData: Record<string, Message> = {
        idGame: this.id,
        idPlayer: id,
      };

      response.data = JSON.stringify(responseData);
      player.send(response);
    });
  }

  getJson() {
    return {
      roomId: this.id,
      roomUsers: this.players.map((player) => {
        return {
          name: player.username,
          index: player.id,
        };
      }),
    };
  }

  startGame() {
    this.players.forEach((player) => {
      const response: ResponseMessage = { type: "start_game" };
      const responseData: Record<string, unknown> = {};

      responseData.ships = player.ships;
      responseData.currentPlayerIndex = player.id;

      response.data = JSON.stringify(responseData);
      player.send(response);
    });

    this.sendTurn();
  }

  sendTurn() {
    const response: ResponseMessage = { type: "turn" };

    const responseData: Record<string, unknown> = {
      currentPlayer: this.currentPlayerId,
    };

    response.data = JSON.stringify(responseData);

    this.players.forEach((player) => {
      player.send(response);
    });
  }

  nextTurn() {
    this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;

    this.sendTurn();
  }

  handleShipPlacement(data: Record<string, unknown>) {
    if (typeof data.indexPlayer !== "number") {
      return;
    }

    if (!this.players[data.indexPlayer]) {
      return;
    }

    if (!isShipArray(data.ships)) {
      return;
    }

    this.players[data.indexPlayer].setShips(data.ships);

    this.players[data.indexPlayer].isReady = true;

    if (!this.players.every((player) => player.isReady)) {
      return;
    }

    this.startGame();
  }

  sendKilled(attackingPlayerId: number, player: Player, ship: Ship) {
    if (!ship.hittedPositions) {
      return;
    }

    const response: ResponseMessage = { type: "attack" };

    const responseData: Record<string, unknown> = {
      currentPlayer: attackingPlayerId,
      status: "killed",
    };

    ship.hittedPositions.forEach((position) => {
      responseData.position = position;

      response.data = JSON.stringify(responseData);

      player.send(response);
    });
  }

  handleAttack(data: Record<string, unknown>) {
    if (
      typeof data.indexPlayer !== "number" ||
      typeof data.x !== "number" ||
      typeof data.y !== "number" ||
      data.indexPlayer !== this.currentPlayerId
    ) {
      return;
    }

    const player = this.players[data.indexPlayer ? 0 : 1];

    if (!player) {
      return;
    }

    const response: ResponseMessage = {
      type: "attack",
    };

    const status = player.attack(data.x, data.y);

    const responseData: Record<string, unknown> = {
      position: {
        x: data.x,
        y: data.y,
      },
      currentPlayer: data.indexPlayer,
      status: status.status,
    };

    this.players.forEach((player) => {
      if (typeof data.x !== "number" || typeof data.y !== "number") {
        return;
      }

      if (
        status.status === "killed" &&
        status.ship &&
        typeof data.indexPlayer === "number"
      ) {
        this.sendKilled(data.indexPlayer, player, status.ship);
        return;
      }

      response.data = JSON.stringify(responseData);

      player.send(response);
    });

    if (status.status === "hit" || status.status === "killed") {
      if (player.isAllShipsKilled()) {
        this.finish(this.players[data.indexPlayer]);
      }

      this.sendTurn();
      return;
    }

    this.nextTurn();
  }

  finish(player: Player) {
    const response: ResponseMessage = {
      type: "finish",
    };

    const responseData: Record<string, unknown> = {
      winPlayer: player.id,
    };

    response.data = JSON.stringify(responseData);

    this.players.forEach((player) => {
      player.send(response);
    });

    if (!this.onFinish) {
      return;
    }

    this.onFinish(player);
  }
}
