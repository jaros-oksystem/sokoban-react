import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import Level from "@/src/Classes/Level";
import GameBoard from "@/src/Components/Board/GameBoard";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import LevelSelector from "@/src/Components/BasicComponents/LevelSelector";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import SolverParams, {
  DeadlockDetectionLevelEnum,
  HeuristicMatchingEnum,
  StateCreationEnum
} from "@/src/Classes/Solver/SolverParams";
import LevelState from "@/src/Classes/LevelState";
import SolverWorkerMessage from "@/src/Classes/Solver/SolverWorkerMessage";
import getCsbCodeFromLevel from "@/src/Util/Codes/CsbEncodingUtils";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import {saveSavedSolverLevelUuidToLocalStorage} from "@/src/Util/LocalStorage/SavedPageStorageUtils";
import {router} from "next/client";
import getInitialSelectState, {LevelSelection} from "@/src/Util/LevelSelectorUtils";
import {millisToReadableTime} from "@/src/Util/StringUtils";
import {PagesEnum} from "@/src/Components/SiteNav";
import {
  transformSolutionStateToLevelStates,
  transformSolverStateToLevelState
} from "@/src/Util/LevelTransformationUtils";

interface Props {
  urlLevelCsbCode?: string,
  urlLibraryLevelUuid?: string
}

