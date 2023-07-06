import { ResponseMessage } from "@/http_server/types/Message";
import { Player } from "@/http_server/types/Player";
import { User } from "@/http_server/types/User";
import { WebSocket } from "ws";

export class Room {
  players: Player[];

  constructor(public id: number, public name: string) {
    this.players = [];
  }

  addPlayer(connection: WebSocket, playerData: User) {
    // const response: ResponseMessage = { type: "create_game" };
    // const responseData: Record<string, any> = { indexRoom: this.id };

    const player = {
      connection,
      name: playerData.name,
      index: playerData.id,
    };

    this.players.push(player);

    // response.data = JSON.stringify(responseData);
    // connection.send(JSON.stringify(response), () => {
    //   console.log("send");
    // });
  }

  getJson() {
    return {
      roomId: this.id,
      roomUsers: this.players.map((player) => {
        return {
          name: player.name,
          index: player.index,
        };
      }),
    };
  }
}
