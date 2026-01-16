import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import {useState} from "react";
import CopyButton from "@/src/Components/BasicComponents/CopyButton";
import Level from "@/src/Classes/Level";
import getLevelCodeFromLevel from "@/src/Util/LevelCode/EncodingUtils";
import {getXsbCodeFromLevel} from "@/src/Util/LevelCode/XsbUtils";
import LevelCodeArea from "@/src/Components/DialogueBox/ImportExport/LevelCodeArea";
import XsbCodeArea from "@/src/Components/DialogueBox/ImportExport/XsbCodeArea";

interface Props {
  level: Level
}

export default function ExportLevelButton({level}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [levelCodeText, setLevelCodeText] = useState<string>("");
  const [xsbCodeText, setXsbCodeText] = useState<string>("");

  function onOpen() {
    setLevelCodeText(getLevelCodeFromLevel(level));
    setXsbCodeText(getXsbCodeFromLevel(level));
  }

  return (
      <DialogBoxButton onOpen={onOpen} isOpen={isOpen} setIsOpen={setIsOpen} buttonText={"\u21E7 Export"} title={"Export level"} content={
        <>
          <LevelCodeArea value={levelCodeText} readOnly={true} />
          <CopyButton textToCopy={levelCodeText} />
          <div className="my-4"/>
          <XsbCodeArea value={xsbCodeText} readOnly={true} />
          <CopyButton textToCopy={xsbCodeText} />
        </>
      }/>
  );

}