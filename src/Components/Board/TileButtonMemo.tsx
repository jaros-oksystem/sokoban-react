import {memo, ReactNode} from "react";
import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";

interface Props {
  tileType: LevelTileEnum,
  className: string,
  content: ReactNode
}

export const TileButtonMemo = memo(TileButton,
    (oldProps, newProps) => oldProps.tileType == newProps.tileType);

export function TileButton({className, content} : Readonly<Props>){
  return <button
      className={className}>
      {content}
    </button>
}