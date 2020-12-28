enum Sys_Type{
    HOST_CHANGED,
    USER_WELCOME,
    USER_JOIN,
    USER_LEAVE,
}
enum Msg_Type{
    WORDS,
    SYSTEM,
    TIMER
}
export interface Msg_Message{
    type: Msg_Type;
    data: any;
}
export interface Sys_Message{
    type: Sys_Type;
    data: any;
}
// export interface Cmd_Message{
//     type: Cmd_Type;
//     data: any; 
// }

export enum PhaseType {
    ready = 'ready',
    prepare = 'prepare',
    guess = 'guess',
    result = 'result',
  }

export enum Cmd_Type{
    TRANSITION,
    TURN,
    TURN_LEFT,
    ROUND,
    GAME_OVER,
    GAME_START
}

export class Cmd_Message{
    inflate(CmdLike: any): Cmd_Message {
        this.type = CmdLike.type;
        this.data = CmdLike.data;
        return this;
      }
    
    type: Cmd_Type;
    data: any;
}
export class Cmd_Transition extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.TRANSITION;
    state: PhaseType;
    data: Map<string, number> | string;
    constructor(state: PhaseType, data: Map<string, number> | string){
        super();
        this.state = state;
        this.data = data;
    }
    static getInstance() : Cmd_Transition{
        return new Cmd_Transition(null, null);
    }
    inflate(CmdLike: any): Cmd_Transition{
        super.inflate(CmdLike);
        this.data = CmdLike.data;
        this.state = CmdLike.state
        return this;
    } 
}

export class Cmd_Turn extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.TURN;
    data: string; //이번 턴 유저이름
    constructor(data: string){
        super();
        this.data = data;
    }
    static getInstance() : Cmd_Turn{
        return new Cmd_Turn(null);
    }
}

export class Cmd_TurnLeft extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.TURN_LEFT;
    data: string; //나간 턴 유저 이름
    constructor(data: string){
        super();
        this.data = data;
    }
    static getInstance() : Cmd_TurnLeft{
        return new Cmd_TurnLeft(null);
    }
}

export class Cmd_Round extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.ROUND;
    data: number;
    constructor(data: number){
        super();
        this.data = data;
    }
    static getInstance() : Cmd_Round{
        return new Cmd_Round(null);
    }
}

export class Cmd_GameOver extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.GAME_OVER;
    data: number; //???
    constructor(data: number){
        super();
        this.data = data;
    }
    static getInstance() : Cmd_GameOver{
        return new Cmd_GameOver(null);
    }
}

export class Cmd_GameStart extends Cmd_Message{
    type: Cmd_Type = Cmd_Type.GAME_OVER;
    data: string[]; // 참여자 이름 배열
    constructor(data: string[]){
        super();
        this.data = data;
    }
    static getInstance() : Cmd_GameStart{
        return new Cmd_GameStart(null);
    }
}