import {memo, ReactNode} from "react";
import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";

interface Props {
  tileType: LevelTileEnum,
  className: string,
  content: ReactNode,
  tileSize?: number
}

export const TileButtonMemo = memo(TileButton,
    (oldProps, newProps) => oldProps.tileType == newProps.tileType);

export function TileButton({className, content, tileSize} : Readonly<Props>){
  return <button
      style={tileSize === undefined ? {} : {
        width: tileSize,
        height: tileSize,
        fontSize: tileSize/1.5,
      }}
      className={className}>
      {content}
    </button>
}