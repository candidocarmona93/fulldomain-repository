import { BaseWidget } from "../../core/BaseWidget";
import { Backdrop } from "./Backdrop";
import { Position } from "../../themes/Position";
import "../../styles/overlays/modal-widget.css";

/**
 * @class Modal
 * @extends Backdrop
 * @description A modal dialog overlay that displays content on top of a backdrop.
 */
export class Modal extends Backdrop {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Modal widget.
   * @param {string} [options.position=Position.flex.center] - The position of the modal.
   * @param {boolean} [options.showCloseIcon=false] - Whether to show a close button.
   * @param {boolean} [options.dismissable=false] - Whether the modal can be dismissed by clicking backdrop.
   * @param {string[]} [options.className=[]] - Additional CSS class names for the modal.
   * @param {BaseWidget[]} [options.content=[]] - Content widgets to display in the modal.
   * @param {object} [options.style={}] - Custom CSS styles for the modal.
   * @param {object} [options.props={}] - Additional HTML properties for the modal.
   * @param {function} [options.onClose=null] - Callback executed when the modal closes.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   * @param {function} [options.onMounted=null] - Lifecycle hook called after mounting.
   */
  constructor({
    position = Position.flex.center,
    showCloseIcon = false,
    dismissable = false,
    className = [],
    content = [],
    style = {},
    props = {},
    onClose = null,
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      position,
      dismissable,
      onBeforeCreated: (widget) => {
        onBeforeCreated?.(widget);
      },
      onCreated: (el, widget) => {
        onCreated?.(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached?.(el, widget);
      },
      onAttached: (el, _, widget) => {
        this.backdropElement = el;
        onAttached?.(el, { modalElement: this.modalElement }, widget);
      },
      onMounted: (el, _, widget) => {
        this.backdropElement = el;
        onMounted?.(el, { modalElement: this.modalElement }, widget);
      },
    });

    this.showCloseIcon = showCloseIcon;
    this.onClose = onClose;
    this.config = { style };

    this.children = [
      this.createModalWidget(className, content, props)
    ];
  }

  /**
   * @method createModalWidget
   * @description Creates the main modal content widget.
   * @param {string[]} className - Additional CSS class names.
   * @param {BaseWidget[]} content - Content widgets.
   * @param {object} props - HTML properties.
   * @returns {BaseWidget} The configured modal widget.
   * @private
   */
  createModalWidget(className, content, props) {
    return new BaseWidget({
      tagName: "div",
      className: ["modal-widget", ...className],
      style: {
        ...this.config.style
      },
      children: [
        this.showCloseIcon ? this.createCloseButton() : null,
        ...content
      ].filter(Boolean),
      props: {
        role: "dialog",
        "aria-hidden": "true",
        tabindex: "-1",
        ...props
      },
      onAttached: (el) => {
        this.modalElement = el;
      },
    });
  }

  /**
   * @method createCloseButton
   * @description Creates the close button widget.
   * @returns {BaseWidget} The configured close button widget.
   * @private
   */
  createCloseButton() {
    return new BaseWidget({
      tagName: "button",
      className: ["modal-header-close-icon-widget"],
      events: {
        click: () => {
          this.close();
        },
      },
      onAttached: (el) => {
        el.insertAdjacentHTML("beforeend", '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>');
      }
    });
  }

  /**
   * @method show
   * @description Shows the modal by adding it to the DOM and applying show classes.
   */
  show() {
    if (!document.body.contains(this.backdropElement)) {
      try {
        const render = super.render();
        super.mounted(render, this);
        document.body.appendChild(render);
      } catch (error) {
        console.log(error)
      }
    }

    requestAnimationFrame(() => {
      this.applyShowStyles();
    });
  }

  /**
   * @method applyShowStyles
   * @description Applies the show classes and accessibility attributes.
   * @private
   */
  applyShowStyles() {
    if (document.body.contains(this.backdropElement)) {
      this.backdropElement.classList.add("show");
      this.modalElement.classList.add("show");
      this.modalElement.setAttribute("aria-hidden", "false");
    }
  }

  /**
   * @method close
   * @description Closes the modal with animation and cleanup.
   */
  close() {
    if (!this.backdropElement) return;

    this.applyCloseStyles();
    this.scheduleCleanup();
  }

  /**
   * @method applyCloseStyles
   * @description Applies the close styles for animation.
   * @private
   */
  applyCloseStyles() {
    this.backdropElement.classList.remove("show");
    this.modalElement.classList.remove("show");
    document.activeElement?.blur(); //Removes focus from the active element
    this.modalElement.setAttribute("aria-hidden", "true");
  }

  /**
   * @method scheduleCleanup
   * @description Schedules the DOM cleanup and callback execution.
   * @private
   */
  scheduleCleanup() {
    setTimeout(() => {
      this.backdropElement?.remove();
      this.onClose?.();
    }, 300);
  }
}