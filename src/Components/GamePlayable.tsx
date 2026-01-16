import {useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import LevelState from "@/src/Classes/LevelState";
import BlueButton from "@/src/Components/BasicComponents/BlueButton";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {EditButtonMemo} from "@/src/Components/BasicComponents/EditButtonMemo";

interface Props {
  level: Level
}

export default function GamePlayable({level}: Readonly<Props>) {
  const [levelState, setLevelState] = useState<LevelState>(level.getInitialLevelState());

  function resetLevel() {
    setLevelState(level.getInitialLevelState());
  }

  useEffect(() => {
    function handleKeyDownEvent(e: KeyboardEvent) {
      if (levelState.isPlayerAtNoPlayerCoordinates()) {
        return;
      }
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction != null) {
        const newLevelState = levelState.createNewLevelStateForPlayerMove(direction);
        if (newLevelState != null) {
          setLevelState(newLevelState);
        }
      } else if (e.key == "r") {
        resetLevel();
      }
    }
    document.addEventListener('keydown', handleKeyDownEvent)
    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent)
    }
  })

  function clickHandler(x:number, y:number) {
    if (levelState.isPlayerAtNoPlayerCoordinates()) {
      return;
    }
    const newLevelState = levelState.createNewLevelStateForClick(new GridCoordinates(x, y));
    if (newLevelState != null) {
      setLevelState(newLevelState);
    }
  }

  return (
      <div className="flex justify-center">
        <div className="flex-col">
          <div className="pb-2 h-12">
            <div className="float-left pt-3">
              <p className={levelState.isWon() ? "font-bold text-xl" : ""}>
                {"Turn: " + levelState.turn}
              </p>
            </div>
            <div className="float-right">
              <BlueButton text={"\u21BB Reset"} onClick={resetLevel}/>
              <EditButtonMemo level={level}/>
            </div>
          </div>
          <GameBoard level={level} levelState={levelState} tileOnClickHandler={clickHandler}/>
        </div>
      </div>
  );

}