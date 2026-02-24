import React, {useCallback, useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import LevelState from "@/src/Classes/LevelState";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {EditButtonMemo} from "@/src/Components/BasicComponents/EditButtonMemo";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import LibraryLevelSelector from "@/src/Components/BasicComponents/LibraryLevelSelector";
import {
  findCollectionWithLevelWithCheck, findLevelRecordByUuid,
  findLevelRecordByUuidWithCheck,
  getFirstNonEmptyCollectionOrNull
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {DEFAULT_CSB_FOR_GAME} from "@/src/Constants/Levels";
import {router} from "next/client";
import {
  getSavedLevelStatesLocalStorage,
  getSavedLevelUuidFromLocalStorage, saveSavedLevelToLocalStorage
} from "@/src/Util/LocalStorage/SavedPageStorageUtils";

interface Props {
  urlLevel?: Level,
  urlLibraryLevelUuid?: string
}

export default function GamePlayable({urlLevel, urlLibraryLevelUuid}: Readonly<Props>) {

  // ____________________________________ Determine what level to load ____________________________________

  let initialLevel: Level;
  let initialLevelUuid: string | null = null;
  let initialLevelStates: LevelState[] | null = null;
  let initialCollectionUuid: string | null = null;
  let loadedFallbackLevel = false

  const lastPlayedLevelUuid = getSavedLevelUuidFromLocalStorage();
  const lastPlayedLevelRecord = lastPlayedLevelUuid == null ? null : findLevelRecordByUuid(lastPlayedLevelUuid);
  const defaultCollection = getFirstNonEmptyCollectionOrNull();

  if (urlLevel !== undefined) {
    // If the url contains a CSB code in the path parameter
    initialLevel = urlLevel;
  } else if (urlLibraryLevelUuid !== undefined) {
    // If the url contains uuid of a level record
    initialLevelUuid = urlLibraryLevelUuid;
    initialCollectionUuid = findCollectionWithLevelWithCheck(urlLibraryLevelUuid).uuid;
    initialLevel = getLevelFromCsbCode(findLevelRecordByUuidWithCheck(urlLibraryLevelUuid).csbCode);
  } else if (lastPlayedLevelUuid != null && lastPlayedLevelRecord != null) {
    // If there is a last played level record uuid in local storage and its level record still exists
    const collection = findCollectionWithLevelWithCheck(lastPlayedLevelUuid);
    initialCollectionUuid = collection.uuid;
    initialLevelUuid = lastPlayedLevelRecord.uuid;
    initialLevel = getLevelFromCsbCode(lastPlayedLevelRecord.csbCode);
    initialLevelStates = getSavedLevelStatesLocalStorage();
  } else if (defaultCollection != null) {
    // Select the first level of the first non-empty collection if none of the above apply
    initialCollectionUuid = defaultCollection.uuid;
    initialLevelUuid = defaultCollection.levels[0].uuid;
    initialLevel = getLevelFromCsbCode(defaultCollection.levels[0].csbCode);
  } else {
    // If no non-empty collection exists, load a fallback level
    initialLevel = getLevelFromCsbCode(DEFAULT_CSB_FOR_GAME);
    loadedFallbackLevel = true;
  }

  // ____________________________________ useState ____________________________________

  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelUuid, setLevelUuid] = useState<string | null>(initialLevelUuid);
  const [levelStates, setLevelStates] = useState<LevelState[]>(initialLevelStates ?? [initialLevel.getInitialLevelState()]);

  // ____________________________________ Functions ____________________________________

  function getCurrentState() : LevelState {
    const ret = levelStates.at(-1);
    if (ret === undefined) {
      throw new Error("No level state available");
    }
    return ret;
  }

  function resetLevel() {
    setLevelStates([level.getInitialLevelState()]);
  }

  function addNewLevelState(newLevelState: LevelState) {
    setLevelStates([...levelStates, newLevelState]);
  }

  function undoMove() {
    if (levelStates.length == 1) {
      return;
    }
    const newStates = levelStates.slice(0, -1);
    setLevelStates(newStates);
  }

  function clickHandler(x: number, y: number) {
    if (getCurrentState().isPlayerAtNoPlayerCoordinates()) {
      return;
    }
    const newLevelState = getCurrentState().createNewLevelStateForClick(new GridCoordinates(x, y));
    if (newLevelState != null) {
      addNewLevelState(newLevelState);
    }
  }

  function handleOnLevelSelect(levelUuid: string) {
    const levelRecord = findLevelRecordByUuidWithCheck(levelUuid);
    setLevelUuid(levelUuid);
    const newLevel = getLevelFromCsbCode(levelRecord.csbCode);
    setLevel(newLevel);
    setLevelStates([newLevel.getInitialLevelState()]);
  }

  // ____________________________________ Listeners ____________________________________

  useEffect(() => {
    function handleKeyDownEvent(e: KeyboardEvent) {
      if (getCurrentState().isPlayerAtNoPlayerCoordinates()) {
        return;
      }
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction != null) {
        const newLevelState = getCurrentState().createNewLevelStateForPlayerMove(direction);
        if (newLevelState != null) {
          addNewLevelState(newLevelState);
        }
      } else if (e.key == "r") {
        resetLevel();
      } else if (e.key == "Backspace") {
        undoMove();
      }
    }
    document.addEventListener('keydown', handleKeyDownEvent);
    return () => document.removeEventListener('keydown', handleKeyDownEvent);
  });

  const saveCurrentProgressToLocalStorage = useCallback(() => {
    if (levelUuid != null) {
      saveSavedLevelToLocalStorage(levelUuid, levelStates);
    }
  }, [levelStates, levelUuid]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveCurrentProgressToLocalStorage);
    return () => window.removeEventListener("beforeunload", saveCurrentProgressToLocalStorage);
  }, [saveCurrentProgressToLocalStorage]);

  useEffect(() => {
    router.events.on("routeChangeStart", saveCurrentProgressToLocalStorage);
    return () => router.events.off("routeChangeStart", saveCurrentProgressToLocalStorage);
  }, [saveCurrentProgressToLocalStorage]);

  // ____________________________________ Render ____________________________________

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
                isLevelWon={getCurrentState().isWon()}/>
              :
              <span className="flex items-center">
                {(loadedFallbackLevel ? "Loaded fallback level" : "Level loaded from URL") + " - progress will not be saved"}
              </span>
          }
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex border-black border-2 p-2 mb-2 mx-auto rounded-[10] bg-gray-100">
            <div className={"flex items-center ml-2 mr-4 " + (getCurrentState().isWon() ? "text-2xl " : "")}>
              <p><b>Turn:</b> {getCurrentState().turn}</p>
            </div>
            <div className="flex flex-row ml-auto">
              <ColoredButton content={"\u21BB Reset"} onClick={resetLevel}/>
              <EditButtonMemo level={level}/>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <GameBoard level={level} levelState={getCurrentState()} tileOnClickHandler={clickHandler}/>
        </div>
      </>
  );

}