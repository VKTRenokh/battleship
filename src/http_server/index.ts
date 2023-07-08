import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as ws from "ws";
import { Users } from "./users/users";
import { isMessage } from "./types/Message";
import { Rooms } from "./rooms/rooms";

export const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(""));
  const filePath =
    __dirname + (req.url === "/" ? "/front/index.html" : "/front" + req.url);

  const readable = fs.createReadStream(filePath);

  readable.on("error", (error) => {
    res.writeHead(404);
    res.end(JSON.stringify(error));
  });

  readable.pipe(res);
});

const webSocketServer = new ws.WebSocketServer({
  host: "localhost",
  port: 3000,
  maxPayload: 100000,
});

const connections: ws.WebSocket[] = [];
const users = new Users();
const rooms = new Rooms();

webSocketServer.on("connection", (socket, _) => {
  connections.push(socket);

  socket.on("message", (data, isBinary) => {
    if (isBinary) {
      return;
    }

    const parsed = JSON.parse(data.toString());
    parsed.data = parsed.data === "" ? {} : JSON.parse(parsed.data);

    if (!isMessage(parsed)) {
      return;
    }

    console.log("socket message", parsed.type);

    if (parsed.type === "reg") {
      users.newUser(socket, parsed.data);
    }

    if (parsed.type === "create_room") {
      const room = rooms.create(crypto.randomUUID());
      const user = users.getUserByConnetion(socket);

      if (!user) {
        return;
      }

      room.addPlayer(socket, user);

      if (!user) {
        return;
      }

      rooms.sendRoomsUpdate(connections);
    }

    if (parsed.type === "add_user_to_room") {
      if (typeof parsed.data.indexRoom !== "number") {
        return;
      }

      const room = rooms.getRoomFromIndex(parsed.data.indexRoom);
      const userData = users.getUserByConnetion(socket);

      if (!room || !userData) {
        return;
      }

      room.addPlayer(socket, userData);
      rooms.sendRoomsUpdate(connections);
    }

    if (parsed.type === "add_ships") {
      if (typeof parsed.data.gameId !== "number") {
        return;
      }

      const room = rooms.getRoomFromIndex(parsed.data.gameId);

      if (!room) {
        return;
      }

      room.handleShipPlacement(parsed.data);
    }

    if (parsed.type === "attack") {
      if (typeof parsed.data.gameId !== "number") {
        return;
      }

      const room = rooms.getRoomFromIndex(parsed.data.gameId);

      if (!room) {
        return;
      }

      room.handleAttack(parsed.data);
    }
  });
});

process.on("SIGINT", () => {
  webSocketServer.close();
  process.exit();
});
