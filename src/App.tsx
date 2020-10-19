import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "./canvas/Canvas";
import { useOffscreenContext } from "./context";
import { InteractionListener } from "./helpers/listener";
import { hasOffscreenCanvas } from "./helpers/offscreenCanvas";

function EventContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const listener = new InteractionListener(ref.current!, ctx);
    listener.init();
    return () => listener.destroy();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

const App = observer(function App() {
  const ctx = useOffscreenContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const cb = () => {
      const width = containerRef.current?.offsetWidth || 0;
      const height = containerRef.current?.offsetHeight || 0;
      ctx.store.setScreenSize(width, height);
    };
    cb();
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#333",
      }}
    >
      <div style={{ position: "absolute", top: 5, right: 5 }}>
        <button
          type="button"
          onClick={() => {
            ctx.store.setAnimateVpt(true);
            const now = performance.now();
            while (performance.now() - now < 4000) {
              // just loop
            }
            ctx.store.setAnimateVpt(false);
          }}
        >
          Block main thread
        </button>
        {hasOffscreenCanvas && (
          <button
            type="button"
            onClick={() => {
              ctx.store.setUseOffscreenCanvas(!ctx.store.useOffscreenCanvas);
            }}
          >
            {ctx.store.useOffscreenCanvas ? "Use classic" : "Use offscreen"}
          </button>
        )}
      </div>
      {!!ctx.store.screenSize.width && !!ctx.store.screenSize.height && (
        <EventContainer>
          <Canvas
            key={ctx.store.useOffscreenCanvas ? "offscreen" : "classic"}
          />
        </EventContainer>
      )}
    </div>
  );
});

export default App;
