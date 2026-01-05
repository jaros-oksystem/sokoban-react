import {Level} from "@/src/Shared/Classes/Level";
import {GridCoordinates} from "@/src/Shared/Classes/GridCoordinates";
import {LevelState} from "@/src/Shared/Classes/LevelState";
import {getCharForTileType, LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";

interface Props {
  level: Level,
  levelState?: LevelState,
  tileOnClickHandler?: (x: number, y: number) => void
}

export function Board({level, levelState, tileOnClickHandler = () => {}} : Readonly<Props>) {

  function getTextSymbolForTile(x: number, y: number): string {
    const coords = new GridCoordinates(x,y);
    const isEmpty = level.isEmptyTileAt(coords);
    const isWall = level.isWallAt(coords);
    const isGoal = level.isGoalAt(coords);
    const isBox = levelState ? levelState.getBoxIdxAt(coords) != null : level.getInitialBoxIdxAt(coords) != null;
    const isPlayer = levelState ? levelState.isPlayerAt(coords) : level.isInitialPlayerAt(coords);
    if ((isWall && isPlayer) || (isWall && isBox) || (isBox && isPlayer)) {
      return "\u2620"; // Error - Invalid state - collision
    } else if (isWall) {
      return getCharForTileType(LevelTileEnum.WALL);
    } else if (isGoal && isBox) {
      return getCharForTileType(LevelTileEnum.BOX_ON_GOAL);
    } else if (isGoal && isPlayer) {
      return getCharForTileType(LevelTileEnum.PLAYER_ON_GOAL);
    } else if (isGoal) {
      return getCharForTileType(LevelTileEnum.GOAL);
    } else if (isBox) {
      return getCharForTileType(LevelTileEnum.BOX);
    } else if (isPlayer) {
      return getCharForTileType(LevelTileEnum.PLAYER);
    } else if (isEmpty) {
      return getCharForTileType(LevelTileEnum.EMPTY);
    } else {
      return "\u2622"; // Error - unknown tile
    }
  }

  const tileClassName = "text-3xl h-10 w-10 align-middle border-2 border-black -m-px " +
      (levelState?.won ? "bg-green-100" : "");

  return (
    <div>
      <div>
        {
          Array.from({length: level.lenY}, (_: number, y: number) =>
            <div key={"Tile row div:" + y}>
              {
                Array.from({length: level.lenX}, (_: number, x: number) =>
                    <button
                      key={"Tile, x:" + x + ", y:" + y}
                      onClick={() => tileOnClickHandler(x,y)}
                      className={tileClassName}>
                      {getTextSymbolForTile(x,y)}
                    </button>
                )
              }
            </div>
          )
        }
      </div>
    </div>
  );

}