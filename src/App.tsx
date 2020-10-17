import React, { useLayoutEffect, useRef, useState } from 'react';
import { getRandomColor, getRandomRect } from './utils';

const contextOptions: CanvasRenderingContext2DSettings = {alpha: true}

function Canvas({width, height}: {width: number, height: number}) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.setAttribute('width', `${width}`)
    canvas.setAttribute('height', `${height}`)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, [width, height])

  useLayoutEffect(() => {
    let currentFrame: number
    function render() {
      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d', contextOptions)
      if (!context) return

      context.clearRect(0, 0, canvas.width, canvas.height)

      context.save()

      context.setTransform(1, 0, 0, 1, 0, 0)

      context.fillStyle = getRandomColor()
      context.fillRect(...getRandomRect())

      context.restore()

      currentFrame = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(currentFrame)
  }, [])

  return   <canvas ref={canvasRef} />
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
