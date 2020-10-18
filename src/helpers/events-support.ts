// Code taken from https://github.com/stuyam/pressure/blob/master/src/helpers.js
let isSupportsMouse = false
let isSupportsTouch = false
let isSupportsPointer = false
let isSupportsTouchForce = false
let pendingSupportsTouchForceChange = false
let isSupportsTouchForceChange = false

if (typeof window !== 'undefined') {
    // only attempt to assign these in a browser environment.
    // on the server, this is a no-op, like the rest of the library
    if (typeof Touch !== 'undefined') {
        // In Android, new Touch requires arguments.
        try {
            // @ts-ignore
            if (Object.prototype.hasOwnProperty.call(Touch, 'force') || 'force' in new Touch()) {
                isSupportsTouchForce = true
            }
        } catch (e) {
            // Silent error
        }
    }
    isSupportsTouch = 'ontouchstart' in window.document /* && isSupportsTouchForce */
    isSupportsMouse = 'onmousemove' in window.document /* && !isSupportsTouch */
    isSupportsPointer = 'onpointermove' in window.document

    // The event also exists in ios device not supporting 3D Touch.
    // In this case, the event is never sent.
    // So we listen for the event and if we receive one, the device really support 3D Touch
    if ('ontouchforcechange' in window.document) {
        pendingSupportsTouchForceChange = true
        const onTouchForceChangeListener = (e: any) => {
            const touch = e.changedTouches && e.changedTouches.length && e.changedTouches[0]
            if (!touch || touch.touchType === 'stylus') return

            pendingSupportsTouchForceChange = false
            isSupportsTouchForceChange = true
            window.document.removeEventListener('touchforcechange', onTouchForceChangeListener)
        }
        // @ts-ignore
        window.document.addEventListener('touchforcechange', onTouchForceChangeListener)
    }
}

export const supportsMouse = isSupportsMouse
export const supportsTouch = isSupportsTouch
export const supportsPointer = isSupportsPointer
export const supportsTouchForce = isSupportsTouchForce
export const canReceiveTouchForceChangeEvent = () =>
    !pendingSupportsTouchForceChange && isSupportsTouchForceChange
