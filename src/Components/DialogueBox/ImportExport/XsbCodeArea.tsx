import {DEFAULT_LEVEL_CODE_GAME_XSB} from "@/src/Constants/Levels";
import {ChangeEvent} from "react";

interface Props {
  value: string,
  readOnly?: boolean,
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
}

export default function XsbCodeArea({value, readOnly = false, onChange = () => {}}: Readonly<Props>) {
  return (
      <>
        <p className="mt-2">XSB code:</p>
        <textarea readOnly={readOnly} value={value} placeholder={DEFAULT_LEVEL_CODE_GAME_XSB} onChange={onChange}
                  className="my-2 outline resize-none w-[500] h-96 font-mono read-only:bg-gray-200"/>
        <br/>
      </>
  );

}