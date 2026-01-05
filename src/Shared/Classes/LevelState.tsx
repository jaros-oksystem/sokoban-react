import {GridCoordinates} from "@/src/Shared/Classes/GridCoordinates";
import {Level} from "@/src/Shared/Classes/Level";
import {DirectionEnum} from "@/src/Shared/Enum/DirectionEnum";

export class LevelState {
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
    const newPlayerCrds = this.player.getShifted(direction);
    if (!level.isValidPlaceForObjectAtCoordinates(newPlayerCrds)) {
      return null;
    }
    // Prepare new level instance
    const newLevelState = new LevelState(newPlayerCrds, this.boxes, this.turn+1, this.won);
    // Check if player tries to move a box
    const movedBoxIdx = this.getBoxIdxAt(newPlayerCrds);
    if (movedBoxIdx != null) {
      const newBoxCrds = newPlayerCrds.getShifted(direction);
      if (level.isValidPlaceForObjectAtCoordinates(newBoxCrds) && this.getBoxIdxAt(newBoxCrds) == null) {
        // There is nothing preventing the box from being moved
        newLevelState.boxes[movedBoxIdx] = newBoxCrds;
        newLevelState.won = newLevelState.boxes.every((boxCrds) => level.isGoalAt(boxCrds));
      } else {
        // Player tries to move a box which cannot be moved, do not move the player
        return null;
      }
    }
    return newLevelState;
  }

}
