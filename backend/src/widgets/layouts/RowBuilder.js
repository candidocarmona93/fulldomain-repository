import { BaseWidget } from "../../core/BaseWidget";
import { Expand } from "./Expand";
import { Row } from "./Row";

/**
 * @class RowBuilder
 * @extends BaseWidget
 * @description A widget that dynamically generates a Row of items based on a builder function and count.
 */
export class RowBuilder extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the RowBuilder widget.
   * @param {string} [options.tag="section"] - The HTML tag name for the container.
   * @param {Function} options.builder - Function that returns a BaseWidget for each item.
   * @param {boolean} [options.stretch=true] - Whether items should stretch to fill vertical space.
   * @param {number} [options.count=0] - The number of items to generate.
   * @param {number} [options.gap=20] - The spacing between items in pixels.
   * @param {object} [options.breakpoints={}] - Breakpoint configurations for Expand widgets.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   */
  constructor({
    tag = "section",
    builder = null,
    count = 0,
    gap = "5px",
    breakpoints = {},
    style = {},
    className = [],
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    /**
   * @method validateBuilder
   * @description Validates that the builder parameter is a function.
   * @param {Function} builder - The builder function to validate.
   * @throws {Error} If builder is not a function.
   * @private
   */
    const validateBuilder = (builder) => {
      if (typeof builder !== "function") {
        throw new Error(`The builder should be a function. Type of ${typeof builder} provided.`);
      }
    }

    validateBuilder(builder);

    super({
      tagName: tag,
      style: {
        width: "100%",
        ...style
      },
      className,
      props,
      onBeforeCreated: (widget) => {
        onBeforeCreated?.(widget);
      },
      onCreated: (el, widget) => {
        onCreated?.(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached?.(el, widget);
      },
      onAttached: (el, widget) => {
        onAttached?.(el, {
          expandElement: this.expandElement,
          rowElement: this.rowElement
        }, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {
          expandElement: this.expandElement,
          rowElement: this.rowElement
        }, widget);
      },
    });

    this.builder = builder;
    this.count = count;
    this.breakpoints = breakpoints;
    this.gap = gap;
  }

  /**
   * @method generateListItems
   * @description Generates an array of widgets using the builder function.
   * @param {Function} builder - The builder function.
   * @param {number} count - The number of items to generate.
   * @returns {BaseWidget[]} Array of generated widgets.
   * @private
   */
  generateListItems() {
    return Array.from({ length: this.count }, (_, index) => this.builder(index));
  }

  /**
   * @method createRowChildren
   * @description Creates Expand widgets wrapping each list item.
   * @param {BaseWidget[]} listItems - The generated list items.
   * @param {object} breakpoints - Breakpoint configurations.
   * @param {boolean} stretch - Whether items should stretch.
   * @returns {Expand[]} Array of Expand widgets.
   * @private
   */
  createRowChildren(listItems) {
    return listItems.map((item) => {
      return new Expand({
        breakpoints: this.breakpoints,
        style: { marginBottom: this.gap, },
        children: [item],
        onAttached: (el) => {
          this.expandElement = el
        }
      });
    });
  }

  /**
   * @method createRowWidget
   * @description Creates the main Row widget with children.
   * @param {BaseWidget[]} children - The children to place in the row.
   * @param {number} gap - The gap between children.
   * @returns {Row} The configured Row widget.
   * @private
   */
  createRowWidget(children) {
    return new Row({
      gap: this.gap,
      children: children,
      onAttached: (el) => {
        this.rowElement = el
      }
    });
  }

  render() {
    const items = this.generateListItems();
    const children = this.createRowChildren(items);
    this.children = [
      this.createRowWidget(children)
    ];

    return super.render();
  }
}