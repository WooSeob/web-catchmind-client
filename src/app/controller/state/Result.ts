import { GameController } from '../game-controller';
import { State } from './State';
import { ChatContainer, Chat } from '../../model/chat-container';
import { Hit } from './Guess';
import { COMMON_KEY } from 'src/app/interfaces';
import { UserContainer } from 'src/app/model/user-container';

enum KEY {
  TURN_RESULT = 'turn_result',
  TURN_USER_LEFT = 'turn_user_left',
  ONLY_ONE_PLAYER = 'only_one_player',
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
        //서버 기준으로 점수 싱크 맞추기
        UserContainer.getInstance().syncScores(turnResult);
        this.controller.gameModel.turnResult = turnResult
        break;

      case KEY.TURN_USER_LEFT:
        let turnUserLeft: TurnUserLeft = {
          user: msg.value,
        };
        ChatContainer.getInstance().push(
          Chat.SysMsg(
            '턴 유저였던 ' +
              turnUserLeft.user +
              '가 퇴장해서 다음턴으로 넘어갑니다.'
          )
        );
        break;
      case KEY.ONLY_ONE_PLAYER:
        ChatContainer.getInstance().push(
          Chat.SysMsg('플레이어가 한명밖에 남지않았으므로 게임을 종료합니다.')
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
