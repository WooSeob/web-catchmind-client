import { StateType, User } from '../interfaces';
import { GameModel } from '../model/game-model';
import { State } from './state/State';
import { Ready } from './state/Ready';
import { Prepare } from './state/Prepare';
import { Guess } from './state/Guess';
import { Result } from './state/Result';

const log = (msg) => {
  console.log('game-controller', msg);
};
export class GameController {
  // Singleton Instance
  private static instance: GameController;

  // Model
  public gameModel: GameModel;

  // State
  private ready: Ready;
  private prepare: Prepare;
  private guess: Guess;
  private result: Result;
  private state: State;

  private constructor(mySelf: User) {
    this.gameModel = new GameModel(mySelf);
    this.ready = new Ready(this);
    this.prepare = new Prepare(this);
    this.guess = new Guess(this);
    this.result = new Result(this);
    //최초 State는 Ready
    this.state = this.ready;
  }
  public init(){
    this.state = this.ready;
  }
  public getModel(): GameModel {
    return this.gameModel;
  }
  public static createInstance(mySelf: User): GameController {
    if (!this.instance) {
      this.instance = new GameController(mySelf);
    }
    return this.instance;
  }
  public static getInstance(): GameController {
    if (GameController.instance) {
      return GameController.instance;
    } else {
      console.log('game instance not found');
      return null;
    }
  }

  public transition(dest: StateType) {
    log('Transition : ' + dest);
    if (dest == StateType.ready) {
      this.gameModel.setReady();
      this.state = this.ready;
    } else if (dest == StateType.prepare) {
      this.gameModel.setPrepare();
      this.state = this.prepare;
    } else if (dest == StateType.guess) {
      this.gameModel.setGuess();
      this.state = this.guess;
    } else if (dest == StateType.result) {
      this.gameModel.setResult();
      this.state = this.result;
    } else {
      log('잘못된 StateType 입니다.');
    }
  }

  public msgHandler(msg) {
    this.state.onMessage(msg);
  }
}
