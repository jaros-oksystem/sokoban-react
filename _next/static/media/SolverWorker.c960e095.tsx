import SolverParams, {HeuristicMatchingEnum, StateCreationEnum} from "@/src/Classes/Solver/SolverParams";
import {DirectionEnum, getAllDirectionEnumValues} from "@/src/Enum/DirectionEnum";
import {LevelForSolver} from "@/src/Classes/Solver/LevelForSolver";
import SolverState from "@/src/Classes/Solver/SolverState";
import {IntegerHeap} from "@/src/Classes/Solver/IntegerHeap";
import Level from "@/src/Classes/Level";
import SolverWorkerMessage from "@/src/Classes/Solver/SolverWorkerMessage";
import {isBoxDeadlockedByNeighbouringBoxes} from "@/src/Algo/Solver/DeadlockDetectionUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";

const MAX_SUPPORTED_TILES_FOR_SOLVER = 2 ** 16;
const MESSAGE_INTERVAL_MS = 200;

// _______________________________________________ Web worker messaging _______________________________________________

let lastMessageSendTime: number | null = null;

function isReadyToSendMessage(): boolean {
  return lastMessageSendTime === null ? false : lastMessageSendTime + MESSAGE_INTERVAL_MS <= Date.now();
}

globalThis.onmessage = ({ data }) => {
  lastMessageSendTime = Date.now();
  const inputLevel = getLevelFromCsbCode(data.csbCode);

  const hydratedParams = new SolverParams(data.params.stateCreation, data.params.heuristicMatching, data.params.deadlockDetectionLevel);
  const finalSolvingState = getSolutionForLevel(inputLevel, hydratedParams);
  finalSolvingState.timestampTerminated = Date.now();
  finalSolvingState.curSolverState = null;

  sendMessage(finalSolvingState);
};

function sendMessage(workerMessage: SolverWorkerMessage) {
  globalThis.postMessage(workerMessage);
  lastMessageSendTime = Date.now();
}

// _______________________________________________ Solver functions _______________________________________________

export default function getSolutionForLevel(inputLevel: Level, params: SolverParams): SolverWorkerMessage {
  const workerMessage = new SolverWorkerMessage();
  const level = new LevelForSolver(inputLevel);

  // Check for unsupported level properties
  if (level.initialPlayer === -1) {
    workerMessage.exceptionMessage = "The level is missing a player";
  } else if (level.getNumberOfInitialBoxesInPlayableArea() === 0) {
    workerMessage.exceptionMessage = "There are no boxes in the playable area";
  } else if (level.initialBoxes.length == 0 || level.initialBoxes.map((box) => level.isGoalAtTileId(box)).every(Boolean)) {
    workerMessage.exceptionMessage = "The level is already solved";
  } else if (level.tilesTotal > MAX_SUPPORTED_TILES_FOR_SOLVER) {
    workerMessage.exceptionMessage = "Level exceeds maximum supported number of tiles: " + level.tilesTotal + " > " + MAX_SUPPORTED_TILES_FOR_SOLVER;
  } else if (level.getNumberOfGoalsInPlayableArea() !== level.getNumberOfInitialBoxesInPlayableArea()) {
    workerMessage.exceptionMessage = "The number of goals in the playable area must equals to the number of boxes in the playable area";
  }
  if (workerMessage.exceptionMessage !== null) {
    return workerMessage;
  }

  // Check if the level is unsolvable using simple checks
  if (isSimplyUnsolvable(level, params)) {
    return workerMessage;
  }

  // Attempt to solve the level
  workerMessage.solutionState = solve(level, params, workerMessage);
  return workerMessage;
}

