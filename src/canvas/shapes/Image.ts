import { BaseShapeData, BaseShape } from "./BaseShape";

export type ImageData = BaseShapeData & {
  src: string;
  width: number;
  height: number;
};

export class Image extends BaseShape<ImageData> {
  private imageBitmap?: ImageBitmap;
  private imageBlobPromise?: Promise<any> | null;
  private error = false

  draw(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) {
    if (this.error) return

    if (this.imageBitmap) {
      context.drawImage(this.imageBitmap, 0, 0);
    } else if (!this.imageBlobPromise) {
      this.imageBlobPromise = fetch(this.obj.src)
        .then((response) => response.blob())
        .then((blob) => createImageBitmap(blob))
        .then((imageBitmap) => (this.imageBitmap = imageBitmap))
        .catch((err) => {
          console.error(err)
          this.error = true
        })
        .finally(() => {
          this.imageBlobPromise = null;
        });
    }
  }
}
