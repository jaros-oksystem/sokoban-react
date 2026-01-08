export enum DirectionEnum {
  UP,
  LEFT,
  DOWN,
  RIGHT
}

export function getDirectionEnumFromKeyboardEventKey(keyBoardEventKey: string): DirectionEnum|null {
  switch (keyBoardEventKey) {
    case "w":
    case "ArrowUp": return DirectionEnum.UP;
    case "a":
    case "ArrowLeft": return DirectionEnum.LEFT;
    case "s":
    case "ArrowDown": return DirectionEnum.DOWN;
    case "d":
    case "ArrowRight": return DirectionEnum.RIGHT;
    default: return null;
  }
}

export function getOppositeDirection(direction: DirectionEnum): DirectionEnum {
  switch (direction) {
    case DirectionEnum.UP: return DirectionEnum.DOWN;
    case DirectionEnum.LEFT: return DirectionEnum.RIGHT;
    case DirectionEnum.DOWN: return DirectionEnum.UP;
    case DirectionEnum.RIGHT: return DirectionEnum.LEFT;
  }
}

export function getRotatedDirection(direction: DirectionEnum): DirectionEnum {
  switch (direction) {
    case DirectionEnum.UP: return DirectionEnum.LEFT;
    case DirectionEnum.LEFT: return DirectionEnum.DOWN;
    case DirectionEnum.DOWN: return DirectionEnum.RIGHT;
    case DirectionEnum.RIGHT: return DirectionEnum.UP;
  }
}