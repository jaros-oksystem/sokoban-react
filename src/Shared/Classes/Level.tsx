import {LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";
import {GridCoordinates} from "@/src/Shared/Classes/GridCoordinates";
import {LevelState} from "@/src/Shared/Classes/LevelState";

export const noPlayerCoordinates = new GridCoordinates(-1,-1);

export class Level {
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

  getInitialLevelState() {
    return new LevelState(this.initialPlayer, this.initialBoxes.slice(), 0, false);
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

  isValidPlaceForObjectAtCoordinates(coordinates: GridCoordinates){
    return coordinates.x >= 0
        && coordinates.y >= 0
        && coordinates.x < this.lenX
        && coordinates.y < this.lenY
        && !this.isWallAt(coordinates)
  }

  coordinatesToTileId(coordinates: GridCoordinates): number {
    return this.lenY*coordinates.x + coordinates.y;
  }

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
    const isCompletelyEmpty = this.isInitiallyEmptyAt(coordinates);
    const isEmptyTile = this.isEmptyTileAt(coordinates);
    const isWall = this.isWallAt(coordinates);
    const isGoal = this.isGoalAt(coordinates);
    const isBox = this.getInitialBoxIdxAt(coordinates) != null;
    const isPlayer = this.isInitialPlayerAt(coordinates);

    switch (tileEnum) {
      case LevelTileEnum.EMPTY:
        if (isCompletelyEmpty) {
          return;
        }
        if (isWall || isGoal) {
          this.changeTileTo(coordinates, LevelTileEnum.EMPTY);
        }
        if (isBox) {
          this.removeInitialBoxAt(coordinates);
        }
        if (isPlayer) {
          this.moveInitialPlayerTo(noPlayerCoordinates);
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
          this.moveInitialPlayerTo(noPlayerCoordinates);
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
          this.moveInitialPlayerTo(noPlayerCoordinates);
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
        throw new Error("Tile chang not supported for enum: " + tileEnum);
    }
  }

}
