import { reaction } from "mobx";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  ContextProvider,
  OffscreenContext,
  useOffscreenContext,
} from "./helpers/context";
import { EventHandler } from "./helpers/eventHandler";
import { InteractionListener } from "./helpers/listener";

function EventContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const listener = new InteractionListener(
      ref.current!,
      new EventHandler(ctx),
      ctx
    );
    listener.init();
    return () => listener.destroy();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}

function Canvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const worker = new Worker("./offscreen.worker.ts");
    workerRef.current = worker;

    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

    const interval = setInterval(() => {
      worker.postMessage({ type: "update" });
    }, 2000);

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
      viewportReaction();
      worker.terminate();
      clearInterval(interval);
    };
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    canvas.setAttribute("width", `${width}`);
    canvas.setAttribute("height", `${height}`);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    workerRef.current?.postMessage({ type: "dimensions", width, height });
  }, [width, height]);

  return <canvas ref={canvasRef} />;
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx] = useState(() => new OffscreenContext());
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const cb = () => {
      const width = containerRef.current?.offsetWidth || 0;
      const height = containerRef.current?.offsetHeight || 0;
      ctx.store.setScreenSize(width, height);
      setDims({
        width,
        height,
      });
    };
    cb();
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  }, []);

  return (
    <ContextProvider ctx={ctx}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#333",
        }}
      >
        <button
          type="button"
          style={{ position: "absolute", top: 5, right: 5 }}
          onClick={() => {
            const now = performance.now();
            while (performance.now() - now < 2000) {
              // just loop
            }
          }}
        >
          Block main thread
        </button>
        {!!dims.width && !!dims.height && (
          <EventContainer>
            <Canvas {...dims} />
          </EventContainer>
        )}
      </div>
    </ContextProvider>
  );
}

export default App;
