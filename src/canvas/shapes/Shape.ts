import { ObjectType } from "../../typings";
import { Image, ImageData } from "./Image";
import { Rectangle, RectangleData } from "./Rectangle";

export type ShapeData = RectangleData | ImageData;
export type Shape = Rectangle | Image;

export function createBoardShape(data: RectangleData): Rectangle;
export function createBoardShape(data: ImageData): Image;
export function createBoardShape(data: ShapeData): Shape {
  switch (data.objectType) {
    case ObjectType.rectangle:
      return new Rectangle(data as any);
    case ObjectType.image:
      return new Image(data as any);
  }
}
