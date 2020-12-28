import { Cmd_Message,
  Cmd_Type,
  Cmd_Turn,
  Cmd_TurnLeft,
  Cmd_Round,
  Cmd_GameOver,
  Cmd_GameStart,
  Cmd_Transition, 
  PhaseType} from "./message"
export class Draw {
  X: Number;
  Y: Number;
}

interface inflatable {
  inflate(like: any): void;
}

export class User implements inflatable {
  constructor(name: string) {
    this.name = name;
  }
  public getName(): string {
    return this.name;
  }
  inflate(userLike: any): User {
    this.name = userLike.name;
    this.isParticipant = userLike.isParticipant;
    if (userLike.score) {
      this.score = new Score().inflate(userLike.score);
    }
    return this;
  }
  name: string;
  isParticipant: boolean = false;
  score: Score = null;
}

export class Score implements inflatable {
  constructor() {
    this.score = 0;
    this.correct = false;
    this.turn = false;
  }
  inflate(scoreLike: any): Score {
    this.score = scoreLike.score;
    this.correct = scoreLike.correct;
    this.turn = scoreLike.turn;
    return this;
  }
  matched(score: number) {
    this.correct = true;
    this.score += score;
  }
  turnClear() {
    this.correct = false;
  }
  score: number;
  correct: boolean;
  turn: boolean;
}

export class CanvasController {
  private static instance: CanvasController;
  private ctx: any;
  private canvas: any;
  private prevX: Number = -1;
  private prevY: Number = -1;
  private constructor(canvas: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.init();

  }
  static createInstance(ctx: any) {
    this.instance = new CanvasController(ctx);
  }
  static getInstance() {
    if (CanvasController.instance) {
      return CanvasController.instance;
    } else {
      console.log('CanvasController not found');
      return null;
    }
  }

  draw(x: Number, y: Number): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = "3";
    this.ctx.strokeStyle = 'green';
    if(this.prevX > -1 && this.prevY > -1){
      this.ctx.moveTo(this.prevX, this.prevY);
    }else{
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(x, y)
    this.ctx.stroke();

    this.prevX = x;
    this.prevY = y;
    // this.ctx.beginPath();
    // this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    // this.ctx.closePath();
    // this.ctx.fill();
  }
  penUp(){
    this.prevY = -1;
    this.prevX = -1;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prevY = -1;
    this.prevX = -1;
  }
  private init() {
    if (window.devicePixelRatio) {
      const {
        width: hidefCanvasWidth,
        height: hidefCanvasHeight,
      } = this.canvas.getBoundingClientRect();
      const hidefCanvasCssWidth = hidefCanvasWidth;
      const hidefCanvasCssHeight = hidefCanvasHeight;
      this.canvas.setAttribute(
        'width',
        hidefCanvasWidth * window.devicePixelRatio
      );
      this.canvas.setAttribute(
        'height',
        hidefCanvasHeight * window.devicePixelRatio
      );
      this.canvas.style.width = `${hidefCanvasCssWidth}px`;
      this.canvas.style.height = `${hidefCanvasCssHeight}px`;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    window.onresize = function(event) {
      this.canvas.style.width = '100%';
      console.log('resize', event)
      this.init()
    }.bind(this);
  }
}
export class ChatContainer {
  private static instance: ChatContainer;
  private constructor() {}
  static getInstance() {
    if (ChatContainer.instance) {
      return ChatContainer.instance;
    } else {
      this.instance = new ChatContainer();
      return this.instance;
    }
  }
  chats: Chat[] = [];
  push(msg: Chat) {
    this.chats.push(msg);
    //스크롤 최하단 고정
    let ele = document.querySelector('.chattingView');
    ele.scrollTop = ele.scrollHeight;
  }
}
export class Chat {
  private constructor(isSys: boolean, from: User, data: string) {
    this.isSystem = isSys;
    this.from = from;
    this.data = data;
  }
  static SysMsg(msg: string): Chat {
    return new Chat(true, null, msg);
  }
  static UserMsg(user: User, msg: string): Chat {
    return new Chat(false, user, msg);
  }

  isSystem: boolean;
  from: User;
  data: string;
}

export interface JoinData {
  roomID: string;
  user: User;
}

export enum Phase {
  ready = 'ready',
  prepare = 'prepare',
  guess = 'guess',
  result = 'result',
}
export class UserContainer {
  users: User[] = [];

  NpUsers: User[] = [];
  PUsers: User[] = [];

  private constructor() {}

