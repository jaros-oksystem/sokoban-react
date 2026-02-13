import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import React, {useState} from "react";
import CopyButton from "@/src/Components/BasicComponents/CopyButton";
import LevelCollection from "@/src/Classes/LevelCollection";

interface Props {
  collection: LevelCollection
}

export default function ExportCollectionButton({collection}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [collectionText, setCollectionText] = useState<string>("");

  function onOpen() {
    setCollectionText(JSON.stringify(collection));
  }

  return (
      <DialogBoxButton onOpen={onOpen} isOpen={isOpen} setIsOpen={setIsOpen} buttonContent={"\u21E7 Export"} title={"Export collection"} content={
        <>
          <textarea readOnly={true} value={collectionText}
                    className={"my-2 outline resize-none w-[500] read-only:bg-gray-200 h-96"}/>
          <CopyButton textToCopy={collectionText} />
        </>
      }/>
  );

}