import {
  canReceiveTouchForceChangeEvent,
  supportsPointer,
  supportsTouch,
} from "./events-support";
import { NormalizedEvent } from "../typings";
import { normalizeWindowPosition } from "./normalizePosition";
import { OffscreenContext } from "../context";
import { InteractionHandler } from "../model/interaction";

const addEventOptions = { passive: false } as EventListenerOptions;

/*
 * On some browsers, the event are read-only.
 * We copy the interesting part of the event to overload it
 */
const copyEvent = (event: any, container: HTMLDivElement): NormalizedEvent => ({
  timestamp: performance.now(),

  stopPropagation: () => event.stopPropagation?.(),
  preventDefault: () => event.preventDefault?.(),
  target: event.target,
  // override event.currentTarget, we want the container here but sometimes we listen to event on document and not the container
  currentTarget: container,

  pointerId: (event.pointerId || 0).toString(),
  pointerType: event.pointerType,
  pressure: event.pressure,

  clientX: event.clientX,
  clientY: event.clientY,
  pointerX: 0,
  pointerY: 0,
  boardX: 0,
  boardY: 0,
  deltaY: event.deltaY,

  altKey: !!event.altKey,
  ctrlKey: !!event.ctrlKey,
  metaKey: !!event.metaKey,
  shiftKey: !!event.shiftKey,

  mouseButton: "which" in event ? event.which : event.button - 1,
});

const addPointerCoords = (
  evt: NormalizedEvent,
  container: HTMLDivElement,
  clientX: number,
  clientY: number,
  ctx: OffscreenContext
) => {
  return Object.assign(
    evt,
    normalizeWindowPosition({ x: clientX, y: clientY }, container, ctx)
  );
};

export const normalizeMouseEvent = (
  container: HTMLDivElement,
  event: MouseEvent,
  ctx: OffscreenContext
): NormalizedEvent => {
  const evt = copyEvent(event, container);
  addPointerCoords(evt, container, event.clientX, event.clientY, ctx);

  evt.pointerId = "mouse";
  evt.pointerType = "mouse";
  evt.pressure = 0.5;

  return evt;
};

export const normalizeTouchEvent = (
  container: HTMLDivElement,
  event: TouchEvent,
  touch: Touch,
  forceTouch = 0.5,
  ctx: OffscreenContext
): NormalizedEvent => {
  const evt = copyEvent(event, container);
  addPointerCoords(evt, container, touch.clientX, touch.clientY, ctx);

  evt.target = touch.target as HTMLElement;

  evt.pointerId = (touch.identifier || 0).toString();
  evt.pointerType = "touch";
  evt.pressure =
    touch.touchType === "stylus" && typeof touch.force !== "undefined"
      ? touch.force
      : forceTouch;

  return evt;
};

export const normalizePointerEvent = (
  container: HTMLDivElement,
  event: PointerEvent,
  ctx: OffscreenContext
): NormalizedEvent => {
  const evt = copyEvent(event, container);
  addPointerCoords(evt, container, event.clientX, event.clientY, ctx);

  evt.pressure =
    evt.pointerType === "pen" ||
    (evt.pointerType === "touch" && canReceiveTouchForceChangeEvent())
      ? evt.pressure
      : 0.5;

  return evt;
};

export class InteractionListener {
  container: HTMLDivElement;
  eventHandler: InteractionHandler;
  ctx: OffscreenContext;

  _downEventsBinded = 0;
  _touchForceMap?: Map<number, number>;
  _eventTimeoutMap?: Map<number | "mouse", number>;

  constructor(container: HTMLDivElement, ctx: OffscreenContext) {
    this.container = container;
    this.eventHandler = ctx.store.interaction;
    this.ctx = ctx;
  }

  init() {
    if (supportsPointer) {
      this.container.addEventListener(
        "pointerdown",
        this.onPointerDown,
        addEventOptions
      );
      this.container.addEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
    } else if (supportsTouch) {
      this.container.addEventListener(
        "touchstart",
        this.onTouchStart,
        addEventOptions
      );
      this.container.addEventListener(
        "touchmove",
        this.onTouchMove,
        addEventOptions
      );
    } else {
      this.container.addEventListener(
        "mousedown",
        this.onMouseDown,
        addEventOptions
      );
      this.container.addEventListener(
        "mousemove",
        this.onMouseMove,
        addEventOptions
      );
    }

    this.container.addEventListener("wheel", this.onMouseWheel);
    this.container.addEventListener("contextmenu", this.onContextMenu);
  }

