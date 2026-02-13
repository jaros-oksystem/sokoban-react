import LevelRecord from "@/src/Classes/LevelRecord";
import React, {useState} from "react";

import DeleteDialogueButton from "@/src/Components/DialogueBox/Library/DeleteDialogueButton";

import CollectionDialogueButton from "@/src/Components/DialogueBox/Library/CollectionDialogueButton";
import LevelRecordDialogueButton from "@/src/Components/DialogueBox/Library/LevelRecordDialogueButton";
import LevelCollection from "@/src/Classes/LevelCollection";
import {
  addLevelToLibrary,
  removeLevelFromLibrary,
  updateCollectionInLibrary,
  updateLevelInLibrary
} from "@/src/Util/LocalStorage/LibraryStorageUtils";
import Link from "next/link";
import {GAME_PAGE_PATH} from "@/src/Constants/PagePaths";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import {PreviewBoardMemo} from "@/src/Components/Board/PreviewBoardMemo";
import ExportCollectionButton from "@/src/Components/DialogueBox/Library/ExportCollectionButton";
import ExpandButton from "@/src/Components/BasicComponents/ExpandButton";

interface Props {
  defaultCollection: LevelCollection,
  onDelete: (uuid: string) => void
}

export default function CollectionCard({defaultCollection, onDelete}: Readonly<Props>) {
  const [collection, setCollection] = useState<LevelCollection>(defaultCollection);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleLevelDelete(levelUuid: string) {
    const newColl = removeLevelFromLibrary(collection.uuid, levelUuid);
    setCollection(newColl);
  }

  function handleLevelEdit(record: LevelRecord) {
    const newColl = updateLevelInLibrary(collection.uuid, record.uuid, record);
    setCollection(newColl);
  }

  function handleCollectionEdit(newCollection: LevelCollection) {
    updateCollectionInLibrary(collection.uuid, newCollection);
    setCollection(newCollection);
  }

  function handleNewLevelCreate(newLevel: LevelRecord) {
    newLevel.order = Math.max(...collection.levels.map(l => l.order), 0) + 1;
    const newCollection = addLevelToLibrary(collection.uuid, newLevel);
    setCollection(newCollection);
  }

  function handleDelete() {
    onDelete(collection.uuid);
  }

  function handleOnExpand() {
    setIsOpen(!isOpen);
  }

  return (
      <div className="flex flex-col border-black border-2 w-200 mt-6 mx-auto bg-gray-100">
        <div className="bg-gray-200 px-3 py-2">
          <div className="float-right">
            <ExpandButton expanded={isOpen} onExpand={handleOnExpand}/>
          </div>
          <p className="text-2xl mt-1">{collection.collectionName}</p>
        </div>
        {
          isOpen &&
          <>
            <div className="p-3">
              <div className="float-right">
                <div className="flex flex-row">
                  <CollectionDialogueButton defaultValues={collection} onSave={handleCollectionEdit} />
                  <div className="mx-1"></div>
                  <ExportCollectionButton collection={collection} />
                  <div className="mx-1"></div>
                  <DeleteDialogueButton onDelete={handleDelete} title={"Delete collection?"} />
                </div>
              </div>
              <div>
                <p className="text"><b>Author</b>: {collection.author}</p>
                <p className="text"><b>Number of levels:</b> {collection.levels.length}</p>
                <p className="text">{collection.description}</p>
              </div>
            </div>
            <div className="flex flex-col w-192 mx-auto">
              {
                collection.levels.map((record: LevelRecord) =>
                    <div key={record.uuid} className="border-2 my-1 bg-white">
                      <div className="float float-right m-2">
                        <div className="flex flex-row">
                          <Link className="pl-2" href={{ pathname: GAME_PAGE_PATH, query: { levelUuid: record.uuid }}}>
                            <ColoredButton content={"\u2BC8 Play"} color={ColorEnum.CYAN}/>
                          </Link>
                          <div className="mr-2"></div>
                          <LevelRecordDialogueButton onSave={handleLevelEdit} defaultValues={record} />
                          <div className="mr-2"></div>
                          <DeleteDialogueButton onDelete={() => handleLevelDelete(record.uuid)} title={"Delete level?"}/>
                        </div>
                      </div>
                      <div className="min-h-10">
                        <p className="ml-4 mt-3 text-xl">{record.levelName}</p>
                      </div>
                      <div className="m-2 flex justify-center">
                        <PreviewBoardMemo csbCode={record.csbCode} widthPx={750} heightPx={200}/>
                      </div>
                    </div>
                )
              }
            </div>
            <div className="m-2 flex justify-center">
              <LevelRecordDialogueButton onSave={handleNewLevelCreate} />
            </div>
          </>
        }
      </div>
  );
}