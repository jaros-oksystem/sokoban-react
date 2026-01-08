export enum LevelTileEnum {
  EMPTY,
  WALL,
  GOAL,
  // The following values are used only in the level editor and board rendering
  BOX,
  PLAYER,
  BOX_ON_GOAL,
  PLAYER_ON_GOAL,
}

export function getCharForTileType(tileType: LevelTileEnum): string {
  switch (tileType) {
    case LevelTileEnum.EMPTY: return "";
    case LevelTileEnum.WALL: return "\u25A0";
    case LevelTileEnum.GOAL: return "\u2E31";
    case LevelTileEnum.BOX: return "\u2D54";
    case LevelTileEnum.PLAYER: return "\u1433";
    case LevelTileEnum.BOX_ON_GOAL: return "\u2D59";
    case LevelTileEnum.PLAYER_ON_GOAL: return "\u1437";
  }
}

export function getTileTypeName(tileType: LevelTileEnum): string {
  switch (tileType) {
    case LevelTileEnum.EMPTY: return "Empty";
    case LevelTileEnum.WALL: return "Wall";
    case LevelTileEnum.GOAL: return "Goal";
    case LevelTileEnum.BOX: return "Box";
    case LevelTileEnum.PLAYER: return "Player";
    case LevelTileEnum.BOX_ON_GOAL: return "Box on goal";
    case LevelTileEnum.PLAYER_ON_GOAL: return "Player on goal";
  }
}