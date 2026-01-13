import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { Themes } from "../../themes/Themes";
import "../../styles/feedback/alert-widget.css";

/**
 * @class Alert
 * @extends BaseWidget
 * @description A widget for displaying alert messages with different themes, close button, and customizable styling.
 */
export class Alert extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Alert widget.
   * @param {string} [options.theme=Themes.alert.type.success] - The theme of the alert.
   * @param {string} [options.message="This is an alert..."] - The message content.
   * @param {function} [options.onClose=null] - Callback executed when the alert is closed.
   * @param {boolean} [options.showCloseButton=true] - Whether to display the close button.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {object} [options.events={}] - DOM event handlers.
   */
  constructor({
    theme = Themes.alert.type.success,
    message = "This is an alert...",
    onClose = null,
    showCloseButton = true,
    style = {},
    className = [],
    props = {},
    events = {},
  } = {}) {
    super({
      tagName: "div",
      style: new Style({ ...style }),
      className: ["alert-widget", theme, ...className],
      props: { ...props, "role": "alert" },
      events,
      onAttached: (el) => {
        this.rootElement = el;
      },
    });

    // Store configuration as instance properties
    this.theme = theme;
    this.message = message;
    this.onClose = onClose;
    this.showCloseButton = showCloseButton;
  }

  /**
   * @method createCloseButton
   * @description Creates the close button widget.
   * @returns {BaseWidget} The configured close button widget.
   * @private
   */
  createCloseButton() {
    return new BaseWidget({
      tagName: "span",
      children: [""],
      className: ["alert-close-icon-widget"],
      events: {
        click: (e) => {
          this.handleClose();
        }
      },
      onAttached: (el) => {
        el.insertAdjacentHTML("beforeend", '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>');
      }
    });
  }

  /**
   * @method handleClose
   * @description Handles the close animation and removal of the alert.
   * @private
   */
  handleClose() {
    this.rootElement.style.opacity = "0";
    this.rootElement.style.transform = "translateY(-10px)";
    
    setTimeout(() => {
      this.rootElement.remove();
      if (this.onClose) this.onClose();
    }, 300);
  }

  /**
   * @method render
   * @override
   * @description Assembles the alert's children based on configuration.
   * @returns {HTMLElement} The rendered DOM element.
   */
  render() {
    this.children = [
      new BaseWidget({
        tagName: "span",
        children: [this.message],
        className: ["alert-message-widget"],
      }),
      this.showCloseButton ? this.createCloseButton() : null,
    ].filter(Boolean);

    return super.render();
  }
}