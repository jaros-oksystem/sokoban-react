import GridCoordinates from "@/src/Shared/Classes/GridCoordinates";
import Level from "@/src/Shared/Classes/Level";
import {DirectionEnum} from "@/src/Shared/Enum/DirectionEnum";

export default class LevelState {
  player: GridCoordinates;
  boxes: GridCoordinates[];
  turn: number;
  won: boolean;

  constructor(player: GridCoordinates, boxes: GridCoordinates[], turn: number, won: boolean) {
    this.player = player;
    this.boxes = boxes;
    this.turn = turn;
    this.won = won;
  }

  isPlayerAt(coordinates: GridCoordinates) {
    return this.player.equals(coordinates);
  }

  getBoxIdxAt(coordinates: GridCoordinates): number|null {
    const idx = this.boxes.findIndex((e) => e.equals(coordinates));
    return idx == -1 ? null : idx;
  }

  createNewLevelStateForPlayerMove(level: Level, direction: DirectionEnum): LevelState|null {
    // Check if the game has already been won
    if (this.won) {
      return null;
    }
    // Check if player tries to move into a wall or out of bounds
    const newPlayerCoords = this.player.getShifted(direction);
    if (!level.isValidPlaceForObjectAt(newPlayerCoords)) {
      return null;
    }
    // Prepare new level instance
    const newLevelState = new LevelState(newPlayerCoords, this.boxes, this.turn+1, this.won);
    // Check if player tries to move a box
    const movedBoxIdx = this.getBoxIdxAt(newPlayerCoords);
    if (movedBoxIdx != null) {
      const newBoxCoords = newPlayerCoords.getShifted(direction);
      if (level.isValidPlaceForObjectAt(newBoxCoords) && this.getBoxIdxAt(newBoxCoords) == null) {
        // There is nothing preventing the box from being moved
        newLevelState.boxes[movedBoxIdx] = newBoxCoords;
        newLevelState.won = newLevelState.boxes.every((box) => level.isGoalAt(box));
      } else {
        // Player tries to move a box which cannot be moved, do not move the player
        return null;
      }
    }
    return newLevelState;
  }

}
