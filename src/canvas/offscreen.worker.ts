import { getRandomColor, getRandomRect } from "../helpers/utils";

const ctx: Worker = self as any;

let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D;
let redraw = true;

const model = {
  viewport: {
    tx: 0,
    ty: 0,
    scale: 1,
  },
};

let currentFrame: number;
function render() {
  currentFrame = requestAnimationFrame(render);
  if (!redraw) {
    return;
  } else {
    redraw = false;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.save();

  context.setTransform(
    model.viewport.scale,
    0,
    0,
    model.viewport.scale,
    model.viewport.tx,
    model.viewport.ty
  );

  context.fillStyle = getRandomColor();
  context.fillRect(...getRandomRect());

  context.restore();
}

function startRenderLoop() {
  cancelAnimationFrame(currentFrame);
  render();
}

ctx.addEventListener("message", ({ data: { type, ...data } }) => {
  switch (type) {
    case "init": {
      canvas = data.canvas;
      canvas.width = data.width;
      canvas.height = data.height;
      context = canvas.getContext("2d", { alpha: true })!;
      startRenderLoop();
      break;
    }
    case "dimensions": {
      canvas.width = data.width;
      canvas.height = data.height;
      break;
    }
    case "viewport": {
      Object.assign(model.viewport, data);
      redraw = true;
      break;
    }
    case "update": {
      redraw = true;
      break;
    }
  }
});