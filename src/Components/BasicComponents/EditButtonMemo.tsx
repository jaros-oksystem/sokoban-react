import Level from "@/src/Classes/Level";
import {EDITOR_PAGE_PATH} from "@/src/Constants/PagePaths";
import getCsbCodeFromLevel from "@/src/Util/Codes/CsbEncodingUtils";
import Link from "next/link";
import {memo} from "react";
import ColoredButton from "@/src/Components/BasicComponents/ColoredButton";
import {ColorEnum} from "@/src/Enum/ColorEnum";

interface Props {
  level: Level
}

export const EditButtonMemo = memo(function EditButton({level} : Readonly<Props>){
  return <Link className="pl-2" href={{
      pathname: EDITOR_PAGE_PATH,
      query: {
        level: getCsbCodeFromLevel(level)
      }}}>
    <ColoredButton color={ColorEnum.CYAN} content={"\u270E Open in editor"}/>
  </Link>;
});