  private static instance: UserContainer;
  static getInstance(): UserContainer {
    if (!UserContainer.instance) {
      this.instance = new UserContainer();
    }
    return this.instance;
  }
  changeTurn(username: string) {
    for (let user of this.PUsers) {
      user.score.turn = user.getName() == username;
      //턴 유저만 true 할당
    }
  }
  setUsers(users: User[]): void {
    for (let user of users) {
      this.users.push(new User(user.name).inflate(user));
    }
    console.log(this.users);
  }
  add(user: User): void {
    this.users.push(user);
    this.NpUsers.push(user);
  }
  sortParticipants(): void {}
  setCorrect(username: string, score: number): void {
    // 맞췄을때
    for (let user of this.getParticipants()) {
      if (user.getName() == username) {
        user.score.matched(score);
      }
      console.log("score : ", user.score.score )
    }
    
  }
  resetCorrect(): void {
    // 턴이 변경될때
    for (let user of this.getParticipants()) {
      user.score.turnClear();
    }
  }

  resetParticipants(): void {
    //게임 끝나고 리셋
    for (let user of this.users) {
      user.isParticipant = false;
      user.score = null;
    }
    this.NpUsers = this.users;
    this.PUsers = [];
  }
  setParticipants(participants: string[]): void {
    //게임 시작하거나 새로들어왔을때 세팅
    this.PUsers = [];
    this.NpUsers = [];
    for (let user of this.users) {
      let pFlag: boolean = false;
      for (let pUser of participants) {
        if (user.getName() == pUser) {
          pFlag = true;
          user.isParticipant = true;
          user.score = new Score();
        }
      }
      if (pFlag) {
        this.PUsers.push(user);
      } else {
        this.NpUsers.push(user);
      }
    }
    console.log('setParticipants : ', this.NpUsers, this.PUsers);
    console.log(participants);
  }
  leaveUser(username: string): void {
    //유저 나갈때
    let idx: number = 0;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].getName() == username) {
        idx = i;
        break;
      }
    }
    this.users.splice(idx, 1);

    this.PUsers = [];
    this.NpUsers = [];
    for (let user of this.users) {
      if (user.isParticipant) {
        this.PUsers.push(user);
      } else {
        this.NpUsers.push(user);
      }
    }
  }
  getParticipants(): User[] {
    let participants: User[] = [];
    for (let user of this.users) {
      if (user.isParticipant) {
        participants.push(user);
      }
    }
    return participants;
  }

  getNotParticipants(): User[] {
    let participants: User[] = [];
    for (let user of this.users) {
      if (!user.isParticipant) {
        participants.push(user);
      }
    }
    return participants;
  }
}

export class game_cmd_Handler {
  private static instance: game_cmd_Handler;

  timerRun: boolean = false;
  remainTime: number = 0;

  mySelf: User;

  isGuess: boolean = false;
  isPrepare: boolean = false;
  isResult: boolean = false;
  isReady: boolean = false;

  phase: PhaseType;
  turn: string;
  round: number;

  words: string[] = []; // 제시된 세가지 단어
  word: string = ''; // 현재 단어
  wordSecret: string = ''; //가려진 현재 단어

  isInGame: boolean = false; //현재 게임중인지
  myTurn: boolean = false; // 내 차례인지

  participants: User[] = []; //현재 참여자

  private constructor(mySelf: User) {
    console.log(mySelf);
    this.mySelf = mySelf;
  }

  public setParticipants(participants) {
    //participants : string[]
    for (let name of participants) {
      //받은 리스트에서
      for (let i = 0; i < this.participants.length; i++) {}
    }
  }
  static createInstance(mySelf: User) {
    this.instance = new game_cmd_Handler(mySelf);
  }
  static getInstance() {
    if (game_cmd_Handler.instance) {
      return game_cmd_Handler.instance;
    } else {
      console.log('game instance not found');
      return null;
    }
  }
  private changePhase(cmd: Cmd_Transition) {
    // console.log(cmd)
    this.timerRun = true;
    this.phase = cmd.state;
    this.isGuess = false;
    this.isReady = false;
    this.isPrepare = false;
    this.isResult = false;

    switch (cmd.state) {
      case PhaseType.ready:
        this.isReady = true;
        break;
      case PhaseType.prepare:
        this.isPrepare = true;
        break;
      case PhaseType.guess:
        this.isGuess = true;
        break;
      case PhaseType.result:
        this.isResult = true;
        break;
      default:
        break;
    }
    if (this.phase == PhaseType.guess) {
      this.word = cmd.data as string;

      this.wordSecret = ' ';
        console.log(this.word)
        for (let i = 0; i < this.word.length; i++) {
          this.wordSecret = this.wordSecret + '_ ';
        }
        console.log(this.wordSecret);
      if (this.myTurn) {
      } else {
        
      }
    } else if (this.phase == PhaseType.result) {
    }

    // ChatContainer.getInstance().push(Chat.SysMsg(cmd.state + '시작'));
  }

