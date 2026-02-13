import {DEFAULT_CSB_FOR_GAME, DEFAULT_XSB_CODE} from "@/src/Constants/Levels";
import { ChangeEvent } from "react";
import {CodeTypeEnum} from "@/src/Enum/CodeTypeEnum";

interface Props {
  value: string,
  codeType: CodeTypeEnum,
  readOnly?: boolean,
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
  includeTitle?: boolean
}

export default function CodeTextArea({value, codeType, readOnly = false, onChange = () => {}, includeTitle = true}: Readonly<Props>) {
  let title, placeholder, classNameSpecific;
  if (codeType == CodeTypeEnum.CSB_CODE) {
    title = "CSB code:";
    placeholder = DEFAULT_CSB_FOR_GAME;
    classNameSpecific = "h-24 ";
  } else {
    title = "XSB code:";
    placeholder = DEFAULT_XSB_CODE;
    classNameSpecific = "h-96 font-mono ";
  }
  return (
      <>
        {
          includeTitle && <p className="mt-2">{title}</p>
        }
        <textarea readOnly={readOnly} value={value} placeholder={placeholder} onChange={onChange}
                  className={"my-2 outline resize-none w-[500] read-only:bg-gray-200 " + classNameSpecific}/>
        <br/>
      </>
  );

}