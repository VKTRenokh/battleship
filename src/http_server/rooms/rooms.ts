import { ResponseMessage } from "../types/Message";
import { Room } from "./room/room";

export class Rooms {
  rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  exists(roomName: string) {
    return !!this.rooms.find((room) => room.name === roomName);
  }

  create(roomName: string) {
    const room = new Room(this.rooms.length, roomName);

    this.rooms.push(room);

    return room;
  }

  startGame(roomName: string) {
    throw new Error("not implemented");
  }

  getRoomsJson() {
    return JSON.stringify(
      this.rooms.map((room) => {
        return room.getJson();
      })
    );
  }
}
