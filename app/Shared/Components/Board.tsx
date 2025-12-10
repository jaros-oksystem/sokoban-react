import {Level} from "@/app/Shared/Classes/Level";
import {GridCoordinates} from "@/app/Shared/Classes/GridCoordinates";
import {LevelState} from "@/app/Shared/Classes/LevelState";

interface Props {
  level: Level,
  levelState?: LevelState,
  tileOnClickHandler?: (x: number, y :number) => void
}

export function Board({level, levelState, tileOnClickHandler = () => {}} : Readonly<Props>) {

  function getTextSymbolForTile(x: number, y:number): string {
    const coords = new GridCoordinates(x,y);
    const isBox = levelState ? levelState.getBoxIdxAt(coords) != null : level.getInitialBoxIdxAt(coords) != null;
    const isPlayer = levelState ? levelState.isPlayerAt(coords) : level.isInitialPlayerAt(coords);
    const isWall = level.isWallAt(coords);
    const isGoal = level.isGoalAt(coords);
    const isEmpty = level.isEmptyAt(coords);
    if ((isWall && isPlayer) || (isWall && isBox) || (isBox && isPlayer)) {
      return "\u2620"; // Error - Invalid state - collision
    } else if (isWall) {
      return "\u25A0";
    } else if (isGoal && isBox) {
      return "\u2D59";
    } else if (isGoal && isPlayer) {
      return "\u1437";
    } else if (isGoal) {
      return "\u2E31";
    } else if (isBox) {
      return "\u2D54";
    } else if (isPlayer) {
      return "\u1433";
    } else if (isEmpty){
      return "";
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