import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../../styles/feedback/shimmer-effect-widget.css";

/**
 * @class ShimmerEffect
 * @extends BaseWidget
 * @description A widget that displays a shimmer loading effect for content placeholders.
 */
export class ShimmerEffect extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the ShimmerEffect widget.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   */
  constructor({
    style = {},
    className = []
  } = {}) {
    super({
      style: new Style({ ...style }),
      className: ["shimmer-effect-container-widget", ...className],
      onAttached: (el) => {
        this.rootElement = el;
      }
    });
  }

  /**
   * @method createShimmer
   * @description Creates the shimmer effect element.
   * @returns {BaseWidget} The shimmer effect widget.
   * @private
   */
  createShimmer() {
    return new BaseWidget({
      tagName: "div",
      className: ["shimmer-effect"],
    });
  }

  /**
   * @method render
   * @override
   * @description Assembles the shimmer effect children.
   * @returns {HTMLElement} The rendered DOM element.
   */
  render() {
    this.children = [this.createShimmer()];
    return super.render();
  }
}