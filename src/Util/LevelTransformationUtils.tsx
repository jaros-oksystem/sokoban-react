import SolverState from "@/src/Classes/Solver/SolverState";
import Level from "@/src/Classes/Level";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import LevelState from "@/src/Classes/LevelState";
import {DirectionEnum, getAllDirectionEnumValues, getOppositeDirection} from "@/src/Enum/DirectionEnum";
import {getMatrixOfSize} from "@/src/Util/MatrixUtils";

// TODO everything in this file is overly complicated

export function transformSolutionStateToLevelStates(solutionState: SolverState, level: Level): LevelState[] {

  // Put solution states from the state tree into an array
  const solutionStates = new Array<SolverState>();
  let curSolverState: SolverState = solutionState;
  while (true) {
    solutionStates.push(curSolverState);
    if (curSolverState.parentState === null) {
      break;
    } else {
      curSolverState = curSolverState.parentState;
    }
  }
  solutionStates.reverse();
  const rootState = solutionStates[0];

  // Transform Array<SolverState> into Array<LevelState>
  const solutionLevelStates = new Array<LevelState>();
  for (let i = 0; i < solutionStates.length; i++) {
    solutionLevelStates.push(transformSolverStateToLevelState(solutionStates[i], rootState, level));
  }

  // Add states between moves
  const ret = new Array<LevelState>();
  ret.push(solutionLevelStates[0]);
  for (let i = 1; i < solutionLevelStates.length; i++) {
    const startState = solutionLevelStates[i-1];
    const goalState = solutionLevelStates[i];

    if (goalState.turn - startState.turn !== 1) {
      const stateBeforePush = getStateBeforeBoxMove(startState, goalState);
      const moveStates = fillMovesBetweenTwoStates(level, startState, stateBeforePush);
      ret.push(...moveStates, stateBeforePush);
    }

    ret.push(goalState);
  }
  return ret;
}

export function transformSolverStateToLevelState(solverState: SolverState, rootState: SolverState, level: Level): LevelState {

  // Define function for coordinate transformation
  const hasAccessibleBoundaries = level.hasAccessibleBoundaries();
  function getGridCoordinateFromTileId(tileId: number): GridCoordinates {
    return hasAccessibleBoundaries ?
        new GridCoordinates(Math.floor(tileId / (level.lenY+2)) - 1, tileId % (level.lenY+2) - 1) :
        new GridCoordinates(Math.floor(tileId / (level.lenY)), tileId % (level.lenY));
  }

  // Parse the boxes
  const initialBoxesTransformedLevel = new Array<GridCoordinates>();
  for (let i = 0; i < rootState.boxHash.length; i++) {
    initialBoxesTransformedLevel.push(getGridCoordinateFromTileId(rootState.boxHash.codePointAt(i)!));
  }

  // Add boxes which were removed during Level -> LevelForSolver transformation
  const boxesToAdd = new Array<GridCoordinates>();
  for (const boxOrig of level.initialBoxes) {
    if (!initialBoxesTransformedLevel.some((box) => box.equals(boxOrig))) {
      boxesToAdd.push(boxOrig);
    }
  }

  // Construct the returned values
  const transformedPlayer = getGridCoordinateFromTileId(solverState.player);
  const transformedBoxes = new Array<GridCoordinates>();
  for (let i = 0; i < solverState.boxHash.length; i++) {
    transformedBoxes.push(getGridCoordinateFromTileId(solverState.boxHash.codePointAt(i)!));
  }
  transformedBoxes.push(...boxesToAdd);

  return new LevelState(level, transformedPlayer, transformedBoxes, solverState.turn);
}

function fillMovesBetweenTwoStates(level: Level, startState: LevelState, goalState: LevelState): LevelState[] {
  if (startState.player.equals(goalState.player)) {
    return [];
  }

  const visitedDirection: Array<Array<DirectionEnum | null>> = getMatrixOfSize(level.lenX, level.lenY, null);
  let stack: GridCoordinates[] = [startState.player];
  let nextStack: GridCoordinates[] = [];
  visitedDirection[startState.player.x][startState.player.y] = DirectionEnum.UP;
  let goalFound = false;
  while (!goalFound) {
    if (stack.length === 0) {
      throw new Error("Could not find a path from one state to another, start: " + JSON.stringify(startState.player) + ", goal: " + JSON.stringify(goalState.player));
    }
    while (stack.length > 0) {
      const state = stack.pop()!;
      if (goalState.player.equals(state)) {
        goalFound = true;
        break;
      }
      for (const direction of getAllDirectionEnumValues()) {
        const nextState = state.getShifted(direction);
        if (level.isValidPlaceForObjectAt(nextState) &&
            startState.getBoxIdxAt(nextState) === null &&
            visitedDirection[nextState.x][nextState.y] === null) {
          visitedDirection[nextState.x][nextState.y] = getOppositeDirection(direction);
          nextStack.push(nextState);
        }
      }
    }
    stack = nextStack;
    nextStack = [];
  }

  const ret = new Array<LevelState>();
  let curTile = goalState.player;
  let curTurn = goalState.turn;
  while (true) {
    curTile = curTile.getShifted(visitedDirection[curTile.x][curTile.y]!);
    curTurn--;
    if (curTile.equals(startState.player)) {
      return ret.toReversed();
    }
    ret.push(new LevelState(level, curTile, startState.boxes.slice(), curTurn));
  }
}

function getStateBeforeBoxMove(startState: LevelState, goalState: LevelState) {
  let boxBeforeMove = null;
  for (const startBox of startState.boxes) {
    if (!goalState.boxes.some((box) => box.equals(startBox))) {
      boxBeforeMove = startBox;
    }
  }

  let boxAfterMove = null;
  for (const goalBox of goalState.boxes) {
    if (!startState.boxes.some((box) => box.equals(goalBox))) {
      boxAfterMove = goalBox;
    }
  }

  if (boxBeforeMove === null || boxAfterMove === null) {
    throw new Error("Moved box not found");
  }

  const direction = boxAfterMove.getDirectionOfAdjacentObject(boxBeforeMove);
  if (direction === null) {
    throw new Error("Box was move more than 1 tile");
  }

  const playerPosition = boxAfterMove.getShifted(direction, 2);
  return new LevelState(startState.parentLevel, playerPosition, startState.boxes.slice(), goalState.turn-1);
}