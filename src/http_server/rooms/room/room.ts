import { ResponseMessage } from "@/http_server/types/Message";
// import { Player } from "@/http_server/types/Player";
import { User } from "@/http_server/types/User";
import { WebSocket } from "ws";
import { Message } from "@/http_server/types/Message";
import { Player } from "./player/player";

export class Room {
  players: Player[];
  ships: number[][];

  constructor(public id: number, public name: string) {
    this.players = [];
    this.ships = [];
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
      player.connection.send(JSON.stringify(response));
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

  handleShipPlacement(data: Record<string, Message>) {
    if (typeof data.indexPlayer !== "number") {
      return;
    }

    if (!this.players[data.indexPlayer]) {
      return;
    }

    console.log(this.players[data.indexPlayer]);

    console.log(data);
  }
}
