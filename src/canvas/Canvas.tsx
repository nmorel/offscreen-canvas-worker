import { reaction } from "mobx";
import React, { useLayoutEffect, useRef } from "react";
import { useOffscreenContext } from "../context";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const worker = new Worker("./offscreen.worker.ts");
    workerRef.current = worker;

    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        width: ctx.store.screenSize.width,
        height: ctx.store.screenSize.height,
      },
      [offscreen]
    );

    const interval = setInterval(() => {
      worker.postMessage({ type: "update" });
    }, 2000);

    const screenSizeReaction = reaction(
      () => ({
        type: "dimensions",
        width: ctx.store.screenSize.width,
        height: ctx.store.screenSize.height,
      }),
      (message) => worker.postMessage(message)
    );

    const viewportReaction = reaction(
      () => ({
        type: "viewport",
        tx: ctx.store.viewport.tx,
        ty: ctx.store.viewport.ty,
        scale: ctx.store.viewport.scale,
      }),
      (message) => worker.postMessage(message)
    );

    return () => {
      screenSizeReaction();
      viewportReaction();
      worker.terminate();
      clearInterval(interval);
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
