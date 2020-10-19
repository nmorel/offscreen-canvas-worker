import { reaction } from "mobx";
import React, { useLayoutEffect, useRef } from "react";
import { useOffscreenContext } from "../context";
import { createCanvasRenderer } from "./renderer";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = createCanvasRenderer(canvas, ctx);

    const screenSizeReaction = reaction(
      () => ({
        width: ctx.store.screenSize.width,
        height: ctx.store.screenSize.height,
      }),
      (screenSize) => renderer.setDimensions(screenSize)
    );

    const viewportReaction = reaction(
      () => ({
        tx: ctx.store.viewport.tx,
        ty: ctx.store.viewport.ty,
        scale: ctx.store.viewport.scale,
      }),
      (viewport) => renderer.setViewport(viewport)
    );

    const animateReaction = reaction(
      () => ctx.store.animateVpt,
      (animateVpt) => renderer.setAnimateViewport(animateVpt)
    );

    return () => {
      screenSizeReaction();
      viewportReaction();
      animateReaction()
      renderer.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={ctx.store.screenSize.width}
      height={ctx.store.screenSize.height}
      style={{
        width: ctx.store.screenSize.width,
        height: ctx.store.screenSize.height,
      }}
    />
  );
}
