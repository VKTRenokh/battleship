import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as ws from "ws";

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
});

const connections: ws.ClientOptions[] = [];

webSocketServer.on("connection", (socket, req) => {
  connections.push(socket);

  socket.on("message", (data, isBinary) => {
    console.log(data.toString());
  });
});
