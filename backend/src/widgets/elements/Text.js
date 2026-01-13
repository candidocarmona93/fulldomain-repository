import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { Themes } from "../../themes/Themes";
import "../../styles/elements/text-widget.css";

/**
 * @class Text
 * @extends BaseWidget
 * @description A basic text display widget that allows for customization of the text content, HTML tag, theme, size, and styles.
 */
export class Text extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Text widget.
   * @param {string} [options.text=""] - The text content to display. Defaults to an empty string.
   * @param {string} [options.tag="p"] - The HTML tag to use for rendering the text (e.g., 'p', 'h1', 'span'). Defaults to 'p'.
   * @param {string} [options.theme=Themes.text.type.dark] - The theme variant to apply to the text. Defaults to `Themes.text.type.dark`.
   * @param {string} [options.size=Themes.text.size.medium] - The size variant to apply to the text. Defaults to `Themes.text.size.medium`.
   * @param {object} [options.style={}] - An object containing custom CSS styles to apply to the text.
   * @param {string[]} [options.className=[]] - An array of additional CSS class names to apply to the text.
   * @param {object} [options.props={}] - An object containing additional HTML attributes to set on the text element.
   * @param {object} [options.events={}] - An object containing event listeners to attach to the text element.
   * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before the text element is created.
   * @param {function} [options.onCreated=null] - Lifecycle hook called after the text element is created.
   * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before the text element is attached to the DOM.
   * @param {function} [options.onAttached=null] - Lifecycle hook called after the text element is attached to the DOM.
   */
  constructor({
    text = "",
    textAsHtml = "",
    tag = "p",
    theme = Themes.text.type.dark,
    size = Themes.text.size.medium,
    style = {},
    className = [],
    props = {},
    events = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null
  } = {}) {

    super({
      tagName: tag,
      children: [String(text)],
      style,
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
        if (textAsHtml) {
          el.innerHTML = textAsHtml;
        }

        onAttached?.(el, {}, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {}, widget);
      },
    });

    this.className = [...this.className, ...this.createTextClasses(theme, size, className)];
    this.props = { ...this.props, ...this.createTextProps(props) };
    this.events = { ...this.events, ...this.createTextEvents(events) };
    this.storeTextConfig(text, tag, theme, size);
  }

  /**
   * @method createTextStyles
   * @description Creates the text style object.
   * @param {object} style - Custom styles.
   * @returns {Style} The style object.
   * @private
   */
  createTextStyles(style) {
    return style;
  }

  /**
   * @method createTextClasses
   * @description Creates the text CSS class array.
   * @param {string} theme - Theme classes.
   * @param {string} size - Size classes.
   * @param {string[]} className - Additional class names.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createTextClasses(theme, size, className) {
    return [
      "text-widget",
      ...theme,
      ...size,
      ...className
    ];
  }

  /**
   * @method createTextProps
   * @description Creates the text HTML properties.
   * @param {object} props - Additional properties.
   * @returns {object} HTML properties object.
   * @private
   */
  createTextProps(props) {
    return {
      ...props,
    };
  }

  /**
   * @method createTextEvents
   * @description Creates the text event handlers.
   * @param {object} events - Additional events.
   * @returns {object} Event handlers object.
   * @private
   */
  createTextEvents(events) {
    return {
      ...events,
    };
  }

  /**
   * @method storeTextConfig
   * @description Stores text configuration as instance properties.
   * @param {string} text - Text content.
   * @param {string} tag - HTML tag.
   * @param {string} theme - Theme classes.
   * @param {string} size - Size classes.
   * @private
   */
  storeTextConfig(text, tag, theme, size) {
    this.text = text;
    this.tag = tag;
    this.theme = theme;
    this.size = size;
  }

  /**
   * @method setText
   * @description Updates the text content.
   * @param {string} newText - The new text content.
   */
  setText(newText) {
    this.validateTextParameters(newText, this.tag);
    this.text = newText;

    if (this.rootElement) {
      this.rootElement.textContent = newText;
    }
  }

  /**
   * @method setTheme
   * @description Updates the text theme.
   * @param {string} newTheme - The new theme classes.
   */
  setTheme(newTheme) {
    if (this.rootElement) {
      // Remove old theme classes
      this.theme.forEach(themeClass => {
        this.rootElement.classList.remove(themeClass);
      });

      // Add new theme classes
      newTheme.forEach(themeClass => {
        this.rootElement.classList.add(themeClass);
      });
    }

    this.theme = newTheme;
  }
}