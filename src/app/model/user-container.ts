import { useAnimation } from '@angular/animations';
import { Hit } from '../controller/state/Guess';
import { Observer, Score, User } from '../interfaces';

export class UserContainer {
  public NpUsersList: Array<User>;
  public PUsersList: Array<User>;

  private NpUsers: Map<string, User>;
  private PUsers: Map<string, User>;

  private constructor() {
    this.init();
  }

  public init() {
    this.NpUsersList = new Array<User>();
    this.PUsersList = new Array<User>();
    this.NpUsers = new Map();
    this.PUsers = new Map();
  }
  private static instance: UserContainer;

  static getInstance(): UserContainer {
    if (!UserContainer.instance) {
      this.instance = new UserContainer();
    }
    return this.instance;
  }

  changeTurn(username: string) {
    //TODO 이게 정말 필요한지?
    this.PUsers.forEach((user) => {
      user.score.turn = user.getName() == username;
      //턴 유저만 true 할당
    });
  }

  // 새롭게 방에 참가할때 받는 유저정보
  restoreUsers(users: User[]): void {
    for (let user of users) {
      if (user.isParticipant) {
        this.PUsers.set(user.name, new User(user.name).inflate(user));
      } else {
        this.NpUsers.set(user.name, new User(user.name).inflate(user));
      }
    }
    this.updateList();

    console.log('restore ', 'setUsers : ', this.NpUsers);
  }

  //새로운 유저가 들어올 때
  add(user: User): void {
    this.NpUsers.set(user.getName(), new User(user.name));
    this.updateList();
  }

  sortParticipants(): void {}
  setCorrect(username: string, score: number): void {
    // 맞췄을때
    this.PUsers.forEach((user) => {
      if (user.getName() === username && !user.score.correct) {
        user.score.matched(score);
        console.log('score : ', user.score.score);
      }
    });
  }
  resetCorrect(): void {
    // 턴이 변경될때
    for (let user of this.getParticipants()) {
      user.score.turnClear();
    }
  }

  updateList() {
    this.PUsersList = new Array<User>();
    this.NpUsersList = new Array<User>();

    this.PUsers.forEach((user) => {
      this.PUsersList.push(user);
    });
    this.NpUsers.forEach((user) => {
      this.NpUsersList.push(user);
    });
  }

  resetParticipants(): void {
    //게임 끝나고 리셋
    for (let userName of this.PUsers.keys()) {
      let user = this.PUsers.get(userName);
      user.isParticipant = false;
      user.score = null;

      this.NpUsers.set(userName, user);
      this.PUsers.delete(userName);
    }
    this.updateList();
  }
  setParticipants(participants: string[]): void {
    // 1. 게임 시작될 때 GameModel.startGame()에서 호출
    // 2. 게임 진행중인 방에 새로 유저가 들어왔을때 romm component에서 호출

    for (let userName of participants) {
      let target: User = this.NpUsers.get(userName);
      target.isParticipant = true;
      target.score = new Score();

      this.PUsers.set(userName, target);
      this.NpUsers.delete(userName);
    }

    this.updateList();
  }

  leaveUser(username: string): void {
    //유저 나갈때

    //NpUsers에서 검색
    for (let userName of this.NpUsers.keys()) {
      let user = this.NpUsers.get(userName);
      if (user && user.getName() === username) {
        this.NpUsers.delete(username);
      }
    }

    //PUsers에서 검색
    for (let userName of this.PUsers.keys()) {
      let user = this.PUsers.get(userName);
      if (user && user.getName() === username) {
        this.PUsers.delete(username);
      }
    }

    this.updateList();
  }

  syncScores(hits: Hit[]){
    hits.forEach(hit => {
      let target = this.PUsers.get(hit.user);
      if(target.score.score != hit.score){
        console.log("점수 싱크가 맞지 않습니다.")
        target.score.score = hit.score
      }
    })
  }

  getParticipants(): User[] {
    return this.PUsersList;
  }

  getNotParticipants(): User[] {
    return this.NpUsersList;
  }
}
