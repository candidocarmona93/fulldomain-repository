import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/feedback/badge-widget.css";

/**
 * @class Badge
 * @extends BaseWidget
 * @description A small, thematic component used for tagging, labeling, or counting.
 */
export class Badge extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Badge widget.
   * @param {string} [options.theme=Themes.badge.type.success] - The theme of the badge.
   * @param {string} [options.size=Themes.badge.size.xsmall] - The size of the badge.
   * @param {string} [options.label=""] - The text content of the badge.
   * @param {boolean} [options.closable=false] - Whether the badge has a close button.
   * @param {function} [options.onClose=() => {}] - Callback executed when the badge is closed.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {object} [options.events={}] - DOM event handlers.
   */
  constructor({
    theme = Themes.badge.type.success,
    size = Themes.badge.size.xsmall,
    label = "",
    closable = false,
    onClose = () => {},
    style = {},
    className = [],
    props = {},
    events = {}
  } = {}) {
    super({
      tagName: "div",
      style,
      className: ["badge-widget", theme, size, ...className],
      props,
      events,
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    // Store configuration as instance properties
    this.label = label;
    this.closable = closable;
    this.onClose = onClose;
    this.theme = theme;
    this.size = size;
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
      className: ["badge-close-icon-widget"],
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
   * @description Handles the close animation and removal of the badge.
   * @private
   */
  handleClose() {
    this.rootElement.style.opacity = "0";
    this.rootElement.style.transform = "translateY(-10px)";

    setTimeout(() => {
      this.rootElement.remove();
      this.onClose();
    }, 300);
  }

  /**
   * @method render
   * @override
   * @description Assembles the badge's children based on configuration.
   * @returns {HTMLElement} The rendered DOM element.
   */
  render() {
    this.children = [
      new BaseWidget({
        tagName: "span",
        children: [this.label],
        className: ["badge-label-widget"],
      }),
      this.closable ? this.createCloseButton() : null,
    ].filter(Boolean);

    return super.render();
  }
}