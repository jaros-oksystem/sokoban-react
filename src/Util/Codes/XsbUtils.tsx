import Level from "@/src/Classes/Level";
import {getMatrixOfSize, getMatrixWithConditionalFill} from "@/src/Util/MatrixUtils";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";

// https://sokosolve.sourceforge.net/FileFormatXSB.html
const EMPTY_CHAR = ' ';
const WALL_CHAR = '#';
const GOAL_CHAR = '.';
const BOX_CHAR = '$';
const PLAYER_CHAR = '@';
const BOX_ON_GOAL_CHAR = '*';
const PLAYER_ON_GOAL_CHAR = '+';
const ERROR_CHAR = 'E';

export function getLevelFromXsbCode(xsbCode: string): Level {
  const xsbLines = xsbCode.split('\n');
  const lenX = Math.max(...xsbLines.map(l => l.length));
  const lenY = xsbLines.length;
  let player: GridCoordinates = new GridCoordinates(-1,-1);
  const boxes: GridCoordinates[] = [];
  const tiles: LevelTileEnum[][] = getMatrixOfSize(lenX, lenY, LevelTileEnum.EMPTY);
  for (let y = 0; y < xsbLines.length; y++) {
    for (let x = 0; x < xsbLines[y].length; x++) {
      switch (xsbLines[y].charAt(x)) {
        case EMPTY_CHAR:
          break;
        case WALL_CHAR:
          tiles[x][y] = LevelTileEnum.WALL;
          break;
        case GOAL_CHAR:
          tiles[x][y] = LevelTileEnum.GOAL;
          break;
        case BOX_CHAR:
          boxes.push(new GridCoordinates(x,y));
          break;
        case BOX_ON_GOAL_CHAR:
          tiles[x][y] = LevelTileEnum.GOAL;
          boxes.push(new GridCoordinates(x,y));
          break;
        case PLAYER_CHAR:
          player = new GridCoordinates(x,y);
          break;
        case PLAYER_ON_GOAL_CHAR:
          player = new GridCoordinates(x,y);
          tiles[x][y] = LevelTileEnum.GOAL;
          break;
        default:
          throw new Error("Error parsing XSB code - unknown character");
      }
    }
  }
  return new Level(lenX, lenY, tiles, boxes, player);
}

export function getXsbCodeFromLevel(level: Level): string {
  return getMatrixWithConditionalFill(level.lenY, level.lenX, (x,y) => {
    return level.transformTileAtCoordinates(new GridCoordinates(y,x), EMPTY_CHAR, WALL_CHAR,
        GOAL_CHAR, BOX_CHAR, PLAYER_CHAR, BOX_ON_GOAL_CHAR, PLAYER_ON_GOAL_CHAR, ERROR_CHAR);
  }).map((row) => row.join('').trimEnd()).join("\n");
}