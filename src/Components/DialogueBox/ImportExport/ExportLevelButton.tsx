import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import {useState} from "react";
import CopyButton from "@/src/Components/BasicComponents/CopyButton";
import Level from "@/src/Classes/Level";
import getCsbCodeFromLevel from "@/src/Util/Codes/CsbEncodingUtils";
import {getXsbCodeFromLevel} from "@/src/Util/Codes/XsbUtils";
import CodeTextArea from "@/src/Components/DialogueBox/ImportExport/CodeTextArea";
import {CodeTypeEnum} from "@/src/Enum/CodeTypeEnum";

interface Props {
  level: Level
}

export default function ExportLevelButton({level}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [csbCodeText, setCsbCodeText] = useState<string>("");
  const [xsbCodeText, setXsbCodeText] = useState<string>("");

  function onOpen() {
    setCsbCodeText(getCsbCodeFromLevel(level));
    setXsbCodeText(getXsbCodeFromLevel(level));
  }

  return (
      <DialogBoxButton onOpen={onOpen} isOpen={isOpen} setIsOpen={setIsOpen} buttonContent={"\u21E7 Export"} title={"Export level"} content={
        <>
          <CodeTextArea codeType={CodeTypeEnum.CSB_CODE} value={csbCodeText} readOnly={true} />
          <CopyButton textToCopy={csbCodeText} />
          <div className="my-4"/>
          <CodeTextArea codeType={CodeTypeEnum.XSB_CODE} value={xsbCodeText} readOnly={true} />
          <CopyButton textToCopy={xsbCodeText} />
        </>
      }/>
  );

}