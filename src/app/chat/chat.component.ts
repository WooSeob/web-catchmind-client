import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'dgram';
import { ChatContainer } from 'src/app/model/chat-container';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @Input() chatContainer: ChatContainer;
  @Input() socket: Socket;

  public MsgToSend: string; // 보낼 채팅 메시지
  constructor() {}

  sendChat(): void {
    this.socket.emit('chat-msg', this.MsgToSend);
  }

  ngOnInit(): void {}
}
