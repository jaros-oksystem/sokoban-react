import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import React, {useState} from "react";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import LevelCollection from "@/src/Classes/LevelCollection";

interface Props {
  onSave: (collection: LevelCollection) => void,
  defaultValues?: LevelCollection
}

export default function CollectionDialogueButton({onSave, defaultValues}: Readonly<Props>) {
  const newCollection = defaultValues === undefined;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collName, setCollName] = useState<string>("");
  const [collAuthor, setCollAuthor] = useState<string>("");
  const [collDescription, setCollDescription] = useState<string>("");

  function setDefaultValues() {
    setCollName(newCollection ? "" : defaultValues.collectionName);
    setCollAuthor(newCollection ? "" : defaultValues.author);
    setCollDescription(newCollection ? "" : defaultValues.description);
  }

  function handleOnSave() {
    setIsOpen(false);
    const retValue: LevelCollection = {
      uuid: newCollection ? crypto.randomUUID() : defaultValues?.uuid,
      collectionName: collName,
      author: collAuthor,
      description: collDescription,
      levels: newCollection ? [] : defaultValues?.levels
    }
    onSave(retValue);
  }

  const title = newCollection ? "Create collection" : "Edit collection";
  const colorEnum = newCollection ? ColorEnum.GREEN : ColorEnum.BLUE;

  return (
      <DialogBoxButton onOpen={setDefaultValues} isOpen={isOpen} setIsOpen={setIsOpen} title={title} color={colorEnum} buttonContent={
        newCollection ? "+ Create Collection" : "\u270E Edit"
      } content={
        <div className="flex flex-col">
          <p>Collection name: </p>
          <textarea value={collName} cols={50} rows={2}
                 onChange={(e) => setCollName(e.target.value)}
                 className="px-1 my-2 outline resize-none read-only:bg-gray-200 whitespace-nowrap"/>
          <p>Author: </p>
          <textarea value={collAuthor} cols={50} rows={1}
                    onChange={(e) => setCollAuthor(e.target.value)}
                    className="px-1 my-2 outline resize-none read-only:bg-gray-200 whitespace-nowrap"/>
          <p>Description: </p>
          <textarea value={collDescription} cols={50} rows={4}
                    onChange={(e) => setCollDescription(e.target.value)}
                    className="my-2 outline read-only:bg-gray-200"/>
          <div className="mx-5"></div>
          <ColoredButton content={newCollection ? "Create" : "Save"}
                         color={colorEnum}
                         onClick={handleOnSave} />
        </div>
      }/>
  );

}