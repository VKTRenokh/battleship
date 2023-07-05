export interface User {
  id: number;
  password: string;
  name: string;
}

export const isUser = (user: any): user is User => {
  return "password" in user && "name" in user;
};
