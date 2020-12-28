import { Component, OnInit } from '@angular/core';
// import { DataService } from '../data.service';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {
  Draw,
  User,
  ChatContainer,
  Chat,
  JoinData,
  CanvasController,
  game_cmd_Handler,
  UserContainer,
} from '../draw';
import { PhaseType } from '../message';
import { io } from 'socket.io-client';

@Component({
  selector: '',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  private mousedown: boolean = false;

  myName: string;

  hostUser: string;
  isHost: boolean = false;

  users: UserContainer;
  chatList: ChatContainer;
  gameHandler: game_cmd_Handler;

  private socket: any;
  private mySelf: User;
  ROOM_ID: string = '7777';

  public setTimeout: number;
  public setRound: number;

  public guess: String; // 보낼 정답
  public MsgToSend: string; // 보낼 채팅 메시지

  constructor(private route: ActivatedRoute) {
    this.ROOM_ID = route.snapshot.params['roomID'];
    this.mySelf = new User('user' + Math.floor(Math.random() * 1000));
    this.myName = this.mySelf.getName();
  }
  sendChat(): void {
    this.socket.emit('chat-msg', this.MsgToSend);
  }

  checkGuess(): void {
    console.log(this.guess + ' guess 전송');
    this.socket.emit('game-msg', this.guess);
  }
  selectWord0(): void {
    if (this.gameHandler.myTurn) {
      this.socket.emit('game-msg', 0); //0, 1, 2 사이 인덱스
    }
  }
  selectWord1(): void {
    if (this.gameHandler.myTurn) {
      this.socket.emit('game-msg', 1); //0, 1, 2 사이 인덱스
    }
  }
  selectWord2(): void {
    if (this.gameHandler.myTurn) {
      this.socket.emit('game-msg', 2); //0, 1, 2 사이 인덱스
    }
  }
  gameStart(): void {
    if (
      this.setRound > 0 &&
      this.setRound < 5 &&
      this.setTimeout > 5 &&
      this.setTimeout < 180
    ) {
      let gameSetting = {
        type: 'start',
        data: {
          round: this.setRound,
          timeout: this.setTimeout,
        },
      };
      this.socket.emit('game-cmd', gameSetting);
    }else{
      alert("라운드는 1~4, 제한시간은 6~179초 이내로 입력해주세요")
    }
  }

  penUp() {
    if (
      this.mousedown &&
      this.gameHandler.myTurn &&
      this.gameHandler.phase == PhaseType.guess
    ) {
      this.socket.emit('draw cmd', { type: 'pen_up' });
    }
  }
  handleMouseEnter(e: any): void {
    if (
      this.mousedown &&
      this.gameHandler.myTurn &&
      this.gameHandler.phase == PhaseType.guess
    ) {
      //e : TouchEvent
      //e.touches : TouchList
      //e.touches[0] : Touch
      //e.touches[0].pageX
      let isMoblie = false;

      var drawData: Draw = { X: 0, Y: 0 };
      if (e instanceof MouseEvent) {
        drawData = { X: e.offsetX, Y: e.offsetY };
      } else if (e instanceof TouchEvent) {
        isMoblie = true;
      }
      if (isMoblie) {
        console.log(e);
        drawData = {
          X: e.touches[0].pageX - e.target.offsetLeft,
          Y: e.touches[0].pageY - e.target.offsetTop,
        };
      }
      // console.log(e)
      // console.log('X: ' + e.pageX + ', Y: ' + e.pageY); //-> "mouseenter"
      CanvasController.getInstance().draw(drawData.X, drawData.Y);

      let msg = {
        type: 'draw',
        data: drawData,
      };
      this.socket.emit('draw cmd', msg);
      // this.dataService.sendMessage(data);
    }
  }
  initInstances(reason) {
    if (reason) {
      console.log('disconnected');
      console.log(reason);
    }
    var canvas: any = document.getElementById('canvas');

    CanvasController.createInstance(canvas);
    game_cmd_Handler.createInstance(this.mySelf);
    this.chatList = ChatContainer.getInstance();
    this.gameHandler = game_cmd_Handler.getInstance();
    this.users = UserContainer.getInstance();
  }
  ngOnInit(): void {
    // this.socket = io('ws://localhost:9999');
    this.socket = io('ws://catchm1nd.herokuapp.com/');

    console.log(this.socket);
    this.initInstances(null);

    this.socket.on('connect', () => {
      let joinData: JoinData = {
        roomID: this.ROOM_ID,
        user: this.mySelf,
      };
      console.log(joinData);
      this.socket.emit('join', joinData);

      this.socket.on('draw cmd', (cmd) => {
        if (!this.gameHandler.myTurn) {
          console.log(cmd);
          if (cmd.type == 'draw') {
            CanvasController.getInstance().draw(cmd.data.X, cmd.data.Y);
          } else if (cmd.type == 'pen_up') {
            CanvasController.getInstance().penUp();
          }
        }
      });

      this.socket.on('disconnect', this.initInstances);

      this.socket.on('sys-msg', (msg) => {
        // 1. 호스트 변경
        if (msg.type == 'host-changed') {
          this.hostUser = msg.data;
          this.isHost = this.hostUser == this.myName;
          this.chatList.push(
            Chat.SysMsg('방의 호스트가 ' + msg.data + '로 변경되었습니다.')
          );
        } else if (msg.type == 'user-welcome') {
          // 새로온 유저에게 기존 리스트 전달
          // msg.data {
          //   host: string,
          //   users: user[],
          //   participants: user[]
          // }
          console.log('sys-msg : user-welcome received!!');
          console.log(msg.data);
          this.hostUser = msg.data.host;
          this.isHost = this.hostUser == this.myName;
          this.users.setUsers(msg.data.users as User[]);
          this.users.setParticipants(msg.data.participants);
        } else if (msg.type == 'user-join') {
          // 유저 접속
          console.log('userjoin' + msg.data);
          if (msg.data != this.mySelf.getName()) {
            this.users.add(new User(msg.data));
          }
          this.chatList.push(Chat.SysMsg(msg.data + '가 입장했습니다.'));
        } else if (msg.type == 'user-leave') {
          // 유저 msg.data가 나감
          // 삭제
          console.log('userleave ' + msg.data);
          this.users.leaveUser(msg.data);
          this.chatList.push(Chat.SysMsg(msg.data + '가 게임을 떠났습니다.'));
        }
      });

      this.socket.on('chat-msg', (msg) => {
        this.chatList.push(Chat.UserMsg(msg.from, msg.data));
        
      });

      this.socket.on(
        'game-msg',
        function (msg) {
          game_cmd_Handler.getInstance().msg_Handler(msg);
        }.bind(this)
      );

      this.socket.on(
        'game-cmd',
        function (cmd) {
          game_cmd_Handler.getInstance().cmd_Handler(cmd);
        }.bind(this)
      );
    });

    var canvas: any = document.getElementById('canvas');

    console.log(canvas);

    canvas.addEventListener(
      'mousemove',
      function (e) {
        this.handleMouseEnter(e);
      }.bind(this),
      false
    );
    canvas.addEventListener(
      'mousedown',
      function (e) {
        this.mousedown = true;
      }.bind(this),
      false
    );
    canvas.addEventListener(
      'mouseup',
      function (e) {
        this.penUp();
        this.mousedown = false;
        CanvasController.getInstance().penUp();
      }.bind(this),
      false
    );
    canvas.addEventListener(
      'touchstart',
      function (e) {
        e.preventDefault();
        console.log(e);
        this.mousedown = true;
      }.bind(this),
      false
    );
    canvas.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault();
        this.handleMouseEnter(e);
      }.bind(this),
      false
    );
    canvas.addEventListener(
      'touchend',
      function (e) {
        e.preventDefault();
        this.penUp();
        this.mousedown = false;
        if (this) CanvasController.getInstance().penUp();
      }.bind(this),
      false
    );
  }
}
