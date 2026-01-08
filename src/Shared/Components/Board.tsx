import Level from "@/src/Shared/Classes/Level";
import GridCoordinates from "@/src/Shared/Classes/GridCoordinates";
import LevelState from "@/src/Shared/Classes/LevelState";
import {getCharForTileType, LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";

interface Props {
  level: Level,
  levelState?: LevelState,
  tileOnClickHandler?: (x: number, y: number) => void
}

export default function Board({level, levelState, tileOnClickHandler = () => {}} : Readonly<Props>) {

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

  const sizes =
      level.lenX < 30 && level.lenY < 30 ? "text-3xl h-10 w-10 m-[-1px] border-2 " :
      level.lenX < 50 && level.lenY < 50 ? "text-xl h-8 w-8 m-[-1px] border-2 " :
      level.lenX < 70 && level.lenY < 70 ? "text-[15px] h-6 w-6 mx-[-1px] my-[-3px] border-1 " :
                                           "text-[11px] h-4 w-4 mx-[-1px] my-[-3px] border-0 ";
  const tileClassName = sizes + " align-middle border-black " + (levelState?.won ? " bg-green-100 " : "");

  return (
    <div>
      {
        Array.from({length: level.lenY}, (_: number, y: number) =>
          <div key={"Tile row:" + y} className="whitespace-nowrap">
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
  );

}