  removeListeners() {
    // Remove the listeners added in init
    if (supportsPointer) {
      this.container.removeEventListener(
        "pointerdown",
        this.onPointerDown,
        addEventOptions
      );
      this.container.removeEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
    } else if (supportsTouch) {
      this.container.removeEventListener(
        "touchstart",
        this.onTouchStart,
        addEventOptions
      );
      this.container.removeEventListener(
        "touchmove",
        this.onTouchMove,
        addEventOptions
      );
    } else {
      this.container.removeEventListener(
        "mousedown",
        this.onMouseDown,
        addEventOptions
      );
      this.container.removeEventListener(
        "mousemove",
        this.onMouseMove,
        addEventOptions
      );
    }

    this.container.removeEventListener("wheel", this.onMouseWheel);
    this.container.removeEventListener("contextmenu", this.onContextMenu);

    // And also remove the down events
    document.removeEventListener(
      "pointermove",
      this.onPointerMove,
      addEventOptions
    );
    document.removeEventListener(
      "pointerup",
      this.onPointerUp,
      addEventOptions
    );
    document.removeEventListener(
      "pointercancel",
      this.onPointerCancel,
      addEventOptions
    );

    document.removeEventListener(
      "mousemove",
      this.onMouseMove,
      addEventOptions
    );
    document.removeEventListener("mouseup", this.onMouseUp, addEventOptions);

    document.removeEventListener(
      "touchmove",
      this.onTouchMove,
      addEventOptions
    );
    document.removeEventListener("touchend", this.onTouchEnd, addEventOptions);
    document.removeEventListener(
      "touchcancel",
      this.onTouchCancel,
      addEventOptions
    );
    // @ts-ignore
    document.removeEventListener(
      "touchforcechange",
      this.onTouchForceChange,
      addEventOptions
    );
    document.removeEventListener(
      "selectstart",
      this.onSelectionStart,
      addEventOptions
    );

    this._downEventsBinded = 0;
  }

  destroy() {
    this.removeListeners();
  }

  onMouseWheel = (evt: WheelEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (!this.eventHandler.onMouseWheel) return;
    const normalizedEvent = normalizeMouseEvent(this.container, evt, this.ctx);
    this.eventHandler.onMouseWheel(normalizedEvent);
  };

