import { BaseWidget } from "../../core/BaseWidget";
import { Modal } from "./Modal";
import { Position } from "../../themes/Position";
import "../../styles/overlays/offcanvas-widget.css";

/**
 * @class OffCanvas
 * @extends BaseWidget
 * @description A sidebar that slides in from the edge of the screen, commonly used for navigation menus.
 */
export class OffCanvas extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the OffCanvas widget.
   * @param {boolean} [options.showCloseIcon=true] - Whether to show the close icon.
   * @param {BaseWidget[]} [options.content=[]] - Content widgets to display in the offcanvas.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {boolean} [options.dismissable=false] - Whether the offcanvas can be dismissed by clicking backdrop.
   * @param {function} [options.onClose=() => {}] - Callback executed when the offcanvas closes.
   * @param {function} [options.onBeforeCreated=() => {}] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=() => {}] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=() => {}] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=() => {}] - Lifecycle hook called after attachment.
   */
  constructor({
    showCloseIcon = true,
    content = [],
    style = {},
    className = [],
    props = {},
    dismissable = false,
    onClose = () => { },
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({});

    this.modal = this.createModal(
      showCloseIcon, content, style, className, props, dismissable, onClose,
      onBeforeCreated, onCreated, onBeforeAttached, onAttached, onMounted
    );
  }

  /**
   * @method createModal
   * @description Creates the underlying modal instance for the offcanvas.
   * @param {boolean} showCloseIcon - Whether to show close icon.
   * @param {BaseWidget[]} content - Content widgets.
   * @param {object} style - Custom CSS styles.
   * @param {string[]} className - Additional CSS class names.
   * @param {object} props - HTML properties.
   * @param {boolean} dismissable - Whether dismissable by backdrop click.
   * @param {function} onClose - Close callback.
   * @param {function} onBeforeCreated - Before creation hook.
   * @param {function} onCreated - After creation hook.
   * @param {function} onBeforeAttached - Before attachment hook.
   * @param {function} onAttached - After attachment hook.
   * @returns {Modal} The configured modal instance.
   * @private
   */
  createModal(showCloseIcon, content, style, className, props, dismissable, onClose,
    onBeforeCreated, onCreated, onBeforeAttached, onAttached, onMounted) {
    return new Modal({
      position: Position.flex.topLeft,
      dismissable,
      showCloseIcon,
      style,
      className: ["offcanvas-widget", "translateX", ...className],
      props,
      onClose,
      content: Array.isArray(content) ? content : [content],
      onBeforeCreated: (widget) => {
        onBeforeCreated?.(widget);
      },
      onCreated: (el, widget) => {
        onCreated?.(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached?.(el, widget);
      },
      onAttached: (el, elements, widget) => {
        const backdropElement = elements.backdropElement;
        const modalElement = elements.modalElement;

        onAttached?.(el, { backdropElement, modalElement }, widget);
      },
      onMounted: (el, elements, widget) => {
        const backdropElement = elements.backdropElement;
        const modalElement = elements.modalElement;

        onMounted?.(el, { backdropElement, modalElement }, widget);
      },
    });
  }

  /**
   * @method show
   * @description Shows the offcanvas.
   */
  show() {
    this.modal.show();
  }

  /**
   * @method close
   * @description Closes the offcanvas.
   */
  close() {
    this.modal.close();
  }
}