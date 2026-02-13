import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import LevelState from "@/src/Classes/LevelState";
import {getMatrixOfSize, getTransposedMatrix} from "@/src/Util/MatrixUtils";
import {DirectionEnum, getOppositeDirection, getRotatedDirection} from "@/src/Enum/DirectionEnum";
import {getAllReachableTiles} from "@/src/Util/StateExplorationUtils";
import emptySvg from "@/src/Svg/Tiles/empty_tile.svg";
import wallSvg from "@/src/Svg/Tiles/wall.svg";
import goalSvg from "@/src/Svg/Tiles/goal.svg";
import boxSvg from "@/src/Svg/Tiles/box.svg";
import playerSvg from "@/src/Svg/Tiles/player.svg";
import boxOnGoalSvg from "@/src/Svg/Tiles/box_on_goal.svg";
import playerOnGoalSvg from "@/src/Svg/Tiles/player_on_goal.svg";
import errorSvg from "@/src/Svg/Tiles/error.svg";

export const NO_PLAYER_COORDINATES = new GridCoordinates(-1,-1);

export default class Level {
  lenX: number;
  lenY: number;
  levelTiles: LevelTileEnum[][];
  initialBoxes: GridCoordinates[];
  initialPlayer: GridCoordinates;

  constructor(lenX: number, lenY: number, levelTiles: LevelTileEnum[][],
              initialBoxes: GridCoordinates[], initialPlayer: GridCoordinates) {
    this.lenX = lenX;
    this.lenY = lenY;
    this.levelTiles = levelTiles;
    this.initialPlayer = initialPlayer;
    this.initialBoxes = initialBoxes;
  }

  // _______________________ Function section: get information about the level _______________________

  getInitialLevelState() {
    return new LevelState(this, this.initialPlayer, Array.from(this.initialBoxes), 0);
  }

  getTileAt(coordinates: GridCoordinates) {
    return this.levelTiles[coordinates.x][coordinates.y];
  }

  isInitialPlayerAt(coordinates: GridCoordinates) {
    return this.initialPlayer.equals(coordinates);
  }

  isWallAt(coordinates: GridCoordinates) {
    return this.getTileAt(coordinates) == LevelTileEnum.WALL;
  }

  isGoalAt(coordinates: GridCoordinates) {
    return this.getTileAt(coordinates) == LevelTileEnum.GOAL;
  }

  isEmptyTileAt(coordinates: GridCoordinates) {
    return this.getTileAt(coordinates) == LevelTileEnum.EMPTY;
  }

  isInitiallyEmptyAt(coordinates: GridCoordinates) {
    return this.isEmptyTileAt(coordinates) &&
      !this.isInitialPlayerAt(coordinates) &&
      this.getInitialBoxIdxAt(coordinates) == null;
  }

  getInitialBoxIdxAt(coordinates: GridCoordinates): number|null {
    const idx = this.initialBoxes.findIndex((e) => e.equals(coordinates));
    return idx == -1 ? null : idx;
  }

  isValidPlaceForObjectAt(coordinates: GridCoordinates){
    return coordinates.x >= 0
        && coordinates.y >= 0
        && coordinates.x < this.lenX
        && coordinates.y < this.lenY
        && !this.isWallAt(coordinates)
  }

  isInitialPlayerAtNoPlayerCoordinates() {
    return NO_PLAYER_COORDINATES.equals(this.initialPlayer);
  }

  isCornerAt(coordinates: GridCoordinates): boolean {
    if (!this.isValidPlaceForObjectAt(coordinates)) {
      return false;
    }
    const isBlockedUp = !this.isValidPlaceForObjectAt(coordinates.getShifted(DirectionEnum.UP));
    const isBlockedLeft = !this.isValidPlaceForObjectAt(coordinates.getShifted(DirectionEnum.LEFT));
    const isBlockedDown = !this.isValidPlaceForObjectAt(coordinates.getShifted(DirectionEnum.DOWN));
    const isBlockedRight = !this.isValidPlaceForObjectAt(coordinates.getShifted(DirectionEnum.RIGHT));
    return isBlockedUp && isBlockedLeft ||
        isBlockedLeft && isBlockedDown ||
        isBlockedDown && isBlockedRight ||
        isBlockedRight && isBlockedUp;
  }

  canBoxBePushedInDirectionAt(coordinates: GridCoordinates, direction: DirectionEnum): boolean {
    const requiredPlayerPosition = coordinates.getShifted(getOppositeDirection(direction));
    const movedBoxCoords = coordinates.getShifted(direction);
    return this.isValidPlaceForObjectAt(movedBoxCoords) && this.isValidPlaceForObjectAt(requiredPlayerPosition);
  }

