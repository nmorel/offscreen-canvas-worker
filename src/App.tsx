import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "./canvas/Canvas";
import { useOffscreenContext } from "./context";
import { InteractionListener } from "./helpers/listener";

function EventContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useOffscreenContext();

  useLayoutEffect(() => {
    const listener = new InteractionListener(ref.current!, ctx);
    listener.init();
    return () => listener.destroy();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
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
      {!!ctx.store.screenSize.width && !!ctx.store.screenSize.height && (
        <EventContainer>
          <Canvas />
        </EventContainer>
      )}
    </div>
  );
});

export default App;
