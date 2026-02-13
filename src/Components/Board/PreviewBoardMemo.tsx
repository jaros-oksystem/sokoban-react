import React, {memo} from "react";

import Image from "next/image";

import {TileButton} from "./TileButtonMemo";
import {getOptionsFromLocalStorage} from "@/src/Util/LocalStorage/OptionStorageUtils";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {ERROR_CSB_CODE} from "@/src/Constants/Levels";

const TILE_SIZE_MIN = 1;
const TILE_SIZE_MAX = 80;

interface Props {
  csbCode: string,
  widthPx?: number,
  heightPx?: number
}

export const PreviewBoardMemo = memo(PreviewBoard,
    (oldProps, newProps) => oldProps.csbCode == newProps.csbCode);

export function PreviewBoard({csbCode, widthPx = 200, heightPx = 200} : Readonly<Props>) {
  let level;
  try {
    level = getLevelFromCsbCode(csbCode);
  } catch {
    console.error("Unable to parse CSB code: " + csbCode);
    level = getLevelFromCsbCode(ERROR_CSB_CODE);
  }
  const options = getOptionsFromLocalStorage();
  const gridOption = options.grid;
  const textGraphicsOption = options.textGraphics;

  const computedTileSize = Math.floor(Math.min(widthPx/level.lenX,heightPx/level.lenY));
  const tileSize = Math.max(TILE_SIZE_MIN, Math.min(TILE_SIZE_MAX, computedTileSize));

  const tileClassName = "block " + (gridOption ? "border-[1px] border-black " : "");

  return (
      <div className={"flex border-1"}>
        {
          Array.from({length: level.lenX}, (_: number, x: number) =>
              <div key={"Tile row:" + x} className="whitespace-nowrap">
                {
                  Array.from({length: level.lenY}, (_: number, y: number) => {
                      const props = {
                        content: textGraphicsOption ?
                            level.getCharForTile(x,y) :
                            <Image draggable="false" loading={"eager"} src={level.getSvgForTile(x,y)} alt="Tile" height={TILE_SIZE_MAX} width={TILE_SIZE_MAX}/>,
                        className: tileClassName,
                        tileType: level.getTileEnumForTile(x,y),
                        tileSize: tileSize,
                      }
                      return <TileButton key={"Tile, x:" + x + ", y:" + y} {...props}/>
                    }
                  )
                }
              </div>
          )
        }
      </div>
  );
}

