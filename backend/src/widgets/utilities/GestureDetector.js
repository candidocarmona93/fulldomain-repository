import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { throttle } from "../../utils/Helper";

/**
 * @class GestureDetector
 * @extends BaseWidget
 * @description A widget that detects and handles various touch and mouse gestures.
 */
export class GestureDetector extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the GestureDetector widget.
   * @param {function} [options.onTap=null] - Callback for tap gestures.
   * @param {function} [options.onDoubleTap=null] - Callback for double-tap gestures.
   * @param {function} [options.onLongPress=null] - Callback for long press gestures.
   * @param {function} [options.onHover=null] - Callback for hover events.
   * @param {function} [options.onSwipeLeft=null] - Callback for left swipe gestures.
   * @param {function} [options.onSwipeRight=null] - Callback for right swipe gestures.
   * @param {function} [options.onSwipeUp=null] - Callback for up swipe gestures.
   * @param {function} [options.onSwipeDown=null] - Callback for down swipe gestures.
   * @param {function} [options.onPinch=null] - Callback for pinch gestures.
   * @param {function} [options.onRotate=null] - Callback for rotate gestures.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {number} [options.swipeThreshold=50] - Minimum distance for swipe detection.
   * @param {number} [options.longPressDuration=500] - Duration for long press detection.
   * @param {number} [options.tapPreventionTime=300] - Time to prevent taps after gestures.
   * @param {object} [options.props={}] - Additional HTML properties.
   */
  constructor({
    onTap = null,
    onDoubleTap = null,
    onLongPress = null,
    onHover = null,
    onSwipeLeft = null,
    onSwipeRight = null,
    onSwipeUp = null,
    onSwipeDown = null,
    onPinch = null,
    onRotate = null,
    style = {},
    children = [],
    className = [],
    swipeThreshold = 50,
    longPressDuration = 500,
    tapPreventionTime = 300,
    ...props
  } = {}) {
    const defaultStyles = new Style({
      cursor: onTap ? "pointer" : "default",
      userSelect: "none",
      touchAction: "none",
      ...style,
    });

    super({
      tagName: "div",
      children,
      style: defaultStyles,
      className: [...className, "gesture-detector"],
      events: this.createEventHandlers(
        onTap, onDoubleTap, onLongPress, onHover, onSwipeLeft, onSwipeRight, 
        onSwipeUp, onSwipeDown, onPinch, onRotate
      ),
      ...props,
      onAttached: (el) => {
        this.gestureElement = el;
        this.setupAccessibilityAttributes(onTap);
      }
    });

    this.initializeGestureState(swipeThreshold, longPressDuration, tapPreventionTime);
  }

  /**
   * @method createEventHandlers
   * @description Creates event handlers for all supported gestures.
   * @param {function} onTap - Tap callback.
   * @param {function} onDoubleTap - Double tap callback.
   * @param {function} onLongPress - Long press callback.
   * @param {function} onHover - Hover callback.
   * @param {function} onSwipeLeft - Swipe left callback.
   * @param {function} onSwipeRight - Swipe right callback.
   * @param {function} onSwipeUp - Swipe up callback.
   * @param {function} onSwipeDown - Swipe down callback.
   * @param {function} onPinch - Pinch callback.
   * @param {function} onRotate - Rotate callback.
   * @returns {object} Event handlers object.
   * @private
   */
  createEventHandlers(onTap, onDoubleTap, onLongPress, onHover, onSwipeLeft, 
                     onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onRotate) {
    return {
      click: (e) => this.handleClick(e, onTap),
      dblclick: (e) => this.handleDoubleClick(e, onDoubleTap),
      mouseover: (e) => this.handleMouseOver(e, onHover),
      mouseleave: () => this.handleMouseLeave(onHover),
      mousedown: (e) => this.handlePressStart(e, onLongPress),
      mouseup: () => this.handlePressEnd(),
      touchstart: (e) => this.handleTouchStart(e),
      touchmove: throttle((e) => this.handleTouchMove(e, onPinch, onRotate), 16),
      touchend: (e) => this.handleTouchEnd(e, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown),
      keydown: (e) => this.handleKeyDown(e, onTap),
      contextmenu: (e) => this.suppressContextMenu(e)
    };
  }

  /**
   * @method initializeGestureState
   * @description Initializes gesture detection state variables.
   * @param {number} swipeThreshold - Swipe detection threshold.
   * @param {number} longPressDuration - Long press duration.
   * @param {number} tapPreventionTime - Tap prevention time.
   * @private
   */
  initializeGestureState(swipeThreshold, longPressDuration, tapPreventionTime) {
    this.touchStart = { x: 0, y: 0, time: 0 };
    this.lastTapTime = 0;
    this.touchPoints = [];
    this.isLongPress = false;
    this.swipeThreshold = swipeThreshold;
    this.longPressDuration = longPressDuration;
    this.tapPreventionTime = tapPreventionTime;
  }

  /**
   * @method setupAccessibilityAttributes
   * @description Sets up accessibility attributes for the gesture element.
   * @param {function} onTap - Tap callback for determining role.
   * @private
   */
  setupAccessibilityAttributes(onTap) {
    this.gestureElement.setAttribute('role', 'button');
    this.gestureElement.setAttribute('tabindex', onTap ? '0' : '-1');
  }

  // ====================
  // Core Event Handlers
  // ====================

  /**
   * @method handleClick
   * @description Handles click events with gesture prevention.
   * @param {Event} e - Click event.
   * @param {function} onTap - Tap callback.
   * @private
   */
  handleClick(e, onTap) {
    if (this.isLongPress || Date.now() - this.lastTapTime < this.tapPreventionTime) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.lastTapTime = Date.now();
    onTap?.(e);
  }

  /**
   * @method handleDoubleClick
   * @description Handles double-click events.
   * @param {Event} e - Double-click event.
   * @param {function} onDoubleTap - Double tap callback.
   * @private
   */
  handleDoubleClick(e, onDoubleTap) {
    onDoubleTap?.(e);
  }

  /**
   * @method handleMouseOver
   * @description Handles mouse over events for hover detection.
   * @param {Event} e - Mouse over event.
   * @param {function} onHover - Hover callback.
   * @private
   */
  handleMouseOver(e, onHover) {
    onHover?.({ type: 'hoverstart', event: e });
  }

  /**
   * @method handleMouseLeave
   * @description Handles mouse leave events for hover detection.
   * @param {function} onHover - Hover callback.
   * @private
   */
  handleMouseLeave(onHover) {
    onHover?.({ type: 'hoverend' });
  }

  /**
   * @method handlePressStart
   * @description Handles press start events for long press detection.
   * @param {Event} e - Press start event.
   * @param {function} onLongPress - Long press callback.
   * @private
   */
  handlePressStart(e, onLongPress) {
    this.isLongPress = false;
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      onLongPress?.(e);
    }, this.longPressDuration);

    this.setupPressCleanup(e);
  }

  /**
   * @method setupPressCleanup
   * @description Sets up cleanup for press events.
   * @param {Event} e - The original event.
   * @private
   */
  setupPressCleanup(e) {
    const cleanup = () => {
      clearTimeout(this.longPressTimer);
      e.target.removeEventListener('mouseup', cleanup);
      e.target.removeEventListener('touchcancel', cleanup);
    };

    e.target.addEventListener('mouseup', cleanup, { once: true });
    e.target.addEventListener('touchcancel', cleanup, { once: true });
  }

  /**
   * @method handlePressEnd
   * @description Handles press end events.
   * @private
   */
  handlePressEnd() {
    clearTimeout(this.longPressTimer);
  }

  /**
   * @method handleTouchStart
   * @description Handles touch start events for gesture detection.
   * @param {Event} e - Touch start event.
   * @private
   */
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    this.touchPoints = Array.from(e.touches).map(t => ({
      x: t.clientX,
      y: t.clientY
    }));
  }

  /**
   * @method handleTouchMove
   * @description Handles touch move events for advanced gestures.
   * @param {Event} e - Touch move event.
   * @param {function} onPinch - Pinch callback.
   * @param {function} onRotate - Rotate callback.
   * @private
   */
  handleTouchMove(e, onPinch, onRotate) {
    if (e.touches.length === 2 && onPinch) {
      this.handlePinchGesture(e, onPinch);
    }

    if (e.touches.length === 2 && onRotate) {
      this.handleRotateGesture(e, onRotate);
    }
  }

  /**
   * @method handleTouchEnd
   * @description Handles touch end events for swipe detection.
   * @param {Event} e - Touch end event.
   * @param {function} onSwipeLeft - Swipe left callback.
   * @param {function} onSwipeRight - Swipe right callback.
   * @param {function} onSwipeUp - Swipe up callback.
   * @param {function} onSwipeDown - Swipe down callback.
   * @private
   */
  handleTouchEnd(e, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;

    if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaX < 0 ? onSwipeLeft?.(e) : onSwipeRight?.(e);
    }

    if (Math.abs(deltaY) > this.swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      deltaY < 0 ? onSwipeUp?.(e) : onSwipeDown?.(e);
    }
  }

  // ====================
  // Advanced Gestures
  // ====================

  /**
   * @method handlePinchGesture
   * @description Handles pinch gesture detection.
   * @param {Event} e - Touch event.
   * @param {function} onPinch - Pinch callback.
   * @private
   */
  handlePinchGesture(e, onPinch) {
    const [t1, t2] = e.touches;
    const currentDistance = Math.hypot(
      t1.clientX - t2.clientX,
      t1.clientY - t2.clientY
    );

    const initialDistance = Math.hypot(
      this.touchPoints[0].x - this.touchPoints[1].x,
      this.touchPoints[0].y - this.touchPoints[1].y
    );

    onPinch?.(currentDistance / initialDistance);
  }

  /**
   * @method handleRotateGesture
   * @description Handles rotate gesture detection.
   * @param {Event} e - Touch event.
   * @param {function} onRotate - Rotate callback.
   * @private
   */
  handleRotateGesture(e, onRotate) {
    const [t1, t2] = e.touches;
    const currentAngle = Math.atan2(
      t2.clientY - t1.clientY,
      t2.clientX - t1.clientX
    );

    const initialAngle = Math.atan2(
      this.touchPoints[1].y - this.touchPoints[0].y,
      this.touchPoints[1].x - this.touchPoints[0].x
    );

    onRotate?.((currentAngle - initialAngle) * (180 / Math.PI));
  }

  /**
   * @method handleKeyDown
   * @description Handles keyboard events for accessibility.
   * @param {Event} e - Key down event.
   * @param {function} onTap - Tap callback.
   * @private
   */
  handleKeyDown(e, onTap) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTap?.(e);
    }
  }

  /**
   * @method suppressContextMenu
   * @description Suppresses context menu on long press.
   * @param {Event} e - Context menu event.
   * @private
   */
  suppressContextMenu(e) {
    e.preventDefault();
  }

  /**
   * @method onDestroy
   * @description Cleans up gesture detector resources.
   */
  onDestroy() {
    clearTimeout(this.longPressTimer);
    if (this.gestureElement) {
      this.gestureElement.removeAttribute('role');
      this.gestureElement.removeAttribute('tabindex');
    }
  }
}