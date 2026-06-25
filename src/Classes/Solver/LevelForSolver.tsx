import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";
import Level from "../Level";
import {DirectionEnum, getAllDirectionEnumValues} from "@/src/Enum/DirectionEnum";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {
  enlargeMatrixOnEachSide,
  getMatrixWithConditionalFill, getGridCoordinatesSatisfyingConditionInMatrix
} from "@/src/Util/MatrixUtils";
import {getGoalPathCostsForGoal} from "@/src/Algo/Solver/GoalPathCostUtils";

/**
 * Level structure more optimized for the solver
 */
export class LevelForSolver {
  // Dimensions
  lenX: number;
  lenY: number;
  tilesTotal: number;

  // Initial state of boxes and player
  initialBoxes: Array<number>;
  initialPlayer: number;

  // Walls
  isWallAt: Array<boolean>;

  // Goals
  goals: Array<number>;
  getGoalIdxFromTileIdx: Array<number>;

  // Pre-computed values
  isInPlayableArea: Array<boolean>;
  goalPathCosts: Array<Array<number>>;
  minGoalPathCosts: Array<number>;

  constructor(level: Level) {
    let levelTransformed = removeUnreachableGoals(turnUnmovableBoxesOnGoalsIntoWalls(level));
    if (level.hasAccessibleBoundaries()) {
      levelTransformed = addALayerOfWallsAroundTheLevelBounds(levelTransformed);
    }

    this.lenX = levelTransformed.lenX;
    this.lenY = levelTransformed.lenY;
    this.tilesTotal = levelTransformed.lenX * levelTransformed.lenY;
    this.initialBoxes = levelTransformed.initialBoxes.map(box => box.toTileIdx(levelTransformed.lenY))
    this.initialPlayer = levelTransformed.isInitialPlayerAtNoPlayerCoordinates() ? -1 : levelTransformed.initialPlayer.toTileIdx(levelTransformed.lenY);
    this.isInPlayableArea = levelTransformed.getPlayableAreaMask().flat();

    // Transform the level tiles
    const levelTilesFlat = levelTransformed.levelTiles.flat();
    this.isWallAt = new Array<boolean>(this.tilesTotal);
    this.goals = new Array<number>();
    this.getGoalIdxFromTileIdx = new Array<number>(this.tilesTotal).fill(-1);
    for (let i = 0; i < levelTilesFlat.length; i++) {
      if (levelTilesFlat[i] === LevelTileEnum.GOAL) {
        this.goals.push(i);
        this.getGoalIdxFromTileIdx[i] = i;
      } else if (levelTilesFlat[i] === LevelTileEnum.WALL) {
        this.isWallAt[i] = true;
      }
    }

    // Compute goal path costs
    this.goalPathCosts = new Array<Array<number>>(this.goals.length);
    this.minGoalPathCosts = new Array<number>(this.tilesTotal).fill(Number.MAX_SAFE_INTEGER);
    for (let i = 0; i < this.goalPathCosts.length; i++) {
      const costs = getGoalPathCostsForGoal(this, this.goals[i]);
      for (let j = 0; j < costs.length; j++) {
        this.minGoalPathCosts[j] = Math.min(this.minGoalPathCosts[j], costs[j]);
      }
      this.goalPathCosts[i] = costs;
    }

  }

  isGoalAtTileId(tileIdx: number): boolean {
    return this.getGoalIdxFromTileIdx[tileIdx] >= 0;
  }

  isViable(tileIdx: number): boolean {
    return this.minGoalPathCosts[tileIdx] !== Number.MAX_SAFE_INTEGER;
  }

  getNumberOfGoalsInPlayableArea(): number {
    return this.goals.filter(goal => this.isInPlayableArea[goal]).length;
  }

  getNumberOfInitialBoxesInPlayableArea(): number {
    return this.initialBoxes.filter(box => this.isInPlayableArea[box]).length;
  }

  shiftTileIdInDirection(tileIdx: number, direction: DirectionEnum): number {
    switch (direction) {
      case DirectionEnum.UP:    return tileIdx - 1;
      case DirectionEnum.DOWN:  return tileIdx + 1;
      case DirectionEnum.LEFT:  return tileIdx - this.lenY;
      case DirectionEnum.RIGHT: return tileIdx + this.lenY;
    }
  }

  getPullableDirectionsForTileIdx(tileIdx: number): DirectionEnum[] {
    const ret: DirectionEnum[] = [];
    for (const direction of getAllDirectionEnumValues()) {
      if (this.isPullableInDirection(tileIdx, direction)) {
        ret.push(direction);
      }
    }
    return ret;
  }

  isPullableInDirection(tileIdx: number, direction: DirectionEnum): boolean {
    const shiftedTileOnce = this.shiftTileIdInDirection(tileIdx, direction);
    const shiftedTileTwice = this.shiftTileIdInDirection(shiftedTileOnce ?? 0, direction);
    return shiftedTileOnce !== null  && !this.isWallAt[shiftedTileOnce] &&
           shiftedTileTwice !== null && !this.isWallAt[shiftedTileTwice];
  }

  isValidPlaceForObjectInDirection(tileIdx: number, direction: DirectionEnum): boolean {
    const tileShifted = this.shiftTileIdInDirection(tileIdx, direction);
    return tileShifted !== null && !this.isWallAt[tileShifted];
  }

}

function turnUnmovableBoxesOnGoalsIntoWalls(level: Level): Level {
  let ret = level;
  const playableArea = level.getPlayableAreaMask();
  while (true) {
    // Flag boxes which should be turned into walls
    const flagged = getGridCoordinatesSatisfyingConditionInMatrix(ret.lenX, ret.lenY, (x,y) => {
      const coords = new GridCoordinates(x,y);
      return ret.levelTiles[x][y] === LevelTileEnum.GOAL &&
          ret.getInitialBoxIdxAt(coords) !== null &&
             (!playableArea[x][y] || ret.isCornerAt(coords));
    });
    if (flagged.length > 0) {
      // Create a new level with boxes on goals turned into walls
      const newTiles = getMatrixWithConditionalFill(ret.lenX, ret.lenY, (x,y) => ret.levelTiles[x][y]);
      let newBoxes = ret.initialBoxes.slice();
      for (const flag of flagged) {
        newTiles[flag.x][flag.y] = LevelTileEnum.WALL;
        newBoxes = newBoxes.filter(box => !box.equals(flag));
      }
      ret = new Level(ret.lenX, ret.lenY, newTiles, newBoxes, ret.initialPlayer);
    } else {
      return ret;
    }
  }
}

function removeUnreachableGoals(level: Level): Level {
  const newTiles = getMatrixWithConditionalFill(level.lenX, level.lenY, (x,y) => {
    if (!level.getPlayableAreaMask()[x][y] && level.levelTiles[x][y] == LevelTileEnum.GOAL) {
      return LevelTileEnum.EMPTY;
    } else {
      return level.levelTiles[x][y];
    }
  });
  return new Level(level.lenX, level.lenY, newTiles, level.initialBoxes, level.initialPlayer);
}

function addALayerOfWallsAroundTheLevelBounds(level: Level): Level {
  const newTiles = enlargeMatrixOnEachSide(level.levelTiles, LevelTileEnum.WALL);
  const movedBoxes = level.initialBoxes.map((box) => box.shiftByXY(1,1));
  const movedPlayer = level.initialPlayer.shiftByXY(1,1);
  return new Level(level.lenX+2, level.lenY+2, newTiles, movedBoxes, movedPlayer);
}