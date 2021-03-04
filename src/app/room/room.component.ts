import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Draw, CanvasController } from '../draw';
import { PhaseType } from '../message';
import { io } from 'socket.io-client';
import { GameController } from '../controller/game-controller';
import { UserContainer } from '../model/user-container';
import { Chat, ChatContainer } from '../model/chat-container';
import { JoinData, User } from '../interfaces';
import { GameModel } from '../model/game-model';
import { AuthenticationService } from '../authentication.service';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Socket } from 'socket.io-client';
@Component({
  selector: '',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nickNameRequiredModal') nickNameRequiredModal: TemplateRef<any>;
  @Input() nickName: string;

  nickNameRequiredModalRef: NgbModalRef;
  setNickName: string = "";

  mySelf: User;
  myID: string;
  myName: string = 'unknown';

  hostUser: string;
  isHost: boolean = false;

  users: UserContainer;
  chatList: ChatContainer;

  socket: Socket;
  // private mySelf: User;
  ROOM_ID: string = '7777';

  public setTimeout: number;
  public setRound: number;

  private gameController: GameController;
  public gameModel: GameModel;
  private canvasController: CanvasController;

  public checkboxGroupForm: FormGroup;

  setMySelf(user: User) {
    this.mySelf = user;
    this.myName = this.mySelf.getName();
    this.connect();
  }
  ngAfterViewInit() {
    if (this.authService.isMemberExist()) {
      this.setMySelf(new User(this.authService.getUserFullID()));
    } else {
      this.openModal(this.nickNameRequiredModal);
    }
  }
  ngOnDestroy() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  join() {
    // Room에 접속시도
    if (this.gameModel.mySelf.getName() !== 'unknown-user') {
      let joinData: JoinData = {
        roomID: this.ROOM_ID,
        user: this.gameModel.mySelf,
      };
      this.socket.emit('join', joinData);
    } else {
      alert('유저 이름을 설정해주세요.');
    }
  }
  openModal(content) {
    this.nickNameRequiredModalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      animation: true,
    });
  }
  public closeModal() {
    if (this.setNickName != '' && this.setNickName.length < 7) {
      this.authService.setNoMemberName(this.setNickName);
      this.setMySelf(new User(this.authService.getUserFullID()));
      this.nickNameRequiredModalRef.close();
    } else {
      alert('닉네임은 6자 이하로 입력해 주세요.');
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.ROOM_ID = route.snapshot.params['roomID'];

    this.mySelf = new User('unknown-user');

    this.gameController = GameController.createInstance(this.mySelf);
    this.gameModel = this.gameController.getModel();

    this.chatList = ChatContainer.getInstance();
    this.users = UserContainer.getInstance();
  }

  selectWord(idx: string): void {
    if (this.gameModel.myTurn && parseInt(idx) >= 0 && parseInt(idx) < 3) {
      this.socket.emit('game-msg', idx); //0, 1, 2 사이 인덱스
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
      //console.log('disconnected');
      //console.log(reason);
    }
    this.gameController.init();
    this.gameModel.init(this.mySelf);
    this.chatList.init();
    this.users.init();
  }

  connect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
    // this.socket = io('ws://172.30.1.20:9999');
    // this.socket = io('ws://localhost:9999');
    this.socket = io('ws://catchm1nd.herokuapp.com/');

    this.initInstances(null);

    //console.log(this.socket);
    this.socket.on('connect', () => {
      //console.log('connect');
      this.join();

      this.socket.on(
        'draw cmd',
        function (msg) {
          if (!this.gameModel.myTurn) {
            CanvasController.getInstance().msgHandler(msg);
          }
        }.bind(this)
      );

      // this.socket.on('disconnect', this.initInstances);

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
          //TODO 그림이미지도 복원받기
          // msg.data { host: string, entireUsers: user[]}
          //console.log('restore', 'sys-msg : user-welcome received!!');
          //console.log('restore', msg.data);
          this.hostUser = msg.data.host;
          this.isHost = this.hostUser == this.myName;
          this.users.restoreUsers(msg.data.users);
        } else if (msg.type == 'user-join') {
          // 유저 접속
          //console.log('userjoin' + msg.data);
          if (msg.data != this.gameModel.mySelf.getName()) {
            this.users.add(new User(msg.data));
          }
          this.chatList.push(Chat.SysMsg(msg.data + '가 입장했습니다.'));
        } else if (msg.type == 'user-leave') {
          // 유저 msg.data가 나감
          // 삭제
          //console.log('userleave ' + msg.data);
          this.users.leaveUser(msg.data);
          this.chatList.push(Chat.SysMsg(msg.data + '가 게임을 떠났습니다.'));
        } else if (msg.type == 'room-not-found') {
          //존재하지 않는 방에 입장한 경우
          alert('존재하지 않는 방입니다.');
          this.router.navigateByUrl(`/`);
        } else if (msg.type == 'kick') {
          alert('추방 당했습니다.');
          this.router.navigateByUrl(`/`);
        }
      });

      this.socket.on('chat-msg', (msg) => {
        this.chatList.push(Chat.UserMsg(msg.from, msg.data));
      });

      this.socket.on(
        'game-msg',
        function (msg) {
          // //console.log(msg);
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
  ngOnInit(): void {
    this.initInstances(null);
    this.checkboxGroupForm = this.formBuilder.group({
      publicRoom: true,
    });
  }
  setRoomSearchable() {
    ////console.log(this.checkboxGroupForm.value.publicRoom);
    this.socket.emit('searchOpt', !this.checkboxGroupForm.value.publicRoom);
  }
}
