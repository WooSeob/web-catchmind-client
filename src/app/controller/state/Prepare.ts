import { COMMON_KEY } from 'src/app/interfaces';
import { Chat, ChatContainer } from 'src/app/model/chat-container';
import { GameController } from '../game-controller';
import { State } from './State';

enum KEY {
  START = 'start',
  NEW_TURN = 'new_turn',
}

// 참여자 정보(처음 시작시에만)
interface StartData {
  participants: string[];
}

// 단어 3개, 턴 유저, 라운드
interface PrepareData {
  words: string[];
  turn: string;
  round: number;
}

export class Prepare extends State {
  // 1. Host가 게임을 시작시켰을 때.
  // 2. 새로운 Turn, Round가 시작될 때

  onMessage(msg) {
    switch (msg.key) {
      case KEY.START:
        //TODO 한 게임당 최초 한번만 호출됨을 보장할 것
        let startData: StartData = msg.value;
        this.controller.gameModel.startGame(startData.participants);

        break;

      case KEY.NEW_TURN:
        let newTurnData: PrepareData = msg.value;
        this.controller.gameModel.setWords(newTurnData.words);
        this.controller.gameModel.setTurn(newTurnData.turn);
        this.controller.gameModel.setRound(newTurnData.round);
        break;

      case COMMON_KEY.TIMER:
        this.controller.gameModel.setTimer(msg.value);
        break;

      default:
        break;
    }
  }
}
