import { ShapeData } from "../shapes/Shape";
import { CanvasRenderer } from "./type";

export class OffscreenRenderer implements CanvasRenderer {
  private worker: Worker;

  constructor(
    canvas: HTMLCanvasElement,
    screenSize: { width: number; height: number },
    viewport: { tx: number; ty: number; scale: number },
    objects: ShapeData[]
  ) {
    this.worker = new Worker("./offscreen.worker.ts");
    const offscreen = canvas.transferControlToOffscreen();
    this.worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        screenSize,
        viewport,
        objects,
      },
      [offscreen]
    );
  }

  setDimensions({ width, height }: { width: number; height: number }): void {
    this.worker.postMessage({
      type: "dimensions",
      width,
      height,
    });
  }

  setViewport(data: { tx: number; ty: number; scale: number }): void {
    this.worker.postMessage({
      type: "viewport",
      ...data,
    });
  }

  destroy(): void {
    this.worker.terminate();
  }
}
