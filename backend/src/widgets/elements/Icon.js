import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";

/**
 * @class Icon
 * @extends BaseWidget
 * @description A widget for displaying icons using font icon classes.
 */
export class Icon extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Icon widget.
   * @param {string} [options.tag="i"] - The HTML tag to use for the icon element.
   * @param {string} [options.icon=""] - The icon classes string (e.g., "fa fa-user").
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {object} [options.props={}] - Additional HTML attributes.
   * @param {object} [options.events={}] - Event listeners.
   */
  constructor({
    tag = "i",
    icon = "",
    className = [],
    style = {},
    props = {},
    events = {},
  } = {}) {
    super({
      tagName: tag,
      style
    });

    const iconClasses = this.parseIconClasses(icon);
    this.className = [...this.className, ...this.createIconClasses(iconClasses, className)];
    this.props = { ...this.props, ...this.createIconProps(props) };
    this.events = { ...this.events, ...this.createIconEvents(events) };

    this.storeIconConfig(tag, icon, iconClasses);
  }

  /**
   * @method validateIconParameters
   * @description Validates the icon and tag parameters.
   * @param {string} icon - The icon classes string.
   * @param {string} tag - The HTML tag name.
   * @throws {Error} If parameters are invalid.
   * @private
   */
  validateIconParameters(icon, tag) {
    if (typeof icon !== "string") {
      throw new Error("icon parameter in Icon widget expects a string of classes");
    }
    if (typeof tag !== "string") {
      throw new Error("tag parameter in Icon widget expects a string");
    }
  }

  /**
   * @method parseIconClasses
   * @description Parses the icon classes string into an array.
   * @param {string} icon - The icon classes string.
   * @returns {string[]} Array of icon classes.
   * @private
   */
  parseIconClasses(icon) {
    return icon.split(" ").flatMap((e) => e.split(" ")).filter(Boolean);
  }

  /**
   * @method createIconClasses
   * @description Creates the icon CSS class array.
   * @param {string[]} iconClasses - Parsed icon classes.
   * @param {string[]} className - Additional class names.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createIconClasses(iconClasses, className) {
    return [
      ...iconClasses,
      ...className
    ];
  }

  /**
   * @method createIconStyles
   * @description Creates the icon style object.
   * @param {object} style - Custom styles.
   * @returns {Style} The style object.
   * @private
   */
  createIconStyles(style) {
    return new Style({
      ...style
    });
  }

  /**
   * @method createIconProps
   * @description Creates the icon HTML properties.
   * @param {object} props - Additional properties.
   * @returns {object} HTML properties object.
   * @private
   */
  createIconProps(props) {
    return {
      ...props,
    };
  }

  /**
   * @method createIconEvents
   * @description Creates the icon event handlers.
   * @param {object} events - Additional events.
   * @returns {object} Event handlers object.
   * @private
   */
  createIconEvents(events) {
    return {
      ...events,
    };
  }

  /**
   * @method storeIconConfig
   * @description Stores icon configuration as instance properties.
   * @param {string} tag - HTML tag.
   * @param {string} icon - Original icon classes string.
   * @param {string[]} iconClasses - Parsed icon classes array.
   * @private
   */
  storeIconConfig(tag, icon, iconClasses) {
    this.tag = tag;
    this.icon = icon;
    this.iconClasses = iconClasses;
  }

  /**
   * @method setIcon
   * @description Updates the icon classes.
   * @param {string} newIcon - The new icon classes string.
   */
  setIcon(newIcon) {
    this.validateIconParameters(newIcon, this.tag);

    const newIconClasses = this.parseIconClasses(newIcon);

    if (this.rootElement) {
      // Remove old icon classes
      this.iconClasses.forEach(iconClass => {
        this.rootElement.classList.remove(iconClass);
      });

      // Add new icon classes
      newIconClasses.forEach(iconClass => {
        this.rootElement.classList.add(iconClass);
      });
    }

    this.icon = newIcon;
    this.iconClasses = newIconClasses;
  }
}