  private changeTurn(cmd : Cmd_Turn) {
    this.clearTurn();

    UserContainer.getInstance().changeTurn(cmd.data);
    this.myTurn = cmd.data == this.mySelf.getName();
    this.word = '';

    CanvasController.getInstance().clear();
    ChatContainer.getInstance().push(Chat.SysMsg(cmd.data + '의 차례입니다.'));
  }

  private changeRound(cmd: Cmd_Round) {
    ChatContainer.getInstance().push(Chat.SysMsg('Round #' + cmd.data));
  }

  public sortScore(score) {
    // 나중에 변경
    // participants : string[]
    //1. 빠진사람 제거
    //2. 점수별 정렬
    //TODO Participants를 Map으로 쓰는게 좋겠다.
  }

  private startGame(cmd_msg : Cmd_GameStart) {
    let participants = cmd_msg.data;

    this.isInGame = true;
    UserContainer.getInstance().setParticipants(participants);

    ChatContainer.getInstance().push(Chat.SysMsg('<<게임 시작>>'));
  }

  private clearGame() {
    this.timerRun = false;
    this.myTurn = false;
    this.isInGame = false;
    this.word = '';
    this.wordSecret = '';
    ChatContainer.getInstance().push(Chat.SysMsg('<<게임이 끝났습니다.>>'));
    UserContainer.getInstance().PUsers.forEach((u) => {
      let msg: string = `${u.getName()} : ${u.score.score} 점`;
      ChatContainer.getInstance().push(Chat.SysMsg(msg));
    });
    UserContainer.getInstance().resetParticipants();
  }

  private clearTurn() {
    this.words = [];
    this.word = '';
    this.wordSecret = '';
    UserContainer.getInstance().resetCorrect();
  }

  public cmd_Handler(cmd) {
    console.log("cmd received", cmd);
    
    
    if (cmd.type == Cmd_Type.TRANSITION) {
      // Phase가 바뀜
      // let cmd_msg:Cmd_Transition = Cmd_Transition.getInstance().inflate(cmd)
      this.changePhase(cmd);

    } else if (cmd.type == Cmd_Type.TURN) {
      // ~의 차례로 차례가 바뀜
      // let cmd_msg:Cmd_Turn = Cmd_Turn.getInstance().inflate(cmd)
      this.changeTurn(cmd);

    } else if (cmd.type == Cmd_Type.TURN_LEFT) {
      // 턴 유저가 나감
      ChatContainer.getInstance().push(
        Chat.SysMsg(
          '턴 유저였던 ' + cmd.data + '가 퇴장해서 다음턴으로 넘어갑니다.'
        )
      );
      // let cmd_msg:Cmd_Turn = Cmd_Turn.getInstance().inflate(cmd)
      this.changeTurn(cmd);

    } else if (cmd.type == Cmd_Type.ROUND) {
      // 라운드가 바뀜
      // let cmd_msg:Cmd_Round = Cmd_Round.getInstance().inflate(cmd)
      this.changeRound(cmd);

    } else if (cmd.type == Cmd_Type.GAME_OVER) {
      // 게임이 끝
      //TODO 최종 결과 받은거 처리하게 만들기
      // let cmd_msg:Cmd_GameOver = Cmd_GameOver.getInstance().inflate(cmd)
      this.clearGame();

    } else if (cmd.type == Cmd_Type.GAME_START) {
      // let cmd_msg:Cmd_GameStart = Cmd_GameStart.getInstance().inflate(cmd)
      this.startGame(cmd);
    }
  }

  public msg_Handler(msg) {
    
    if (msg.type == 'words') {
      console.log("msg received", msg)
      if (this.myTurn) {
        // 세 가지 단어중에서 선택
        msg.data.forEach(
          function (w) {
            console.log(this);
            this.words.push(w);
          }.bind(this)
        );
      }
    } else if (msg.type == 'system') {
      console.log("msg received", msg)
      if (this.phase == PhaseType.prepare) {
      } else if (this.phase == PhaseType.guess) {
        // ~가 맞췄습니다
        //
        UserContainer.getInstance().setCorrect(msg.data.user, msg.data.score);
        ChatContainer.getInstance().push(
          Chat.SysMsg(msg.data.user + '가 맞췄습니다.')
        );
      } else if (this.phase == PhaseType.result) {
        // 턴 스코어
        // msg.data = {name:string, score:number}
        console.log(msg.data);
        let scoreData = msg.data;

        for (let user of scoreData) {
          UserContainer.getInstance().setCorrect(user.name, user.score);
        }

        // this.sortScore(scoreData);
      }
    } else if (msg.type == 'timer') {
      this.remainTime = msg.data;
    }
  }
}
