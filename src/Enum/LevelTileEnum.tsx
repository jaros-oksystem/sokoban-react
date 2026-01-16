export enum LevelTileEnum {
  EMPTY,
  WALL,
  GOAL,
  BOX,
  PLAYER,
  BOX_ON_GOAL,
  PLAYER_ON_GOAL,
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