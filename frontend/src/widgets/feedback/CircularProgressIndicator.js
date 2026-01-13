import { BaseWidget } from "../../core/BaseWidget";
import { Row } from "../layouts/Row";
import { Expand } from "../layouts/Expand";
import { Text } from "../elements/Text";
import { Modal } from "../overlays/Modal";
import { Spinner } from "./Spinner";
import { Position } from "../../themes/Position";

/**
 * @class CircularProgressIndicator
 * @extends BaseWidget
 * @description A widget that displays a circular progress indicator within a modal for loading states.
 */
export class CircularProgressIndicator extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the CircularProgressIndicator.
   * @param {(string|BaseWidget)} [options.message="Please wait..."] - The message to display below the spinner.
   * @param {string} [options.position=Position.flex.center] - The position of the modal.
   * @param {boolean} [options.dismissable=true] - Whether the modal can be dismissed by clicking outside.
   * @param {number} [options.size=50] - The size of the spinner in pixels.
   * @param {string} [options.color="#6366f1"] - The color of the spinner.
   * @param {number} [options.speed=1.2] - The rotation speed of the spinner in seconds.
   * @param {number} [options.thickness=2] - The thickness of the spinner border in pixels.
   * @param {object} [options.style={}] - Custom CSS styles for the modal content.
   * @param {string[]} [options.className=[]] - Additional CSS class names for the modal.
   * @param {object} [options.props={}] - Additional HTML properties for the modal's root element.
   * @param {object} [options.events={}] - DOM event handlers for the root element.
   */
  constructor({
    message = "Please wait...",
    position = Position.flex.center,
    dismissable = true,
    size = 50,
    color = "#6366f1",
    speed = 1.2,
    thickness = 2,
    style = {},
    className = [],
    props = {},
    events = {},
  } = {}) {
    super({ tagName: "div", events });

    // Store configuration as instance properties
    this.message = message;
    this.position = position;
    this.dismissable = dismissable;
    this.size = size;
    this.color = color;
    this.speed = speed;
    this.thickness = thickness;
    this.style = style;
    this.className = className;
    this.props = props;

    // Initialize the main internal component
    this.modal = this.createModal();
  }

  /**
   * @method createModal
   * @description Creates the modal component with spinner and message.
   * @returns {Modal} The configured modal instance.
   * @private
   */
  createModal() {
    return new Modal({
      position: this.position,
      showCloseIcon: false,
      dismissable: this.dismissable,
      style: {
        width: "100%",
        maxWidth: "500px",
        ...this.style
      },
      className: ["fade", ...this.className],
      props: this.props,
      content: [
        new Row({
          children: [
            this.createSpinnerSection(),
            this.createMessageSection(),
          ],
          onAttached: (el) => {
            el.style.marginTop = "0";
          }
        })
      ]
    });
  }

  /**
   * @method createSpinnerSection
   * @description Creates the spinner section of the progress indicator.
   * @returns {Expand} The configured expand layout with spinner.
   * @private
   */
  createSpinnerSection() {
    return new Expand({
      breakpoints: { col: 2 },
      children: [
        new Spinner({
          size: this.size,
          color: this.color,
          speed: this.speed,
          thickness: this.thickness,
        }),
      ]
    });
  }

  /**
   * @method createMessageSection
   * @description Creates the message section of the progress indicator.
   * @returns {Expand} The configured expand layout with message.
   * @private
   */
  createMessageSection() {
    return new Expand({
      breakpoints: { col: 10 },
      style: { justifySelf: "flex-start", alignItems: "center" },
      children: [
        this.message instanceof BaseWidget
          ? this.message
          : new Text({
            text: `${this.message}`, style: { textAlign: "left" },
            onAttached: (el) => {
              this.textMessageElement = el
            }
          }),
      ]
    });
  }

  /**
   * @method setMessage
   * @description Updates the text message displayed below the spinner.
   * @param {object} options - Configuration options for updating the message.
   * @param {string} options.text - The new text to display in the message section.
   * @returns {void}
   */
  setMessage({ text }) {
    if (this.textMessageElement) {
      this.textMessageElement.textNodeValue = text;
    }
  }

  /**
   * @method show
   * @description Shows the circular progress indicator modal.
   * @returns {void}
   */
  show() {
    this.modal.show();
  }

  /**
   * @method close
   * @description Closes the circular progress indicator modal.
   * @returns {void}
   */
  close() {
    this.modal.close();
  }
}