import { convertToParamMap } from '@angular/router';

export class Draw {
  NormX: number;
  NormY: number;
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
  abstract draw(x: number, y: number): void;
}

class Pen extends DrawMode {
  Type = ModeType.PEN;
  draw(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.controller.getStrokeWidth();
    this.ctx.strokeStyle = this.controller.getStrokeColor();
    this.ctx.lineCap = 'round';
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
  draw(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.controller.getStrokeWidth();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineCap = 'round';
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
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private prevX: Number = -1;
  private prevY: Number = -1;
  private strokeWidth: Number = 1;
  private strokeColor: string = 'black';
  
  private prevWidth: number;
  private resizeTimeout;
  private restoreWidthRatio: number = 1;

  private devicePixelRatio: number = 1;

  public mode: DrawMode;
  public pen: DrawMode;
  public erase: DrawMode;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.init();
    window.addEventListener('resize', this.resizeThrottler.bind(this), false);

    this.pen = new Pen(this);
    this.erase = new Erase(this);
    this.mode = this.pen;
  }
  public initDrawingOptions() {
    this.setStrokeColor('black');
    this.setStrokeWidth(3);
    this.setDrawMode(ModeType.PEN);
  }
  public getStrokeWidth() {
    return this.strokeWidth;
  }
  public getStrokeColor() {
    return this.strokeColor;
  }
  public setStrokeWidth(width: number) {
    this.strokeWidth = width * this.devicePixelRatio;
  }
  public setStrokeColor(color: string) {
    this.strokeColor = color;
  }
  public msgHandler(msg) {
    // Turn 유저로부터 브로드 캐스팅 된 Draw Msg 를 기반으로 캔버스를 재현함
    if (msg.type == 'draw') {
      console.log(msg.data)
      this.draw(msg.data.NormX, msg.data.NormY);
    } else if (msg.type == 'pen_up') {
      this.penUp();
    } else if (msg.type == 'mode change') {
      this.setDrawMode(msg.data);
    } else if (msg.type == 'width change') {
      this.setStrokeWidth(msg.data);
    } else if (msg.type == 'color change') {
      this.setStrokeColor(msg.data);
    } else if (msg.type == 'canvas clear') {
      this.clear();
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

  draw(normalizedX: number, normalizedY: number): void {
    this.mode.draw(
      normalizedX * this.canvas.width,
      normalizedY * this.canvas.height
    );
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

  public setCanvasSize() {
    const RATIO_16_10 = 0.625;
    const {
      width: hidefCanvasWidth,
      height: hidefCanvasHeight,
    } = this.canvas.getBoundingClientRect();
    const hidefCanvasCssWidth = hidefCanvasWidth;
    const hidefCanvasCssHeight = hidefCanvasWidth * RATIO_16_10;
    // const hidefCanvasCssHeight = hidefCanvasHeight;
    this.canvas.setAttribute(
      'width',
      `${hidefCanvasWidth * this.devicePixelRatio}`
    );
    this.canvas.setAttribute(
      'height',
      `${hidefCanvasWidth * this.devicePixelRatio * RATIO_16_10}`
      // `${hidefCanvasHeight * this.devicePixelRatio * 0.625}`
    );
    this.canvas.style.width = `${hidefCanvasCssWidth}px`;
    this.canvas.style.height = `${hidefCanvasCssHeight}px`;
  }

  private init() {
    if (window.devicePixelRatio) {
      this.devicePixelRatio = window.devicePixelRatio;
    }
    this.setCanvasSize();
    this.prevWidth = this.canvas.width;
  }

  public resizeThrottler() {
    if (!this.resizeTimeout) {
      this.resizeTimeout = setTimeout(
        function () {
          this.resizeTimeout = null;
          this.actualResizeHandler();
        }.bind(this),
        66
      );
    }
  }

  public actualResizeHandler() {
    //리사이즈 될 때 기존 캔버스 그림 저장후 변화된 스케일에 맞춰 복구함
    this.canvas.style.width = '100%';

    let saved: CanvasImageSource = new Image();
    saved.src = this.canvas.toDataURL();

    this.setCanvasSize();

    if (this.prevWidth != this.canvas.width) {
      //실제 캔버스의 width가 변할때만 복구
      this.restoreWidthRatio = this.canvas.width / this.prevWidth;
      this.prevWidth = this.canvas.width;
    }

    saved.onload = function () {
      //모두지우고
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //기존의 그림을 바뀐 브라우저 사이즈의 스케일로 그려줌
      this.ctx.scale(this.restoreWidthRatio, this.restoreWidthRatio);
      this.restoreWidthRatio = 1;
      this.ctx.drawImage(saved, 0, 0);
      //스케일 다시 1로 복구
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }.bind(this);
  }
}
