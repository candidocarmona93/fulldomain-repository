import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/buttons/button-widget.css";

/**
 * @class Button
 * @extends BaseWidget
 * @description A customizable button widget with support for labels, icons, themes, sizes, and full-width options.
 */
export class Button extends BaseWidget {
  constructor({
    label = "",
    prefixIcon = null,
    suffixIcon = null,
    theme = Themes.button.type.primary,
    size = Themes.button.size.medium,
    fullWidth = false,
    type = "button",
    onPressed = null,
    style = {},
    className = [],
    disabled = false,
    events = {},
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: "button",
      style: {
        width: fullWidth ? "100%" : "auto",
        ...style,
      },
      className: [
        "button-widget",
        theme,
        size,
        disabled ? "disabled" : "",
        ...className
      ].filter(Boolean),
      props: {
        type: type,
        disabled: disabled,
        ...props,
      },
      events: {
        click: (e) => {
          if (!this._disabled && onPressed) onPressed(e);
        },
        ...events,
      },
      onBeforeCreated: (widget) => {
        onBeforeCreated?.(widget);
      },
      onCreated: (el, widget) => {
        this.buttonElement = el;
        onCreated?.(el, widget);
      },
      onBeforeAttached: (el, widget) => {
        onBeforeAttached?.(el, widget);
      },
      onAttached: (el, widget) => {
        onAttached?.(el, {}, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {}, widget);
      },
    });

    this.label = label;
    this.prefixIcon = prefixIcon;
    this.suffixIcon = suffixIcon;
    this.theme = theme;
    this.size = size;
    this.fullWidth = fullWidth;

    this._disabled = disabled;
    this.disabled = disabled;
  }

  /**
   * @description Get the current disabled state
   * @returns {boolean}
   */
  get disabled() {
    return this._disabled;
  }

  /**
   * @description Toggle the disabled state, updating both the DOM attribute and CSS class
   * @param {boolean} value
   */
  set disabled(value) {
    this._disabled = !!value;
    if (!this.buttonElement) return;

    this.buttonElement.disabled = this._disabled;

    if (this._disabled) {
      this.buttonElement.classList.add("disabled");
      this.buttonElement.setAttribute("aria-disabled", "true");
    } else {
      this.buttonElement.classList.remove("disabled");
      this.buttonElement.removeAttribute("aria-disabled");
    }
  }

  render() {
    this.children = [
      this.prefixIcon,
      this.label,
      this.suffixIcon
    ].filter(Boolean);

    return super.render();
  }
}