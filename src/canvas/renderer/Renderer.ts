import { Bounds } from "../../typings";
import { createBoardShape, Shape, ShapeData } from "../shapes/Shape";
import { CanvasRenderer, CanvasRendererHelper } from "./type";

export class RendererHelper implements CanvasRendererHelper {
  getImageBitmap(id: string, src: string): Promise<ImageBitmap> {
    return fetch(src)
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob));
  }
}

export class Renderer<
  CANVAS extends HTMLCanvasElement | OffscreenCanvas,
  CONTEXT extends CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
> implements CanvasRenderer {
  helper: RendererHelper

  canvas: CANVAS;
  context: CONTEXT;
  redraw = true;

  screenSize = {
    width: 0,
    height: 0,
  };
  viewport = {
    tx: 0,
    ty: 0,
    scale: 1,
  };
  viewportBounds: Bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };
  shapes = new Map<string, Shape>();
  shapesOrder: string[] = [];

  currentRaf?: number;

  showFps = true;
  fps = {
    prevTime: 0,
    frames: 0,
    lastFps: "",
  };

  constructor(
    helper: RendererHelper,
    canvas: CANVAS,
    context: CONTEXT,
    screenSize: { width: number; height: number },
    viewport: { tx: number; ty: number; scale: number },
    objects: ShapeData[]
  ) {
    this.helper = helper
    this.canvas = canvas;
    this.context = context;
    this.setDimensions(screenSize);
    this.setViewport(viewport);
    objects.forEach((obj: ShapeData) => {
      this.shapes.set(obj.id, createBoardShape(obj));
      this.shapesOrder.push(obj.id);
    });
    this.startRenderLoop();
  }

  private startRenderLoop() {
    this.currentRaf && cancelAnimationFrame(this.currentRaf);
    this.fps.prevTime = performance.now();
    this.render();
  }

  private render() {
    this.currentRaf = requestAnimationFrame(() => this.render());

    if (!this.showFps && !this.redraw) {
      return;
    }

    this.redraw = false;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.save();

    this.context.setTransform(
      this.viewport.scale,
      0,
      0,
      this.viewport.scale,
      this.viewport.tx,
      this.viewport.ty
    );

    this.shapesOrder.forEach((shapeId) => {
      const shape = this.shapes.get(shapeId);
      if (shape?.isVisible(this.viewportBounds)) {
        shape?.render(this.context, this.helper);
      }
    });

    this.context.restore();

    if (this.showFps) {
      this.fps.frames++;

      const time = performance.now();
      if (time > this.fps.prevTime + 1000) {
        this.fps.lastFps = `${Math.round(
          Math.max((this.fps.frames * 1000) / (time - this.fps.prevTime), 0)
        )} FPS`;
        this.fps.prevTime = time;
        this.fps.frames = 0;
      }

      if (this.fps.lastFps) {
        this.context.save();
        this.context.fillStyle = "#000";
        this.context.fillRect(5, 0, 50, 18);
        this.context.fillStyle = "rgb(0, 255, 0)";
        this.context.font = "14px Arial";
        this.context.fillText(this.fps.lastFps, 8, 14);
        this.context.restore();
      }
    }
  }

  setDimensions(screenSize: { width: number; height: number }) {
    this.screenSize = screenSize;
    this.canvas.width = screenSize.width;
    this.canvas.height = screenSize.height;
    this.updateViewportBounds();
    this.redraw = true;
  }

  setViewport(viewport: Renderer<any, any>["viewport"]) {
    Object.assign(this.viewport, viewport);
    this.updateViewportBounds();
    this.redraw = true;
  }

  private updateViewportBounds() {
    const left = -this.viewport.tx / this.viewport.scale;
    const top = -this.viewport.ty / this.viewport.scale;
    const right = left + this.screenSize.width / this.viewport.scale;
    const bottom = top + this.screenSize.height / this.viewport.scale;
    Object.assign(this.viewportBounds, {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    });
  }

  destroy(): void {
    this.currentRaf && cancelAnimationFrame(this.currentRaf);
  }
}
