import {useEffect, useState} from "react";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {getTileTypeName, LevelTileEnum} from "@/src/Enum/LevelTileEnum";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import getLevelCodeFromLevel from "@/src/Util/LevelCode/EncodingUtils";
import {isStringAPositiveInteger} from "@/src/Util/StringUtils";
import Separator from "@/src/Components/BasicComponents/Separator";
import BlueButton from "@/src/Components/BasicComponents/BlueButton";
import ImportLevelButton from "@/src/Components/DialogueBox/ImportExport/ImportLevelButton";
import ExportLevelButton from "@/src/Components/DialogueBox/ImportExport/ExportLevelButton";
import Link from "next/link";
import {GAME_PAGE_PATH} from "@/src/Constants/PagePaths";
import {DirectionEnum, getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";

interface Props {
  initialLevel: Level
}

const MAX_LEVEL_DIMENSION = 500;

export default function LevelEditor({initialLevel}: Readonly<Props>) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [tileBrush, setTileBrush] = useState<LevelTileEnum>(LevelTileEnum.WALL);
  const [lenXText, setLenXText] = useState(level.lenX + "");
  const [lenYText, setLenYText] = useState(level.lenY + "");

  function tileOnClickHandler(x: number, y: number) {
    level.changeLevelBasedOnBrushClick(new GridCoordinates(x,y), tileBrush);
    setLevel(level.getLevelCopy());
  }

  function setDimensionsHandler() {
    if (isStringAPositiveInteger(lenXText) && isStringAPositiveInteger(lenYText)) {
      const newXLen = Number.parseInt(lenXText);
      const newYLen = Number.parseInt(lenYText);
      if (newXLen > MAX_LEVEL_DIMENSION || newYLen > MAX_LEVEL_DIMENSION) {
        alert("Maximum allowed width and height is " + MAX_LEVEL_DIMENSION);
        return;
      }
      level.changeLevelDimensions(newXLen, newYLen);
      setLevel(level.getLevelCopy());
    } else {
      alert("Both values must be positive integers");
    }
  }

  function loadLevel(level: Level) {
    try {
      setLevel(level);
      setLenXText(level.lenX + "");
      setLenYText(level.lenY + "");
    } catch {
      alert("Invalid level code.");
    }
  }

  const brushes = [LevelTileEnum.EMPTY, LevelTileEnum.WALL, LevelTileEnum.GOAL, LevelTileEnum.BOX, LevelTileEnum.PLAYER];

  useEffect(() => {
    function handleKeyDownEvent(e: KeyboardEvent) {
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction != null) {
        const brushShift =
            direction == DirectionEnum.UP ? -1 :
            direction == DirectionEnum.DOWN ? 1 :
            0;
        setTileBrush(Math.max(0, Math.min(brushes.length-1, brushes.indexOf(tileBrush)+brushShift)));
      }
    }
    document.addEventListener('keydown', handleKeyDownEvent)
    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent)
    }
  });

  return (
      <div>
        <div className="flex flex-row border-black border-2 w-106 p-2 mx-auto rounded-[10] bg-gray-100">
          <div className="pl-2 w-28">
            <p className="text-xl">Tile brush:</p>
            {
              brushes.map((tileEnum: LevelTileEnum) =>
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
          <div className="w-40 px-4">
            <p className="text-xl">Set level size:</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <p>Width:</p>
              <input
                  type="text"
                  value={lenXText} minLength={1} maxLength={3}
                  className="outline resize-none h-6 ml-3 bg-white w-8 pl-[2px]"
                  onChange={(e) => setLenXText(e.target.value)}/>
              <br/>
              <p>Height:</p>
              <input
                  type="text"
                  value={lenYText} minLength={1} maxLength={3}
                  className="outline resize-none h-6 ml-3 bg-white w-8 pl-[2px]"
                  onChange={(e) => setLenYText(e.target.value)}/>
              <br/>
              <div className="col-span-3">
                <BlueButton text="Set level size" onClick={() => setDimensionsHandler()} />
              </div>
            </div>
          </div>
          <Separator/>
          <div className="pl-4 pt-1 flex flex-col justify-center">
            <ExportLevelButton level={level}/>
            <div className="my-1"/>
            <ImportLevelButton onImport={(level: Level) => loadLevel(level)} />
            <div className="my-2"/>
            <Link className="pl-2" href={{ pathname: GAME_PAGE_PATH, query: { level: getLevelCodeFromLevel(level) }}}>
              <BlueButton text={"\u2BC8 Play"}/>
            </Link>
          </div>
        </div>
        <div className="my-4 flex justify-center">
          <GameBoard level={level} tileOnClickHandler={tileOnClickHandler} verticalSpaceTakenPx={250}/>
        </div>
      </div>
  );
}