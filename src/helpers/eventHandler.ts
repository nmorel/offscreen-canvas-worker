import { observable } from "mobx";
import { pan } from "../events/pan";
import { initPinchAction, pinch } from "../events/pinch";
import { zoomToPoint } from "../events/zoom";
import {
  NormalizedEvent,
  RegisteredEvent,
  ActionType,
  Action,
  PanAction,
} from "../typings/events";
import { OffscreenContext } from "./context";
import { getDistanceBetweenTwoPoints } from "./math";

export const LEFT_CLICK = 1;
export const MIDDLE_CLICK = 2;
export const RIGHT_CLICK = 3;

export class EventHandler {
  ctx: OffscreenContext;
  pointers = observable.map<string, RegisteredEvent>({}, { deep: false });

  constructor(ctx: OffscreenContext) {
    this.ctx = ctx;
  }

  registerEvent(
    {
      stopPropagation,
      preventDefault,
      target,
      currentTarget,
      ...evt
    }: NormalizedEvent,
    action: Action
  ) {
    this.pointers.set(evt.pointerId, {
      downEvent: evt,
      lastEvent: evt,
      action,
    });
  }

  isPanning() {
    if (this.pointers.size !== 1) {
      return false;
    }

    const [event] = Array.from(this.pointers.values());
    return event.action.type === ActionType.pan;
  }

  isPinching() {
    if (this.pointers.size !== 2) {
      return false;
    }

    const [event1, event2] = Array.from(this.pointers.values());
    return (
      event1.action.type === ActionType.pinch && event1.action === event2.action
    );
  }

  onDown(evt: NormalizedEvent) {
    const ctx = this.ctx;
    const store = ctx.store;

    //
    // Mouse left click or any other pointer
    //
    if (evt.pointerType !== "mouse" || evt.mouseButton === LEFT_CLICK) {
      // If pinching, the other pointer are ignored
      if (this.isPinching()) {
        return;
      }

      // If a pan is in progress, the only action possible is a pinch
      if (this.isPanning()) {
        if (evt.pointerType === "touch") {
          const [otherPointer] = Array.from(this.pointers.values());
          if (otherPointer.downEvent.pointerType === "touch") {
            // Pinch with 2 fingers
            const action = initPinchAction(evt, otherPointer, ctx);
            otherPointer.action = action;
            this.registerEvent(evt, action);
          }
        }
        return;
      }

      if (!this.pointers.size) {
        // No other action and the pointer is not over an interactive object => pan
        const action: PanAction = { type: ActionType.pan };
        this.registerEvent(evt, action);
      }
    }
    //
    // Right click
    //
    else if (evt.pointerType === "mouse" && evt.mouseButton === RIGHT_CLICK) {
      // If no current action, start panning
      if (!this.pointers.size) {
        // Pan
        const action: PanAction = { type: ActionType.pan };
        this.registerEvent(evt, action);
      }
    }
    //
    // Other mouse buttons
    //
    else {
      // Ignore the event
    }
  }

  onMove(evt: NormalizedEvent) {
    const ctx = this.ctx;
    const pointer = this.pointers.get(evt.pointerId);
    if (!pointer) {
      return;
    }

    evt.preventDefault();

    if (evt.pointerType === "touch") {
      // On touch devices, it's almost impossible to get a down and up event without a move
      // So we wait a bit to consider that the user wanted to move and not click
      pointer.action.ignoreClick =
        pointer.action.ignoreClick ||
        evt.timestamp - pointer.downEvent.timestamp >= 300 ||
        getDistanceBetweenTwoPoints(
          pointer.downEvent.clientX,
          pointer.downEvent.clientY,
          evt.clientX,
          evt.clientY
        ) > 30;
    } else {
      pointer.action.ignoreClick = true;
    }

    if (!pointer.action.ignoreClick) {
      return;
    }

    const prevEvent = pointer.lastEvent;
    pointer.lastEvent = evt;

    const actionParams = {
      ...pointer,
      ctx,
      prevEvent,
      action: pointer.action,
    };

    switch (pointer.action.type) {
      case ActionType.pan: {
        pan({
          ...actionParams,
          action: pointer.action,
        });
        break;
      }
      case ActionType.pinch: {
        pinch(
          {
            ...actionParams,
            action: pointer.action,
          },
          this
        );
        break;
      }
      default:
        // no action
        break;
    }
  }

  onUp(evt: NormalizedEvent) {
    const ctx = this.ctx;
    const { store } = ctx;

    const pointer = this.pointers.get(evt.pointerId);
    if (!pointer || !pointer.action) {
      return;
    }

    switch (pointer.action.type) {
      case ActionType.pan: {
        // Should be empty but just in case
        this.pointers.clear();
        break;
      }
      case ActionType.pinch: {
        const otherPointer = Array.from(this.pointers.values()).find(
          (p) => p !== pointer
        );
        if (otherPointer) {
          otherPointer.action = {
            type: ActionType.pan,
            ignoreClick: pointer.action.ignoreClick,
          };
        } else {
          this.pointers.clear();
        }
        break;
      }
      default:
        // no action
        break;
    }

    this.pointers.delete(evt.pointerId);
  }

  onMouseWheel(evt: NormalizedEvent) {
    zoomToPoint(evt, evt.deltaY, this.ctx);
  }
}
