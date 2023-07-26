import { WebSocket } from "ws";

export interface User {
  id: number;
  password: string;
  name: string;
  connection?: WebSocket;
}

export const isUser = (user: unknown): user is User => {
  if (typeof user !== "object" || !user) {
    return false;
  }

  return (
    "password" in user &&
    "name" in user &&
    typeof user.name === "string" &&
    typeof user.password === "string" &&
    user.name.length >= 5 &&
    user.password.length >= 5
  );
};
