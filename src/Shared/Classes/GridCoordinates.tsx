import {DirectionEnum} from "@/src/Shared/Enum/DirectionEnum";

export default class GridCoordinates {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: GridCoordinates): boolean {
    return this.x === other.x && this.y === other.y;
  }

  getShifted(direction: DirectionEnum, shiftAmount: number = 1): GridCoordinates {
    switch (direction) {
      case DirectionEnum.UP:    return new GridCoordinates(this.x, this.y-shiftAmount);
      case DirectionEnum.DOWN:  return new GridCoordinates(this.x, this.y+shiftAmount);
      case DirectionEnum.LEFT:  return new GridCoordinates(this.x-shiftAmount, this.y);
      case DirectionEnum.RIGHT: return new GridCoordinates(this.x+shiftAmount, this.y);
    }
  }

}