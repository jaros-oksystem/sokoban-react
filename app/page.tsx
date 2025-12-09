'use client'

import {ReactNode, useCallback, useEffect, useState} from "react";

export default function Home() {
  return (
      <div>
        <div className="mx-20 py-20">
          <GameSimple/>
        </div>
      </div>
  );
}

enum LevelTileEnum {
  EMPTY,
  WALL,
  GOAL,
}

enum DirectionEnum {
  UP,
  LEFT,
  DOWN,
  RIGHT
}

function keyBoardEventKeyToDirectionEnum(keyBoardEventKey: string): DirectionEnum|null {
  switch (keyBoardEventKey) {
    case "ArrowUp": return DirectionEnum.UP;
    case "ArrowLeft": return DirectionEnum.LEFT;
    case "ArrowDown": return DirectionEnum.DOWN;
    case "ArrowRight": return DirectionEnum.RIGHT;
    default: return null;
  }
}

interface Coordinates2D {
  x: number,
  y: number,
}

interface Level {
  lenX: number,
  lenY: number,
  levelTiles: LevelTileEnum[][],
  initialPlayer: Coordinates2D,
  initialBoxes: Coordinates2D[]
}

interface LevelState {
  player: Readonly<Coordinates2D>,
  turn: number,
  boxes: Readonly<Coordinates2D>[],
  won: boolean
}

function shiftCoordinatesInDirection(object: Coordinates2D, direction: DirectionEnum, amount: number = 1): Coordinates2D {
  switch (direction) {
    case DirectionEnum.UP: return {x: object.x, y: object.y-amount}
    case DirectionEnum.LEFT: return {x: object.x-amount, y: object.y}
    case DirectionEnum.DOWN: return {x: object.x, y: object.y+amount}
    case DirectionEnum.RIGHT: return {x: object.x+amount, y: object.y}
  }
}

function getIntialLevelStateFromLevel(level: Level): LevelState {
  return {
    player: {x: level.initialPlayer.x, y: level.initialPlayer.y},
    turn: 0,
    boxes: new Array(...level.initialBoxes),
    won: false
  }
}

