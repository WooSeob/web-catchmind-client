export enum StateType {
  ready = 'ready',
  prepare = 'prepare',
  guess = 'guess',
  result = 'result',
}

export interface Observer {
  update<T>(updatedData: T): void;
}

export interface Observable {
  subscribe(o: Observer): void;
  unsubscribe(o: Observer): void;
  notify(): void;
}

export enum COMMON_KEY {
  TIMER = 'timer',
}

export interface JoinData {
  roomID: string;
  user: User;
}

interface inflatable {
  inflate(like: any): void;
}

export class User implements inflatable {
  constructor(name: string) {
    this.name = name;
    this.isParticipant = false;
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
  isParticipant: boolean;
  score: Score = null;
}

export class Score implements inflatable {
  constructor() {
    this.turnScore = 0
    this.score = 0;
    this.correct = false;
    this.turn = false;
  }
  inflate(scoreLike: any): Score {
    this.score = scoreLike.score;
    this.correct = scoreLike.correct;
    this.turn = scoreLike.turn;
    //TODO turnScore는?
    return this;
  }
  matched(score: number) {
    this.correct = true;
    this.score += score;
    this.turnScore = score;
  }
  turnClear() {
    this.turnScore = 0;
    this.correct = false;
  }
  turnScore: number;
  score: number;
  correct: boolean;
  turn: boolean;
}
