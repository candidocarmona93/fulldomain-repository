import { BaseWidget } from "../../core/BaseWidget";
import "../../styles/overlays/backdrop-widget.css";
import { Position } from "../../themes/Position";

/**
 * @class Backdrop
 * @extends BaseWidget
 * @description A semi-transparent overlay used as a background for modal dialogs and other overlays.
 */
export class Backdrop extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Backdrop widget.
   * @param {string} [options.position=Position.flex.center] - The position of the backdrop content.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {boolean} [options.dismissable=false] - Whether the backdrop can be dismissed by clicking.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   */
  constructor({
    position = Position.flex.center,
    style = {},
    dismissable = false,
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: "div",
      style,
      className: ["backdrop-widget", position],
      events: {
        click: (event) => {
          this.handleBackdropClick(event);
        }
      },
      onBeforeCreated: (widget) => {
        onBeforeCreated?.(widget);
      },
      onCreated: (el, widget) => {
        onCreated?.(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached?.(el, widget);
      },
      onAttached: (el, widget) => {
        this.backdropElement = el;
        onAttached?.(el, {}, widget);
      },
      onMounted: (el, widget) => {
        this.backdropElement = el;
        onMounted?.(el, {}, widget);
      },
    });

    this.dismissable = dismissable;
  }

  /**
   * @method handleBackdropClick
   * @description Handles click events on the backdrop for dismissable behavior.
   * @param {Event} event - The click event.
   * @private
   */
  handleBackdropClick(event) {
    if (this.dismissable && event.target === this.backdropElement) {
      this.close?.();
    }
  }

  /**
   * @method close
   * @description Closes the backdrop (to be implemented by subclasses or instances).
   */
  close() {
    // To be implemented by subclasses or instances
  }
}