  onContextMenu = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
  };

  onSelectionStart = (evt: Event) => {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  onMouseDown = (evt: MouseEvent) => {
    const normalizedEvent = normalizeMouseEvent(this.container, evt, this.ctx);
    this.eventHandler.onDown(normalizedEvent);
    this._bindDownEvents(normalizedEvent, () => {
      this.container.removeEventListener(
        "mousemove",
        this.onMouseMove,
        addEventOptions
      );
      document.addEventListener("mousemove", this.onMouseMove, addEventOptions);
      document.addEventListener("mouseup", this.onMouseUp, addEventOptions);
    });
  };

  onMouseMove = (evt: MouseEvent) => {
    const normalizedEvent = normalizeMouseEvent(this.container, evt, this.ctx);
    this.eventHandler.onMove(normalizedEvent);
  };

  onMouseUp = (evt: MouseEvent) => {
    const normalizedEvent = normalizeMouseEvent(this.container, evt, this.ctx);
    this._onMouseUp(normalizedEvent);
  };

  _onMouseUp(normalizedEvent: NormalizedEvent) {
    this.eventHandler.onUp(normalizedEvent);
    this._unbindDownEvents(normalizedEvent, () => {
      document.removeEventListener(
        "mousemove",
        this.onMouseMove,
        addEventOptions
      );
      document.removeEventListener("mouseup", this.onMouseUp, addEventOptions);
      this.container.addEventListener(
        "mousemove",
        this.onMouseMove,
        addEventOptions
      );
    });
  }

  onTouchStart = (evt: TouchEvent) => {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches.item(i)!;
      if (canReceiveTouchForceChangeEvent()) {
        this._setTouchForce(touch.identifier, touch.force || 0);
      }
      const normalizedEvent = normalizeTouchEvent(
        this.container,
        evt,
        touch,
        this._getTouchForce(touch.identifier),
        this.ctx
      );
      this.eventHandler.onDown(normalizedEvent);
      this._bindDownEvents(normalizedEvent, () => {
        this.container.removeEventListener(
          "touchmove",
          this.onTouchMove,
          addEventOptions
        );
        document.addEventListener(
          "touchmove",
          this.onTouchMove,
          addEventOptions
        );
        document.addEventListener("touchend", this.onTouchEnd, addEventOptions);
        document.addEventListener(
          "touchcancel",
          this.onTouchCancel,
          addEventOptions
        );
        if (canReceiveTouchForceChangeEvent()) {
          // @ts-ignore
          document.addEventListener(
            "touchforcechange",
            this.onTouchForceChange,
            addEventOptions
          );
        }
      });
    }
  };

  onTouchMove = (evt: TouchEvent) => {
    // In touch events, the interesting data are contained inside Touch object
    // https://developer.mozilla.org/fr/docs/Web/API/Touch
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches.item(i)!;
      const normalizedEvent = normalizeTouchEvent(
        this.container,
        evt,
        touch,
        this._getTouchForce(touch.identifier),
        this.ctx
      );
      this.eventHandler.onMove(normalizedEvent);
    }
  };

  onTouchEnd = (evt: TouchEvent) => {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches.item(i)!;
      const normalizedEvent = normalizeTouchEvent(
        this.container,
        evt,
        touch,
        this._getTouchForce(touch.identifier),
        this.ctx
      );
      this._onTouchEnd(normalizedEvent);
    }
  };

  _onTouchEnd(normalizedEvent: NormalizedEvent) {
    this.eventHandler.onUp(normalizedEvent);
    this._unbindDownEvents(normalizedEvent, () => {
      document.removeEventListener(
        "touchmove",
        this.onTouchMove,
        addEventOptions
      );
      document.removeEventListener(
        "touchend",
        this.onTouchEnd,
        addEventOptions
      );
      document.removeEventListener(
        "touchcancel",
        this.onTouchCancel,
        addEventOptions
      );
      this.container.addEventListener(
        "touchmove",
        this.onTouchMove,
        addEventOptions
      );
      if (canReceiveTouchForceChangeEvent()) {
        // @ts-ignore
        document.removeEventListener(
          "touchforcechange",
          this.onTouchForceChange,
          addEventOptions
        );
      }
    });
  }

  onTouchCancel = (evt: TouchEvent) => {
    this.onTouchEnd(evt);
  };

  onTouchForceChange = (evt: TouchEvent) => {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches.item(i)!;
      this._setTouchForce(touch.identifier, touch.force);
    }
  };

  onPointerDown = (evt: PointerEvent) => {
    const normalizedEvent = normalizePointerEvent(
      this.container,
      evt,
      this.ctx
    );
    this.eventHandler.onDown(normalizedEvent);
    this._bindDownEvents(normalizedEvent, () => {
      this.container.removeEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
      document.addEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
      document.addEventListener("pointerup", this.onPointerUp, addEventOptions);
      document.addEventListener(
        "pointercancel",
        this.onPointerCancel,
        addEventOptions
      );
    });
  };

  onPointerMove = (evt: PointerEvent) => {
    const normalizedEvent = normalizePointerEvent(
      this.container,
      evt,
      this.ctx
    );
    if (normalizedEvent.pressure) {
      this.eventHandler.onMove(normalizedEvent);
    } else {
      this._onPointerUp(normalizedEvent);
    }
  };

  onPointerUp = (evt: PointerEvent) => {
    const normalizedEvent = normalizePointerEvent(
      this.container,
      evt,
      this.ctx
    );
    this._onPointerUp(normalizedEvent);
  };

  _onPointerUp(normalizedEvent: NormalizedEvent) {
    this.eventHandler.onUp(normalizedEvent);
    this._unbindDownEvents(normalizedEvent, () => {
      document.removeEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
      document.removeEventListener(
        "pointerup",
        this.onPointerUp,
        addEventOptions
      );
      document.removeEventListener(
        "pointercancel",
        this.onPointerCancel,
        addEventOptions
      );
      this.container.addEventListener(
        "pointermove",
        this.onPointerMove,
        addEventOptions
      );
    });
  }

  onPointerCancel = (evt: PointerEvent) => {
    this.onPointerUp(evt);
  };

  _bindDownEvents(normalizedEvent: NormalizedEvent, cb: () => void) {
    if (!this._downEventsBinded) {
      if (normalizedEvent.shiftKey) {
        // Prevent IE from selecting text
        document.addEventListener(
          "selectstart",
          this.onSelectionStart,
          addEventOptions
        );
      }
      cb();
      this._downEventsBinded = 0;
    }
    this._downEventsBinded++;
  }

  _unbindDownEvents(normalizedEvent: NormalizedEvent, cb: () => void) {
    if (!this._downEventsBinded) return;

    this._downEventsBinded--;
    if (!this._downEventsBinded) {
      cb();
      document.removeEventListener(
        "selectstart",
        this.onSelectionStart,
        addEventOptions
      );
    }
  }

  _getTouchForce(touchId: number) {
    if (!this._touchForceMap) return;
    return this._touchForceMap.get(touchId);
  }

  _setTouchForce(touchId: number, touchForce: number) {
    if (!this._touchForceMap) this._touchForceMap = new Map();
    this._touchForceMap.set(touchId, touchForce);
    return touchForce;
  }

  _removeTouchForce(touchId: number, touchForce: number) {
    if (!this._touchForceMap) this._touchForceMap = new Map();
    this._touchForceMap.set(touchId, touchForce);
    return touchForce;
  }
}
