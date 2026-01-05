import {useState} from "react";
import {GridCoordinates} from "@/src/Shared/Classes/GridCoordinates";
import {getNameTileType, LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";
import {Level} from "@/src/Shared/Classes/Level";
import {Board} from "@/src/Shared/Components/Board";

export function LevelEditor() {
  const demoLenX = 5, demoLenY = 5;
  const demoLevelTiles = [...Array(demoLenX)].map(() => new Array(demoLenY).fill(LevelTileEnum.EMPTY));
  demoLevelTiles[3][2] = LevelTileEnum.WALL;
  demoLevelTiles[3][0] = LevelTileEnum.GOAL;
  demoLevelTiles[0][4] = LevelTileEnum.GOAL;
  const demoLevel = new Level(demoLenX, demoLenY, demoLevelTiles,
      [new GridCoordinates(1, 1), new GridCoordinates(3, 3)],
      new GridCoordinates(2, 2));

  const [level, setLevel] = useState<Level>(demoLevel);
  const [tileBrush, setTileBrush] = useState<LevelTileEnum>(LevelTileEnum.WALL);

  function tileOnClickHandler(x: number, y: number) {
    level.changeLevelBasedOnBrushClick(new GridCoordinates(x,y), tileBrush);
    setLevel(new Level(level.lenX, level.lenY, level.levelTiles, level.initialBoxes, level.initialPlayer));
  }

  const radioOptions: LevelTileEnum[] =
      [LevelTileEnum.EMPTY, LevelTileEnum.WALL, LevelTileEnum.GOAL, LevelTileEnum.BOX, LevelTileEnum.PLAYER];

  return (
      <div>
        <div className={"mx-auto border-black border-2 w-50 p-2"}>
          <form>
            <p>Tile brush:</p>
            {
              radioOptions.map((tileEnum: LevelTileEnum) =>
                <div key={"Brush radio div for enum: " + tileEnum}>
                  <label>
                  <input key={"Radio for" + tileEnum}
                      type="radio"
                      name="brushRadio"
                      value={tileEnum}
                      checked={tileBrush == tileEnum}
                      onChange={() => setTileBrush(tileEnum)}
                    /> {getNameTileType(Number(tileEnum))}
                  </label>
                  <br/>
                </div>
              )
            }
          </form>
        </div>
        <div className={"my-4 flex justify-center"}>
          <Board key={"board"} level={level} tileOnClickHandler={tileOnClickHandler}/>
        </div>
      </div>
  );
}