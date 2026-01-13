/**
 * @class Style
 * @description
 * A utility class for managing and applying CSS styles, including support for themes and scoped styling.  It allows you to define styles as an object, merge them with a theme, and apply them to DOM elements either directly or with a CSS scope.
 */
export class Style {
  /**
   * @constructor
   * @param {Object.<string, string>} [styles={}] - An object containing CSS styles, where keys are style properties (in camelCase) and values are their corresponding CSS values.
   * @param {Object.<string, string>} [theme={}] - An object containing theme values.  These values will be applied only if the corresponding style property is not already defined in the `styles` parameter.
   *
   * @example
   * // Creating a Style object with initial styles and a theme
   * const myStyle = new Style({
   * backgroundColor: 'blue',
   * color: 'white',
   * fontSize: '16px'
   * }, {
   * color: 'black',  // Will not override the 'white' color from styles
   * fontFamily: 'Arial'
   * });
   */
  constructor(styles = {}, theme = {}) {
    /**
     * @property {Object.<string, string>} styles - The user-defined styles for this Style instance.
     */
    this.styles = styles;       // User-defined styles
    /**
     * @property {Object.<string, string>} theme - The theme object for this Style instance.
     */
    this.theme = theme;         // Theme object with predefined values
  }

  /**
   * @method applyTheme
   * @description
   * Merges the styles with the theme.  Styles defined in the `styles` property take precedence over theme values.  This method modifies the `this.styles` object.
   *
   * @returns {void}
   *
   * @example
   * const myStyle = new Style({ backgroundColor: 'blue' }, { backgroundColor: 'red', fontFamily: 'Arial' });
   * myStyle.applyTheme();  // this.styles is now { backgroundColor: 'blue', fontFamily: 'Arial' }
   */
  applyTheme() {
    if (this.theme) {
      Object.keys(this.theme).forEach(key => {
        if (!this.styles[key]) {
          this.styles[key] = this.theme[key]; // Apply theme values only if not overridden
        }
      });
    }
  }

  /**
   * @method apply
   * @description
   * Applies the styles to a DOM element.  It can apply styles directly to the element or apply them to a set of child elements that match a given scoped CSS class.  It calls `applyTheme` internally before applying the styles.
   *
   * @param {HTMLElement} element - The DOM element to apply the styles to.
   * @param {string} [scopedClass=''] - An optional CSS class selector. If provided, the styles will be applied to all child elements of the given `element` that have this class. If not provided, styles are applied directly to the `element`.
   *
   * @returns {void}
   *
   * @example
   * // Applying styles directly to an element
   * const myDiv = document.getElementById('myDiv');
   * const myStyle = new Style({ color: 'green', fontSize: '18px' });
   * myStyle.apply(myDiv); // myDiv.style.color is now 'green'
   *
   * @example
   * // Applying styles to scoped elements
   * const myDiv = document.getElementById('myDiv');
   * myDiv.innerHTML = '<span class="my-text">Hello</span> <p class="my-text">World</p>';
   * const myStyle = new Style({ color: 'red' });
   * myStyle.apply(myDiv, 'my-text'); // Only the span and p elements with class 'my-text' will have red text.
   */
  apply(element, scopedClass = '') {
    this.applyTheme(); // Apply the theme before applying styles

    if (scopedClass) {
      // Apply styles with a scoped class (prefixing the styles)
      element.querySelectorAll(`.${scopedClass}`).forEach(scopedElement => {
        Object.assign(scopedElement.style, this.styles);
      });
    } else {
      // Apply styles directly if no scoped class is provided
      Object.assign(element.style, this.styles);
    }
  }

  /**
   * @method generate
   * @description
   * Generates a CSS string from the `styles` object.  It converts camelCase property names to kebab-case.
   *
   * @returns {string} A CSS string representation of the styles.
   *
   * @example
   * const myStyle = new Style({ backgroundColor: 'purple', fontWeight: 'bold' });
   * const cssString = myStyle.generate(); // Returns "background-color: purple; font-weight: bold;"
   */
  generate() {
    return Object.entries(this.styles)
      .map(([key, value]) => `${this.toKebabCase(key)}: ${value};`)
      .join(" ");
  }

  /**
   * @method toKebabCase
   * @description
   * Converts a camelCase string to kebab-case.
   *
   * @private
   * @param {string} str - The camelCase string to convert.
   * @returns {string} The kebab-case version of the string.
   *
   * @example
   * const result = Style.prototype.toKebabCase('backgroundColor'); // Returns "background-color"
   */
  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
}
