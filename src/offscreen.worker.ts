import { getRandomColor, getRandomRect } from "./utils";

const ctx: Worker = self as any;

let canvas: OffscreenCanvas
let context: OffscreenCanvasRenderingContext2D
let dimensions: {width: number, height: number}

let currentFrame: number
function render() {
  context.clearRect(0, 0, dimensions.width, dimensions.height)

  context.save()

  context.setTransform(1, 0, 0, 1, 0, 0)

  context.fillStyle = getRandomColor()
  context.fillRect(...getRandomRect())

  context.restore()

  currentFrame = requestAnimationFrame(render)
}

function startRenderLoop() {
  cancelAnimationFrame(currentFrame)

  if (canvas && context && dimensions) {
    render()
  }
}

ctx.addEventListener('message', ({data: {type, ...data}}) => {
  switch(type) {
    case 'init': {
      canvas = data.canvas
      context = canvas.getContext('2d', {alpha: true})
      startRenderLoop()
      break
    }
    case 'dimensions': {
      dimensions = data
      canvas.width = data.width
      canvas.height = data.height
      startRenderLoop()
      break
    }
  }
});
