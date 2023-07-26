import { ResponseMessage } from "../types/Message";
import { Winner } from "../types/Winner";
import { WebSocket } from "ws";

export class Winners {
  winners: Winner[];
  onWinnersUpdate: ((winners: Winner[]) => void) | null = null;

  constructor() {
    this.winners = [];
  }

  increaseWins(id: number) {
    if (!this.winners[id]) {
      return;
    }

    this.winners[id].wins++;

    this.onWinnersUpdate?.(this.winners);
  }

  getIndexByName(name: string) {
    return this.winners.findIndex((winner) => winner.name === name);
  }

  addWinner(name: string) {
    this.winners.push({
      name,
      wins: 1,
    });
    console.log("add winneer call", this.winners);

    this.onWinnersUpdate?.(this.winners);
  }

  getWinnersJson() {
    return JSON.stringify(this.winners);
  }

  sendUpdateWinners(connections: WebSocket[]) {
    const response: ResponseMessage = {
      type: "update_winners",
    };

    response.data = JSON.stringify(this.winners);

    console.log(this.winners, "winners update send");

    connections.forEach((connection) => {
      connection.send(JSON.stringify(response));
    });
  }
}
