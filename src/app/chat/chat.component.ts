import { Component, OnInit, Input } from '@angular/core';
import { ChatContainer } from 'src/app/model/chat-container';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @Input() chatContainer: ChatContainer;

  constructor() {}

  ngOnInit(): void {}
}
