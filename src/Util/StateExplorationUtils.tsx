import {getMatrixOfSize} from "@/src/Util/MatrixUtils";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {DirectionEnum} from "@/src/Enum/DirectionEnum";

export function getAllReachableTiles(lenX: number, lenY: number, start: GridCoordinates,
                                     isBlocking: (coords: GridCoordinates) => boolean): boolean[][] {
  const visited: boolean[][] = getMatrixOfSize(lenX, lenY, false);
  const stack: GridCoordinates[] = [start];
  visited[start.x][start.y] = true;
  while (stack.length > 0) {
    const state = stack.pop();
    if (state === undefined) {
      throw new Error("Nothing to pop");
    }
    for (const direction of [DirectionEnum.UP, DirectionEnum.LEFT, DirectionEnum.DOWN, DirectionEnum.RIGHT]) {
      const nextState = state.getShifted(direction);
      if (!isBlocking(nextState) && !visited[nextState.x][nextState.y]) {
        visited[nextState.x][nextState.y] = true;
        stack.push(nextState);
      }
    }
  }
  return visited;
}

export function getMovesRequiredToReachTile(lenX: number, lenY: number, start: GridCoordinates, goal: GridCoordinates,
                                     isBlocking: (coords: GridCoordinates) => boolean): number | null {
  const visited: boolean[][] = getMatrixOfSize(lenX, lenY, false);
  let stack: GridCoordinates[] = [start];
  let nextStack: GridCoordinates[] = [];
  visited[start.x][start.y] = true;
  let move = 0;
  while (stack.length > 0) {
    while (stack.length > 0) {
      const state = stack.pop();
      if (state === undefined) {
        throw new Error("Nothing to pop");
      }
      if (goal.equals(state)) {
        return move;
      }
      for (const direction of [DirectionEnum.UP, DirectionEnum.LEFT, DirectionEnum.DOWN, DirectionEnum.RIGHT]) {
        const nextState = state.getShifted(direction);
        if (!isBlocking(nextState) && !visited[nextState.x][nextState.y]) {
          visited[nextState.x][nextState.y] = true;
          nextStack.push(nextState);
        }
      }
    }
    stack = nextStack;
    nextStack = [];
    move++;
  }
  return null;
}
