import { StateType, User } from '../interfaces';
import { CanvasController } from '../draw';
import { Chat, ChatContainer } from './chat-container';
import { UserContainer } from './user-container';
export class GameModel {
  public mySelf: User;

  public turn: string;
  public round: number;

  public isGuess: boolean = false;
  public isPrepare: boolean = false;
  public isResult: boolean = false;
  public isReady: boolean = false;

  public words: string[] = []; // 제시된 세가지 단어
  public word: string = ''; // 현재 단어
  public wordSecret: string = ''; //가려진 현재 단어

  public isInGame: boolean = false;
  public myTurn: boolean = false;

  public timerRun: boolean = false;
  public remainTime: number = 0;

  constructor(mySelf: User) {
    this.mySelf = mySelf;
  }

  public startGame(participants: string[]) {
    if (!this.isInGame) {
      this.isInGame = true;
      // 게임 시작
      this.setParticipants(participants);
      ChatContainer.getInstance().push(Chat.SysMsg('<<게임 시작>>'));
    }
  }

  public clearGame() {
    if (this.isInGame) {
      this.isInGame = false;
      // 게임 종료
      this.timerRun = false;
      this.myTurn = false;
      this.isInGame = false;
      this.word = '';
      this.wordSecret = '';
      ChatContainer.getInstance().push(Chat.SysMsg('<<게임이 끝났습니다.>>'));
      // UserContainer.getInstance().PUsers.forEach((u) => {
      //   let msg: string = `${u.getName()} : ${u.score.score} 점`;
      //   ChatContainer.getInstance().push(Chat.SysMsg(msg));
      // });
      UserContainer.getInstance().resetParticipants();
    }
  }
  public setTimer(time: number) {
    this.remainTime = time;
  }
  public setWords(words: string[]) {
    this.words = words;
  }
  public setTurn(turn: string) {
    if (this.turn != turn) {
      // turn changed
      this.turn = turn;

      //clear turn
      this.words = [];
      this.word = '';
      this.wordSecret = '';
      UserContainer.getInstance().resetCorrect();

      UserContainer.getInstance().changeTurn(this.turn);
      this.myTurn = this.turn == this.mySelf.getName();
      this.word = '';
      CanvasController.getInstance().clear();
      ChatContainer.getInstance().push(
        Chat.SysMsg(this.turn + '의 차례입니다.')
      );
    }
  }
  public setRound(round: number) {
    if (this.round != round) {
      // round changed
      this.round = round;
      ChatContainer.getInstance().push(Chat.SysMsg('Round #' + this.round));
    }
  }
  private setParticipants(users: string[]) {
    // 게임 시작될때만, this.startGame()에서만 호출
    UserContainer.getInstance().setParticipants(users);
  }
  public setWord(word: string) {
    this.word = word;

    this.wordSecret = ' ';
    for (let i = 0; i < this.word.length; i++) {
      this.wordSecret = this.wordSecret + '_ ';
    }
    console.log(this.wordSecret);
  }

  private clearState() {
    this.isReady = false;
    this.isPrepare = false;
    this.isGuess = false;
    this.isResult = false;
  }

  public setGuess() {
    this.clearState();
    this.isGuess = true;
  }
  public setReady() {
    this.clearState();
    this.isReady = true;
  }
  public setPrepare() {
    this.clearState();
    this.isReady = true;
  }
  public setResult() {
    this.clearState();
    this.isReady = true;
  }
}
