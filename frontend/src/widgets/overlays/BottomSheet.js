import { BaseWidget } from "../../core/BaseWidget";
import { Modal } from "./Modal";
import { Position } from "../../themes/Position";
import "../../styles/overlays/bottomsheet-widget.css";

/**
 * @class BottomSheet
 * @extends BaseWidget
 * @description A modal that slides up from the bottom of the screen, commonly used for actions or menus.
 */
export class BottomSheet extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the BottomSheet widget.
   * @param {boolean} [options.showCloseIcon=true] - Whether to show the close icon.
   * @param {BaseWidget[]} [options.content=[]] - Content widgets to display in the bottom sheet.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {boolean} [options.dismissable=false] - Whether the bottom sheet can be dismissed by clicking backdrop.
   */
  constructor({
    showCloseIcon = true,
    content = [],
    style = {},
    className = [],
    props = {},
    dismissable = false,
  } = {}) {
    super({});

    this.modal = this.createModal(showCloseIcon, Array.isArray(content) ? content : [content], style, className, props, dismissable);
  }

  /**
   * @method createModal
   * @description Creates the underlying modal instance for the bottom sheet.
   * @param {boolean} showCloseIcon - Whether to show close icon.
   * @param {BaseWidget[]} content - Content widgets.
   * @param {object} style - Custom CSS styles.
   * @param {string[]} className - Additional CSS class names.
   * @param {object} props - HTML properties.
   * @param {boolean} dismissable - Whether dismissable by backdrop click.
   * @returns {Modal} The configured modal instance.
   * @private
   */
  createModal(showCloseIcon, content, style, className, props, dismissable) {
    return new Modal({
      position: Position.flex.bottom,
      dismissable,
      showCloseIcon,
      style,
      className: ["bottomsheet-widget", "translateY", ...className],
      props,
      content: [
        this.createHandle(),
        ...content
      ]
    });
  }

  /**
   * @method createHandle
   * @description Creates the drag handle widget for the bottom sheet.
   * @returns {BaseWidget} The configured handle widget.
   * @private
   */
  createHandle() {
    return new BaseWidget({
      tagName: "div",
      className: ["bottomsheet-handle-widget"],
      events: {
        click: () => {
          this.close();
        },
      },
    });
  }

  /**
   * @method show
   * @description Shows the bottom sheet.
   */
  show() {
    this.modal.show();
  }

  /**
   * @method close
   * @description Closes the bottom sheet.
   */
  close() {
    this.modal.close();
  }
}