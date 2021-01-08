import { UserContainer } from 'src/app/model/user-container';
import { ChatContainer, Chat } from 'src/app/model/chat-container';
import { GameController } from '../game-controller';
import { State } from './State';
import { COMMON_KEY } from 'src/app/interfaces';

enum KEY {
  COMMITTED_WORD = 'committed_word',
  USER_HIT = 'user_hit',
}

// 확정된 단어
export interface CommittedWord {
  word: string;
}

// ~가 맞췄습니다 (id, 점수)
export interface Hit {
  user: string;
  score: number;
}

export class Guess extends State {
  // 1. Prepare에서 TimeOut될 때
  // 2. Turn User가 단어를 선택했을 때.

  onMessage(msg) {
    switch (msg.key) {
      case KEY.COMMITTED_WORD:
        let committedWord: CommittedWord = msg.value;
        this.controller.gameModel.setWord(committedWord.word);
        break;

      case KEY.USER_HIT:
        let hit: Hit = msg.value;
        UserContainer.getInstance().setCorrect(hit.user, hit.score);
        ChatContainer.getInstance().push(
          Chat.SysMsg(msg.data.user + '가 맞췄습니다.')
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