function isSimplyUnsolvable(levelData: LevelForSolver, params: SolverParams): boolean {
  // Check if the player can reach all boxes
  for (const box of levelData.initialBoxes) {
    if (!levelData.isInPlayableArea[box]) {
      return true;
    }
  }

  // Check if any boxes cannot reach a goal no matter how they are pushed
  if (params.isDeadlockDetectionAvoidUnviable()) {
    for (const box of levelData.initialBoxes) {
      if (!levelData.isViable(box)) {
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

function solve(level: LevelForSolver, params: SolverParams, workerMessage: SolverWorkerMessage): SolverState | null {
  const statesToExploreHeap = new IntegerHeap<SolverState>();
  const exploredStates = new Array<Map<string, number>>(level.tilesTotal);
  const curBoxMask = new Array<boolean>(level.tilesTotal).fill(false);
  const sharedCostsArray = new Array<number>(level.tilesTotal);
  const allDirectionValues = getAllDirectionEnumValues();

  for (let i = 0; i < exploredStates.length; i++) {
    if (level.isInPlayableArea[i]) {
      exploredStates[i] = new Map<string, number>();
    }
  }

  // Define helper functions

  function calculateHeuristic(boxesHash: string): number {
    switch (params.heuristicMatching) {
      case HeuristicMatchingEnum.NONE:
        return 0;
      case HeuristicMatchingEnum.NEAREST_GOAL: {
        let sum = 0;
        for (let i = 0; i < boxesHash.length; i++) {
          sum += level.minGoalPathCosts[boxesHash.codePointAt(i)!];
        }
        return sum;
      }
    }
  }

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
    const newBoxHash = createNewBoxesHash(state.boxHash, boxTileId, movedBoxTileId);
    const newHeuristic: number = params.heuristicMatching === HeuristicMatchingEnum.NEAREST_GOAL ?
        state.heuristic - level.minGoalPathCosts[boxTileId] + level.minGoalPathCosts[movedBoxTileId] :
        calculateHeuristic(newBoxHash);
    return new SolverState(state, boxTileId, newBoxHash, state.turn+turnsToAdd, newHeuristic);
  }

  function getNewStatesForStateAndAddThemToHeapForOnPlayerMove(state: SolverState): void {
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
          addStateToHeap(newState);
        }
      } else {
        // The player moves without pushing a box
        addStateToHeap(new SolverState(state, playerTileIdAfterMove, state.boxHash, state.turn+1, state.heuristic));
      }
    }
  }

  function getNewStatesForStateAndAddThemToHeapForOnBoxMove(state: SolverState): void {
    sharedCostsArray.fill(Number.MAX_SAFE_INTEGER);
    sharedCostsArray[state.player] = 0;
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
              addStateToHeap(newState);
            }
          } else if (sharedCostsArray[nextStateTileId] > nextStateCost) {
            // No box on this tile and new optimum found
            sharedCostsArray[nextStateTileId] = nextStateCost;
            nextStack.push(nextStateTileId);
          }
        }
      }
      stack = nextStack;
      nextStack = [];
      curCost++;
    }
  }

  function addStateToHeap(state: SolverState) {
    if (state.heuristic >= Number.MAX_SAFE_INTEGER) {
      // In case there is no deadlock detection but a heuristic is still being used -> unviable states should be ignored
      return;
    }
    const curVal = state.turn + state.heuristic;
    const bestVal = exploredStates[state.player].get(state.boxHash);
    if (bestVal === undefined || curVal < bestVal) {
      exploredStates[state.player].set(state.boxHash, curVal);
      statesToExploreHeap.add(state.turn + state.heuristic, state);
    }
  }

  // Initialization for the main loop
  const initialHash = getHashFromTileIds(level.initialBoxes);
  const winningHash = getHashFromTileIds(level.goals);
  const rootState = new SolverState(null, level.initialPlayer, initialHash, 0, calculateHeuristic(initialHash));
  workerMessage.rootState = rootState;
  addStateToHeap(rootState);

  // Main cycle
  while (true) {
    const curState = statesToExploreHeap.getNext();
    workerMessage.statesExplored++;
    if (curState == null) {
      // No solution found
      return null;
    }

    // Check if this state was already explored with a lower cost
    const bestVal = exploredStates[curState.player].get(curState.boxHash)!;
    const curVal = curState.turn + curState.heuristic;
    if (curVal > bestVal) {
      continue;
    }

    // Check if the state is a solution
    if (curState.boxHash == winningHash) {
      workerMessage.curTurn = curState.turn;
      return curState;
    }

    // Send a message if enough time has passed
    if (isReadyToSendMessage()) {
      workerMessage.curSolverState = curState;
      workerMessage.curTurn = curState.turn;
      sendMessage(workerMessage);
    }

    // Fill the current box mask
    for (let i = 0; i < curState.boxHash.length; i++) {
      curBoxMask[curState.boxHash.codePointAt(i)!] = true;
    }

    // Create new states and add them to the heap
    if (params.stateCreation === StateCreationEnum.ON_PLAYER_MOVE) {
      getNewStatesForStateAndAddThemToHeapForOnPlayerMove(curState);
    } else if (params.stateCreation === StateCreationEnum.ON_BOX_MOVE) {
      getNewStatesForStateAndAddThemToHeapForOnBoxMove(curState);
    } else {
      throw new Error("Unknown StateCreationEnum");
    }

    // Reset the current box mask
    for (let i = 0; i < curState.boxHash.length; i++) {
      curBoxMask[curState.boxHash.codePointAt(i)!] = false;
    }
  }

}

function createNewBoxesHash(curBoxHash: string, boxToRemoveTileId: number, boxToAddTileId: number): string {
  let ret = "";
  let wasAdded = false;
  for (let i = 0; i < curBoxHash.length; i++) {
    const curBoxTileId = curBoxHash.codePointAt(i)!;
    if (curBoxTileId === boxToRemoveTileId) {
      continue;
    }
    if (!wasAdded && boxToAddTileId < curBoxTileId) {
      ret += String.fromCodePoint(boxToAddTileId);
      wasAdded = true;
    }
    ret += curBoxHash[i];
  }
  if (!wasAdded) {
    ret += String.fromCodePoint(boxToAddTileId);
  }
  return ret;
}

function getHashFromTileIds(tiles: Array<number>): string {
  tiles = tiles.toSorted((n1, n2) => n1 < n2 ? -1 : 1);
  let ret = "";
  for (let i = 0; i < tiles.length; i++) {
    ret += String.fromCodePoint(tiles[i]);
  }
  return ret;
}