  getLevelCopy() {
    return new Level(this.lenX, this.lenY, this.levelTiles, this.initialBoxes, this.initialPlayer);
  }

  // _______________________ Function section: changing the level _______________________

  changeTileTo(coordinates: GridCoordinates, tile: LevelTileEnum){
    this.levelTiles[coordinates.x][coordinates.y] = tile;
  }

  removeInitialBoxAt(coordinates: GridCoordinates){
    this.initialBoxes = this.initialBoxes.filter((c) => {return !c.equals(coordinates)});
  }

  addInitialBoxAt(coordinates: GridCoordinates){
    this.initialBoxes.push(coordinates);
  }

  moveInitialPlayerTo(coordinates: GridCoordinates){
    this.initialPlayer = coordinates;
  }

  changeLevelBasedOnBrushClick(coordinates: GridCoordinates, tileEnum: LevelTileEnum){
    const isInitiallyEmptyAt = this.isInitiallyEmptyAt(coordinates);
    const isEmptyTile = this.isEmptyTileAt(coordinates);
    const isWall = this.isWallAt(coordinates);
    const isGoal = this.isGoalAt(coordinates);
    const isBox = this.getInitialBoxIdxAt(coordinates) != null;
    const isPlayer = this.isInitialPlayerAt(coordinates);

    switch (tileEnum) {
      case LevelTileEnum.EMPTY:
        if (isInitiallyEmptyAt) {
          return;
        }
        if (isWall || isGoal) {
          this.changeTileTo(coordinates, LevelTileEnum.EMPTY);
        }
        if (isBox) {
          this.removeInitialBoxAt(coordinates);
        }
        if (isPlayer) {
          this.moveInitialPlayerTo(NO_PLAYER_COORDINATES);
        }
        break;
      case LevelTileEnum.WALL:
        if (isWall) {
          return;
        }
        if (isEmptyTile || isGoal) {
          this.changeTileTo(coordinates, LevelTileEnum.WALL);
        }
        if (isBox) {
          this.removeInitialBoxAt(coordinates);
        }
        if (isPlayer) {
          this.moveInitialPlayerTo(NO_PLAYER_COORDINATES);
        }
        break;
      case LevelTileEnum.GOAL:
        if (isGoal) {
          return;
        }
        if (isEmptyTile || isWall) {
          this.changeTileTo(coordinates, LevelTileEnum.GOAL);
        }
        break;
      case LevelTileEnum.BOX:
        if (isBox) {
          return;
        }
        if (isWall) {
          this.changeTileTo(coordinates, LevelTileEnum.EMPTY);
        }
        if (isPlayer) {
          this.moveInitialPlayerTo(NO_PLAYER_COORDINATES);
        }
        this.addInitialBoxAt(coordinates);
        break;
      case LevelTileEnum.PLAYER:
        if (isPlayer) {
          return;
        }
        if (isWall) {
          this.changeTileTo(coordinates, LevelTileEnum.EMPTY);
        }
        if (isBox) {
          this.removeInitialBoxAt(coordinates);
        }
        this.moveInitialPlayerTo(coordinates);
        break;
      default:
        throw new Error("Tile change not supported for enum: " + tileEnum);
    }
  }

  changeLevelDimensions(newLenX: number, newLenY: number){
    const newLevelTiles = getMatrixOfSize(newLenX, newLenY, LevelTileEnum.EMPTY);
    for (let x = 0; x < Math.min(newLenX, this.lenX); x++) {
      for (let y = 0; y < Math.min(newLenY, this.lenY); y++) {
        newLevelTiles[x][y] = this.levelTiles[x][y];
      }
    }
    this.levelTiles = newLevelTiles;
    this.initialBoxes = this.initialBoxes.filter(box => box.x < newLenX && box.y < newLenY);
    if (this.initialPlayer.x >= newLenX || this.initialPlayer.y >= newLenY) {
      this.moveInitialPlayerTo(NO_PLAYER_COORDINATES);
    }
    this.lenX = newLenX;
    this.lenY = newLenY;
  }

  getLevelTransposed(): Level {
    return new Level(
        this.lenY,
        this.lenX,
        getTransposedMatrix(this.levelTiles),
        this.initialBoxes.map(box => new GridCoordinates(box.y, box.x)),
        new GridCoordinates(this.initialPlayer.y, this.initialPlayer.x)
    );
  }

  // _______________________ Function section: creating masks _______________________

