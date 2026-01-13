import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";

/**
 * @class SizedBox
 * @extends BaseWidget
 * @description A widget that creates a fixed-size box with configurable dimensions and constraints.
 */
export class SizedBox extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SizedBox widget.
   * @param {string|number} [options.width="0"] - Width of the box.
   * @param {string|number} [options.height="0"] - Height of the box.
   * @param {string|number} [options.flex=null] - Flex value for flexible sizing.
   * @param {string|number} [options.minWidth="none"] - Minimum width constraint.
   * @param {string|number} [options.maxWidth="none"] - Maximum width constraint.
   * @param {string|number} [options.minHeight="none"] - Minimum height constraint.
   * @param {string|number} [options.maxHeight="none"] - Maximum height constraint.
   * @param {object} [options.style={}] - Custom CSS styles.
   */
  constructor({
    width = "0",
    height = "0",
    flex = null,
    minWidth = "none",
    maxWidth = "none",
    minHeight = "none",
    maxHeight = "none",
    style = {},
  } = {}) {
    super({
      style: new Style({ 
        ...style,
        display: "block",
        minWidth,
        maxWidth,
        minHeight, 
        maxHeight
      }),
      onAttached: (el) => {
        this.rootElement = el;
      }
    });
    
    this.width = width;
    this.height = height;
    this.flex = flex;
  }

  /**
   * @method render
   * @override
   * @description Renders the sized box with applied dimensions.
   * @returns {HTMLElement} The rendered DOM element.
   */
  render() {
    this.style.width = this.width;
    this.style.height = this.height;
    
    if (this.width === "auto") {
      this.style.width = "auto";
      this.style.display = "inline-block";
    }
    
    if (this.height === "auto") {
      this.style.height = "auto";
    }

    if (this.flex !== null) {
      this.style.flex = this.flex;
    }
    
    return super.render();
  }
}