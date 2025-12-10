import {useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/app/Shared/Enum/DirectionEnum";
import {GridCoordinates} from "@/app/Shared/Classes/GridCoordinates";
import {LevelTileEnum} from "@/app/Shared/Enum/LevelTileEnum";
import {Level} from "@/app/Shared/Classes/Level";
import {Board} from "@/app/Shared/Components/Board";
import {LevelState} from "@/app/Shared/Classes/LevelState";

export function GamePlayable() {
  const demoLenX = 6, demoLenY = 5;
  const demoLevelTiles = [...Array(demoLenX)].map(() => new Array(demoLenY).fill(LevelTileEnum.EMPTY));
  demoLevelTiles[3][2] = LevelTileEnum.WALL;
  demoLevelTiles[5][3] = LevelTileEnum.WALL;
  demoLevelTiles[3][0] = LevelTileEnum.GOAL;
  demoLevelTiles[0][4] = LevelTileEnum.GOAL;
  const demoLevel = new Level(demoLenX, demoLenY, demoLevelTiles, new GridCoordinates(2,2), [new GridCoordinates(1,1), new GridCoordinates(3,3)]);

  const [level, setLevel] = useState<Level>(demoLevel);
  const [levelState, setLevelState] = useState<LevelState>(level.getInitialLevelState());

  useEffect(() => {
    function handlekeydownEvent(e: KeyboardEvent) {
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction != null) {
        const newLevelState = levelState.createNewLevelStateForPlayerMove(level, direction);
        if (newLevelState != null) {
          setLevelState(newLevelState);
        }
      }
    }
    document.addEventListener('keyup', handlekeydownEvent)
    return () => {
      document.removeEventListener('keyup', handlekeydownEvent)
    }
  })

  return (
      <div>
        <div className={"mb-2 h-10 relative"}>
          <p className={"absolute bottom-0 left-0 "}>{"Turn: " + levelState.turn}</p>
          <button onClick={() => setLevelState(level.getInitialLevelState())}
                  className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Reset
          </button>
        </div>
        <div>
          <Board key={"board"} level={level} levelState={levelState}/>
        </div>
      </div>
  );

}