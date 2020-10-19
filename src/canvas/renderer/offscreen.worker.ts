import { Renderer, RendererHelper } from "./Renderer";
import { CanvasRendererHelper } from "./type";

const ctx: Worker = self as any;

class OffscreenRendererHelper implements CanvasRendererHelper {
  baseHelper = new RendererHelper();

  promises = new Map<
    string,
    { resolve(image: ImageBitmap): void; reject(): void }
  >();

  getImageBitmap(
    id: string,
    src: string,
    kind?: "jpg" | "svg"
  ): Promise<ImageBitmap> {
    if (kind === "svg") {
      return new Promise((resolve, reject) => {
        ctx.postMessage({ type: "getImageBitmap", id, src });
        this.promises.set(`${id}+${src}`, { resolve, reject });
      });
    } else {
      return this.baseHelper.getImageBitmap(id, src);
    }
  }

  processImageBitmap({ id, src, bitmap }) {
    const promise = this.promises.get(`${id}+${src}`);
    if (promise) {
      this.promises.delete(`${id}+${src}`);
      promise.resolve(bitmap);
    }
  }
}

let renderer: Renderer<OffscreenCanvas, OffscreenCanvasRenderingContext2D>;
let rendererHelper = new OffscreenRendererHelper();

ctx.addEventListener("message", ({ data: { type, ...data } }) => {
  switch (type) {
    case "init": {
      const { canvas } = data;
      renderer = new Renderer(
        rendererHelper,
        canvas,
        canvas.getContext("2d", { alpha: true }),
        data.screenSize,
        data.viewport,
        data.objects
      );
      break;
    }
    case "dimensions": {
      renderer.setDimensions(data);
      break;
    }
    case "viewport": {
      renderer.setViewport(data);
      break;
    }
    case "animateVpt": {
      renderer.setAnimateViewport(data.animateVpt);
      break;
    }
    case "getImageBitmap": {
      rendererHelper.processImageBitmap(data);
      break;
    }
  }
});
