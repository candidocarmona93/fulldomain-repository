import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/layouts/card-widget.css";

/**
 * @class Card
 * @extends BaseWidget
 * @description A card widget with header, body, and footer sections for structured content display.
 */
export class Card extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Card widget.
   * @param {BaseWidget|string} [options.header=null] - Content for the card header.
   * @param {BaseWidget|string} [options.body=null] - Content for the card body.
   * @param {BaseWidget|string} [options.footer=null] - Content for the card footer.
   * @param {object} [options.style={}] - Custom CSS styles for the card.
   * @param {string[]} [options.className=[]] - Additional CSS class names for the card.
   * @param {string[]} [options.headerClassName=[]] - CSS class names for the header.
   * @param {string[]} [options.bodyClassName=[]] - CSS class names for the body.
   * @param {string[]} [options.footerClassName=[]] - CSS class names for the footer.
   * @param {object} [options.headerStyle={}] - Custom CSS styles for the header.
   * @param {object} [options.bodyStyle={}] - Custom CSS styles for the body.
   * @param {object} [options.footerStyle={}] - Custom CSS styles for the footer.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   */
  constructor({
    theme = Themes.card.type.primary,
    size = Themes.card.size.medium,
    header = null,
    body = null,
    footer = null,
    style = {},
    events = {},
    className = [],
    headerClassName = [],
    bodyClassName = [],
    footerClassName = [],
    headerStyle = {},
    bodyStyle = {},
    footerStyle = {},
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
  } = {}) {
    super({
      tagName: "div",
      style: {
        ...style,
      },
      className: ["card-widget", theme, size, ...className],
      props: {
        "aria-label": "Card",
        ...props
      },
      events,
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
        const headerElement = this.headerElement;
        const bodyElement = this.bodyElement;
        const footerElement = this.footerElement;

        onAttached?.(el, { headerElement, bodyElement, footerElement }, widget);
      },
    });

    // Store configuration as instance properties
    this.header = header;
    this.body = body;
    this.footer = footer;
    this.headerClassName = headerClassName;
    this.bodyClassName = bodyClassName;
    this.footerClassName = footerClassName;
    this.headerStyle = headerStyle;
    this.bodyStyle = bodyStyle;
    this.footerStyle = footerStyle;
  }

  /**
   * @method createHeader
   * @description Creates the header section widget.
   * @returns {BaseWidget|null} The header widget or null if no header content.
   * @private
   */
  createHeader() {
    if (!this.header) return null;
    if (!this.header instanceof BaseWidget) throw new Error("Please provide an Basewidget to the header");
    const headerChildren = Array.isArray(this.header) ? this.header : [this.header];

    return new BaseWidget({
      tagName: "header",
      style: this.headerStyle,
      className: ["card-header-widget", ...this.headerClassName],
      children: headerChildren,
      onAttached: (el) => {
        this.headerElement = el;
      }
    });
  }

  /**
   * @method createBody
   * @description Creates the body section widget.
   * @returns {BaseWidget|null} The body widget or null if no body content.
   * @private
   */
  createBody() {
    if (!this.body) return null;
    if (!this.body instanceof BaseWidget) throw new Error("Please provide an Basewidget to the body");
    const bodyChildren = Array.isArray(this.body) ? this.body : [this.body];

    return new BaseWidget({
      tagName: "div",
      style: {
        height: "100%",
        ...this.bodyStyle
      },
      className: ["card-body-widget", ...this.bodyClassName],
      children: bodyChildren,
      onAttached: (el) => {
        this.bodyElement = el;
      }
    });
  }

  /**
   * @method createFooter
   * @description Creates the footer section widget.
   * @returns {BaseWidget|null} The footer widget or null if no footer content.
   * @private
   */
  createFooter() {
    if (!this.footer) return null;
    if (!this.footer instanceof BaseWidget) throw new Error("Please provide an Basewidget to the footer");
    const footerChildren = Array.isArray(this.footer) ? this.footer : [this.footer];

    return new BaseWidget({
      tagName: "footer",
      style: this.footerStyle,
      className: ["card-footer-widget", ...this.footerClassName],
      children: footerChildren,
      onAttached: (el) => {
        this.footerElement = el;
      }
    });
  }

  /**
   * @method render
   * @override
   * @description Assembles the card's children based on configuration.
   * @returns {HTMLElement} The rendered DOM element.
   */
  render() {
    this.children = [
      this.createHeader(),
      this.createBody(),
      this.createFooter(),
    ].filter(Boolean);

    return super.render();
  }
}