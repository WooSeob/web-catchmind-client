import { Component, OnInit, Input } from '@angular/core';
import { isThisTypeNode } from 'typescript';
import { ModeType, Draw, CanvasController } from '../draw';
import { GameModel } from '../model/game-model';

import { HostBinding } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

abstract class Handler {
  component: CanvasComponent;
  constructor(component: CanvasComponent) {
    this.component = component;
  }
  abstract handle(e: any): Draw;
  isTimeToHandle() {
    return (
      this.component.mousedown &&
      this.component.gameModel.myTurn &&
      this.component.gameModel.isGuess
    );
  }
}
class MouseHandler extends Handler {
  handle(e): Draw {
    var drawData: Draw = { NormX: 0, NormY: 0 };

    var viewportOffset = this.component.canvas.getBoundingClientRect();
    //(this.component.canvas.width / window.devicePixelRatio)
    drawData = {
      NormX: e.offsetX / viewportOffset.width,
      NormY: e.offsetY / viewportOffset.height,
    };

    return drawData;
  }
}
class TouchHandler extends Handler {
  handle(e): Draw {
    var drawData: Draw = { NormX: 0, NormY: 0 };

    var viewportOffset = this.component.canvas.getBoundingClientRect();
    drawData = {
      NormX:
        (e.touches[0].clientX - viewportOffset.left) / viewportOffset.width,
      NormY:
        (e.touches[0].clientY - viewportOffset.top) / viewportOffset.height,
    };

    return drawData;
  }
}

class DefaultHandler extends Handler {
  handle(e): Draw {
    if (e instanceof MouseEvent) {
      this.component.setHandler(this.component.mouseHandler);
    } else if (e instanceof TouchEvent) {
      this.component.setHandler(this.component.touchHandler);
    }
    return this.component.handler.handle(e);
  }
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  animations: [
    trigger('overlayTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('700ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('700ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CanvasComponent implements OnInit {
  @Input() gameModel: GameModel;
  @Input() socket: any;
  public inputElement: HTMLInputElement;
  public mousedown: boolean = false;
  public guess: String; // 보낼 정답
  public canvas: HTMLCanvasElement;
  public strokeWidth: number;

  defaultHandler: Handler;
  touchHandler: Handler;
  mouseHandler: Handler;
  handler: Handler;
  setHandler(handler: Handler) {
    this.handler = handler;
  }
  checkGuess(): void {
    if (this.guess !== '') {
      this.socket.emit('game-msg', this.guess);
      this.inputElement.value = '';
      this.guess = '';
    } else {
      alert('단어를 입력해 주세요.');
    }
  }
  constructor() {
    this.defaultHandler = new DefaultHandler(this);
    this.touchHandler = new TouchHandler(this);
    this.mouseHandler = new MouseHandler(this);

    this.handler = this.defaultHandler;
  }

  clearCanvas(): void {
    CanvasController.getInstance().clear();
    let msg = {
      type: 'canvas clear',
      data: null,
    };
    this.socket.emit('draw cmd', msg);
  }
  selectPen(): void {
    console.log('selectPen');
    this.selectMode(ModeType.PEN);
  }
  selectErase(): void {
    console.log('selectErase');
    this.selectMode(ModeType.ERASE);
  }
  private selectMode(mode: ModeType) {
    CanvasController.getInstance().setDrawMode(mode);
    let msg = {
      type: 'mode change',
      data: mode,
    };
    this.socket.emit('draw cmd', msg);
  }

  selectStrokeSize(width: string) {
    CanvasController.getInstance().setStrokeWidth(parseInt(width));
    let msg = {
      type: 'width change',
      data: width,
    };
    this.socket.emit('draw cmd', msg);
  }

  selectColor(color: string) {
    CanvasController.getInstance().setStrokeColor(color);
    let msg = {
      type: 'color change',
      data: color,
    };
    this.socket.emit('draw cmd', msg);
  }

  penUp() {
    if (this.mousedown && this.gameModel.myTurn && this.gameModel.isGuess) {
      this.socket.emit('draw cmd', { type: 'pen_up' });
    }
  }

  handleMouseEnter(e: any): void {
    if (this.handler.isTimeToHandle()) {
      let drawData: Draw = this.handler.handle(e);

      CanvasController.getInstance().draw(drawData.NormX, drawData.NormY);

      let msg = {
        type: 'draw',
        data: drawData,
      };
      this.socket.emit('draw cmd', msg);
    }
  }

  ngOnInit(): void {
    this.inputElement = <HTMLInputElement>(
      document.getElementById('guess-input')
    );
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;

    CanvasController.createInstance(this.canvas);

    this.canvas.addEventListener(
      'mousemove',
      function (e) {
        this.handleMouseEnter(e);
      }.bind(this),
      false
    );
    this.canvas.addEventListener(
      'mousedown',
      function (e) {
        this.mousedown = true;
      }.bind(this),
      false
    );
    this.canvas.addEventListener(
      'mouseup',
      function (e) {
        this.penUp();
        this.mousedown = false;
        CanvasController.getInstance().penUp();
      }.bind(this),
      false
    );
    this.canvas.addEventListener(
      'touchstart',
      function (e) {
        e.preventDefault();
        console.log(e);
        this.mousedown = true;
      }.bind(this),
      false
    );
    this.canvas.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault();
        this.handleMouseEnter(e);
      }.bind(this),
      false
    );
    this.canvas.addEventListener(
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
