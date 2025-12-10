export enum DirectionEnum {
  UP,
  LEFT,
  DOWN,
  RIGHT
}

export function getDirectionEnumFromKeyboardEventKey(keyBoardEventKey: string): DirectionEnum|null {
  switch (keyBoardEventKey) {
    case "ArrowUp": return DirectionEnum.UP;
    case "ArrowLeft": return DirectionEnum.LEFT;
    case "ArrowDown": return DirectionEnum.DOWN;
    case "ArrowRight": return DirectionEnum.RIGHT;
    default: return null;
  }
}