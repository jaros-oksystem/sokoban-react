import LevelState from "@/src/Classes/LevelState";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import {findLevelRecordByUuid} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";


// ___________________________________ Saved game level ___________________________________

const LOCAL_STORAGE_SAVED_GAME_PROGRESS_KEY = "savedGameProgress";

class SavedGameLevel {
  levelUuid: string;
  states: SavedLevelState[];

  constructor(levelUuid: string, states: SavedLevelState[]) {
    this.levelUuid = levelUuid;
    this.states = states;
  }
}

class SavedLevelState {
  player: GridCoordinates;
  boxes: GridCoordinates[];
  turn: number;

  constructor(player: GridCoordinates, boxes: GridCoordinates[], turn: number) {
    this.player = player;
    this.boxes = boxes;
    this.turn = turn;
  }
}

function getSavedLevelObjectFromLocalStorage() : SavedGameLevel | null {
  if (globalThis.window === undefined) {
    return null;
  }
  const savedLevelValue = localStorage.getItem(LOCAL_STORAGE_SAVED_GAME_PROGRESS_KEY);
  if (savedLevelValue === null) {
    return null;
  }
  return JSON.parse(savedLevelValue);
}

export function getSavedLevelUuidFromLocalStorage(): string | null {
  const savedLevel = getSavedLevelObjectFromLocalStorage();
  if (savedLevel === null) {
    return null;
  }
  return savedLevel.levelUuid;
}

export function getSavedLevelStatesLocalStorage(): LevelState[] | null {
  const savedLevel = getSavedLevelObjectFromLocalStorage();
  if (savedLevel === null) {
    return null;
  }
  const levelRecord = findLevelRecordByUuid(savedLevel.levelUuid);
  if (levelRecord === null) {
    return null;
  }
  const level = getLevelFromCsbCode(levelRecord.csbCode);
  return savedLevel.states.map(state =>
      new LevelState(
        level,
        new GridCoordinates(state.player.x, state.player.y),
        state.boxes.map(box => new GridCoordinates(box.x, box.y)),
        state.turn
      )
  );
}

export function saveSavedLevelToLocalStorage(levelUuid: string, states: LevelState[]) {
  if (globalThis.window !== undefined) {
    const statesToSave = states.map(state => new SavedLevelState(state.player, state.boxes, state.turn));
    localStorage.setItem(LOCAL_STORAGE_SAVED_GAME_PROGRESS_KEY, JSON.stringify(new SavedGameLevel(levelUuid, statesToSave)));
  }
}

// ___________________________________ Saved editor level ___________________________________

const LOCAL_STORAGE_SAVED_EDITOR_LEVEL_CSB_CODE_KEY = "savedEditorLevelCsbCode";

export function getSavedEditorLevelCsbCodeFromLocalStorage(): string | null {
  return globalThis.window === undefined ? null : localStorage.getItem(LOCAL_STORAGE_SAVED_EDITOR_LEVEL_CSB_CODE_KEY);
}

export function saveSavedEditorLevelCsbCodeToLocalStorage(csbCode: string) {
  if (globalThis.window !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_SAVED_EDITOR_LEVEL_CSB_CODE_KEY, csbCode);
  }
}

// ___________________________________ Saved solver level ___________________________________

const LOCAL_STORAGE_SAVED_SOLVER_LEVEL_UUID = "savedSolverLevelUuid";

export function getSavedSolverLevelUuidFromLocalStorage(): string | null {
  return globalThis.window === undefined ? null : localStorage.getItem(LOCAL_STORAGE_SAVED_SOLVER_LEVEL_UUID);
}

export function saveSavedSolverLevelUuidToLocalStorage(uuid: string) {
  if (globalThis.window !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_SAVED_SOLVER_LEVEL_UUID, uuid);
  }
}