import React, { useLayoutEffect, useRef, useState } from 'react';

function Canvas({width, height}: {width: number, height: number}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    const worker =  new Worker('./offscreen.worker.ts')
    workerRef.current = worker

    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

    return () => worker.terminate()
  }, [])

  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    canvas.setAttribute('width', `${width}`)
    canvas.setAttribute('height', `${height}`)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    workerRef.current?.postMessage({type: 'dimensions', width, height});
  }, [width, height])

  return <canvas ref={canvasRef} />
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({width: 0, height: 0})

  useLayoutEffect(() => {
    const cb = () => setDims({width: containerRef.current?.offsetWidth || 0, height: containerRef.current?.offsetHeight || 0})
    cb()
    window.addEventListener('resize', cb)
    return () => window.removeEventListener('resize', cb)
  }, [])

  return (
    <div ref={containerRef} style={{position: 'relative', width: '100%', height: '100%', backgroundColor: '#333'}}>
      <button type="button" style={{position: 'absolute', top: 5, right: 5}} onClick={() => {
        const now = performance.now()
        while(performance.now() - now < 2000) {
          // just loop
        }
      }}>Block main thread</button>
      {!!dims.width && !!dims.height && <Canvas {...dims} />}
    </div>
  );
}

export default App;
