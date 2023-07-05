import { ResponseMessage } from "../types/Message";
import { User, isUser } from "../types/User";
import * as crypto from "crypto";
import * as ws from "ws";

export class Users {
  users: User[];

  constructor() {
    this.users = [];
  }

  userExists(name: string) {
    return !!this.users.find((user) => user.name === name);
  }

  newUser(connection: ws.WebSocket, userData: Record<string, any>) {
    const response: ResponseMessage = {
      type: "reg",
    };

    const responseData = {
      error: false,
      errorMessage: "",
      name: "",
      password: "",
      index: "",
    };

    if (!isUser(userData)) {
      responseData.error = true;
      responseData.errorMessage = "user data doesn't contain requierd fields";
      response.data = JSON.stringify(responseData);
      connection.send(JSON.stringify(response));
      return;
    }

    responseData.name = userData.name;
    responseData.password = userData.password;
    responseData.index = crypto.randomUUID();
    response.id = userData.id;

    response.data = JSON.stringify(responseData);

    this.users.push(userData);
    connection.send(JSON.stringify(response));
  }
}
