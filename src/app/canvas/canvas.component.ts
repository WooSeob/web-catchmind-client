import { Component, OnInit, Input } from '@angular/core';
import { ModeType, Draw, CanvasController } from '../draw';
import { GameModel } from '../model/game-model';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit {
  @Input() gameModel: GameModel;
  @Input() socket: any;
  private mousedown: boolean = false;
  public guess: String; // 보낼 정답

  public strokeWidth: number;

  checkGuess(): void {
    console.log(this.guess + ' guess 전송');
    this.socket.emit('game-msg', this.guess);
  }
  constructor() {}

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

  selectStrokeSmall() {
    this.selectStroke(3);
  }
  selectStrokeMedium() {
    this.selectStroke(5);
  }
  selectStrokeLarge() {
    this.selectStroke(7);
  }
  private selectStroke(width) {
    CanvasController.getInstance().setStrokeWidth(width);
    let msg = {
      type: 'width change',
      data: width,
    };
    this.socket.emit('draw cmd', msg);
  }

  selectColorBlack() {
    this.selectColor('black');
  }
  selectColorRed() {
    this.selectColor('red');
  }
  selectColorGreen() {
    this.selectColor('green');
  }
  selectColorBlue() {
    this.selectColor('blue');
  }
  private selectColor(color: string) {
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
    if (this.mousedown && this.gameModel.myTurn && this.gameModel.isGuess) {
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

  ngOnInit(): void {
    var canvas: any = document.getElementById('canvas');
    CanvasController.createInstance(canvas);

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
