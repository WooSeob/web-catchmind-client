import { GameController } from '../game-controller';
import { State } from './State';
import { ChatContainer, Chat } from '../../model/chat-container';
import { Hit } from './Guess';
import { COMMON_KEY } from 'src/app/interfaces';

enum KEY {
  TURN_RESULT = 'turn_result',
  TURN_USER_LEFT = 'turn_user_left',
}

interface TurnUserLeft {
  user: string;
}

export class Result extends State {
  // 1. Guess에서 TimeOut됬을 때.
  // 2. Prepare에서 해당 TurnUser가 탈주 했을 떄.
  // 3. Guess에서 해당 TurnUser가 탈주 했을 때.

  // 4. Prepare | Guess에서 2명 남은 상황에서 한명이 나갈 때.

  // 해당 턴의 결과 (이 상태에서 싱크를 맞춘다.)
  onMessage(msg) {
    switch (msg.key) {
      case KEY.TURN_RESULT:
        let turnResult: Hit[] = msg.value;
        //TODO 하나의 턴 끝나고
        // let scoreData = msg.data;
        // for (let user of scoreData) {
        //   UserContainer.getInstance().setCorrect(user.name, user.score);
        // }
        break;

      case KEY.TURN_USER_LEFT:
        let turnUserLeft: TurnUserLeft = msg.value;
        ChatContainer.getInstance().push(
          Chat.SysMsg(
            '턴 유저였던 ' +
              turnUserLeft.user +
              '가 퇴장해서 다음턴으로 넘어갑니다.'
          )
        );
        break;
      case COMMON_KEY.TIMER:
        this.controller.gameModel.setTimer(msg.value);
        break;

      default:
        break;
    }
  }
}
