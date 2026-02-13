import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import React, {useState} from "react";
import LevelCollection from "@/src/Classes/LevelCollection";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";

interface Props {
  onImport: (collection: LevelCollection) => void;
}

export default function ImportCollectionButton({onImport}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionText, setCollectionText] = useState<string>("");

  function handleCollectionImport() {
    try {
      const coll: LevelCollection = JSON.parse(collectionText);
      onImport(coll);
      setIsOpen(false);
    } catch {
      alert("Invalid format");
    }
  }

  function handleOnOpen() {
    setCollectionText("");
  }

  const importText = "\u21E9 Import";

  return (
      <DialogBoxButton onOpen={handleOnOpen} isOpen={isOpen} setIsOpen={setIsOpen} buttonContent={importText + " collection"} title={"Import collection"} content={
        <>
          <textarea value={collectionText} onChange={(e) => setCollectionText(e.target.value)}
                    className={"my-2 outline resize-none w-[500] read-only:bg-gray-200 h-96"}/>
          <ColoredButton content={importText} onClick={handleCollectionImport} />
        </>
      }/>
  );

}