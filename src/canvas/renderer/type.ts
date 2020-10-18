import { ShapeData } from "../shapes/Shape";

export interface CanvasRenderer {
  setDimensions({ width, height }: { width: number; height: number }): void;
  setViewport(data: { tx: number; ty: number; scale: number }): void;
  destroy(): void
}

export interface CanvasRendererHelper {
  getImageBitmap(id: string, src: string, kind?: 'jpg' | 'svg'): Promise<ImageBitmap>
}
