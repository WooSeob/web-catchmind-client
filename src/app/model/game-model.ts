import { StateType, User } from '../interfaces';
import { CanvasController } from '../draw';
import { Chat, ChatContainer } from './chat-container';
import { UserContainer } from './user-container';
import { Hit } from '../controller/state/Guess';
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

  public turnResult:Hit[];

  constructor(mySelf: User) {
    this.init(mySelf)
  }

  public init(mySelf: User){
    this.mySelf = mySelf;

    this.isGuess = false;
    this.isPrepare = false;
    this.isResult = false;
    this.isReady = false;
    
    this.words = []
    this.word = ''
    this.wordSecret = ''
    
    this.isInGame = false
    this.myTurn = false
    
    this.timerRun = false
    this.remainTime = 0
  }
  public startGame(participants: string[]) {
    // 게임 시작
    this.setParticipants(participants);
    ChatContainer.getInstance().push(Chat.SysMsg('<<게임 시작>>'));
  }

  public clearGame() {
    // 게임 종료
    this.timerRun = false;
    this.myTurn = false;
    this.word = '';
    this.wordSecret = '';
    ChatContainer.getInstance().push(Chat.SysMsg('<<게임이 끝났습니다.>>'));
    UserContainer.getInstance().PUsersList.forEach((u) => {
      let msg: string = `${u.getName()} : ${u.score.score} 점`;
      ChatContainer.getInstance().push(Chat.SysMsg(msg));
    });
    UserContainer.getInstance().resetParticipants();
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

  public setReady() {
    this.clearState();
    this.isReady = true;
    this.timerRun = false;
    if (this.isInGame) {
      this.isInGame = false;
    }
  }
  public setPrepare() {
    this.clearState();
    this.isPrepare = true;
    //TODO TimerRun이 여기 있는게 과연 맞는가?
    this.timerRun = true;
    if (!this.isInGame) {
      this.isInGame = true;
    }
  }
  public setGuess() {
    this.clearState();
    this.isGuess = true;
    if (!this.isInGame) {
      this.isInGame = true;
    }
  }
  public setResult() {
    this.clearState();
    this.isResult = true;
    if (!this.isInGame) {
      this.isInGame = true;
    }
  }
}
