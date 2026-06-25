import React, {useCallback, useEffect, useState} from "react";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import LevelState from "@/src/Classes/LevelState";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {EditButtonMemo} from "@/src/Components/BasicComponents/EditButtonMemo";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import LevelSelector from "@/src/Components/BasicComponents/LevelSelector";
import {router} from "next/client";
import {saveSavedLevelToLocalStorage} from "@/src/Util/LocalStorage/SavedPageStorageUtils";
import getInitialSelectState, {LevelSelection} from "@/src/Util/LevelSelectorUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {PagesEnum} from "@/src/Components/SiteNav";

interface Props {
  urlLevelCsbCode?: string,
  urlLibraryLevelUuid?: string
}

export default function GamePlayable({urlLevelCsbCode, urlLibraryLevelUuid}: Readonly<Props>) {

  const initialLevelSelection = getInitialSelectState(PagesEnum.GAME, urlLevelCsbCode, urlLibraryLevelUuid);
  const initialLevel = getLevelFromCsbCode(initialLevelSelection.levelCsbCode);

  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelStates, setLevelStates] = useState<LevelState[]>(initialLevelSelection.levelStates ?? [initialLevel.getInitialLevelState()]);
  const [levelUuid, setLevelUuid] = useState<string | null>(initialLevelSelection.levelRecord === null ? null : initialLevelSelection.levelRecord.uuid);

  // ____________________________________ Functions ____________________________________

  function handleOnLevelSelect(levelSelection: LevelSelection) {
    const level = getLevelFromCsbCode(levelSelection.levelCsbCode);
    setLevel(level);
    setLevelStates(levelSelection.levelStates ?? [level.getInitialLevelState()]);
    setLevelUuid(levelSelection.levelRecord === null ? null : levelSelection.levelRecord.uuid);
  }

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
    if (levelStates.length === 1) {
      return;
    }
    setLevelStates(levelStates.slice(0, -1));
  }

  function clickHandler(x: number, y: number) {
    if (getCurrentState().isPlayerAtNoPlayerCoordinates() || x < 0 || y < 0) {
      return;
    }
    const newLevelState = getCurrentState().createNewLevelStateForClick(new GridCoordinates(x, y));
    if (newLevelState !== null) {
      addNewLevelState(newLevelState);
    }
  }

  // ____________________________________ Listeners ____________________________________

  useEffect(() => {
    function handleKeyDownEvent(e: KeyboardEvent) {
      if (getCurrentState().isPlayerAtNoPlayerCoordinates()) {
        return;
      }
      const direction = getDirectionEnumFromKeyboardEventKey(e.key);
      if (direction !== null) {
        const newLevelState = getCurrentState().createNewLevelStateForPlayerMove(direction);
        if (newLevelState !== null) {
          addNewLevelState(newLevelState);
        }
      } else if (e.key === "r") {
        resetLevel();
      } else if (e.key === "Backspace") {
        undoMove();
      }
    }
    document.addEventListener('keydown', handleKeyDownEvent);
    return () => document.removeEventListener('keydown', handleKeyDownEvent);
  });

  const saveCurrentProgressToLocalStorage = useCallback(() => {
    if (levelUuid !== null) {
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

  return (
      <>
        <div className="flex flex-col justify-center">
          <LevelSelector
              initialLevelSelection={initialLevelSelection}
              onSelect={handleOnLevelSelect}/>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex border-black border-2 p-2 mb-2 mx-auto rounded-[10] bg-gray-100">
            <div className={"flex items-center ml-2 mr-4 " + (getCurrentState().isWon() ? "text-2xl " : "")}>
              <p><b>Turn:</b> {getCurrentState().turn}</p>
            </div>
            <div className="flex flex-row ml-auto">
              <ColoredButton content={"\u21BB Reset"} onClick={resetLevel} />
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