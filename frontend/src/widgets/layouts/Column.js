import { BaseWidget } from "../../core/BaseWidget";
import { Position } from "../../themes/Position";
import "../../styles/layouts/column-widget.css";

/**
 * @class Column
 * @extends BaseWidget
 * @description A widget that arranges its children vertically with configurable alignment and spacing.
 */
export class Column extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Column widget.
   * @param {string} [options.tag="div"] - The HTML tag name for the column container.
   * @param {string} [options.position=Position.flex.start] - The vertical alignment of children.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets to be arranged in column.
   * @param {number} [options.gap=0] - The spacing between children in pixels.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {object} [options.events={}] - DOM event handlers.
   * @param {function} [options.onBeforeCreated=() => {}] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=() => {}] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=() => {}] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=() => {}] - Lifecycle hook called after attachment.
   */
  constructor({
    tag = "div",
    position = Position.flex.start,
    children = [],
    gap = "10px",
    style = {},
    className = [],
    props = {},
    events = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: tag,
      children,
      style,
      className: ["column-widget", position, ...className],
      props,
      events,
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
        this.setupGapStyles(el, gap);
        onAttached?.(el, {}, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {}, widget);
      },
    });
  }

  /**
   * @method setupGapStyles
   * @description Sets up column and row gap styles.
   * @param {HTMLElement} element - The column element.
   * @param {number} gap - The gap value in pixels.
   * @private
   */
  setupGapStyles(element, gap) {
    element.style.setProperty("column-gap", gap);
    element.style.setProperty("row-gap", gap);
  }
}