export function GameSimple() {
  const initialLevelTiles = [...Array(5)].map(() => new Array(5).fill(LevelTileEnum.EMPTY));
  initialLevelTiles[3][2] = LevelTileEnum.WALL;
  initialLevelTiles[3][0] = LevelTileEnum.GOAL;
  initialLevelTiles[0][4] = LevelTileEnum.GOAL;
  const initialLevel = {
    lenX: 5,
    lenY: 5,
    levelTiles: initialLevelTiles,
    initialPlayer: {x: 2, y: 2 },
    initialBoxes: [{x: 1, y: 1 },{x: 3, y: 3 }],
  };
  const [levelInfo, setLevelInfo] = useState<Level>(initialLevel);
  const [levelState, setLevelState] = useState<LevelState>(getIntialLevelStateFromLevel(initialLevel));

  console.log("Level info:" + JSON.stringify(levelInfo) + ", Level state: " + JSON.stringify(levelState));

  // Game functions

  function tryToMovePlayerInDirection(direction: DirectionEnum): Coordinates2D|null {
    const newPlayerCrds = shiftCoordinatesInDirection(levelState.player, direction);
    // Check if the game has already been won
    if (levelState.won) {
      return null;
    }
    // Check if player tries to move into a wall or out of bounds
    if (!canObjectBeAtCoordinates(newPlayerCrds)) {
      return null;
    }
    // Check if player tries to move a box
    let newBoxes: Coordinates2D[]|null = null;
    let won: boolean = false;
    const movedBoxIdx = getBoxIdxAt(newPlayerCrds);
    if (movedBoxIdx != null) {
      const newBoxCrds = shiftCoordinatesInDirection(newPlayerCrds, direction);
      if (canObjectBeAtCoordinates(newBoxCrds) && getBoxIdxAt(newBoxCrds) == null) {
        newBoxes = levelState.boxes.slice();
        newBoxes[movedBoxIdx] = newBoxCrds;
      } else {
        // Player tries to move a box which cannot be moved -> do not move the player
        return null;
      }
      // If the box was moved on a goal, check if all other boxes are also on a goal
      if (levelInfo.levelTiles[newBoxCrds.x][newBoxCrds.y] == LevelTileEnum.GOAL) {
        console.log("BOX WAS MOVED TO A GOAL")
        won = true;
        for (let i = 0; i < levelState.boxes.length; i++) {
          const box = levelState.boxes[i];
          if (i != movedBoxIdx && levelInfo.levelTiles[box.x][box.y] != LevelTileEnum.GOAL) {
            won = false;
            break;
          }
        }
      }
    }
    // Construct and set new level state
    const newLevelState: LevelState = {
      player: newPlayerCrds,
      turn: levelState.turn+1,
      boxes: newBoxes ?? levelState.boxes,
      won: won
    }
    setLevelState(newLevelState);
    return newPlayerCrds;
  }

  // Util functions

  function isPlayerAt(coordinates: Coordinates2D) {
    return levelState.player.x == coordinates.x && levelState.player.y == coordinates.y;
  }

  function isWallAt(coordinates: Coordinates2D) {
    return levelInfo.levelTiles[coordinates.x][coordinates.y] == LevelTileEnum.WALL;
  }

  function isGoalAt(coordinates: Coordinates2D) {
    return levelInfo.levelTiles[coordinates.x][coordinates.y] == LevelTileEnum.GOAL;
  }

  function isEmptyAt(coordinates: Coordinates2D) {
    return levelInfo.levelTiles[coordinates.x][coordinates.y] == LevelTileEnum.EMPTY;
  }

  function getBoxIdxAt(coordinates: Coordinates2D): number|null {
    for (let i = 0; i < levelState.boxes.length; i++) {
      const box = levelState.boxes[i];
      if (box.x == coordinates.x && box.y == coordinates.y) {
        return i;
      }
    }
    return null;
  }

  function canObjectBeAtCoordinates(coordinates: Coordinates2D){
    return !isCoordinateOutsideOfLevel(coordinates) && !isWallAt(coordinates);
  }


  function isCoordinateOutsideOfLevel(coordinates: Coordinates2D) {
    return coordinates.x < 0 || coordinates.x >= levelInfo.lenX ||
        coordinates.y < 0 || coordinates.y >= levelInfo.lenY;
  }

  // Keyboard hook

  const handleGameKeyDown = useCallback((e: KeyboardEvent) => {
    const direction = keyBoardEventKeyToDirectionEnum(e.key);
    if (direction != null) {
      tryToMovePlayerInDirection(direction);
    }
  }, [tryToMovePlayerInDirection]);

  useEffect(() => {
    function handlekeydownEvent(event: KeyboardEvent) {
      handleGameKeyDown(event);
    }
    document.addEventListener('keyup', handlekeydownEvent)
    return () => {
      document.removeEventListener('keyup', handlekeydownEvent)
    }
  }, [handleGameKeyDown])

  // Reset button handler

  function handleResetButtonOnClick() {
    setLevelState(getIntialLevelStateFromLevel(initialLevel));
  }

  // Rendering functions

  function getTextSymbolForTile(x: number, y:number): string {
    const coords = {x: x, y: y}
    const isBox = getBoxIdxAt(coords) != null;
    const isWall = isWallAt(coords);
    const isPlayer = isPlayerAt(coords);
    const isGoal = isGoalAt(coords);
    const isEmpty = isEmptyAt(coords);
    if ((isWall && isPlayer) || (isWall && isBox) || (isBox && isPlayer)) {
      return "\u2620"; // Error - Invalid state - collision
    } else if (isWall) {
      return "\u25A0";
    } else if (isGoal && isBox) {
      return "\u2D59";
    } else if (isGoal && isPlayer) {
      return "\u1437";
    } else if (isBox) {
      return "\u2D54";
    } else if (isPlayer) {
      return "\u1433";
    } else if (isGoal) {
      return "\u2E31";
    } else if (isEmpty){
      return "";
    } else {
      return "\u2622"; // Error - unknown tile
    }
  }

  function Tile({x, y, colorClassName}: {x: number, y: number, colorClassName: string}) {
    const className = "text-3xl h-10 w-10 align-middle border-2 border-black -m-px " + colorClassName;
    return (
        <button
            className={className}>
          {getTextSymbolForTile(x,y)}
        </button>
    );
  }

  return (
      <div>
        <div>
          <p>{"Turn: " + levelState.turn}</p>
          <button onClick={() => handleResetButtonOnClick()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            RESET
          </button>
        </div>
        <div>
          {
            Array.from({length: levelInfo.lenY}, (_: number, y: number): ReactNode =>
                <div key={"Tile row div:" + y}>
                  {
                    Array.from({length: levelInfo.lenX}, (_: number, x: number): ReactNode =>
                        <Tile key={"Tile, x:" + x + ", y:" + y} x={x} y={y} colorClassName={levelState.won ? "bg-green-200" : ""}/>
                    )
                  }
                </div>
            )
          }
        </div>
      </div>
  );

}