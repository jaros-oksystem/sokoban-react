import LevelCollection from "@/src/Classes/LevelCollection";
import {MICROBAN_CSB_CODES, ORIGINAL_LEVELS_CSB_CODES} from "@/src/Constants/Levels";
import LevelRecord from "@/src/Classes/LevelRecord";

export const LOCAL_STORAGE_LIBRARY_KEY = "library";
export const DEFAULT_VALUE_LIBRARY_CONTENT: LevelCollection[] = [
  {
    uuid: crypto.randomUUID(),
    collectionName: "Originals",
    author: "Thinking rabbit",
    description: "The original sokoban levels",
    levels: ORIGINAL_LEVELS_CSB_CODES.map((code, idx) => {
      return {
        uuid: crypto.randomUUID(),
        order: idx+1,
        levelName: "Level " + (idx+1),
        csbCode: code
      }
    })
  },
  {
    uuid: crypto.randomUUID(),
    collectionName: "Microban",
    author: "David W Skinner",
    description: "A collection of simple levels",
    levels: MICROBAN_CSB_CODES.map((code, idx) => {
      return {
        uuid: crypto.randomUUID(),
        order: idx+1,
        levelName: "Level " + (idx+1),
        csbCode: code
      }
    })
  }
];

// ____________________________________ Library ____________________________________

export function getLibraryFromLocalStorage(): LevelCollection[] {
  const localStorageValue = globalThis.window === undefined ? null : localStorage.getItem(LOCAL_STORAGE_LIBRARY_KEY);
  if (localStorageValue == null) {
    saveLibraryToLocalStorage(DEFAULT_VALUE_LIBRARY_CONTENT);
    return DEFAULT_VALUE_LIBRARY_CONTENT;
  }
  try {
    return JSON.parse(localStorageValue);
  } catch {
    return DEFAULT_VALUE_LIBRARY_CONTENT;
  }
}

function saveLibraryToLocalStorage(library: LevelCollection[]) {
  if (globalThis.window !== undefined) {
    localStorage.setItem(LOCAL_STORAGE_LIBRARY_KEY, JSON.stringify(library));
  }
}

// ____________________________________ Modifying collections ____________________________________

export function addCollectionToLibrary(collection: LevelCollection): LevelCollection[] {
  const library = [...getLibraryFromLocalStorage(), collection]
      .toSorted((c1, c2) => c1.collectionName.localeCompare(c2.collectionName));
  saveLibraryToLocalStorage(library);
  return library;
}

export function removeCollectionFromLibrary(collectionUuid: string): LevelCollection[] {
  const library = getLibraryFromLocalStorage();
  const collIndex = getCollectionIdxByUuid(collectionUuid);
  library.splice(collIndex, 1);
  saveLibraryToLocalStorage(library);
  return library;
}

export function updateCollectionInLibrary(collectionUuid: string, collection: LevelCollection) {
  removeCollectionFromLibrary(collectionUuid);
  addCollectionToLibrary(collection);
}

// ____________________________________ Modifying levels ____________________________________

export function addLevelToLibrary(collectionUuid: string, levelToAdd: LevelRecord): LevelCollection {
  const library = getLibraryFromLocalStorage();
  const collIndex = getCollectionIdxByUuid(collectionUuid);
  const collectionLevels = library[collIndex].levels;
  for (let i = 0; i < collectionLevels.length; i++) {
    const level = collectionLevels[i];
    if (level.order >= levelToAdd.order) {
      level.order += 1;
    }
  }
  collectionLevels.push(levelToAdd);
  library[collIndex].levels = collectionLevels.toSorted((l1, l2) => l1.order - l2.order);
  saveLibraryToLocalStorage(library);
  return library[collIndex];
}

export function removeLevelFromLibrary(collectionUuid: string, levelUuid: string): LevelCollection {
  const library = getLibraryFromLocalStorage();
  const collIndex = getCollectionIdxByUuid(collectionUuid);
  const collectionLevels = library[collIndex].levels;
  const recordToRemoveIndex = collectionLevels.findIndex(l => l.uuid == levelUuid);
  if (recordToRemoveIndex == -1) {
    throw new Error("Level record with uuid " + (levelUuid) + " was not found");
  }
  const recordToRemove = collectionLevels[recordToRemoveIndex];
  for (let i = 0; i < collectionLevels.length; i++) {
    const level = collectionLevels[i];
    if (i != recordToRemoveIndex && level.order > recordToRemove.order) {
      level.order -= 1;
    }
  }
  library[collIndex].levels.splice(recordToRemoveIndex, 1);
  saveLibraryToLocalStorage(library);
  return library[collIndex];
}

export function updateLevelInLibrary(collectionUuid: string, levelUuid: string, levelToUpdate: LevelRecord): LevelCollection {
  removeLevelFromLibrary(collectionUuid, levelUuid);
  return addLevelToLibrary(collectionUuid, levelToUpdate);
}

// ____________________________________ Util ____________________________________

export function getCollectionIdxByUuid(collectionUuid: string) {
  const library = getLibraryFromLocalStorage();
  const collIndex = library.findIndex(coll => coll.uuid == collectionUuid);
  if (collIndex == -1) {
    throw new Error("Collection with uuid " + (collectionUuid) + " was not found");
  }
  return collIndex;
}

export function getFirstNonEmptyCollectionOrNull() : LevelCollection | null {
  const nonEmptyCollections = getLibraryFromLocalStorage().filter(c => c.levels.length != 0);
  if (nonEmptyCollections.length == 0) {
    return null;
  }
  return nonEmptyCollections[0];
}

export function findCollectionByUuid(collUuid: string): LevelCollection {
  return getLibraryFromLocalStorage()[getCollectionIdxByUuid(collUuid)];
}

export function findLevelRecordByUuid(levelUuid: string): LevelRecord {
  const level = getLibraryFromLocalStorage()
      .reduce((prev: LevelRecord[], next: LevelCollection) => prev.concat(next.levels), [])
      .find(l => l.uuid === levelUuid);
  if (level === undefined) {
    throw new Error("Level not found for uuid " + levelUuid);
  }
  return level;
}

export function findCollectionWithLevel(levelUuid: string): LevelCollection {
  const collection = getLibraryFromLocalStorage()
      .find(coll => coll.levels.some(l => l.uuid == levelUuid))
  if (collection === undefined) {
    throw new Error("Collection with level uuid " + (levelUuid) + " was not found");
  }
  return collection;
}