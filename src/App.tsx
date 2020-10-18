import React, { useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "./canvas/Canvas";
import {
  ContextProvider,
  OffscreenContext,
  useOffscreenContext,
} from "./context";
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
