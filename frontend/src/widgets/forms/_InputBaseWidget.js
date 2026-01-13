import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { Themes } from "../../themes/Themes";

/**
 * @class InputBaseWidget
 * @extends BaseWidget
 * @description
 * A robust base class for all input widgets with validation, accessibility,
 * lifecycle hooks, value transformation, and proper event handling.
 */
export class _InputBaseWidget extends BaseWidget {
  /**
   * @constructor
   * @param {Object} options - Configuration options
   * @param {string} [options.inputType="text"] - HTML input type
   * @param {string|string[]} [options.size=Themes.input.size.medium] - Size class(es)
   * @param {*} [options.value=null] - Initial value
   * @param {string} [options.name=""] - Input name
   * @param {string} [options.id] - Input ID (auto-generated if omitted)
   * @param {string} [options.label=""] - Label text
   * @param {boolean} [options.required=false] - Required field
   * @param {boolean} [options.disabled=false] - Disabled state
   * @param {Function} [options.validation=null] - Custom sync validator: (value) => boolean | string
   * @param {string} [options.errorMessage="This field is required"] - Default error
   * @param {Object} [options.style={}] - Custom inline styles
   * @param {string[]} [options.className=[]] - Extra container classes
   * @param {Object} [options.props={}] - Additional input attributes
   * @param {Function} [options.onChange=null] - (value, event) => void
   * @param {Function} [options.onFocus=null] - (event) => void
   * @param {Function} [options.onBlur=null] - (event) => void
   * @param {Function} [options.onGet=null] - Transform value on get
   * @param {Function} [options.onSet=null] - Transform value on set (including user input)
   * @param {Function} [options.onBeforeCreated=null] - Lifecycle
   * @param {Function} [options.onCreated=null] - Lifecycle
   * @param {Function} [options.onBeforeAttached=null] - Lifecycle
   * @param {Function} [options.onAttached=null] - Lifecycle
   * @param {Function} [options.onMounted=null] - Lifecycle
   */
  constructor({
    inputType = "text",
    value = null,
    name = "",
    id = `input-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    label = "",
    required = false,
    disabled = false,
    validation = null,
    errorMessage = "This field is required",
    style = {},
    className = [],
    props = {},
    events = {},
    onChange = null,
    onFocus = null,
    onBlur = null,
    onGet = null,
    onSet = null,
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: "div",
      className: [...className],
      props,
      events,
      onBeforeCreated,
      onCreated,
      onBeforeAttached,
      onAttached: (el, widget) => {
        onAttached?.(el, this.getElementReferences(), widget);
      },
      onMounted: (el, widget) => {
        this.syncValueToInput();
        this.updateUI();
        (this.onSet || this.value) && this.validate();
        onMounted?.(el, this.getElementReferences(), widget);
      },
    });

    // Bind event handlers once
    this.handleInputBound = this.handleInput.bind(this);
    this.handleBlurBound = this.handleBlur.bind(this);
    this.handleFocusBound = this.handleFocus.bind(this);

    // Store configuration
    this.id = id;
    this.inputType = inputType;
    this.size = Themes.input.size.medium
    this._value = value;
    this.name = name;
    this.required = required;
    this.validation = validation;
    this.errorMessage = errorMessage;
    this.disabled = disabled;
    this.label = label;
    this.onChange = onChange;
    this.onFocus = onFocus;
    this.onBlur = onBlur;
    this.onGet = onGet;
    this.onSet = onSet;

    // DOM references
    this.inputElement = null;
    this.labelElement = null;
    this.errorElement = null;

    // Config for reuse
    this.config = {
      style,
      className,
      props: {
        id: this.id,
        name: this.name,
        disabled: this.disabled,
        required: this.required,
        ...props,
      },
      events,
    };
  }

  /**
   * @method getElementReferences
   * @returns {Object} References to key DOM elements
   */
  getElementReferences() {
    return {
      inputElement: this.inputElement,
      labelElement: this.labelElement,
      errorElement: this.errorElement,
      container: this.element,
    };
  }

  /**
   * @method createLabel
   * @param {string} [labelClass="input-label-widget"]
   * @param {Object} [additionalProps={}]
   * @returns {BaseWidget|null}
   */
  createLabel({ labelClass = "input-label-widget", additionalProps = {} } = {}) {
    if (!this.label) return null;

    return new BaseWidget({
      tagName: "label",
      props: {
        for: this.id,
        ...additionalProps,
      },
      className: Array.isArray(labelClass) ? labelClass : [labelClass],
      children: [this.label],
      onAttached: (el) => {
        this.labelElement = el;
      },
    });
  }

  /**
   * @method createInput
   * @param {string} [inputClass="input-widget"]
   * @param {Object} [additionalProps={}]
   * @param {Object} [additionalEvents={}]
   * @returns {BaseWidget}
   */

  createInput({ inputClass = "input-widget", additionalProps = {}, style = {} } = {}) {
    return new BaseWidget({
      tagName: "input",
      props: {
        autocomplete: "off",
        type: this.inputType,
        "aria-invalid": "false",
        "aria-describedby": `${this.id}-error`,
        ...this.config.props,
        ...additionalProps,
      },
      className: [inputClass, this.size, ...this.config.className],
      style: { ...this.config.style, ...style },
      events: {
        input: this.handleInputBound,
        blur: this.handleBlurBound,
        focus: this.handleFocusBound,
        ...this.config.events,
      },
      onAttached: (el) => {
        this.inputElement = el;
        el.disabled = this.disabled;
        this.syncValueToInput();
      },
    });
  }

  /**
   * @method createError
   * @param {string} [errorClass="input-error-message-widget"]
   * @param {Object} [additionalProps={}]
   * @returns {BaseWidget}
   */
  createError({ errorClass = "input-error-message-widget", additionalProps = {} } = {}) {
    return new BaseWidget({
      tagName: "div",
      props: {
        id: `${this.id}-error`,
        role: "alert",
        "aria-live": "assertive",
        ...additionalProps,
      },
      className: [errorClass],
      style: { display: "none" },
      onAttached: (el) => {
        this.errorElement = el;
      },
    });
  }

  /**
   * @private
   * @method handleInput
   */
  handleInput(e) {
    const rawValue = e.target.value;
    const processedValue = this.onSet ? this.onSet.call(this, rawValue) : rawValue;

    this._value = processedValue;
    this.onChange?.(processedValue, e);
    this.updateUI();
    this.validate();
  }

  /**
   * @private
   * @method handleBlur
   */
  handleBlur(e) {
    this.onBlur?.(e);
    this.validate();
    this.updateUI();
  }

  /**
   * @private
   * @method handleFocus
   */
  handleFocus(e) {
    this.onFocus?.(e);

    // Hide any existing error message visually when the user starts interacting again
    if (this.errorElement) {
      this.errorElement.style.display = "none";
    }
    this.updateUI();
  }

  /**
   * @method validate
   * @returns {boolean} Validity
   */
  async validate({ validateClass = "input-invalid-state-widget" } = {}) {
    if (!this.inputElement || !this.errorElement) return true;

    let isValid = true;
    let currentErrorMessage = this.errorMessage;

    // Required check
    if (this.required && !this.hasValue()) {
      isValid = false;
    }

    // Custom validation
    if (typeof this.validation === "function") {
      const result = await this.validation(this._value);
      if (typeof result === "string") {
        isValid = false;
        currentErrorMessage = result;
      } else if (Boolean(result) === false) {
        isValid = true;
      }
    }

    // Update DOM
    this.inputElement.classList.toggle(validateClass, !isValid);
    this.inputElement.setAttribute("aria-invalid", String(!isValid));

    this.errorElement.textContent = isValid ? "" : currentErrorMessage;
    this.errorElement.style.display = isValid ? "none" : "block";

    return { isValid, error: !isValid ? currentErrorMessage : null };
  }

  /**
   * @method hasValue
   * @returns {boolean}
   */
  hasValue() {
    if (this._value === null || this._value === undefined) return false;

    if (typeof this._value === "string") {
      return this._value.trim().length > 0;
    }

    if (typeof this._value === "number") {
      return true;
    }

    if (Array.isArray(this._value)) {
      return this._value.length > 0;
    }

    return !!this._value;
  }

  isFocused() {
    return document.activeElement == this.inputElement;
  }

  /**
   * @method updateUI
   * @description Default UI state updates (filled/empty)
   */
  updateUI({ filledStateClass = "input-empty-state", emptyStateClass = "input-filled-state" } = {}) {
    if (!this.inputElement) return;

    const hasVal = this.hasValue();
    this.inputElement.classList.toggle(filledStateClass, hasVal);
    this.inputElement.classList.toggle(emptyStateClass, !hasVal);
  }

  /**
   * @private
   * @method syncValueToInput
   * @description Safely sync internal value to DOM input
   */
  syncValueToInput() {
    if (this.inputElement && this._value != null) {
      // Avoid triggering input event
      this.inputElement.value = this._value;
    }
  }

  // ————————————————————————
  // Public Value Accessors
  // ————————————————————————

  /** @returns {*} Current value (transformed via onGet) */
  get value() {
    return this.onGet ? this.onGet.call(this, this._value) : this._value;
  }

  /** @param {*} newValue - Sets value (transformed via onSet) */
  set value(newValue) {
    const processedValue = this.onSet ? this.onSet.call(this, newValue) : newValue;
    const changed = this._value !== processedValue;

    this._value = processedValue;

    if (this.inputElement) {
      this.inputElement.value = processedValue;
    }

    if (changed) {
      this.updateUI();
      this.validate();
    }
  }

  // ————————————————————————
  // Lifecycle: Cleanup
  // ————————————————————————

  /** @override */
  detach() {
    if (this.inputElement) {
      this.inputElement.removeEventListener("input", this.handleInputBound);
      this.inputElement.removeEventListener("blur", this.handleBlurBound);
      this.inputElement.removeEventListener("focus", this.handleFocusBound);
    }
    super.detach();
  }

  // ————————————————————————
  // Public API
  // ————————————————————————

  /** Focus the input */
  focus() {
    this.inputElement?.focus();
  }

  /** Blur the input */
  blur() {
    this.inputElement?.blur();
  }

  /** Reset to initial state */
  reset() {
    this.value = null;
    this.validate();
    this.updateUI();
  }

  /** Enable input */
  enable() {
    this.disabled = false;
    if (this.inputElement) {
      this.inputElement.disabled = false;
    }
  }

  /** Disable input */
  disable() {
    this.disabled = true;
    if (this.inputElement) {
      this.inputElement.disabled = true;
    }
  }
}