import { Matrix, ObjectType } from "../typings"

export type BaseShapeData = {
    id: string
    objectType: ObjectType
    matrix: Matrix
}

export abstract class BaseShape<T extends BaseShapeData> {
    obj: T

    constructor(obj: T) {
        this.obj = obj
    }

    render(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D): void {
        context.save()
        context.transform(...this.obj.matrix)
        this.draw(context)
        context.restore()
    }

    abstract draw(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D): void
}
