import Level from "@/src/Classes/Level";
import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import {useState} from "react";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {getLevelFromXsbCode} from "@/src/Util/Codes/XsbUtils";
import CodeTextArea from "@/src/Components/DialogueBox/ImportExport/CodeTextArea";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {CodeTypeEnum} from "@/src/Enum/CodeTypeEnum";

interface Props {
  onImport: (level: Level) => void;
}

export default function ImportLevelButton({onImport}: Readonly<Props>) {
  const [csbCodeText, setCsbCodeText] = useState<string>("");
  const [xsbCodeText, setXsbCodeText] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleCsbCodeImport() {
    try {
      const level = getLevelFromCsbCode(csbCodeText);
      onImport(level);
      setIsOpen(false);
    } catch {
      alert("Invalid CSB code");
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
    setCsbCodeText("");
    setXsbCodeText("");
  }

  const importText = "\u21E9 Import";

  return (
      <DialogBoxButton onOpen={onOpenHandler} isOpen={isOpen} setIsOpen={setIsOpen} buttonContent={importText} title={"Import level"} content={
        <>
          <CodeTextArea codeType={CodeTypeEnum.CSB_CODE} value={csbCodeText} readOnly={false}
                        onChange={(e) => setCsbCodeText(e.target.value)} />
          <ColoredButton content={importText} onClick={handleCsbCodeImport} />
          <div className="my-4"/>
          <CodeTextArea codeType={CodeTypeEnum.XSB_CODE} value={xsbCodeText} readOnly={false}
                         onChange={(e) => setXsbCodeText(e.target.value)} />
          <ColoredButton content={importText} onClick={handleXsbCodeImport} />
        </>
      }/>
  );

}