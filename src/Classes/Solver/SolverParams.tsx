export enum StateCreationEnum {
  ON_PLAYER_MOVE,
  ON_BOX_MOVE
}

export enum HeuristicMatchingEnum {
  NONE,
  NEAREST_GOAL
}

export enum DeadlockDetectionLevelEnum {
  NONE,
  AVOID_UNVIABLE_BOX_TILES,
  CHECK_NEIGHBOURING_BOXES,
}

export default class SolverParams {
  stateCreation: StateCreationEnum;
  heuristicMatching: HeuristicMatchingEnum;
  deadlockDetectionLevel: DeadlockDetectionLevelEnum;

  constructor(stateCreation: StateCreationEnum, heuristicMatching: HeuristicMatchingEnum, deadlockDetections: DeadlockDetectionLevelEnum) {
    this.stateCreation = stateCreation;
    this.heuristicMatching = heuristicMatching;
    this.deadlockDetectionLevel = deadlockDetections;
  }

  isDeadlockDetectionNone() {
    return this.deadlockDetectionLevel === DeadlockDetectionLevelEnum.NONE;
  }

  isDeadlockDetectionAvoidUnviable() {
    return this.deadlockDetectionLevel >= DeadlockDetectionLevelEnum.AVOID_UNVIABLE_BOX_TILES;
  }

  isDeadlockDetectionCheckNeighbour() {
    return this.deadlockDetectionLevel >= DeadlockDetectionLevelEnum.CHECK_NEIGHBOURING_BOXES;
  }

}
