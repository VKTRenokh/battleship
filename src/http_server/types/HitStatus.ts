import { Ship } from "./Ships";

export interface HitStatus {
  ship?: Ship;
  status: "hit" | "miss" | "killed";
}
