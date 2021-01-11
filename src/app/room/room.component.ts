import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Draw, CanvasController } from '../draw';
import { PhaseType } from '../message';
import { io } from 'socket.io-client';
import { GameController } from '../controller/game-controller';
import { UserContainer } from '../model/user-container';
import { Chat, ChatContainer } from '../model/chat-container';
import { JoinData, User } from '../interfaces';
import { GameModel } from '../model/game-model';
@Component({
  selector: '',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  myName: string;

  hostUser: string;
  isHost: boolean = false;

  users: UserContainer;
  chatList: ChatContainer;

  socket: any;
  private mySelf: User;
  ROOM_ID: string = '7777';

  public setTimeout: number;
  public setRound: number;

  private gameController: GameController;
  public gameModel: GameModel;
  private canvasController: CanvasController;

  constructor(private route: ActivatedRoute) {
    this.ROOM_ID = route.snapshot.params['roomID'];
    this.mySelf = new User('user' + Math.floor(Math.random() * 1000));
    this.myName = this.mySelf.getName();
    this.gameController = GameController.createInstance(this.mySelf);
    this.gameModel = this.gameController.getModel();
  }

  selectWord0(): void {
    if (this.gameModel.myTurn) {
      this.socket.emit('game-msg', 0); //0, 1, 2 사이 인덱스
    }
  }
  selectWord1(): void {
    if (this.gameModel.myTurn) {
      this.socket.emit('game-msg', 1); //0, 1, 2 사이 인덱스
    }
  }
  selectWord2(): void {
    if (this.gameModel.myTurn) {
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
      if (!this.gameModel.isInGame) {
        this.socket.emit('game-cmd', gameSetting);
      }
    } else {
      alert('라운드는 1~4, 제한시간은 6~179초 이내로 입력해주세요');
    }
  }

  initInstances(reason) {
    if (reason) {
      console.log('disconnected');
      console.log(reason);
    }

    this.chatList = ChatContainer.getInstance();
    this.users = UserContainer.getInstance();
  }
  ngOnInit(): void {
    this.socket = io('ws://localhost:9999');
    // this.socket = io('ws://catchm1nd.herokuapp.com/');

    console.log(this.socket);
    this.initInstances(null);

    this.socket.on('connect', () => {
      let joinData: JoinData = {
        roomID: this.ROOM_ID,
        user: this.mySelf,
      };
      console.log(joinData);
      this.socket.emit('join', joinData);

      this.socket.on(
        'draw cmd',
        function (msg) {
          if (!this.gameModel.myTurn) {
            CanvasController.getInstance().msgHandler(msg);
          }
        }.bind(this)
      );

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
          // 새로온 유저 - 기존 게임 State 복원
          // msg.data { host: string, entireUsers: user[]}
          console.log('restore', 'sys-msg : user-welcome received!!');
          console.log('restore', msg.data);
          this.hostUser = msg.data.host;
          this.isHost = this.hostUser == this.myName;
          this.users.restoreUsers(msg.data.users);
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
          console.log('game-msg received ', msg);
          this.gameController.msgHandler(msg);
        }.bind(this)
      );
      this.socket.on(
        'game-sync',
        function (msg) {
          this.gameController.transition(msg);
        }.bind(this)
      );
    });
  }
}
