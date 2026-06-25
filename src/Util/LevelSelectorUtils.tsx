import {
  findCollectionWithLevelWithCheck,
  findLevelRecordByUuid,
  findLevelRecordByUuidWithCheck,
  getFirstNonEmptyCollectionOrNull
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import LevelCollection from "@/src/Classes/LevelCollection";
import LevelRecord from "@/src/Classes/LevelRecord";
import LevelState from "@/src/Classes/LevelState";
import {
  getSavedLevelStatesLocalStorage,
  getSavedLevelUuidFromLocalStorage, getSavedSolverLevelUuidFromLocalStorage
} from "@/src/Util/LocalStorage/SavedPageStorageUtils";
import {FALLBACK_CSB_CODE_FOR_GAME} from "@/src/Constants/Levels";
import {PagesEnum} from "@/src/Components/SiteNav";

export class LevelSelection {
  levelCsbCode: string;
  collection: LevelCollection | null;
  levelRecord: LevelRecord | null;
  levelStates: LevelState[] | null;

  constructor(initialLevelCsbCode: string, initialCollection: LevelCollection | null, initialLevel: LevelRecord | null, initialLevelStates: LevelState[] | null) {
    this.levelCsbCode = initialLevelCsbCode;
    this.collection = initialCollection;
    this.levelRecord = initialLevel;
    this.levelStates = initialLevelStates;
  }
}

export default function getInitialSelectState(page: PagesEnum, urlLevelCsbCode: string | undefined, urlLibraryLevelUuid: string | undefined): LevelSelection {
  let lastPlayedLevelUuid = null;
  let savedStates = null;
  switch (page) {
    case PagesEnum.GAME:
      lastPlayedLevelUuid = getSavedLevelUuidFromLocalStorage();
      savedStates = getSavedLevelStatesLocalStorage();
      break;
    case PagesEnum.SOLVER:
      lastPlayedLevelUuid = getSavedSolverLevelUuidFromLocalStorage();
      break;
    default:
      throw new Error("Level selection unsupported for page: " + page);
  }

  // If the url contains a CSB code in the path parameter
  if (urlLevelCsbCode !== undefined) {
    return new LevelSelection(urlLevelCsbCode, null, null, null);
  }

  // If the url contains uuid of a level record
  if (urlLibraryLevelUuid !== undefined) {
    const collection = findCollectionWithLevelWithCheck(urlLibraryLevelUuid);
    const level = findLevelRecordByUuidWithCheck(urlLibraryLevelUuid);
    if (collection !== null && level !== null) {
      return new LevelSelection(level.csbCode, collection, level, null);
    }
  }

  // If there is a last played level record uuid in local storage and its level record still exists
  if (lastPlayedLevelUuid !== null) {
    const lastPlayedLevelRecord = findLevelRecordByUuid(lastPlayedLevelUuid);
    if (lastPlayedLevelRecord !== null) {
      const collection = findCollectionWithLevelWithCheck(lastPlayedLevelUuid)!;
      const level = lastPlayedLevelRecord;
      return new LevelSelection(level.csbCode, collection, level, savedStates);
    }
  }

  // Select the first level of the first non-empty collection if none of the above apply
  const defaultCollection = getFirstNonEmptyCollectionOrNull();
  if (defaultCollection !== null) {
    const collection = defaultCollection;
    const level = defaultCollection.levels[0];
    return new LevelSelection(level.csbCode, collection, level, null);
  }

  return new LevelSelection(FALLBACK_CSB_CODE_FOR_GAME, null, null, null);
}
