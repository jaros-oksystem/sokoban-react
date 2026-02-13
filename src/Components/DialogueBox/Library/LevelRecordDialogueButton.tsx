import DialogBoxButton from "@/src/Components/DialogueBox/DialogBoxButton";
import React, {useState} from "react";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";
import LevelRecord from "@/src/Classes/LevelRecord";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {getLevelFromXsbCode, getXsbCodeFromLevel} from "@/src/Util/Codes/XsbUtils";
import {CodeTypeEnum, codeEnumToString} from "@/src/Enum/CodeTypeEnum";
import getCsbCodeFromLevel from "@/src/Util/Codes/CsbEncodingUtils";
import CodeTextArea from "@/src/Components/DialogueBox/ImportExport/CodeTextArea";
import {isStringAPositiveInteger} from "@/src/Util/StringUtils";

interface Props {
  onSave: (record: LevelRecord) => void,
  defaultValues?: LevelRecord
}

export default function LevelRecordDialogueButton({onSave, defaultValues}: Readonly<Props>) {
  const newRecord = defaultValues === undefined;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [levelName, setLevelName] = useState<string>("");
  const [csbCode, setCsbCode] = useState<string>("");
  const [xsbCode, setXsbCode] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [selectedCodeType, setSelectedCodeType] = useState<CodeTypeEnum>(CodeTypeEnum.CSB_CODE);

  function setDefaultValues() {
    setLevelName(newRecord ? "" : defaultValues?.levelName);
    setCsbCode(newRecord ? "" : defaultValues?.csbCode);
    setXsbCode(newRecord ? "" : getXsbCodeFromLevel(getLevelFromCsbCode(defaultValues?.csbCode)));
    setOrder(newRecord ? "" : "" + defaultValues?.order);
  }

  function handleOnSave() {
    try {
      if (!newRecord && !isStringAPositiveInteger(order)) {
        alert("Order must be a positive integer");
        return;
      }
      const csbCodeToSave = selectedCodeType === CodeTypeEnum.CSB_CODE ?
          csbCode :
          getCsbCodeFromLevel(getLevelFromXsbCode(xsbCode));
      getLevelFromCsbCode(csbCodeToSave);

      setIsOpen(false);
      const retValue: LevelRecord = {
        uuid: newRecord ? crypto.randomUUID() : defaultValues?.uuid,
        levelName: levelName,
        csbCode: csbCodeToSave,
        order: newRecord ? 0 : Number(order),
      }
      onSave(retValue);
    } catch {
      alert("Invalid code");
      return;
    }
  }

  const title = newRecord ? "Add level" : "Edit level";
  const colorEnum = newRecord ? ColorEnum.GREEN : ColorEnum.BLUE;

  return (
      <DialogBoxButton onOpen={setDefaultValues} isOpen={isOpen} setIsOpen={setIsOpen} title={title} color={colorEnum} buttonContent={
        newRecord ? "+ Add level" : "\u270E Edit record"
      } content={
        <div className="flex flex-col">
          <p>Level name: </p>
          <textarea value={levelName} cols={50} rows={1}
                 onChange={(e) => setLevelName(e.target.value)}
                 className="px-1 my-2 outline resize-none read-only:bg-gray-200 whitespace-nowrap"/>
          <p>Level contents:</p>
          {
            [CodeTypeEnum.CSB_CODE, CodeTypeEnum.XSB_CODE].map((codeEnum: CodeTypeEnum) =>
                <div key={"Radio for: " + codeEnum + ", level: " + defaultValues?.uuid}>
                  <label>
                    <input type="radio"
                           name="codeTypeRadio"
                           value={codeEnum}
                           checked={selectedCodeType == codeEnum}
                           onChange={() => setSelectedCodeType(codeEnum)}
                    /> {codeEnumToString(codeEnum)}
                  </label>
                  <br/>
                </div>
            )
          }
          <CodeTextArea codeType={selectedCodeType} readOnly={false} includeTitle={false}
                        value={selectedCodeType === CodeTypeEnum.CSB_CODE ? csbCode : xsbCode}
                        onChange={(e) => selectedCodeType === CodeTypeEnum.CSB_CODE ?
                            setCsbCode(e.target.value) : setXsbCode(e.target.value)}/>
          {
            !newRecord &&
            <>
              <p>Order: </p>
              <input type="number" value={order} min={1}
                        onChange={(e) => setOrder(e.target.value)}
                        className="px-1 my-2 outline resize-none read-only:bg-gray-200 whitespace-nowrap"/>
            </>
          }
          <ColoredButton content={newRecord ? "Create" : "Save"}
                         color={colorEnum}
                         onClick={handleOnSave} />
        </div>
      }/>
  );

}