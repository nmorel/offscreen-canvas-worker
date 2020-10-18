import { OffscreenContext } from "../helpers/context";

export type Point = {
  x: number;
  y: number;
};

export type Transform = {
  scale: number;
  tx: number;
  ty: number;
};

export type Pointer = {
  timestamp: number;

  pointerId: string;
  pointerType: string;
  pressure: number;

  clientX: number;
  clientY: number;
  pointerX: number;
  pointerY: number;
  boardX: number;
  boardY: number;
  deltaY: number;

  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  mouseButton: number;
};

export type NormalizedEvent = Pointer & {
  stopPropagation: () => void;
  preventDefault: () => void;
  target?: HTMLElement;
  currentTarget?: HTMLElement;
};

export type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export enum AnimateMode {
  MOUSE_PAN = "MOUSE_PAN",
  TOUCH_PAN = "TOUCH_PAN",
  ALL = "ALL",
  NONE = "NONE",
}

export enum ActionType {
  pan = "pan",
  pinch = "pinch",
}

type BaseAction = {
  ignoreClick?: boolean;
};

export type PanAction = BaseAction & {
  type: ActionType.pan;
};

export type PinchAction = BaseAction & {
  type: ActionType.pinch;
  initialDistance: number;
  initialScale: number;
  centerPoint: Point;
};

export type Action = PanAction | PinchAction;

// export type Target = {
//   primary?: IBoardObject | IActiveSelection
//   secondary: {
//       type?: ObjectType | SecondaryObjectType | BoardContainerType
//       id?: string
//   }
//   boardObject?: IBoardObject
//   control?: Control
//   corner?: Corner
// }

export type RegisteredEvent = {
  // targetObject?: IBoardObject | IActiveSelection
  // boardObject?: IBoardObject
  downEvent: Pointer;
  lastEvent: Pointer;
  action: Action;
};

export type ParamsAction<T extends Action> = {
  ctx: OffscreenContext
  // targetObject?: IBoardObject | IActiveSelection
  downEvent: Pointer
  prevEvent: Pointer
  lastEvent: Pointer
  action: T
}
