import { ObjectType } from "../../typings";
import { Image, ImageData } from "./Image";
import { Rectangle, RectangleData } from "./Rectangle";

export type ShapeData = RectangleData | ImageData;
export type Shape = Rectangle | Image;

export function createBoardShape(
  data: { objectType: ObjectType.rectangle } & Record<string, any>
): Rectangle;
export function createBoardShape(
  data: { objectType: ObjectType.image } & Record<string, any>
): Image;
export function createBoardShape(
  data: { objectType: ObjectType } & Record<string, any>
): Shape {
  switch (data.objectType) {
    case ObjectType.rectangle:
      return new Rectangle(data as any);
    case ObjectType.image:
      return new Image(data as any);
  }
}
