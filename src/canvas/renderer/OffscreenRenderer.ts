import { Image } from "../../model/image";
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

    this.worker.addEventListener("message", ({ data: { type, ...data } }) => {
      switch (type) {
        case "getImageBitmap":
          const image = new window.Image();
          image.onload = () => {
            createImageBitmap(image).then((bitmap) =>
              this.worker.postMessage({
                type: "getImageBitmap",
                id: data.id,
                src: data.src,
                bitmap,
              })
            );
          };
          image.src = data.src;
      }
    });
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
