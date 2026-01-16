import Level from "@/src/Classes/Level";
import GridCoordinates from "@/src/Classes/GridCoordinates";
import LevelState from "@/src/Classes/LevelState";
import React, {useEffect, useState} from "react";

import Image from "next/image";

import {TileButtonMemo} from "./TileButtonMemo";

import wallSvg from "./../../Svg/Tiles/wall.svg";
import goalSvg from "./../../Svg/Tiles/goal.svg";
import boxSvg from "./../../Svg/Tiles/box.svg";
import playerSvg from "./../../Svg/Tiles/player.svg";
import boxOnGoalSvg from "./../../Svg/Tiles/box_on_goal.svg";
import playerOnGoalSvg from "./../../Svg/Tiles/player_on_goal.svg";
import errorSvg from "./../../Svg/Tiles/error.svg";
import emptySvg from "./../../Svg/Tiles/empty_tile.svg";
import {getOptionsFromLocalStorage} from "@/src/Util/LocalStorage/OptionUtils";
import {LevelTileEnum} from "@/src/Enum/LevelTileEnum";

const TILE_SIZE_MIN = 2;
const TILE_SIZE_MAX = 80;
const SIDE_PAD = 40;

interface Props {
  level: Level,
  levelState?: LevelState,
  tileOnClickHandler?: (x: number, y: number) => void,
  verticalSpaceTakenPx?: number
}

export default function GameBoard({level, levelState, tileOnClickHandler = () => {}, verticalSpaceTakenPx = 100} : Readonly<Props>) {
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

  function getSvgForTile(x: number, y: number) {
    return level.transformTileAtCoordinates(new GridCoordinates(x,y), emptySvg, wallSvg,
        goalSvg, boxSvg, playerSvg, boxOnGoalSvg, playerOnGoalSvg, errorSvg, levelState);
  }

  function getCharForTile(x: number, y: number) {
    return level.transformTileAtCoordinates(new GridCoordinates(x,y), "", "\u25A0",
        "\u2E31", "\u2D54", "\u1433", "\u2D59", "\u1437", "\u2620", levelState);
  }

  function getTileEnumForTile(x: number, y: number) {
    return level.transformTileAtCoordinates(new GridCoordinates(x,y), LevelTileEnum.EMPTY, LevelTileEnum.WALL,
        LevelTileEnum.GOAL, LevelTileEnum.BOX, LevelTileEnum.PLAYER, LevelTileEnum.BOX_ON_GOAL,
        LevelTileEnum.PLAYER_ON_GOAL, LevelTileEnum.EMPTY, levelState);
  }

  const tileClassName = "tile text-2xl " + (gridOption ? "border-[1px] border-black " : "");

  function handleWholeBoardOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const bounds = e.currentTarget.getBoundingClientRect();
    const tileX = Math.min(level.lenX-1, Math.floor((e.clientX - bounds.left)/tileSize));
    const tileY = Math.min(level.lenY-1, Math.floor((e.clientY - bounds.top)/tileSize));
    tileOnClickHandler(tileX, tileY);
  }

  return (
      <div className={"flex border-1"}
           onMouseDown={handleWholeBoardOnClick}
           onMouseOver={(e) => e.buttons & 1 ? handleWholeBoardOnClick(e) : {} }>
        {
          Array.from({length: level.lenX}, (_: number, x: number) =>
              <div key={"Tile row:" + x} className="whitespace-nowrap">
                {
                  Array.from({length: level.lenY}, (_: number, y: number) => {
                      const props = {
                        content: textGraphicsOption ?
                            getCharForTile(x,y) :
                            <Image draggable="false" loading={"eager"} src={getSvgForTile(x,y)} alt="Tile" height={TILE_SIZE_MAX} width={TILE_SIZE_MAX}/>,
                        className: tileClassName,
                        tileType: getTileEnumForTile(x,y)
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

