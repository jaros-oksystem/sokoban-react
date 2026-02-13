import Level from "@/src/Classes/Level";
import LevelState from "@/src/Classes/LevelState";
import React, {useEffect, useState} from "react";

import Image from "next/image";

import {TileButtonMemo} from "./TileButtonMemo";
import {getOptionsFromLocalStorage} from "@/src/Util/LocalStorage/OptionStorageUtils";

const TILE_SIZE_MIN = 2;
const TILE_SIZE_MAX = 80;
const SIDE_PAD = 40;

interface Props {
  level: Level,
  levelState?: LevelState,
  tileOnClickHandler?: (x: number, y: number) => void,
  verticalSpaceTakenPx?: number
}

export default function GameBoard({level, levelState, tileOnClickHandler = () => {}, verticalSpaceTakenPx = 200} : Readonly<Props>) {
  const options = getOptionsFromLocalStorage();
  const gridOption = options.grid;
  const textGraphicsOption = options.textGraphics;

  function getDimensionsObject() {
    return {
      width: globalThis.window === undefined ? 0 : globalThis.window.innerWidth,
      height: globalThis.window === undefined ? 0 : globalThis.window.innerHeight
    }
  }

  const [dimensions, setDimensions] = useState(getDimensionsObject());
  useEffect(() => {
    globalThis.window.addEventListener("resize", () => setDimensions(getDimensionsObject()), false);
  }, []);

  const tileSize = Math.max(TILE_SIZE_MIN, Math.min(TILE_SIZE_MAX, Math.floor(Math.min(
      (dimensions.width-SIDE_PAD) / level.lenX,
      (dimensions.height-verticalSpaceTakenPx) / level.lenY))));
  if (globalThis.document !== undefined) {
    document.documentElement.style.setProperty('--tile-size', tileSize + "px");
    document.documentElement.style.setProperty('--tile-font-size', tileSize/(1.5) + "px");
  }

  const tileClassName = "tile " + (gridOption ? "border-[1px] border-black " : "");

  function handleBoardOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const bounds = e.currentTarget.getBoundingClientRect();
    const tileX = Math.min(level.lenX-1, Math.floor((e.clientX-1 - bounds.left)/tileSize));
    const tileY = Math.min(level.lenY-1, Math.floor((e.clientY-1 - bounds.top)/tileSize));
    tileOnClickHandler(tileX, tileY);
  }

  return (
      <div className={"flex border-1"}
           onMouseDown={handleBoardOnClick}
           onMouseOver={(e) => e.buttons & 1 ? handleBoardOnClick(e) : {} }>
        {
          Array.from({length: level.lenX}, (_: number, x: number) =>
              <div key={"Tile row:" + x} className="whitespace-nowrap">
                {
                  Array.from({length: level.lenY}, (_: number, y: number) => {
                      const props = {
                        content: textGraphicsOption ?
                            level.getCharForTile(x, y, levelState) :
                            <Image draggable="false" loading={"eager"} src={level.getSvgForTile(x, y, levelState)} alt="Tile" height={TILE_SIZE_MAX} width={TILE_SIZE_MAX}/>,
                        className: tileClassName,
                        tileType: level.getTileEnumForTile(x, y, levelState)
                      }
                      return <TileButtonMemo key={"Tile, x:" + x + ", y:" + y} {...props}/>
                    }
                  )
                }
              </div>
          )
        }
      </div>
  );
}

