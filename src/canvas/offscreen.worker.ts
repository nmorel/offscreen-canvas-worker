import { BoardObject } from "../model/boardObject";
import { ObjectType } from "../typings";

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
  objects: new Map<string, BoardObject>(),
  objectsOrder: [] as string[],
};

function renderObject(obj: BoardObject) {
  if (obj.objectType !== ObjectType.rectangle) return

  context.save()
  context.transform(...obj.matrix)
  context.fillStyle = obj.color
  context.fillRect(0, 0, obj.width, obj.height)
  context.restore()
}

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

  model.objectsOrder.forEach(objId => {
    const obj = model.objects.get(objId)
    if (obj) {
      renderObject(obj)
    }
  })

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
    case "objects.init": {
      data.objects.forEach((obj: BoardObject) => {
        model.objects.set(obj.id, obj)
        model.objectsOrder.push(obj.id)
      })
      redraw = true;
      break;
    }
  }
});
