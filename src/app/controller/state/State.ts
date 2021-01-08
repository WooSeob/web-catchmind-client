import { GameController } from '../game-controller';
export abstract class State {
  protected controller: GameController;
  constructor(c: GameController) {
    this.controller = c;
  }
  abstract onMessage(msg): void;
}
