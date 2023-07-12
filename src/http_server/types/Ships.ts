export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
  hittedPositions?: number[];
}

export const isShip = (ship: unknown): ship is Ship => {
  if (typeof ship !== "object" || !ship) {
    return false;
  }

  return (
    "position" in ship &&
    "direction" in ship &&
    "length" in ship &&
    "type" in ship
  );
};

export const isShipArray = (shipArray: unknown): shipArray is Ship[] => {
  return Array.isArray(shipArray) && shipArray.every((ship) => isShip(ship));
};
