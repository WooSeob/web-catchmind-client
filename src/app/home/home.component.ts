import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('nickNameRequiredModal') nickNameRequiredModal: TemplateRef<any>;
  nickNameRequiredModalRef: NgbModalRef;

  isNameExist: boolean = false;

  setNickName: string;

  matchInProgress = false;
  myName: string = 'unknown';
  socket: Socket;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // this.socket = io('ws://localhost:9999');
    this.socket = io('ws://catchm1nd.herokuapp.com/');

    this.socket.on('connect', () => {
      console.log('connected');
    });
    this.socket.on('lobby-msg', (msg) => {
      if (msg.type == 'createRoom') {
        console.log('createRoom', msg.data);
        this.socket.disconnect();
        this.matchInProgress = false;

        this.router.navigateByUrl(`room/${msg.data}`);
      } else if (msg.type == 'searchRoom') {
        console.log('searchRoom', msg.data);
        this.socket.disconnect();
        this.matchInProgress = false;
        this.router.navigateByUrl(`room/${msg.data}`);
      }
    });
    this.isNameExist = this.authService.isMemberExist()
    
    this.myName = this.authService.getUserFullID();
    
  }

  openModal(content) {
    this.nickNameRequiredModalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      animation: true,
    });
  }
  closeModal() {
    this.authService.setNoMemberName(this.setNickName);
    this.myName = this.authService.getUserFullID();
    this.isNameExist = this.authService.isMemberExist()
    this.nickNameRequiredModalRef.close();
  }
  makeRoom() {
    if (this.socket.connected) {
      if (this.authService.isMemberExist()) {
        this.matchInProgress = true;
        let createReqMsg = {
          type: 'createRoom',
          data: this.authService.getUserFullID(),
        };
        this.socket.emit('lobby-msg', createReqMsg);
      } else {
        this.openModal(this.nickNameRequiredModal);
      }
    }
  }

  searchRoom() {
    if (this.socket.connected) {
      if(this.authService.isMemberExist()){
        this.matchInProgress = true;
        let searchReqMsg = {
          type: 'searchRoom',
          data: this.authService.getUserFullID(),
        };
        this.socket.emit('lobby-msg', searchReqMsg);
      }else{
        this.openModal(this.nickNameRequiredModal);
      }
    }
  }
}
