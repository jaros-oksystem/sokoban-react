import SolverParams, {HeuristicMatchingEnum, StateCreationEnum} from "@/src/Classes/Solver/SolverParams";
import {DirectionEnum, getAllDirectionEnumValues} from "@/src/Enum/DirectionEnum";
import {LevelForSolver} from "@/src/Classes/Solver/LevelForSolver";
import SolverState from "@/src/Classes/Solver/SolverState";
import {getMatrixWithConditionalFill, getTransposedMatrix} from "@/src/Util/MatrixUtils";
import {IntegerHeapV2} from "@/src/Classes/Solver/IntegerHeapV2";
import Level from "@/src/Classes/Level";
import LevelState from "@/src/Classes/LevelState";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import SolvingState from "@/src/Classes/Solver/SolvingState";
import {isBoxDeadlockedByNeighbouringBoxes} from "@/src/Algo/Solver/DeadlockDetectionUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";

const MAX_SUPPORTED_TILES_FOR_SOLVER = 2 ** 16;

const MESSAGE_INTERVAL_MS = 200;

// TODO figure out how to run this whole thing with the nextJs production optimizations so that you know if something actually helps or not... doing it on dev makes no sense (maybe something like using uint16 arrays will suddenly be faster or idk)
// TODO reset idea

// _______________________________________________ Web worker messaging _______________________________________________

let lastMessageSent: number | null = null;

function updateLastMessageSent() {
  lastMessageSent = Date.now();
}

function isReadyToSentMessage(): boolean {
  return lastMessageSent === null ? false : lastMessageSent + MESSAGE_INTERVAL_MS < Date.now();
}

globalThis.onmessage = ({ data }) => {
  updateLastMessageSent();

  const inputLevel = getLevelFromCsbCode(data.csbCode);

  //TODO this is just sad
  let params: SolverParams = data.params;
  params = new SolverParams(params.stateCreation, params.heuristicMatching, params.heuristicValue, params.deadlockDetectionLevel);

  const finalSolvingState = getSolutionForLevel(inputLevel, params);
  finalSolvingState.timestampTerminated = Date.now();

  sendSolvingState(finalSolvingState);
};

function sendSolvingState(solvingState: SolvingState) {
  globalThis.postMessage(solvingState);
  updateLastMessageSent();
}

// _______________________________________________ Solver functions _______________________________________________

export default function getSolutionForLevel(inputLevel: Level, params: SolverParams): SolvingState {
  // Initialize the solving state
  const solvingState = new SolvingState();

  // Transform level data into data structures more optimized for the solver algorithm
  const level = new LevelForSolver(inputLevel);

  let exceptionMessage = null;
  const levelTiles = level.lenX * level.lenY;
  if (level.initialPlayer === -1) {
    exceptionMessage = "The level is missing a player";
  } else if (level.getNumberOfInitialBoxesInPlayableArea() === 0) {
    exceptionMessage = "There are no boxes in the playable area";
  } else if (level.getNumberOfInitialBoxesInPlayableArea() === 0) {
    exceptionMessage = "There are are more boxes than goals in the playable area";
  } else if (level.initialBoxes.length == 0 || level.initialBoxes.map((box) => level.isGoalAtTileId(box)).every(Boolean)) {
    exceptionMessage = "The level is already solved";
  } else if (levelTiles > MAX_SUPPORTED_TILES_FOR_SOLVER) {
    exceptionMessage = "Level exceeds maximum supported number of tiles: " + levelTiles + " > " + MAX_SUPPORTED_TILES_FOR_SOLVER;
  } else if (params.heuristicMatching === HeuristicMatchingEnum.BIPARTITE_MATCHING && level.getNumberOfGoalsInPlayableArea() !== level.getNumberOfInitialBoxesInPlayableArea()) {
    exceptionMessage = "The number of goals in the playable area must equals to the number of boxes in the playable area when using the bipartite matching heuristic";
  }

  if (exceptionMessage !== null) {
    solvingState.exceptionMessage = exceptionMessage;
    return solvingState;
  }

  // Check if the level is unsolvable using simple checks
  if (checkIsSimplyUnsolvable(level, params)) {
    return solvingState;
  }

  // Try to solve the level
  const solutionState = solve(level, params, solvingState, inputLevel);

  // No solution found
  if (solutionState === null) {
    return solvingState;
  }

  //TODO parsing for the ON_BOX_MOVE state creation type -> have to do a BFS between each 2 states
  //TODO when a box is transformed into a wall or removed because it is out of the playable area, it needs to be added back here

  // Parse the solution
  const levelStates = new Array<LevelState>();
  let curSolverState: SolverState = solutionState;
  while (true) {
    levelStates.push(transformSolverStateToLevelState(curSolverState, inputLevel));
    if (curSolverState.parentState == null) {
      break;
    } else {
      curSolverState = curSolverState.parentState;
    }
  }
  solvingState.solutionStates = levelStates.toReversed();
  return solvingState;
}

