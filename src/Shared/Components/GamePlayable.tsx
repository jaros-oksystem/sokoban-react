import {useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Shared/Enum/DirectionEnum";
import Level from "@/src/Shared/Classes/Level";
import Board from "@/src/Shared/Components/Board";
import LevelState from "@/src/Shared/Classes/LevelState";
import BlueButton from "@/src/Shared/Components/BasicComponents/BlueButton";

interface Props {
  level: Level
}

export default function GamePlayable({level}: Readonly<Props>) {
  const [levelState, setLevelState] = useState<LevelState>(level.getInitialLevelState());

  useEffect(() => {
    function handleKeyDownEvent(e: KeyboardEvent) {
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction != null) {
        const newLevelState = levelState.createNewLevelStateForPlayerMove(level, direction);
        if (newLevelState != null) {
          setLevelState(newLevelState);
        }
      }
    }
    document.addEventListener('keydown', handleKeyDownEvent)
    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent)
    }
  })

  return (
      <div className="flex justify-center">
        <div>
          <div className="mb-2 h-10 relative">
            <p className="absolute bottom-0 left-0">
              {"Turn: " + levelState.turn}
            </p>
            <div className="absolute bottom-0 right-0">
              <BlueButton text="Reset" onClick={() => setLevelState(level.getInitialLevelState())}/>
            </div>
          </div>
          <Board level={level} levelState={levelState}/>
        </div>
      </div>
  );

}