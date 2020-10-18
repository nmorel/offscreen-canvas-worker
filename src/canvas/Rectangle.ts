import { BaseShapeData, BaseShape } from "./BaseShape";


export type RectangleData = BaseShapeData & {
    width: number,
    height: number,
    color: string,
}

export class Rectangle extends BaseShape<RectangleData> {
    draw(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) {
        context.fillStyle = this.obj.color
        context.fillRect(0, 0, this.obj.width, this.obj.height)
    }
}
