import React, {useEffect, useState} from "react";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import {findCollectionByUuid, getLibraryFromLocalStorage} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import LevelCollection from "@/src/Classes/LevelCollection";
import LevelRecord from "@/src/Classes/LevelRecord";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {FALLBACK_CSB_CODE_FOR_GAME} from "@/src/Constants/Levels";
import {LevelSelection} from "@/src/Util/LevelSelectorUtils";

interface Props {
  initialLevelSelection: LevelSelection,
  onSelect: (levelSelect: LevelSelection) => void
}

export default function LevelSelector({initialLevelSelection, onSelect}: Readonly<Props>) {
  // Do not show collections with no levels
  const shownLibrary = getLibraryFromLocalStorage().filter(c => c.levels.length !== 0);

  const [selectedCollection, setSelectedCollection] = useState<LevelCollection | null>(null);
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(0);
  const [isFallbackLevel, setIsFallbackLevel] = useState<boolean>(false);

  function isFirstLevelSelected(): boolean {
    return selectedLevelIdx === 0;
  }

  function isLastLevelSelected(): boolean {
    if (selectedCollection === null) {
      return true;
    }
    return selectedLevelIdx >= selectedCollection.levels.length - 1;
  }

  function handleOnCollectionSelect(collUuid: string) {
    const coll = findCollectionByUuid(collUuid);
    setSelectedCollection(coll);
    setSelectedLevelIdx(0);
    const selectedLevelRecord = coll.levels[0];
    onSelect(new LevelSelection(selectedLevelRecord.csbCode, coll, selectedLevelRecord, null));
  }

  function handleOnLevelSelectString(idx: string) {
    handleOnLevelSelect(Number(idx));
  }

  function handleOnLevelSelect(idx: number) {
    if (selectedCollection === null || idx < 0 || idx >= selectedCollection.levels.length) {
      return;
    }
    setSelectedLevelIdx(idx);
    const selectedLevelRecord = selectedCollection.levels[idx];
    onSelect(new LevelSelection(selectedLevelRecord.csbCode, selectedCollection, selectedLevelRecord, null));
  }

  useEffect(() => {
    const initialLevel = initialLevelSelection.levelRecord;
    const initialCollection = initialLevelSelection.collection;

    if (initialLevelSelection.levelCsbCode === FALLBACK_CSB_CODE_FOR_GAME) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFallbackLevel(true);
    }

    if (initialLevel !== null && initialCollection !== null) {
      setSelectedCollection(initialCollection);
      const idx = initialCollection.levels.findIndex((r) => r.uuid === initialLevel.uuid);
      if (idx === -1) {
        throw new Error("Level not found in collection");
      }
      setSelectedLevelIdx(idx);
    }
  }, []);

  return (
      <div className="flex border-black border-2 p-2 mb-2 h-15 mx-auto rounded-[10] bg-gray-100">
        {
          selectedCollection !== null ?
            <>
              <p className="flex items-center mx-2 font-bold"> Collection: </p>
              <select
                  onChange={event => handleOnCollectionSelect(event.target.value)}
                  value={selectedCollection.uuid}
                  onKeyDown={e => handleKeyDownPreventDefault(e)}>
                {
                  shownLibrary.map((collection: LevelCollection) =>
                      <option key={collection.uuid} value={collection.uuid}>{collection.collectionName}</option>
                  )
                }
              </select>
              <p className="flex items-center mx-2 font-bold"> Level: </p>
              <select
                  onChange={event => handleOnLevelSelectString(event.target.value)}
                  value={selectedLevelIdx}
                  onKeyDown={e => handleKeyDownPreventDefault(e)}>
                {
                  selectedCollection.levels.map((levelRecord: LevelRecord, idx: number) =>
                      <option key={levelRecord.uuid} value={idx}>
                        {levelRecord.levelName}
                      </option>
                  )
                }
              </select>
              <div className="ml-2">
                <ColoredButton content={"\ud83e\udc44"} onClick={() => handleOnLevelSelect(selectedLevelIdx-1)} color={ColorEnum.BLUE} disabled={isFirstLevelSelected()}/>
              </div>
              <div className="ml-2">
                <ColoredButton content={"\ud83e\udc46"} onClick={() => handleOnLevelSelect(selectedLevelIdx+1)} color={ColorEnum.BLUE} disabled={isLastLevelSelected()}/>
              </div>
            </>
            :
            <span className="flex items-center">
              {(isFallbackLevel ? "Loaded fallback level" : "Level loaded from URL") + " - progress will not be saved"}
            </span>
        }
      </div>
      
  );
}

function handleKeyDownPreventDefault(e: React.KeyboardEvent<HTMLSelectElement>) {
  const direction = getDirectionEnumFromKeyboardEventKey(e.key);
  if (direction !== null) {
    e.preventDefault();
  }
}