import { BaseWidget } from "../../core/BaseWidget";
import "../../styles/feedback/spinner-widget.css";

/**
 * @class Spinner
 * @extends BaseWidget
 * @description A simple, animated circular loading indicator.
 */
export class Spinner extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Spinner widget.
   * @param {number} [options.size=50] - The diameter of the spinner in pixels.
   * @param {string} [options.color="#6366f1"] - The CSS color of the spinner.
   * @param {number} [options.speed=1.2] - The rotation speed in seconds.
   * @param {number} [options.thickness=2] - The thickness of the border in pixels.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {object} [options.events={}] - DOM event handlers.
   */
  constructor({        
    size = 50,
    color = "#6366f1",
    speed = 1.2,
    thickness = 2,
    style = {},
    className = [],
    props = {},
    events = {},
  } = {}) {
    super({
      tagName: "div",
      style,
      className: ["spinner-widget", ...className],
      props,
      events,
      onAttached: (el) => {
        this.spinnerElement = el;
        this.setupSpinnerStyles();
      }
    });

    // Store configuration as instance properties
    this.size = size;
    this.color = color;
    this.speed = speed;
    this.thickness = thickness;
  }

  /**
   * @method setupSpinnerStyles
   * @description Sets up CSS variables for spinner styling.
   * @private
   */
  setupSpinnerStyles() {
    this.spinnerElement.style.setProperty("--spinner-width", `${this.size}px`);
    this.spinnerElement.style.setProperty("--spinner-height", `${this.size}px`);
    this.spinnerElement.style.setProperty("--spinner-border-width", `${this.thickness}px`);
    this.spinnerElement.style.setProperty("--spinner-speed", `${this.speed}s`);
    this.spinnerElement.style.setProperty("--spinner-color", this.color);
  }
}