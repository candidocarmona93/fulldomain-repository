import { BaseWidget } from "../../core/BaseWidget";
import "../../styles/layouts/expand-widget.css";

/**
 * @class Expand
 * @extends BaseWidget
 * @description A responsive layout widget that expands to fill available space based on breakpoint configurations.
 */
export class Expand extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Expand widget.
   * @param {string} [options.tag="div"] - The HTML tag name for the expand container.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets to be contained.
   * @param {object} [options.breakpoints={}] - Breakpoint configurations for responsive behavior.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {function} [options.onBeforeCreated=() => {}] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=() => {}] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=() => {}] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=() => {}] - Lifecycle hook called after attachment.
   */
  constructor({
    tag = "div",
    children = [],
    breakpoints = {},
    style = {},
    className = [],
    props = {},
    events = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null
  } = {}) {
    // Validate breakpoints
    if (Object.keys(breakpoints).length === 0) {
      throw new Error("Expand widget requires at least one breakpoint in the 'breakpoints' property");
    }
    super({
      tagName: tag,
      children,
      style,
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
        onAttached?.(el, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, widget);
      },
    });

    const columnClasses = this.generateColumnClasses(breakpoints);
    this.className = this.mergeClassNames(columnClasses, className);
  }

  /**
   * @method generateColumnClasses
   * @description Generates CSS column classes from breakpoint configurations.
   * @param {object} breakpoints - Breakpoint configuration object.
   * @returns {string[]} Array of CSS class names.
   * @private
   */
  generateColumnClasses(breakpoints) {
    return Object.entries(breakpoints).map(([breakpoint, size]) => {
      if (typeof size == 'number' && (size < 1 || size > 12)) {
        throw new Error(`Invalid column size ${size}. Must be between 1-12.`);
      }

      // Handle special cases
      if (size === 'auto') {
        return breakpoint === "col" ? "col-auto" : `${breakpoint}-auto`;
      }

      if (size === 'fill') {
        return breakpoint === "col" ? "col" : `${breakpoint}`;
      }

      return breakpoint === "col"
        ? `col-${size}`
        : `col-${breakpoint}-${size}`;
    });
  }

  /**
   * @method mergeClassNames
   * @description Merges base and additional class names.
   * @param {string[]} columnClasses - Generated column classes.
   * @param {string[]} className - Additional class names.
   * @returns {string[]} Merged class names array.
   * @private
   */
  mergeClassNames(columnClasses, className) {
    return [
      ...columnClasses,
      ...(Array.isArray(className) ? className : [className])
    ].filter(Boolean);
  }
}