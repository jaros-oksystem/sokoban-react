import Level from "@/src/Classes/Level";
import {EDITOR_PAGE_PATH} from "@/src/Constants/PagePaths";
import getLevelCodeFromLevel from "@/src/Util/LevelCode/EncodingUtils";
import Link from "next/link";
import BlueButton from "@/src/Components/BasicComponents/BlueButton";
import {memo} from "react";

interface Props {
  level: Level
}

export const EditButtonMemo = memo(function EditButton({level} : Readonly<Props>){
  return <Link className="pl-2" href={{
      pathname: EDITOR_PAGE_PATH,
      query: {
        level: getLevelCodeFromLevel(level)
      }}}>
    <BlueButton text={"\u270E Edit"}/>
  </Link>;
});