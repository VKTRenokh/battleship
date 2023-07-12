import { ResponseMessage } from "@/http_server/types/Message";
import { User } from "@/http_server/types/User";
import { WebSocket } from "ws";
import { Message } from "@/http_server/types/Message";
import { Player } from "./player/player";
import { isShipArray } from "../../types/Ships";

export class Room {
  players: Player[];
  ships: number[][];
  currentPlayerId: number;

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

    this.nextTurn();
  }

  nextTurn() {
    const player = this.players[this.currentPlayerId];

    this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;

    const response: ResponseMessage = { type: "turn" };
    const responseData: Record<string, unknown> = {
      currentPlayer: this.currentPlayerId,
    };

    response.data = JSON.stringify(responseData);
    player.send(response);
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

  handleAttack(data: Record<string, unknown>) {
    console.log("handle Attack Call");
    console.log(data.indexPlayer);

    if (
      typeof data.indexPlayer !== "number" ||
      typeof data.x !== "number" ||
      typeof data.y !== "number"
    ) {
      return;
    }

    const player = this.players[data.indexPlayer ? 1 : 0];

    if (!player) {
      return;
    }

    const response: ResponseMessage = {
      type: "attack",
    };

    const responseData: Record<string, unknown> = {
      position: {
        x: data.x,
        y: data.y,
      },
      status: player.attack(data.x, data.y),
    };

    this.players.forEach((player, index) => {
      if (typeof data.x !== "number" || typeof data.y !== "number") {
        return;
      }

      responseData.currentPlayer = index;

      response.data = JSON.stringify(responseData);
      player.send(response);
    });
  }
}
