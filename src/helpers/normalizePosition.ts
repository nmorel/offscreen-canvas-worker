import {Point, Position, Bounds, Transform} from '../typings/events'
import { OffscreenContext } from './context'

/* ###### Conversion to viewport transform */

const xToVptTransform = (x: number, transform: Transform) => {
    const invertedScale = 1 / transform.scale
    return invertedScale * x - transform.tx * invertedScale
}

const yToVptTransform = (y: number, transform: Transform) => {
    const invertedScale = 1 / transform.scale
    return invertedScale * y - transform.ty * invertedScale
}

const widthToVptTransform = (width: number, transform: Transform) => {
    return width / transform.scale
}

const heightToVptTransform = (height: number, transform: Transform) => {
    return height / transform.scale
}

export function convertPointToViewportTransform(
    {x, y}: Point,
    {store: {viewport: transform}}: OffscreenContext
) {
    return {
        x: xToVptTransform(x, transform),
        y: yToVptTransform(y, transform),
    }
}

export function convertBoundsToViewportTransform(
    bounds: Omit<Bounds, 'right' | 'bottom'>,
    {store: {viewport: transform}}: OffscreenContext
): Bounds {
    const left = xToVptTransform(bounds.left, transform)
    const top = yToVptTransform(bounds.top, transform)
    const width = widthToVptTransform(bounds.width, transform)
    const height = heightToVptTransform(bounds.height, transform)
    return {
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
    }
}

/* ###### Conversion from viewport transform */

const xFromVptTransform = (x: number, transform: Transform) => {
    return x * transform.scale + transform.tx
}

const yFromVptTransform = (y: number, transform: Transform) => {
    return y * transform.scale + transform.ty
}

const distanceFromVptTransform = (distance: number, transform: Transform) => {
    return distance * transform.scale
}

export function convertPointFromViewportTransform(
    {x, y}: Point,
    {store: {viewport: transform}}: OffscreenContext
) {
    return {
        x: xFromVptTransform(x, transform),
        y: yFromVptTransform(y, transform),
    }
}

export function convertBoundsFromViewportTransform(
    bounds: Omit<Bounds, 'right' | 'bottom'>,
    {store: {viewport: transform}}: OffscreenContext
): Bounds {
    const left = xFromVptTransform(bounds.left, transform)
    const top = yFromVptTransform(bounds.top, transform)
    const width = distanceFromVptTransform(bounds.width, transform)
    const height = distanceFromVptTransform(bounds.height, transform)
    return {
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
    }
}

/* ###### Normalize window coordinates */

export function normalizeWindowPosition(
    {x, y}: Position,
    container: HTMLElement,
    {store: {viewport: transform}}: OffscreenContext
): {
    pointerX: number
    pointerY: number
    boardX: number
    boardY: number
    clientX: number
    clientY: number
} {
    const box = container.getBoundingClientRect()
    const pointerX = x - box.left
    const pointerY = y - box.top

    const boardX = xToVptTransform(pointerX, transform)
    const boardY = yToVptTransform(pointerY, transform)

    return {pointerX, pointerY, boardX, boardY, clientX: x, clientY: y}
}

export function normalizeBoardPosition(
    {x, y}: Position,
    container: HTMLElement,
    {store: {viewport: transform}}: OffscreenContext
): {
    windowX: number
    windowY: number
    pointerX: number
    pointerY: number
    boardX: number
    boardY: number
} {
    const box = container.getBoundingClientRect()
    const pointerX = xFromVptTransform(x, transform)
    const pointerY = yFromVptTransform(y, transform)

    return {
        windowX: pointerX + box.left,
        windowY: pointerY + box.top,
        pointerX,
        pointerY,
        boardX: x,
        boardY: y,
    }
}
