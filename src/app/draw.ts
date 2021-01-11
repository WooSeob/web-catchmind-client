import { convertToParamMap } from '@angular/router';

export class Draw {
  X: Number;
  Y: Number;
}
export enum ModeType {
  PEN = 'pen',
  ERASE = 'erase',
}
abstract class DrawMode {
  public readonly Type: ModeType;
  protected controller: CanvasController;
  protected ctx;
  constructor(controller: CanvasController) {
    this.controller = controller;
    this.ctx = controller.getCtx();
  }
  abstract draw(x: Number, y: Number): void;
}

class Pen extends DrawMode {
  Type = ModeType.PEN;
  draw(x: Number, y: Number): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.controller.getStrokeWidth();
    this.ctx.strokeStyle = this.controller.getStrokeColor();
    if (this.controller.getPrevX() > -1 && this.controller.getPrevY() > -1) {
      this.ctx.moveTo(this.controller.getPrevX(), this.controller.getPrevY());
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.controller.setPrevPos(x, y);
  }
}

class Erase extends DrawMode {
  Type = ModeType.ERASE;
  draw(x: Number, y: Number): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.controller.getStrokeWidth();
    this.ctx.strokeStyle = 'white';
    if (this.controller.getPrevX() > -1 && this.controller.getPrevY() > -1) {
      this.ctx.moveTo(this.controller.getPrevX(), this.controller.getPrevY());
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.controller.setPrevPos(x, y);
  }
}
export class CanvasController {
  private static instance: CanvasController;
  private ctx: any;
  private canvas: any;
  private prevX: Number = -1;
  private prevY: Number = -1;
  private strokeWidth: Number = 1;
  private strokeColor: string = 'black';

  public mode: DrawMode;
  public pen: DrawMode;
  public erase: DrawMode;

  private constructor(canvas: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.init();

    this.pen = new Pen(this);
    this.erase = new Erase(this);
    this.mode = this.pen;
  }
  public getStrokeWidth() {
    return this.strokeWidth;
  }
  public getStrokeColor() {
    return this.strokeColor;
  }
  public setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }
  public setStrokeColor(color: string) {
    this.strokeColor = color;
  }
  public msgHandler(msg) {
    // Turn 유저로부터 브로드 캐스팅 된 Draw Msg 를 기반으로 캔버스를 재현함
    if (msg.type == 'draw') {
      this.draw(msg.data.X, msg.data.Y);
    } else if (msg.type == 'pen_up') {
      this.penUp();
    } else if (msg.type == 'mode change') {
      this.setDrawMode(msg.data);
    } else if (msg.type == 'width change') {
      this.setStrokeWidth(msg.data);
    } else if (msg.type == 'color change') {
      this.setStrokeColor(msg.data);
    }
  }
  public setDrawMode(mode: ModeType) {
    switch (mode) {
      case ModeType.PEN:
        this.mode = this.pen;
        break;
      case ModeType.ERASE:
        this.mode = this.erase;
        break;

      default:
        break;
    }
  }
  public getPrevX() {
    return this.prevX;
  }
  public getPrevY() {
    return this.prevY;
  }
  public getCtx() {
    return this.ctx;
  }
  public setPrevPos(X: Number, Y: Number) {
    this.prevX = X;
    this.prevY = Y;
  }
  static createInstance(ctx: any) {
    this.instance = new CanvasController(ctx);
  }
  static getInstance() {
    if (CanvasController.instance) {
      return CanvasController.instance;
    } else {
      console.log('CanvasController not found');
      return null;
    }
  }

  draw(x: Number, y: Number): void {
    this.mode.draw(x, y);
  }
  penUp() {
    this.prevY = -1;
    this.prevX = -1;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.prevY = -1;
    this.prevX = -1;
  }
  private init() {
    if (window.devicePixelRatio) {
      const {
        width: hidefCanvasWidth,
        height: hidefCanvasHeight,
      } = this.canvas.getBoundingClientRect();
      const hidefCanvasCssWidth = hidefCanvasWidth;
      const hidefCanvasCssHeight = hidefCanvasHeight;
      this.canvas.setAttribute(
        'width',
        hidefCanvasWidth * window.devicePixelRatio
      );
      this.canvas.setAttribute(
        'height',
        hidefCanvasHeight * window.devicePixelRatio
      );
      this.canvas.style.width = `${hidefCanvasCssWidth}px`;
      this.canvas.style.height = `${hidefCanvasCssHeight}px`;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    window.onresize = function (event) {
      this.canvas.style.width = '100%';
      // console.log('resize', event)
      this.init();
    }.bind(this);
  }
}
