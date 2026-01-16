import Level from "@/src/Classes/Level";
import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import BlueButton from "@/src/Components/BasicComponents/BlueButton";
import {useState} from "react";
import getLevelFromLevelCode from "@/src/Util/LevelCode/DecodingUtils";
import {getLevelFromXsbCode} from "@/src/Util/LevelCode/XsbUtils";
import LevelCodeArea from "@/src/Components/DialogueBox/ImportExport/LevelCodeArea";
import XsbCodeArea from "@/src/Components/DialogueBox/ImportExport/XsbCodeArea";

interface Props {
  onImport: (level: Level) => void;
}

export default function ImportLevelButton({onImport}: Readonly<Props>) {
  const [levelCodeText, setLevelCodeText] = useState<string>("");
  const [xsbCodeText, setXsbCodeText] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleLevelCodeImport() {
    try {
      const level = getLevelFromLevelCode(levelCodeText);
      onImport(level);
      setIsOpen(false);
    } catch {
      alert("Invalid level code");
    }
  }

  function handleXsbCodeImport() {
    try {
      const level = getLevelFromXsbCode(xsbCodeText);
      onImport(level);
      setIsOpen(false);
    } catch {
      alert("Invalid XSB code");
    }
  }

  function onOpenHandler() {
    setLevelCodeText("");
    setXsbCodeText("");
  }

  const importText = "\u21E9 Import";

  return (
      <DialogBoxButton onOpen={onOpenHandler} isOpen={isOpen} setIsOpen={setIsOpen} buttonText={importText} title={"Import level"} content={
        <>
          <LevelCodeArea value={levelCodeText} readOnly={false}
                         onChange={(e) => setLevelCodeText(e.target.value)} />
          <BlueButton text={importText} onClick={handleLevelCodeImport} />
          <div className="my-4"/>
          <XsbCodeArea value={xsbCodeText} readOnly={false}
                         onChange={(e) => setXsbCodeText(e.target.value)} />
          <BlueButton text={importText} onClick={handleXsbCodeImport} />
        </>
      }/>
  );

}