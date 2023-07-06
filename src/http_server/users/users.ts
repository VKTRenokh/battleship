import { ResponseMessage } from "../types/Message";
import { User, isUser } from "../types/User";
import * as crypto from "crypto";
import * as ws from "ws";

export class Users {
  users: User[];

  constructor() {
    this.users = [];
  }

  exists(name: string) {
    return !!this.users.find((user) => user.name === name);
  }

  newUser(connection: ws.WebSocket, userData: Record<string, any>) {
    const response: ResponseMessage = {
      type: "reg",
    };

    const responseData: Record<string, any> = {};

    if (!isUser(userData)) {
      responseData.error = true;
      responseData.errorMessage = "user data doesn't contain requierd fields";
      response.data = JSON.stringify(responseData);
      connection.send(JSON.stringify(response));
      return;
    }

    if (this.exists(userData.name)) {
      this.login(connection, userData);
    }

    responseData.name = userData.name;
    responseData.password = userData.password;
    responseData.index = crypto.randomUUID();

    response.data = JSON.stringify(responseData);

    userData.connection = connection;
    this.users.push(userData);
    connection.send(JSON.stringify(response));
  }

  login(connection: ws.WebSocket, userData: User) {
    const response: ResponseMessage = { type: "reg" };
    const responseData: Record<string, any> = {};

    responseData.name = userData.name;
    responseData.password = userData.password;

    response.data = JSON.stringify(responseData);

    connection.send(JSON.stringify(response));
  }

  getUserByConnetion(connection: ws.WebSocket) {
    return this.users.find((user) => user.connection === connection);
  }
}
