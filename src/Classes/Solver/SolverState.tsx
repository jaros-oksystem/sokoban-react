export default class SolverState {
  parentState: SolverState | null;
  player: number;
  boxHash: string;
  turn: number;
  heuristic: number;

  constructor(parentState: SolverState | null, player: number, boxHash: string, turn: number, heuristic: number) {
    this.parentState = parentState;
    this.player = player;
    this.boxHash = boxHash;
    this.turn = turn;
    this.heuristic = heuristic;
  }

}