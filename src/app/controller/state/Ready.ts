import { GameController } from '../game-controller';
import { Hit } from './Guess';
import { State } from './State';

enum KEY {
  GAME_RESULT = 'game_result',
}

export class Ready extends State {
  // 1. 게임이 끝났을 때

  // 최종 결과
  onMessage(msg) {
    switch (msg.key) {
      case KEY.GAME_RESULT:
        //TODO ~ 게임이 끝났습니다 ~
        let gameResult: Hit[] = msg.value;
        this.controller.gameModel.clearGame();
        // 최종 성적 처리~~~~
        break;

      default:
        break;
    }
  }
}
