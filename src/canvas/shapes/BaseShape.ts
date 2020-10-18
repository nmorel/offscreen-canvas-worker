import { Bounds, Matrix, ObjectType } from "../../typings";

export type BaseShapeData = {
  id: string;
  objectType: ObjectType;
  matrix: Matrix;
  bounds: Bounds;
};

export abstract class BaseShape<T extends BaseShapeData> {
  obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  isVisible(vptBounds: Bounds) {
    return (
      this.obj.bounds.width > 0 &&
      this.obj.bounds.height > 0 &&
      this.obj.bounds.right >= vptBounds.left &&
      this.obj.bounds.left <= vptBounds.right &&
      this.obj.bounds.bottom >= vptBounds.top &&
      this.obj.bounds.top <= vptBounds.bottom
    );
  }

  render(
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
  ): void {
    context.save();
    context.transform(...this.obj.matrix);
    this.draw(context);
    context.restore();
  }

  abstract draw(
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
  ): void;
}
