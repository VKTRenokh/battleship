import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as ws from "ws";
import { Users } from "./users/users";
import { ResponseMessage, isMessage } from "./types/Message";
import { Rooms } from "./rooms/rooms";
import { Winners } from "./winners/winners";
import { isUser } from "./types/User";

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
const winners = new Winners();

rooms.onRoomFinish = (roomId, winner) => {
  const index = winners.getIndexByName(winner.username);

  rooms.sendRoomsUpdate(connections);

  if (index === -1) {
    winners.addWinner(winner.username);
    winners.sendUpdateWinners(connections);
    return;
  }

  winners.increaseWins(index);

  winners.sendUpdateWinners(connections);
};

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

    if (parsed.type === "reg" && isUser(parsed.data)) {
      if (users.getUserByName(parsed.data.name)) {
        users.login(socket, parsed.data);
      } else {
        users.newUser(socket, parsed.data);
      }

      const response: ResponseMessage = { type: "update_winners" };

      response.data = JSON.stringify(winners.winners);

      socket.send(JSON.stringify(response));
    }

    if (parsed.type === "create_room") {
      const room = rooms.create(crypto.randomUUID());
      const user = users.getUserByConnetion(socket);

      if (!user) {
        return;
      }

      room.addPlayer(socket, user);

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

    if (parsed.type === "randomAttack") {
      if (typeof parsed.data.gameId !== "number") {
        return;
      }

      const room = rooms.getRoomFromIndex(parsed.data.gameId);

      if (!room) {
        return;
      }

      room.handleAttack({
        x: (Math.random() * 100) | 0,
        y: (Math.random() * 100) | 0,
        indexPlayer: parsed.data.indexPlayer,
      });
    }
  });

  socket.on("close", () => {
    users.handleDisconnect(socket);
  });
});

process.on("SIGINT", () => {
  webSocketServer.close();
  process.exit();
});