function transformSolverStateToLevelState(solverState: SolverState, inputLevel: Level) {

  function getGridCoordinateFromTileId(tileId: number): GridCoordinates {
    return new GridCoordinates(Math.floor(tileId / (inputLevel.lenY+2)) - 1, tileId % (inputLevel.lenY+2) - 1);
  }

  const transformedPlayer = getGridCoordinateFromTileId(solverState.player);
  const transformedBoxes = solverState.boxes.map(box => getGridCoordinateFromTileId(box));

  return new LevelState(inputLevel, transformedPlayer, transformedBoxes, solverState.turn);
}

function checkIsSimplyUnsolvable(levelData: LevelForSolver, params: SolverParams): boolean {
  // Check if the player can reach all boxes
  for (const box of levelData.initialBoxes) {
    if (!levelData.isInPlayableArea[box]) {
      return true;
    }
  }

  // Check if there are more boxes than goals in the playable area
  if (levelData.getNumberOfInitialBoxesInPlayableArea() > levelData.getNumberOfGoalsInPlayableArea()) {
    return true;
  }

  // Check if any boxes cannot reach a goal no matter how they are pushed
  if (params.isDeadlockDetectionAvoidUnviable()) {
    for (const box of levelData.initialBoxes) {
      if (levelData.minGoalPathCosts[box] === Number.MAX_SAFE_INTEGER) {
        return true;
      }
    }
  }

  // Check if any of the boxes is not on a goal and can never be moved due to neighboring boxes
  if (params.isDeadlockDetectionCheckNeighbour()) {
    const currentBoxes = new Array<boolean>(levelData.tilesTotal).fill(false);
    for (const box of levelData.initialBoxes) {
      currentBoxes[box] = true;
    }
    for (const box of levelData.initialBoxes) {
      if (isBoxDeadlockedByNeighbouringBoxes(levelData, box, currentBoxes)) {
        return true;
      }
    }
  }

  return false;
}

