import { ObjectType } from "../typings";
import { Rectangle, RectangleData } from "./Rectangle";

export type ShapeData = RectangleData
export type Shape = Rectangle

export function createBoardShape(data: {objectType: ObjectType.rectangle} & Record<string, any>): Rectangle
export function createBoardShape(data: {objectType: ObjectType} & Record<string, any>): Shape {
    switch(data.objectType) {
        case ObjectType.rectangle :
            return new Rectangle(data as any)
    }
}
