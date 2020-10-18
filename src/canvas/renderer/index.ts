import { OffscreenContext } from "../../context";
import { OffscreenRenderer } from "./OffscreenRenderer";
import { Renderer, RendererHelper } from "./Renderer";
import { CanvasRenderer } from "./type";

export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  ctx: OffscreenContext
): CanvasRenderer {
  const screenSize = {
    ...ctx.store.screenSize,
  };
  const viewport = {
    tx: ctx.store.viewport.tx,
    ty: ctx.store.viewport.ty,
    scale: ctx.store.viewport.scale,
  };
  const objects = ctx.store.objects.items.map((obj) => obj.transferableData());
  if (ctx.store.useOffscreenCanvas) {
    console.log("Using OffscreenCanvas");
    return new OffscreenRenderer(canvas, screenSize, viewport, objects);
  } else {
    console.log("Using classic Canvas");
    return new Renderer<HTMLCanvasElement, CanvasRenderingContext2D>(
      new RendererHelper(),
      canvas,
      canvas.getContext("2d", { alpha: true })!,
      screenSize,
      viewport,
      objects
    );
  }
}
