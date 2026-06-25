import SolverState from "@/src/Classes/Solver/SolverState";

export default class SolverWorkerMessage {
  rootState: SolverState | null = null;
  curSolverState: SolverState | null = null;
  solutionState: SolverState | null = null;
  curTurn: number = 0;
  statesExplored: number = 0;
  timestampStart: number = Date.now();
  timestampTerminated: number | null = null;
  exceptionMessage: string | null = null;
}