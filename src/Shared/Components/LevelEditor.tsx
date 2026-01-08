import {useState} from "react";
import GridCoordinates from "@/src/Shared/Classes/GridCoordinates";
import {getTileTypeName, LevelTileEnum} from "@/src/Shared/Enum/LevelTileEnum";
import Level from "@/src/Shared/Classes/Level";
import Board from "@/src/Shared/Components/Board";
import getLevelCodeFromLevel from "@/src/Shared/Util/LevelCode/EncodingUtils";
import getLevelFromLevelCode from "@/src/Shared/Util/LevelCode/DecodingUtils";
import {isStringAPositiveInteger} from "@/src/Shared/Util/StringUtils";
import Separator from "@/src/Shared/Components/BasicComponents/Separator";
import BlueButton from "@/src/Shared/Components/BasicComponents/BlueButton";

interface Props {
  initialLevel: Level
}

export default function LevelEditor({initialLevel}: Readonly<Props>) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [tileBrush, setTileBrush] = useState<LevelTileEnum>(LevelTileEnum.WALL);
  const [lenXText, setLenXText] = useState(level.lenX + "");
  const [lenYText, setLenYText] = useState(level.lenY + "");
  const [levelCodeText, setLevelCodeText] = useState("");

  function tileOnClickHandler(x: number, y: number) {
    level.changeLevelBasedOnBrushClick(new GridCoordinates(x,y), tileBrush);
    setLevel(level.getLevelCopy());
  }

  function setDimensionsHandler() {
    if (isStringAPositiveInteger(lenXText) && isStringAPositiveInteger(lenYText)) {
      const newXLen = Number.parseInt(lenXText);
      const newYLen = Number.parseInt(lenYText);
      level.changeLevelDimensions(newXLen, newYLen);
      setLevel(level.getLevelCopy());
    } else {
      alert("Both values must be positive integers");
    }
  }

  function generateLevelCodeButtonHandler() {
    if (level.isPlayerInNoPlayerCoordinates()) {
      alert("Level does not contain a player. Code cannot be generated.")
    } else {
      setLevelCodeText(getLevelCodeFromLevel(level))
    }
  }

  function loadLevelCodeButtonHandler() {
    try {
      const newLevel = getLevelFromLevelCode(levelCodeText.trim());
      setLevel(newLevel);
      setLenXText(newLevel.lenX + "");
      setLenYText(newLevel.lenY + "");
    } catch {
      alert("Invalid level code.");
    }
  }

  return (
      <div>
        <div className="flex flex-row border-black border-2 w-202 p-2 mx-auto">
          <div className="pl-2 w-26">
            <p>Tile brush:</p>
            {
              [LevelTileEnum.EMPTY, LevelTileEnum.WALL, LevelTileEnum.GOAL, LevelTileEnum.BOX, LevelTileEnum.PLAYER]
                .map((tileEnum: LevelTileEnum) =>
                  <div key={"Brush radio div for enum: " + tileEnum}>
                    <label>
                      <input type="radio"
                             name="brushRadio"
                             value={tileEnum}
                             checked={tileBrush == tileEnum}
                             onChange={() => setTileBrush(tileEnum)}
                      /> {getTileTypeName(Number(tileEnum))}
                    </label>
                    <br/>
                  </div>
              )
            }
          </div>
          <Separator/>
          <div className="w-50 px-4">
            <p>Change level size:</p>
            <div className="mt-2 grid grid-cols-[45%_55%] grid-rows-3">
              <p>Width:</p>
              <textarea
                  value={lenXText} minLength={1} maxLength={8}
                  className="outline resize-none h-6 pl-1"
                  onChange={(e) => setLenXText(e.target.value)}/>
              <p>Height:</p>
              <textarea
                  value={lenYText} minLength={1} maxLength={8}
                  className="outline resize-none h-6 pl-1"
                  onChange={(e) => setLenYText(e.target.value)}/>
              <div className="col-span-2 row-start-3 mx-auto">
                <BlueButton text="Set level size" onClick={() => setDimensionsHandler()} />
              </div>
            </div>
          </div>
          <Separator/>
          <div className="pl-4">
            <div className="grid grid-cols-[53%_47%] grid-rows-[70%_30%] gap-2 h-36">
              <div className="col-span-2">
                <textarea
                    className="outline resize-none px-1 overflow-auto text-sm"
                    value={levelCodeText}
                    onChange={(e) => setLevelCodeText(e.target.value)}
                    cols={57} rows={5}/>
              </div>
              <BlueButton text={"\u21E7 Generate code from level"} onClick={() => generateLevelCodeButtonHandler()}/>
              <BlueButton text={"\u21E9 Load level from code"} onClick={() => loadLevelCodeButtonHandler()}/>
            </div>
          </div>
        </div>
        <div className="my-4 flex justify-center">
          <Board level={level} tileOnClickHandler={tileOnClickHandler}/>
        </div>
      </div>
  );
}