import GridCoordinates from "@/src/Classes/GridCoordinates";
import Level, {NO_PLAYER_COORDINATES} from "@/src/Classes/Level";
import {DirectionEnum} from "@/src/Enum/DirectionEnum";
import {getMovesRequiredToReachTile} from "@/src/Util/StateExplorationUtils";

export default class LevelState {
  parentLevel: Level;
  player: GridCoordinates;
  boxes: GridCoordinates[];
  turn: number;

  constructor(parentLevel: Level, player: GridCoordinates, boxes: GridCoordinates[], turn: number) {
    this.parentLevel = parentLevel;
    this.player = player;
    this.boxes = boxes;
    this.turn = turn;
  }

  isPlayerAt(coordinates: GridCoordinates) {
    return this.player.equals(coordinates);
  }

  getBoxIdxAt(coordinates: GridCoordinates): number|null {
    const idx = this.boxes.findIndex((e) => e.equals(coordinates));
    return idx == -1 ? null : idx;
  }

  isWon() {
    return this.boxes.length > 0 && this.boxes.every((box) => this.parentLevel.isGoalAt(box));
  }

  isPlayerAtNoPlayerCoordinates() {
    return NO_PLAYER_COORDINATES.equals(this.player);
  }

  createNewLevelStateForPlayerMove(direction: DirectionEnum): LevelState|null {
    if (this.isWon()) {
      return null;
    }
    // Check if player tries to move into a wall or out of bounds
    const newPlayerCoords = this.player.getShifted(direction);
    if (!this.parentLevel.isValidPlaceForObjectAt(newPlayerCoords)) {
      return null;
    }
    // Check if player tries to move a box
    const movedBoxIdx = this.getBoxIdxAt(newPlayerCoords);
    if (movedBoxIdx != null) {
      const newBoxCoords = newPlayerCoords.getShifted(direction);
      if (this.canBoxBePushedTo(newBoxCoords)) {
        // There is nothing preventing the box from being moved
        this.boxes[movedBoxIdx] = newBoxCoords;
      } else {
        // Player tries to move a box which cannot be moved, do not move the player
        return null;
      }
    }
    return new LevelState(this.parentLevel, newPlayerCoords, this.boxes, this.turn+1);
  }

  createNewLevelStateForClick(clickCoords: GridCoordinates): LevelState|null {
    if (this.isWon() || this.isPlayerAtNoPlayerCoordinates() || this.player.equals(clickCoords)) {
      return null;
    }
    // Check if the destination is a wall
    if (this.parentLevel.isWallAt(clickCoords)) {
      return null;
    }
    // If the destination is a box, check if it is next to the player and can be moved
    const movedBoxIdx = this.getBoxIdxAt(clickCoords);
    if (movedBoxIdx != null) {
      const pushDirection = this.player.getDirectionOfAdjacentObject(clickCoords);
      if (pushDirection == null) {
        // The player isn't next to a box, yet tries to move into one
        return null;
      } else {
        // There is a box next to the player
        const newBoxCoords = clickCoords.getShifted(pushDirection);
        if (this.canBoxBePushedTo(newBoxCoords)) {
          // There is nothing preventing the box from being moved
          this.boxes[movedBoxIdx] = newBoxCoords;
          return new LevelState(this.parentLevel, clickCoords, this.boxes, this.turn+1);
        } else {
          // Player tries to move a box which cannot be moved, do not move the player
          return null;
        }
      }
    }
    const movesRequired = getMovesRequiredToReachTile(this.parentLevel.lenX, this.parentLevel.lenY,
        this.player, clickCoords, (c) => {
      return !this.parentLevel.isValidPlaceForObjectAt(c) || this.getBoxIdxAt(c) != null;
    });
    return movesRequired == null ? null : new LevelState(this.parentLevel, clickCoords, this.boxes, this.turn+movesRequired);
  }

  canBoxBePushedTo(coords: GridCoordinates): boolean {
    return this.parentLevel.isValidPlaceForObjectAt(coords) && this.getBoxIdxAt(coords) == null;
  }

}
