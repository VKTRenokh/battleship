import { ResponseMessage } from "../types/Message";
import { Player } from "./room/player/player";
import { Room } from "./room/room";
import { WebSocket } from "ws";

export class Rooms {
  rooms: Room[];
  onRoomFinish: ((roomId: number, winner: Player) => void) | null = null;

  constructor() {
    this.rooms = [];
  }

  exists(roomName: string) {
    return !!this.rooms.find((room) => room.name === roomName);
  }

  create(roomName: string) {
    const room = new Room(this.rooms.length, roomName);

    room.onFinish = (player) => {
      this.rooms.splice(room.id);

      this.onRoomFinish?.(room.id, player);
    };

    this.rooms.push(room);

    return room;
  }

  getRoomsJson() {
    return JSON.stringify(
      this.rooms.map((room) => {
        return room.getJson();
      }),
    );
  }

  getRoomFromIndex(index: number) {
    return this.rooms.find((room) => room.id === index);
  }

  sendRoomsUpdate(connections: WebSocket[]) {
    connections.forEach((connection) => {
      const response: ResponseMessage = { type: "update_room" };
      const responseData = this.getRoomsJson();

      response.data = responseData;
      connection.send(JSON.stringify(response));
    });
  }
}
