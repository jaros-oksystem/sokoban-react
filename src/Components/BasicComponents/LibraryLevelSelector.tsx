import React, {useState} from "react";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import {
  findCollectionByUuid,
  findLevelRecordByUuid,
  getLibraryFromLocalStorage
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import Level from "@/src/Classes/Level";
import LevelCollection from "@/src/Classes/LevelCollection";
import LevelRecord from "@/src/Classes/LevelRecord";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {getDirectionEnumFromKeyboardEventKey} from "@/src/Enum/DirectionEnum";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";


interface Props {
  onSelect: (level: Level) => void,
  initialCollectionUuid: string,
  initialLevelUuid: string,
  isLevelWon: boolean
}

export default function LibraryLevelSelector({onSelect, initialCollectionUuid, initialLevelUuid, isLevelWon}: Readonly<Props>) {
  // Do not show collections with no levels
  const shownLibrary = getLibraryFromLocalStorage().filter(c => c.levels.length != 0);

  const [selectedCollectionUuid, setSelectedCollectionUuid] = useState<string>(initialCollectionUuid);
  const [selectedLevelUuid, setSelectedLevelUuid] = useState<string>(initialLevelUuid);

  function isLastLevel() {
    const coll = findCollectionByUuid(selectedCollectionUuid);
    const curLevelIdx = coll.levels.findIndex(l => l.uuid == selectedLevelUuid);
    if (curLevelIdx == -1) {
      throw new Error("Level not found, levelUuid " + selectedLevelUuid + ", collection uuid " + selectedCollectionUuid);
    }
    return curLevelIdx == coll.levels.length - 1;
  }

  function handleOnSelectCollection(collUuid: string) {
    const coll = findCollectionByUuid(collUuid);
    const firstLevel = coll.levels.at(0);
    if (firstLevel === undefined) {
      throw new Error("No level found found for collection " + collUuid);
    }
    setSelectedCollectionUuid(collUuid);
    setSelectedLevelUuid(firstLevel.uuid);
    onSelect(getLevelFromCsbCode(firstLevel.csbCode));
  }

  function handleOnSelectLevel(levelUuid: string) {
    const levelRecord = findLevelRecordByUuid(levelUuid);
    setSelectedLevelUuid(levelUuid);
    onSelect(getLevelFromCsbCode(levelRecord.csbCode));
  }

  function handleOnNextLevel() {
    const coll = findCollectionByUuid(selectedCollectionUuid);
    const nextLevelIdx = coll.levels.findIndex(l => l.uuid == selectedLevelUuid) + 1;
    const nextLevelRecord = coll.levels[nextLevelIdx];
    setSelectedLevelUuid(nextLevelRecord.uuid);
    onSelect(getLevelFromCsbCode(nextLevelRecord.csbCode));
  }

  return (
      initialCollectionUuid !== undefined && initialLevelUuid !== undefined &&
      <>
        <p className="flex items-center mx-2 font-bold"> Collection: </p>
        <select
          onChange={event => handleOnSelectCollection(event.target.value)}
          value={selectedCollectionUuid}
          onKeyDown={e => handleKeyDownPreventDefault(e)}>
          {
            shownLibrary.map((collection: LevelCollection) =>
                  <option key={collection.uuid} value={collection.uuid}>{collection.collectionName}</option>
            )
          }
        </select>
        <p className="flex items-center mx-2 font-bold"> Level: </p>
        <select
          onChange={event => handleOnSelectLevel(event.target.value)}
          value={selectedLevelUuid}
          onKeyDown={e => handleKeyDownPreventDefault(e)}>
          {
            shownLibrary.find(col => col.uuid == selectedCollectionUuid)?.levels.map((levelRecord: LevelRecord) =>
                <option key={levelRecord.uuid} value={levelRecord.uuid}>{levelRecord.levelName}</option>
            )
          }
        </select>
        {
          !isLastLevel() && isLevelWon &&
          <div className="ml-2">
            <ColoredButton content={"\u2BC8 Next level"} onClick={handleOnNextLevel} color={ColorEnum.GREEN}/>
          </div>
        }
      </>
  );
}

function handleKeyDownPreventDefault(e: React.KeyboardEvent<HTMLSelectElement>) {
  const direction = getDirectionEnumFromKeyboardEventKey(e.key);
  if (direction != null) {
    e.preventDefault();
  }
}