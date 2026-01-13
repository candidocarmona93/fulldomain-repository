import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";

/**
 * @class Container
 * @extends BaseWidget
 * @description A generic container widget for grouping and styling child widgets.
 */
export class Container extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Container widget.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets to be contained.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {object} [options.events={}] - DOM event handlers.
   * @param {function} [options.onBeforeCreated=() => {}] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=() => {}] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=() => {}] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=() => {}] - Lifecycle hook called after attachment.
   * @param {function} [options.onMounted=() => {}] - Lifecycle hook called after mounting.
   */
  constructor({
    children = [],
    style = {},
    className = [],
    props = {}, 
    events = {},
    onBeforeCreated = () => { },
    onCreated = () => { },
    onBeforeAttached = () => { },
    onAttached = () => { },
    onMounted = () => {}
  } = {}) {
    super({
      tagName: "div",
      children,
      style: new Style({
        ...style
      }),
      className,
      props,
      events,
      onBeforeCreated: (widget) => {
        onBeforeCreated(widget);
      },
      onCreated: (el, widget) => {
        onCreated(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached(el, widget);
      },
      onAttached: (el, widget) => {
        onAttached(el, {}, widget);
      },
      onMounted: (el, widget) => {
        onMounted(el, {}, widget);
      },
    });
  }
}