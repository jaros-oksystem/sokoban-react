import {DirectionEnum, getAllDirectionEnumValues} from "@/src/Enum/DirectionEnum";
import {LevelForSolver} from "@/src/Classes/Solver/LevelForSolver";
import {IntegerHeap} from "@/src/Classes/Solver/IntegerHeap";

class StateForGoalPathCostComputation {
  boxTileIdx: number;
  playerDirection: DirectionEnum;

  constructor(tileIdx: number, direction: DirectionEnum) {
    this.boxTileIdx = tileIdx;
    this.playerDirection = direction;
  }
}

export function getGoalPathCostsForGoal(level: LevelForSolver, goalTileIdx: number): number[] {
  // Create the heap
  const statesHeap = new IntegerHeap<StateForGoalPathCostComputation>();
  for (const direction of level.getPullableDirectionsForTileIdx(goalTileIdx)) {
    statesHeap.add(0, new StateForGoalPathCostComputation(goalTileIdx, direction));
  }

  // Create path costs matrix (first axis is directions, second axis is tileId)
  const pathCosts = new Array<Array<number>>();
  for (const direction of getAllDirectionEnumValues()) {
    const pathCostsCurDirection = new Array<number>(level.tilesTotal).fill(Number.MAX_SAFE_INTEGER);
    if (level.isValidPlaceForObjectInDirection(goalTileIdx, direction)) {
      pathCostsCurDirection[goalTileIdx] = 0;
    }
    pathCosts[direction] = pathCostsCurDirection;
  }

  // Main cycle
  while (true) {
    // Get the next state or exit the loop if there are no more states
    const curState = statesHeap.getNext();
    if (curState == null) {
      break;
    }

    // Helper variables
    const boxTileIdx = curState.boxTileIdx;
    const playerTileIdx = level.shiftTileIdInDirection(boxTileIdx, curState.playerDirection);
    const curPathCost = pathCosts[curState.playerDirection][boxTileIdx];
    const moveCosts = getPlayerMoveCost(level, playerTileIdx, boxTileIdx);

    // Find all possible pulls with the number of moves required, update the costs and heap
    for (const pullDirection of level.getPullableDirectionsForTileIdx(boxTileIdx)) {
      // Test if the player can approach the box from the pull direction
      const playerTileIdxBeforePull = level.shiftTileIdInDirection(boxTileIdx, pullDirection);
      if (moveCosts[playerTileIdxBeforePull] === Number.MAX_SAFE_INTEGER) {
        // Player cannot access the box from this side, because the box is blocking the way
        continue;
      }

      // Check if there is new optimal cost before the pull
      const costBeforePull = curPathCost + moveCosts[playerTileIdxBeforePull];
      if (pathCosts[pullDirection][boxTileIdx] > costBeforePull) {
        pathCosts[pullDirection][boxTileIdx] = costBeforePull;
      }

      // Check if there is new optimal cost after the pull
      const costAfterPull = costBeforePull + 1;
      if (pathCosts[pullDirection][playerTileIdxBeforePull] > costAfterPull) {
        pathCosts[pullDirection][playerTileIdxBeforePull] = costAfterPull;
        statesHeap.add(costAfterPull, new StateForGoalPathCostComputation(playerTileIdxBeforePull, pullDirection));
      }
    }
  }

  // Return the best cost for every tileIdx
  const ret = new Array<number>(level.tilesTotal).fill(Number.MAX_SAFE_INTEGER);
  pathCosts.forEach((costs) => {
    for (let i = 0; i < costs.length; i++) {
      ret[i] = Math.min(ret[i], costs[i]);
    }
  });

  return ret;
}

export function getPlayerMoveCost(level: LevelForSolver, start: number, curBox: number): number[] {
  const costs: number[] = new Array<number>(level.tilesTotal).fill(Number.MAX_SAFE_INTEGER);
  costs[start] = 0;

  let reachedDirectionsNum = 0;
  const tilesToReach = Array<number>();
  for (const direction of getAllDirectionEnumValues()) {
    const shifted = level.shiftTileIdInDirection(curBox, direction);
    if (!level.isWallAt[shifted]) {
      tilesToReach.push(shifted);
    }
  }

  let stack: number[] = [start];
  let nextStack: number[] = [];
  let curCost = 0;
  while (stack.length > 0) {
    while (stack.length > 0) {
      const state = stack.pop()!;
      for (const direction of getAllDirectionEnumValues()) {
        const nextState = level.shiftTileIdInDirection(state, direction);
        if (level.isWallAt[nextState]) {
          continue;
        }
        if (nextState !== curBox && costs[nextState] > curCost+1) {
          // New optimum found
          costs[nextState] = curCost+1;
          nextStack.push(nextState);
          for (const tileToReach of tilesToReach) {
            if (nextState === tileToReach) {
              reachedDirectionsNum++;
              // Check if the box was reached from every possible direction
              if (reachedDirectionsNum === tilesToReach.length) {
                return costs;
              }
            }
          }
        }
      }
    }
    stack = nextStack;
    nextStack = [];
    curCost++;
  }
  return costs;
}