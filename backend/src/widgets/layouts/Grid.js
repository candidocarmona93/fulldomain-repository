import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../styles/grid-widget.css";

/**
 * @class Grid
 * @extends BaseWidget
 * @description A CSS Grid layout widget with configurable gap, columns, and responsive behavior.
 */
export class Grid extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Grid widget.
   * @param {number} [options.gap=15] - The gap between grid items in pixels.
   * @param {number} [options.minmax=0] - The minimum size for auto-fit grid columns.
   * @param {number} [options.columns=0] - The fixed number of grid columns.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets to be arranged in grid.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {string} [options.tag="div"] - The HTML tag name for the grid container.
   */
  constructor({
    gap = 15,
    minmax = 0,
    columns = 0,
    style = {},
    className = [],
    children = [],
    props = {},
    tag = "div"
  } = {}) {
    super({
      tagName: tag,
      style: new Style({
        ...style,
      }),
      className: ["grid-widget", ...className],
      children,
      props,
      onAttached: (el) => {
        this.rootElement = el;
        this.setupGridStyles(gap, minmax, columns);
      }
    });
  }

  /**
   * @method setupGridStyles
   * @description Sets up CSS custom properties for grid configuration.
   * @param {number} gap - The gap between grid items.
   * @param {number} minmax - The minimum size for auto-fit columns.
   * @param {number} columns - The fixed number of columns.
   * @private
   */
  setupGridStyles(gap, minmax, columns) {
    this.rootElement.style.setProperty("--gap", `${gap}px`);

    if (minmax > 0) {
      this.rootElement.style.setProperty("--minmax", `${minmax}px`);
    } else if (columns > 0) {
      this.rootElement.style.setProperty("--columns", `${columns}`);
    }
  }
}