import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../../styles/layouts/center-widget.css";

/**
 * @class Center
 * @extends BaseWidget
 * @description A versatile layout widget that centers its children either horizontally or vertically using Flexbox.
 */
export class Center extends BaseWidget {
  static row = "row";
  static column = "column";

  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Center widget.
   * @param {string} [options.direction=Center.column] - The direction for centering (row/column).
   * @param {number} [options.gap=5] - The spacing between children in pixels.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets to be centered.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {object} [options.events={}] - DOM event handlers.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   */
  constructor({
    direction = Center.column,
    gap = 5,
    children = [],
    style = {},
    events = {},
    className = [],
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
  } = {}) {
    super({
      children,
      events,
      style: new Style({ ...style }),
      className: ["center-widget", direction, ...className],
      props,
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
        this.setupGapStyle(el, gap);
        onAttached?.(el, {}, widget);
      },
    });
  }

  /**
   * @method setupGapStyle
   * @description Sets up the CSS custom property for gap spacing.
   * @param {HTMLElement} element - The center element.
   * @param {number} gap - The gap value in pixels.
   * @private
   */
  setupGapStyle(element, gap) {
    element.style.setProperty("--gap", `${gap}px`);
  }
}