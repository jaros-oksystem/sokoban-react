import React, {useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import LevelState from "@/src/Classes/LevelState";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {EditButtonMemo} from "@/src/Components/BasicComponents/EditButtonMemo";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import LibraryLevelSelector from "@/src/Components/BasicComponents/LibraryLevelSelector";
import {
  findCollectionWithLevel,
  findLevelRecordByUuid,
  getFirstNonEmptyCollectionOrNull
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {DEFAULT_CSB_FOR_GAME} from "@/src/Constants/Levels";

interface Props {
  urlLevel?: Level,
  libraryLevelUuid?: string
}

export default function GamePlayable({urlLevel, libraryLevelUuid}: Readonly<Props>) {
  // Determine the loaded level
  let initialLevel: Level;
  let initialLevelUuid: string | null = null;
  let initialCollectionUuid: string | null = null;
  let loadedFallbackLevel = false;
  if (urlLevel !== undefined) {
    // If the url contains a CSB code in the path parameter, load the level corresponding to it
    initialLevel = urlLevel;
  } else if (libraryLevelUuid !== undefined) {
    // If the url contains uuid of a level record, load its level
    initialLevelUuid = libraryLevelUuid;
    initialCollectionUuid = findCollectionWithLevel(libraryLevelUuid).uuid;
    initialLevel = getLevelFromCsbCode(findLevelRecordByUuid(libraryLevelUuid).csbCode);
  } else {
    // If the url does not contain any level specification, select the first level of the first non-empty collection
    const defaultCollection = getFirstNonEmptyCollectionOrNull();
    if (defaultCollection != null) {
      initialCollectionUuid = defaultCollection.uuid;
      initialLevelUuid = defaultCollection.levels[0].uuid;
      initialLevel = getLevelFromCsbCode(defaultCollection.levels[0].csbCode);
    } else {
      // If no non-empty collection exists, load the default level
      initialLevel = getLevelFromCsbCode(DEFAULT_CSB_FOR_GAME);
      loadedFallbackLevel = true;
    }
  }

  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelState, setLevelState] = useState<LevelState>(initialLevel.getInitialLevelState());

  function resetLevel() {
    setLevelState(level.getInitialLevelState());
  }

  function clickHandler(x: number, y: number) {
    if (levelState.isPlayerAtNoPlayerCoordinates()) {
      return;
    }
    const newLevelState = levelState.createNewLevelStateForClick(new GridCoordinates(x, y));
    if (newLevelState != null) {
      setLevelState(newLevelState);
    }
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
    document.addEventListener('keydown', handleKeyDownEvent);
    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent);
    }
  })

  function handleOnLevelSelect(level: Level) {
    setLevel(level);
    setLevelState(level?.getInitialLevelState());
  }

  return (
      <>
        <div className="flex flex-col justify-center">
          <div className="flex border-black border-2 p-2 mb-2 h-15 mx-auto rounded-[10] bg-gray-100">
          {
            initialLevelUuid != null && initialCollectionUuid != null ?
              <LibraryLevelSelector
                initialCollectionUuid={initialCollectionUuid}
                initialLevelUuid={initialLevelUuid}
                onSelect={handleOnLevelSelect}
                isLevelWon={levelState.isWon()}/>
              :
              <span className="flex items-center">
                {loadedFallbackLevel ? "Loaded fallback level" : "Level loaded from URL"}
              </span>
          }
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex border-black border-2 p-2 mb-2 mx-auto rounded-[10] bg-gray-100">
            <div className={"flex items-center ml-2 mr-4 " + (levelState.isWon() ? "text-2xl " : "")}>
              <p><b>Turn:</b> {levelState.turn}</p>
            </div>
            <div className="flex flex-row ml-auto">
              <ColoredButton content={"\u21BB Reset"} onClick={resetLevel}/>
              <EditButtonMemo level={level}/>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <GameBoard level={level} levelState={levelState} tileOnClickHandler={clickHandler}/>
        </div>
      </>
  );

}