import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Style } from "../../core/Style";
import { Icon } from "../elements/Icon";
import "../../styles/buttons/button-widget.css";

/**
 * @class IconButton
 * @extends BaseWidget
 * @description A button widget specifically designed for icon-based actions with optional label support.
 */
export class IconButton extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the IconButton widget.
   * @param {Icon} [options.icon=null] - Icon widget to display.
   * @param {string} [options.label=null] - Text label for the button.
   * @param {string} [options.image=null] - Image source for image-based button.
   * @param {string} [options.theme=Themes.button.type.primary] - The visual theme of the button.
   * @param {string} [options.size=Themes.button.size.medium] - The size of the button.
   * @param {boolean} [options.reverse=false] - Whether to reverse icon and label order.
   * @param {function} [options.onPressed=null] - Callback executed when the button is pressed.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {boolean} [options.disabled=false] - If true, the button will be disabled.
   * @param {object} [options.props={}] - Additional HTML attributes.
   */
  constructor({
    icon = null,
    label = null,
    image = null,
    theme = Themes.button.type.primary,
    size = Themes.button.size.medium,
    reverse = false,
    onPressed = null,
    style = {},
    className = [],
    disabled = false,
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: "button",
      style,
      events: {
        click: (e) => {
          if (!disabled && onPressed) onPressed(e);
        },
      },
      props: {
        type: "button",
        ...props,
      },
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
        this.setupIconButtonState(el, disabled);
        onAttached?.(el, {}, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {}, widget);
      },
    });

    this.children = this.createIconButtonChildren(icon, label, image, reverse);
    this.className = this.createIconButtonClasses(theme, size, className);
    this.storeIconButtonConfig(icon, label, image, theme, size, reverse, disabled);
  }

  /**
   * @method createIconButtonChildren
   * @description Creates the icon button's child elements array.
   * @param {Icon} icon - Icon widget.
   * @param {string} label - Button label.
   * @param {string} image - Image source.
   * @param {boolean} reverse - Whether to reverse order.
   * @returns {Array} Array of child widgets.
   * @private
   */
  createIconButtonChildren(icon, label, image, reverse) {
    const children = [];

    if (image) {
      children.push(this.createImageElement(image));
    } else if (icon) {
      children.push(icon);
    }

    if (label) {
      children.push(label);
    }

    return reverse ? children.reverse() : children;
  }

  /**
   * @method createImageElement
   * @description Creates an image element for image-based buttons.
   * @param {string} imageSrc - Image source URL.
   * @returns {BaseWidget} Image widget.
   * @private
   */
  createImageElement(imageSrc) {
    return new BaseWidget({
      tagName: "img",
      props: {
        src: imageSrc,
        alt: "button icon",
      },
      style: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      },
    });
  }

  /**
   * @method createIconButtonClasses
   * @description Creates the icon button's CSS class array.
   * @param {string} theme - Button theme classes.
   * @param {string} size - Button size classes.
   * @param {string[]} className - Additional class names.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createIconButtonClasses(theme, size, className) {
    return [
      "icon-button",
      theme,
      size,
      ...className
    ];
  }

  /**
   * @method setupIconButtonState
   * @description Sets up the icon button's initial state.
   * @param {HTMLElement} element - The button element.
   * @param {boolean} disabled - Whether button is disabled.
   * @private
   */
  setupIconButtonState(element, disabled) {
    element.disabled = disabled;
  }

  /**
   * @method storeIconButtonConfig
   * @description Stores icon button configuration as instance properties.
   * @param {Icon} icon - Button icon.
   * @param {string} label - Button label.
   * @param {string} image - Button image.
   * @param {string} theme - Button theme.
   * @param {string} size - Button size.
   * @param {boolean} reverse - Reverse order setting.
   * @param {boolean} disabled - Disabled state.
   * @private
   */
  storeIconButtonConfig(icon, label, image, theme, size, reverse, disabled) {
    this.icon = icon;
    this.label = label;
    this.image = image;
    this.theme = theme;
    this.size = size;
    this.reverse = reverse;
    this.disabled = disabled;
  }

  /**
   * @method setDisabled
   * @description Sets the disabled state of the icon button.
   * @param {boolean} disabled - The disabled state.
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.rootElement) {
      this.rootElement.disabled = disabled;
    }
  }
}