export default function LevelSolver({urlLevelCsbCode, urlLibraryLevelUuid}: Readonly<Props>) {

  const initialLevelSelection = getInitialSelectState(PagesEnum.SOLVER, urlLevelCsbCode, urlLibraryLevelUuid);
  const initialLevel = getLevelFromCsbCode(initialLevelSelection.levelCsbCode);

  const [level, setLevel] = useState<Level>(initialLevel);
  const [levelState, setLevelState] = useState<LevelState>(initialLevel.getInitialLevelState());
  const [levelUuid, setLevelUuid] = useState<string | null>(initialLevelSelection.levelRecord === null ? null : initialLevelSelection.levelRecord.uuid);
  const [workerMessage, setWorkerMessage] = useState<SolverWorkerMessage | null>(null);
  const [solutionStates, setSolutionStates] = useState<LevelState[] | null>(null);
  const [solutionStatesIdx, setSolutionStatesIdx] = useState<number>(0);
  const workerRef = useRef<Worker>(null);

  // ____________________________________ Functions ____________________________________

  function getSolverRunningTimeMs(): number {
    return workerMessage === null ? -1 : (workerMessage.timestampTerminated ?? Date.now()) - workerMessage.timestampStart;
  }

  function isIdle(): boolean {
    return workerMessage === null || workerMessage.timestampTerminated !== null;
  }

  function handleOnLevelSelect(levelSelection: LevelSelection) {
    const level = getLevelFromCsbCode(levelSelection.levelCsbCode);
    setLevel(level);
    setLevelState(level.getInitialLevelState());
    setLevelUuid(levelSelection.levelRecord === null ? null : levelSelection.levelRecord.uuid);
    setSolutionStates(null);
    setSolutionStatesIdx(0);
    setWorkerMessage(null);
    refreshWorker(level);
  }

  function handleOnTerminate() {
    refreshWorker(level);
  }

  function refreshWorker(level: Level) {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    workerRef.current = new Worker(new URL("../Algo/Solver/SolverWorker.tsx", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (e: MessageEvent<SolverWorkerMessage>) => {
      handleOnWorkerMessage(e.data, level);
    };

    setWorkerMessage(null);
  }

  // Sets levelState, workerMessage, solutionStates and solutionStatesIdx
  function handleOnWorkerMessage(workerMessage: SolverWorkerMessage, level: Level) {
    const exceptionMsg = workerMessage.exceptionMessage;
    if (exceptionMsg !== null) {
      alert("Solver was not run for the following reason:\n" + exceptionMsg);
      return;
    }
    setWorkerMessage(workerMessage);

    if (workerMessage.curSolverState !== null && workerMessage.rootState !== null) {
      // If the worker sends state to be shown mid-computation
      setLevelState(transformSolverStateToLevelState(workerMessage.curSolverState, workerMessage.rootState, level));
    } else if (workerMessage.timestampTerminated !== null && workerMessage.solutionState === null) {
      // No solution was found
      alert("No solution found");
    } else if (workerMessage.solutionState !== null && workerMessage.rootState !== null) {
      // Parse the solution state into solution state arr
      setSolutionStates(transformSolutionStateToLevelStates(workerMessage.solutionState, level));
      setSolutionStatesIdx(0);
      setLevelState(level.getInitialLevelState());
    } else {
      throw new Error("Unexpected state")
    }
  }

  function handleOnSolve() {
    if (workerRef.current === null) {
      refreshWorker(level);
    }

    // TODO allow the user to set these
    const params = new SolverParams(
        StateCreationEnum.ON_BOX_MOVE,
        HeuristicMatchingEnum.NEAREST_GOAL,
        DeadlockDetectionLevelEnum.CHECK_NEIGHBOURING_BOXES);

    workerRef.current!.postMessage({ csbCode: getCsbCodeFromLevel(level), params: params });
  }

  function handleSliderOnChange(e: ChangeEvent<HTMLInputElement>) {
    const slideValue = Number(e.target.value);
    setSolutionStatesIdx(slideValue);
    if (solutionStates !== null) {
      setLevelState(solutionStates[slideValue]);
    }
  }

  // ____________________________________ Listeners ____________________________________

  const saveCurrentSelectionToLocalStorage = useCallback(() => {
    if (levelUuid !== null) {
      saveSavedSolverLevelUuidToLocalStorage(levelUuid);
    }
  }, [levelUuid]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveCurrentSelectionToLocalStorage);
    return () => window.removeEventListener("beforeunload", saveCurrentSelectionToLocalStorage);
  }, [saveCurrentSelectionToLocalStorage]);

  useEffect(() => {
    router.events.on("routeChangeStart", saveCurrentSelectionToLocalStorage);
    return () => router.events.off("routeChangeStart", saveCurrentSelectionToLocalStorage);
  }, [saveCurrentSelectionToLocalStorage]);

  // ____________________________________ Render ____________________________________

  return (
      <>
        <div className="flex flex-col justify-center">
          <LevelSelector
              initialLevelSelection={initialLevelSelection}
              onSelect={handleOnLevelSelect}/>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex border-black border-2 p-2 mb-2 mx-auto rounded-[10] bg-gray-100">
            <div className="flex flex-col">
              <div className="flex flex-row ml-auto">
                <ColoredButton content={"\u2BCE Solve"} onClick={handleOnSolve} disabled={!isIdle()}/>
                <div className="mx-1"/>
                <ColoredButton content={"\u23FB Terminate"} onClick={handleOnTerminate} color={ColorEnum.RED} disabled={isIdle()} />
              </div>
              {
                workerMessage !== null &&
                <div>
                  <label>{"Time taken: " + millisToReadableTime(getSolverRunningTimeMs())}</label>
                  <div className="mx-1"/>
                  <label>{"States explored: " + Intl.NumberFormat('en-US').format(workerMessage.statesExplored)}</label>
                  <div className="mx-1"/>
                  <label>{"Turn: " + workerMessage.curTurn}</label>
                </div>
              }
            </div>
          </div>
        </div>
        {
          solutionStates !== null &&
          <div className="flex flex-col justify-center">
            <div className="flex border-black border-2 p-2 mb-2 mx-auto rounded-[10] bg-gray-100 w-3/4 ">
              <div className="flex flex-col w-full ">
                <input type="range" value={solutionStatesIdx} min={0} step={1} max={solutionStates.length-1} onChange={handleSliderOnChange}/>
              </div>
            </div>
          </div>
        }
        <div className="flex justify-center">
          <GameBoard level={level} levelState={levelState} verticalSpaceTakenPx={340}/>
        </div>
      </>
  );

}