  getPlayableAreaMask(): boolean[][] {
    if (this.isInitialPlayerAtNoPlayerCoordinates()) {
      return getMatrixOfSize(this.lenX, this.lenY, true);
    }
    return getAllReachableTiles(this.lenX, this.lenY, this.initialPlayer, (c) => !this.isValidPlaceForObjectAt(c));
  }

  getAllCornersInMask(mask: boolean[][]): GridCoordinates[] {
    const corners: GridCoordinates[] = [];
    for (let x = 0; x < this.lenX; x++) {
      for (let y = 0; y < this.lenY; y++) {
        if (!mask[x][y]) {
          continue;
        }
        const tile = new GridCoordinates(x,y);
        if (this.isCornerAt(tile)) {
          corners.push(tile);
        }
      }
    }
    return corners;
  }

  getViableBoxMask(): boolean[][] {
    const viableBoxMask: boolean[][] = this.getPlayableAreaMask();
    const corners: GridCoordinates[] = this.getAllCornersInMask(viableBoxMask);
    for (const corner of corners) {
      if (!this.isGoalAt(corner)) {
        viableBoxMask[corner.x][corner.y] = false;
      }
      for (const direction of [DirectionEnum.RIGHT, DirectionEnum.DOWN]) {
        if (this.isValidPlaceForObjectAt(corner.getShifted(direction))) {
          const exploredTiles: GridCoordinates[] = [];
          let curPosition = corner;
          while (true) {
            exploredTiles.push(curPosition);
            // If the line contains a goal, it is viable
            if (this.isGoalAt(curPosition)) {
              break;
            }
            // No goal was found and the search ended in a corner, the line is unviable
            if (exploredTiles.length > 1 && this.isCornerAt(curPosition)) {
              for (const exploredTile of exploredTiles) {
                viableBoxMask[exploredTile.x][exploredTile.y] = false;
              }
              break;
            }
            // See if the box could move in a different direction at the next position
            const nextPosition = curPosition.getShifted(direction);
            if (this.canBoxBePushedInDirectionAt(nextPosition, getRotatedDirection(direction))) {
              break;
            }
            curPosition = nextPosition;
          }
        }
      }
    }
    return viableBoxMask;
  }

  // _______________________ Function section: other _______________________

  transformTileAtCoordinates<T>(coords: GridCoordinates, empty: T, wall: T, goal: T, box: T, player: T,
                                boxOnGoal: T, playerOnGoal: T, error: T, levelState?: LevelState): T {
    const isEmpty = this.isEmptyTileAt(coords);
    const isWall = this.isWallAt(coords);
    const isGoal = this.isGoalAt(coords);
    const isBox = levelState ? levelState.getBoxIdxAt(coords) != null : this.getInitialBoxIdxAt(coords) != null;
    const isPlayer = levelState ? levelState.isPlayerAt(coords) : this.isInitialPlayerAt(coords);
    if ((isWall && isPlayer) || (isWall && isBox) || (isBox && isPlayer)) {
      return error;
    } else if (isWall) {
      return wall;
    } else if (isGoal && isBox) {
      return boxOnGoal;
    } else if (isGoal && isPlayer) {
      return playerOnGoal;
    } else if (isGoal) {
      return goal;
    } else if (isBox) {
      return box;
    } else if (isPlayer) {
      return player;
    } else if (isEmpty) {
      return empty;
    } else {
      return error;
    }
  }

  getSvgForTile(x: number, y: number, levelState?: LevelState) {
    return this.transformTileAtCoordinates(new GridCoordinates(x,y), emptySvg, wallSvg,
        goalSvg, boxSvg, playerSvg, boxOnGoalSvg, playerOnGoalSvg, errorSvg, levelState);
  }

  getCharForTile(x: number, y: number, levelState?: LevelState) {
    return this.transformTileAtCoordinates(new GridCoordinates(x,y), "", "\u25A0",
        "\u2E31", "\u2D54", "\u1433", "\u2D59", "\u1437", "\u2620", levelState);
  }

  getTileEnumForTile(x: number, y: number, levelState?: LevelState) {
    return this.transformTileAtCoordinates(new GridCoordinates(x,y), LevelTileEnum.EMPTY, LevelTileEnum.WALL,
        LevelTileEnum.GOAL, LevelTileEnum.BOX, LevelTileEnum.PLAYER, LevelTileEnum.BOX_ON_GOAL,
        LevelTileEnum.PLAYER_ON_GOAL, LevelTileEnum.EMPTY, levelState);
  }

}
