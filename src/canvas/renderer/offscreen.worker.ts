import { Renderer } from "./Renderer";

const ctx: Worker = self as any;

let renderer: Renderer<OffscreenCanvas, OffscreenCanvasRenderingContext2D>;

ctx.addEventListener("message", ({ data: { type, ...data } }) => {
  switch (type) {
    case "init": {
      const { canvas } = data;
      renderer = new Renderer(
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
  }
});
