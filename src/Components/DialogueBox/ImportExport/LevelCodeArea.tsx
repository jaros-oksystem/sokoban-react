import {DEFAULT_LEVEL_CODE_GAME} from "@/src/Constants/Levels";
import { ChangeEvent } from "react";

interface Props {
  value: string,
  readOnly?: boolean,
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
}

export default function LevelCodeArea({value, readOnly = false, onChange = () => {}}: Readonly<Props>) {
  return (
      <>
        <p className="mt-2">Level code:</p>
        <textarea readOnly={readOnly} value={value} placeholder={DEFAULT_LEVEL_CODE_GAME} onChange={onChange}
                  className="my-2 outline resize-none w-[500] h-24 read-only:bg-gray-200"/>
        <br/>
      </>
  );

}