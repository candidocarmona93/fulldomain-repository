import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Style } from "../../core/Style";
import { Icon } from "../elements/Icon";
import "../../styles/buttons/button-widget.css";

/**
 * @class TextButton
 * @extends BaseWidget
 * @description A customizable text button widget with minimal styling, ideal for secondary actions.
 */
export class TextButton extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the TextButton widget.
   * @param {string} [options.label="Button"] - The text displayed on the button.
   * @param {Icon} [options.prefixIcon=null] - An Icon widget to display before the label.
   * @param {Icon} [options.suffixIcon=null] - An Icon widget to display after the label.
   * @param {string} [options.theme=Themes.button.type.default] - The visual theme of the button.
   * @param {string} [options.size=Themes.button.size.medium] - The size of the button.
   * @param {boolean} [options.fullWidth=false] - If true, the button takes full width of its container.
   * @param {string} [options.type="button"] - The type attribute of the button element.
   * @param {function} [options.onPressed=null] - Callback executed when the button is clicked.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {boolean} [options.disabled=false] - If true, the button will be disabled.
   * @param {object} [options.events={}] - Additional event listeners.
   * @param {object} [options.props={}] - Additional HTML attributes.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
   */
  constructor({
    label = "Button",
    prefixIcon = null,
    suffixIcon = null,
    theme = Themes.button.type.default,
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
  } = {}) {
    if (typeof label !== "string") {
      throw new Error("label prop in TextButton widget expects string");
    }

    super({
      tagName: "button",
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
        this.setupButtonState(el, disabled);
        onAttached?.(el, widget);
      },
    });

    this.children = this.createButtonChildren(prefixIcon, label, suffixIcon);
    this.className = [...this.className, ...this.createButtonClasses(theme, size, className)];
    this.style = { ...this.style, ...this.createButtonStyles(fullWidth, style) };
    this.events = { ...this.events, ...this.createButtonEvents(disabled, onPressed, events) };
    this.props = { ...this.props, ...this.createButtonProps(type, props) };
    
    this.storeButtonConfig(label, prefixIcon, suffixIcon, theme, size, fullWidth, disabled);
  }

  /**
   * @method createButtonChildren
   * @description Creates the button's child elements array.
   * @param {Icon} prefixIcon - Prefix icon widget.
   * @param {string} label - Button label.
   * @param {Icon} suffixIcon - Suffix icon widget.
   * @returns {Array} Array of child widgets.
   * @private
   */
  createButtonChildren(prefixIcon, label, suffixIcon) {
    return [
      prefixIcon ? prefixIcon : null,
      label,
      suffixIcon ? suffixIcon : null
    ].filter(Boolean);
  }

  /**
   * @method createButtonClasses
   * @description Creates the button's CSS class array.
   * @param {string} theme - Button theme classes.
   * @param {string} size - Button size classes.
   * @param {string[]} className - Additional class names.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createButtonClasses(theme, size, className) {
    return [
      ...theme,
      ...size,
      "button-widget",
      "button-widget--text",
      ...className
    ];
  }

  /**
   * @method createButtonStyles
   * @description Creates the button's style object.
   * @param {boolean} fullWidth - Whether button should be full width.
   * @param {object} style - Custom styles.
   * @returns {Style} The composed style object.
   * @private
   */
  createButtonStyles(fullWidth, style) {
    return new Style({
      width: fullWidth ? "100%" : "auto",
      ...style,
    });
  }

  /**
   * @method createButtonEvents
   * @description Creates the button's event handlers.
   * @param {boolean} disabled - Whether button is disabled.
   * @param {function} onPressed - Press callback.
   * @param {object} events - Additional events.
   * @returns {object} Event handlers object.
   * @private
   */
  createButtonEvents(disabled, onPressed, events) {
    return {
      click: (e) => {
        if (!disabled && onPressed) onPressed(e);
      },
      ...events,
    };
  }

  /**
   * @method createButtonProps
   * @description Creates the button's HTML properties.
   * @param {string} type - Button type attribute.
   * @param {object} props - Additional properties.
   * @returns {object} HTML properties object.
   * @private
   */
  createButtonProps(type, props) {
    return {
      type: type,
      ...props,
    };
  }

  /**
   * @method setupButtonState
   * @description Sets up the button's initial state.
   * @param {HTMLElement} element - The button element.
   * @param {boolean} disabled - Whether button is disabled.
   * @private
   */
  setupButtonState(element, disabled) {
    element.disabled = disabled;
  }

  /**
   * @method storeButtonConfig
   * @description Stores button configuration as instance properties.
   * @param {string} label - Button label.
   * @param {Icon} prefixIcon - Prefix icon.
   * @param {Icon} suffixIcon - Suffix icon.
   * @param {string} theme - Button theme.
   * @param {string} size - Button size.
   * @param {boolean} fullWidth - Full width setting.
   * @param {boolean} disabled - Disabled state.
   * @private
   */
  storeButtonConfig(label, prefixIcon, suffixIcon, theme, size, fullWidth, disabled) {
    this.label = label;
    this.prefixIcon = prefixIcon;
    this.suffixIcon = suffixIcon;
    this.theme = theme;
    this.size = size;
    this.fullWidth = fullWidth;
    this.disabled = disabled;
  }

  /**
   * @method setDisabled
   * @description Sets the disabled state of the button.
   * @param {boolean} disabled - The disabled state.
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.rootElement) {
      this.rootElement.disabled = disabled;
    }
  }

  /**
   * @method setLabel
   * @description Updates the button label.
   * @param {string} newLabel - The new label text.
   */
  setLabel(newLabel) {
    this.validateLabel(newLabel);
    this.label = newLabel;

    if (this.rootElement) {
      // Find the text node between icons and update it
      const children = Array.from(this.rootElement.childNodes);
      const textNode = children.find(node => node.nodeType === Node.TEXT_NODE);

      if (textNode) {
        textNode.textContent = newLabel;
      } else {
        // If no text node exists, create one between icons
        this.rebuildButtonContent();
      }
    }
  }

  /**
   * @method rebuildButtonContent
   * @description Rebuilds the button's content when label changes.
   * @private
   */
  rebuildButtonContent() {
    if (this.rootElement) {
      this.rootElement.innerHTML = '';

      const children = this.createButtonChildren(this.prefixIcon, this.label, this.suffixIcon);
      children.forEach(child => {
        if (child instanceof BaseWidget) {
          this.rootElement.appendChild(child.render());
        } else {
          this.rootElement.appendChild(document.createTextNode(child));
        }
      });
    }
  }
}