import {DirectionEnum, getAllDirectionEnumValues, getOppositeDirection} from "@/src/Enum/DirectionEnum";
import {LevelForSolver} from "@/src/Classes/Solver/LevelForSolver";

export function isBoxDeadlockedByNeighbouringBoxes(level: LevelForSolver, boxToCheck: number, curBoxesMask: boolean[]): boolean {
  const assumeDeadlockedBoxes = new Set<number>();
  const isBoxUnmovable = recuriveCallIsDeadlocked(level, boxToCheck, curBoxesMask, assumeDeadlockedBoxes);
  if (isBoxUnmovable) {
    // If the box is unmovable and any of the explored unmovable boxes is not on a goal, there is a deadlock
    for (const box of assumeDeadlockedBoxes) {
      if (!level.isGoalAtTileId(box)) {
        return true;
      }
    }
  }
  return false;
}

function recuriveCallIsDeadlocked(level: LevelForSolver, boxToCheck: number, curBoxMask: boolean[], assumeDeadlockedSet: Set<number>): boolean {
  const shiftedUp = level.shiftTileIdInDirection(boxToCheck, DirectionEnum.UP);
  const shiftedLeft = level.shiftTileIdInDirection(boxToCheck, DirectionEnum.LEFT);
  const shiftedDown = level.shiftTileIdInDirection(boxToCheck, DirectionEnum.DOWN);
  const shiftedRight = level.shiftTileIdInDirection(boxToCheck, DirectionEnum.RIGHT);
  const shiftedByDirection = [shiftedUp, shiftedLeft, shiftedDown, shiftedRight];

  const isHardBlockedVertically =
      (level.isWallAt[shiftedUp] || assumeDeadlockedSet.has(shiftedUp) ||
          level.isWallAt[shiftedDown] || assumeDeadlockedSet.has(shiftedDown))
      || (!level.isViable(shiftedUp) && !level.isViable(shiftedDown));

  const isHardBlockedHorizontally =
      (level.isWallAt[shiftedLeft] || assumeDeadlockedSet.has(shiftedLeft) ||
          level.isWallAt[shiftedRight] || assumeDeadlockedSet.has(shiftedRight))
      || (!level.isViable(shiftedLeft) && !level.isViable(shiftedRight));

  const isBoxVertically = curBoxMask[shiftedUp] || curBoxMask[shiftedDown];
  const isBoxHorizontally = curBoxMask[shiftedLeft] || curBoxMask[shiftedRight];

  function isBoxInDirection(direction: DirectionEnum): boolean {
    return curBoxMask[shiftedByDirection[direction]];
  }

  function isAssumedDeadlockedInDirection(direction: DirectionEnum): boolean {
    return assumeDeadlockedSet.has(shiftedByDirection[direction]);
  }

  // Recursive calls to neighboring boxes purely for filling the assumeDeadlockedSet once the current box has been confirmed to be blocked
  function fillAssumeDeadlockedSetBeforeReturningTrue() {
    for (const direction of getAllDirectionEnumValues()) {
      if (isBoxInDirection(direction) && !isAssumedDeadlockedInDirection(direction)) {
        doRecursiveCallInDirection(direction);
      }
    }
  }

  function doRecursiveCallInDirection(direction: DirectionEnum) {
    return recuriveCallIsDeadlocked(level, level.shiftTileIdInDirection(boxToCheck, direction), curBoxMask, assumeDeadlockedSet);
  }

  // Check if the box is not blocked at all on at least 1 axis
  if ((!isHardBlockedVertically && !isBoxVertically) || (!isHardBlockedHorizontally && !isBoxHorizontally)) {
    return false;
  }

  // Adding current box to the set before further recursive calls
  assumeDeadlockedSet.add(boxToCheck);

  // Check if the box is hard blocked from both axes
  if (isHardBlockedVertically && isHardBlockedHorizontally) {
    fillAssumeDeadlockedSetBeforeReturningTrue();
    return true;
  }

  // Recursive calls to check if the neighboring boxes are blocking the current box or not
  for (const axis of [DirectionEnum.UP, DirectionEnum.LEFT]) {
    const hardBlockedOnAxis = axis === DirectionEnum.UP ? isHardBlockedVertically : isHardBlockedHorizontally;
    const boxOnAxis = axis === DirectionEnum.UP ? isBoxVertically : isBoxHorizontally;
    if (!hardBlockedOnAxis && boxOnAxis) {
      let recursivelyBlocked = false;
      for (const direction of [axis, getOppositeDirection(axis)]) {
        if (isBoxInDirection(direction)) {
          if (doRecursiveCallInDirection(direction)) {
            recursivelyBlocked = true;
            break;
          }
        }
      }
      if (!recursivelyBlocked) {
        // Not blocked in this axis, therefore the current box is not blocked
        assumeDeadlockedSet.delete(boxToCheck);
        return false;
      }
    }
  }

  // Is blocked on both sides by boxes
  fillAssumeDeadlockedSetBeforeReturningTrue();
  return true;
}