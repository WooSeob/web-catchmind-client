export class Draw {
  X: Number;
  Y: Number;
}

export class CanvasController {
  private static instance: CanvasController;
  private ctx: any;
  private canvas: any;
  private prevX: Number = -1;
  private prevY: Number = -1;
  private constructor(canvas: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.init();
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
    this.ctx.beginPath();
    this.ctx.lineWidth = '3';
    this.ctx.strokeStyle = 'green';
    if (this.prevX > -1 && this.prevY > -1) {
      this.ctx.moveTo(this.prevX, this.prevY);
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.prevX = x;
    this.prevY = y;
    // this.ctx.beginPath();
    // this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    // this.ctx.closePath();
    // this.ctx.fill();
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
