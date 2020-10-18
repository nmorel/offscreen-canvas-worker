import { OffscreenContext } from "../context";
import { ObjectType } from "../typings";
import { Rectangle } from "./rectangle";

export type BoardObject = Rectangle

export function createBoardObject(data: {objectType: ObjectType.rectangle} & Record<string, any>, ctx: OffscreenContext): Rectangle
export function createBoardObject(data: {objectType: ObjectType} & Record<string, any>, ctx: OffscreenContext): BoardObject {
    switch(data.objectType) {
        case ObjectType.rectangle :
            return new Rectangle(data as any, ctx)
    }
}