function solve(level: LevelForSolver, params: SolverParams, solvingState: SolvingState, inputLevel: Level): SolverState | null {
  // Initialize data structures

  const stateHeap = new IntegerHeapV2<SolverState>();
  const exploredStates = new Array<Map<string, number>>(level.tilesTotal); //TODO wouldnt a single map be better?
  const curBoxMask = new Array<boolean>(level.tilesTotal).fill(false);
  const allDirectionValues = getAllDirectionEnumValues();

  for (let i = 0; i < exploredStates.length; i++) {
    if (level.isInPlayableArea[i]) {
      exploredStates[i] = new Map<string, number>();
    }
  }

  // Define helper functions

  function calculateHeuristic(boxes: Array<number>): number {
    switch (params.heuristicMatching) {
      case HeuristicMatchingEnum.NONE:
        return 0;
      case HeuristicMatchingEnum.NEAREST_GOAL: {
        let sum = 0;
        for (const box of boxes) {
          sum += level.minGoalPathCosts[box];
        }
        return sum;
      }
      case HeuristicMatchingEnum.BIPARTITE_MATCHING:
        throw new Error("Not implemented yet"); //TODO
    }
  }

  // Get a new state with a pushed box if such push is possible and does not lead to a deadlock, null otherwise
  function getNewStateWithPushedBoxOrNull(state: SolverState, boxTileId: number, direction: DirectionEnum, turnsToAdd: number = 1): SolverState | null {
    if (!curBoxMask[boxTileId]) {
      throw new Error("Trying to push a box which doesn't exist");
    }
    const movedBoxTileId = level.shiftTileIdInDirection(boxTileId, direction);
    if (level.isWallAt[movedBoxTileId] || curBoxMask[movedBoxTileId] ||
        (params.isDeadlockDetectionAvoidUnviable() && !level.isViable(movedBoxTileId))) {
      // The box is being moved out of bounds, into a wall, into another box or into an unviable tileId
      return null;
    }
    if (params.isDeadlockDetectionCheckNeighbour()) {
      // Edit the box mask such that the box is moved
      curBoxMask[boxTileId] = false;
      curBoxMask[movedBoxTileId] = true;

      const isDeadlock = isBoxDeadlockedByNeighbouringBoxes(level, movedBoxTileId, curBoxMask);

      // Return the box mask to its previous state
      curBoxMask[boxTileId] = true;
      curBoxMask[movedBoxTileId] = false;

      if (isDeadlock) {
        return null;
      }
    }
    if (params.isDeadlockDetectionPiCorralPruning()) {
      // Check if the move created a new coral
      // -> if it didn't, do nothing
      // -> if it did check into cached corals
      //   -> if one is found, then either return null or do nothing based on the cached result
      //   -> if none is found, then run the simulation, add the result to cache and return its result
      throw new Error("Not implemented yet");
    }
    const newBoxes = createNewBoxesList(state.boxes, boxTileId, movedBoxTileId);
    return new SolverState(state, boxTileId, newBoxes, state.turn+turnsToAdd, calculateHeuristic(newBoxes));
  }

  function createNewBoxesList(curBoxes: Array<number>, boxToRemoveTileId: number, boxToAddTileId: number): Array<number> {
    const ret = new Array<number>();
    let wasAdded = false;
    for (let i = 0; i < curBoxes.length; i++) {
      const curBoxTileId = curBoxes[i];
      if (curBoxTileId === boxToRemoveTileId) {
        continue;
      }
      if (!wasAdded && boxToAddTileId < curBoxTileId) {
        ret.push(boxToAddTileId);
        wasAdded = true;
      }
      ret.push(curBoxTileId);
    }
    if (!wasAdded) {
      ret.push(boxToAddTileId);
    }
    return ret;
  }

  function getNewStatesForState(state: SolverState): Array<SolverState> {
    const ret = new Array<SolverState>();
    // TODO couldnt this be a switch?
    if (params.stateCreation === StateCreationEnum.ON_PLAYER_MOVE) {
      for (const direction of allDirectionValues) {
        const playerTileIdAfterMove = level.shiftTileIdInDirection(state.player, direction);
        if (level.isWallAt[playerTileIdAfterMove]) {
          // The player tries to move into a wall or out of bounds
          continue;
        }
        if (curBoxMask[playerTileIdAfterMove]) {
          // Player tries to move a box
          const newState = getNewStateWithPushedBoxOrNull(state, playerTileIdAfterMove, direction);
          if (newState !== null) {
            ret.push(newState);
          }
        } else {
          // The player moves without pushing a box
          ret.push(new SolverState(state, playerTileIdAfterMove, state.boxes, state.turn+1, state.heuristic));
        }
      }
    } else if (params.stateCreation === StateCreationEnum.ON_BOX_MOVE) {

        // TODO wouldnt it be possible to generalize all BFS searches? like bruh, there is already like 5 in the project and there will be more

        const costs: number[] = new Array<number>(level.tilesTotal).fill(Number.MAX_SAFE_INTEGER);
        costs[state.player] = 0;
        let stack: number[] = [state.player];
        let nextStack: number[] = [];
        let curCost = 0;
        while (stack.length > 0) {
          while (stack.length > 0) {
            const curTileId = stack.pop()!;
            for (const direction of allDirectionValues) {
              const nextStateTileId = level.shiftTileIdInDirection(curTileId, direction);
              if (level.isWallAt[nextStateTileId]) {
                // Hit a wall or level bounds
                continue;
              }
              const nextStateCost = curCost+1;
              if (curBoxMask[nextStateTileId]) {
                // Box found
                const newState = getNewStateWithPushedBoxOrNull(state, nextStateTileId, direction, nextStateCost);
                if (newState !== null) {
                  ret.push(newState);
                }
              } else if (costs[nextStateTileId] > nextStateCost) {
                // No box on this tile and new optimum found
                costs[nextStateTileId] = nextStateCost;
                nextStack.push(nextStateTileId);
              }
            }
          }
          stack = nextStack;
          nextStack = [];
          curCost++;
        }
    } else {
      throw new Error("Unknown enum");
    }
    return ret;
  }

  function addStateToHeap(state: SolverState) {
    //console.log("adding new state to the heap with turn: " + state.turn + ", and heuristic: " + state.heuristic);
    if (state.heuristic >= Number.MAX_SAFE_INTEGER) {
      // In case there is no deadlock detection but a heuristic is still being used -> unviable states should be ignored
      return;
    }
    const curVal = state.turn + state.heuristic;
    const bestVal = exploredStates[state.player].get(state.boxHash);
    if (bestVal === undefined || curVal < bestVal) {
      exploredStates[state.player].set(state.boxHash, curVal);
      stateHeap.add(state.turn + state.heuristic, state);
    }
  }

  function printState(state: SolverState) {
    const tileStrings1D = new Array<string>(level.tilesTotal);
    for (let i = 0; i < level.tilesTotal; i++) {
      if (i === state.player) {
        if (level.isGoalAtTileId(i)) {
          tileStrings1D[i] = "P";
        } else {
          tileStrings1D[i] = "p";
        }
      } else if (state.boxes.includes(i)) {
        if (level.isGoalAtTileId(i)) {
          tileStrings1D[i] = "B";
        } else {
          tileStrings1D[i] = "b";
        }
      } else if (level.isWallAt[i]) {
        tileStrings1D[i] = "W";
      } else if (level.isGoalAtTileId(i)) {
        tileStrings1D[i] = "g";
      } else {
        tileStrings1D[i] = " ";
      }
    }
    const tileStrings2D = getMatrixWithConditionalFill(level.lenX, level.lenY, (x,y) => tileStrings1D[x*level.lenY + y]);
    const matrix2dTransposed = getTransposedMatrix(tileStrings2D);
    for (let y = 0; y < level.lenY; y++) {
      const str = [];
      for (let x = 0; x < level.lenX; x++) {
        str.push(" " + matrix2dTransposed[y][x]);
      }
      console.log("Row " + (y + "").padStart(3) + " -" + str.join(" "));
    }
  }

  // Initialization +  Main cycle

  const rootState = new SolverState(null, level.initialPlayer, level.initialBoxes, 0, calculateHeuristic(level.initialBoxes));
  addStateToHeap(rootState);
  while (true) {
    const curState = stateHeap.getNext();
    solvingState.statesExplored++;
    //console.log("Solver cycle ------------------------------------------------------------------------------------")
    if (curState == null) {
      // No more states before a solution was found -> no solution
      //console.log("No more states, returning null");
      return null;
    }

    //console.log("Loaded state, turn: " + curState.turn);
    //printState(curState);

    // Check if this state was already explored
    const bestVal = exploredStates[curState.player].get(curState.boxHash)!;
    const curVal = curState.turn + curState.heuristic;
    if (curVal > bestVal) {
      //console.log("Already explored!");
      continue;
    } else {
      //exploredStates[curState.player].add(boxesAsString);
    }

    // Check if the state is a solution
    if (curState.boxes.map((box) => level.isGoalAtTileId(box)).every(Boolean)) {
      //console.log("Solution! Total explored states: " + statesExploredTotal + ", out of which were already explored states: " + alreadyExploredStates + ", turn: " + curState.turn);
      return curState;
    }

    // Send a message if enough time has passed
    if (isReadyToSentMessage()) {
      solvingState.curSolverState = transformSolverStateToLevelState(curState, inputLevel);
      solvingState.curTurn = curState.turn;
      sendSolvingState(solvingState);
    }

    // Fill the current box mask
    curState.boxes.forEach((box) => curBoxMask[box] = true);

    // Create new states and add them to the heap
    getNewStatesForState(curState).forEach((newState) => addStateToHeap(newState));

    // Reset the current box mask
    curState.boxes.forEach((box) => curBoxMask[box] = false);
  }

}