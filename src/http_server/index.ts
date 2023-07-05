import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as ws from "ws";
import { Users } from "./users/users";
import { isMessage } from "./types/Message";
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

const connections: ws.ClientOptions[] = [];
const users = new Users();

webSocketServer.on("connection", (socket, req) => {
  connections.push(socket);

  socket.on("message", (data, isBinary) => {
    if (isBinary) {
      return;
    }

    const parsed = JSON.parse(data.toString());
    parsed.data = JSON.parse(parsed.data);

    if (!isMessage(parsed)) {
      return;
    }

    if (parsed.type === "reg") {
      users.newUser(socket, parsed.data);
    }

    console.log("socket message", parsed.type);
  });
});

process.on("SIGINT", () => {
  webSocketServer.close();
  process.exit();
});
