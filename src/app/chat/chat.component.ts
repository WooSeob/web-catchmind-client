import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'socket.io-client';
import { ChatContainer } from 'src/app/model/chat-container';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @Input() chatContainer: ChatContainer;
  @Input() socket: Socket;

  public inputElement: HTMLInputElement;
  public MsgToSend: string; // 보낼 채팅 메시지
  constructor() {}

  sendChat(): void {
    if(this.MsgToSend !== ""){
      this.socket.emit('chat-msg', this.MsgToSend);
      this.inputElement.value = ""
      this.MsgToSend = ""
    }else{
      alert("메시지를 입력해 주세요.")
    }
  }

  ngOnInit(): void {
    this.inputElement = <HTMLInputElement> document.getElementById('chat-input') 
  }
}
