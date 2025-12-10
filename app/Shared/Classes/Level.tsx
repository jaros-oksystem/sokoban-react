import {LevelTileEnum} from "@/app/Shared/Enum/LevelTileEnum";
import {GridCoordinates} from "@/app/Shared/Classes/GridCoordinates";
import {LevelState} from "@/app/Shared/Classes/LevelState";

export class Level {
  lenX: number;
  lenY: number;
  levelTiles: LevelTileEnum[][];
  initialPlayer: Readonly<GridCoordinates>;
  initialBoxes: Readonly<GridCoordinates>[];

  constructor(lenX: number, lenY: number, levelTiles: LevelTileEnum[][],
              initialPlayer: Readonly<GridCoordinates>, initialBoxes: Readonly<GridCoordinates>[]) {
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

  isEmptyAt(coordinates: GridCoordinates) {
    return this.getTileAt(coordinates) == LevelTileEnum.EMPTY;
  }

  getInitialBoxIdxAt(coordinates: GridCoordinates): number|null {
    const idx = this.initialBoxes.findIndex((e) => e.equals(coordinates));
    return idx == -1 ? null : idx;
  }

  canObjectBeAt(coordinates: GridCoordinates){
    return coordinates.x >= 0
        && coordinates.y >= 0
        && coordinates.x < this.lenX
        && coordinates.y < this.lenY
        && !this.isWallAt(coordinates)
  }

}
