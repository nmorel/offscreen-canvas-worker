import { CanvasRendererHelper } from "../renderer/type";
import { BaseShapeData, BaseShape } from "./BaseShape";

export type ImageData = BaseShapeData & {
  src: string;
  width: number;
  height: number;
  kind?: "jpg" | "svg";
};

export class Image extends BaseShape<ImageData> {
  private imageBitmap?: ImageBitmap;
  private imageBlobPromise?: Promise<any> | null;
  private error = false;

  draw(
    context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
    helper: CanvasRendererHelper
  ) {
    if (this.error) return;

    if (this.imageBitmap) {
      context.drawImage(this.imageBitmap, 0, 0);
    } else if (!this.imageBlobPromise) {
      this.imageBlobPromise = helper
        .getImageBitmap(this.obj.id, this.obj.src, this.obj.kind)
        .then((imageBitmap) => (this.imageBitmap = imageBitmap))
        .catch((err) => {
          console.error(err);
          this.error = true;
        })
        .finally(() => {
          this.imageBlobPromise = null;
        });
    }
  }
}
