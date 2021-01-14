import { User, Observer } from '../interfaces';

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
export class ChatContainer {
  private static instance: ChatContainer;
  public chats: Chat[] = [];
  
  private constructor() {
    
  }

  static getInstance() {
    if (ChatContainer.instance) {
      return ChatContainer.instance;
    } else {
      this.instance = new ChatContainer();
      return this.instance;
    }
  }

  push(msg: Chat) {
    this.chats.push(msg);
    //스크롤 최하단 고정
    setTimeout(function(){
      let chatViewEle = document.querySelector('.chattingView')
      chatViewEle.scrollTop = chatViewEle.scrollHeight;
    }, 10);
  }
}
