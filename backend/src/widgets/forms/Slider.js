import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../styles/slider-widget.css";
import { Themes } from "../../themes/Themes";

export class Slider extends BaseWidget {
  constructor({
    themes = Themes.input.type.primary,
    min = 0,
    max = 100,
    step = 10,
    value = 0,
    name = "",
    style = {},
    className = [],
    onChange = null,
    onFocus = null,
    onBlur = null,
    disabled = false,
    required = false,
    validation = null,
    errorMessage = "This field is required",
    id = `input-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    props = {},
    onAttached = () => { },
    formatTooltip = value => value,
  } = {}) {
    // Ensure valid min/max/step values
    const [validMin, validMax] = min > max ? [max, min] : [min, max];
    const validStep = Math.max(step, 0.0001);

    super({
      tagName: "div",
      style,
      className: ["slider-container", themes, ...className],
      onAttached: (el) => {
        onAttached(el);
        this.validate();
      }
    });

    // Initialize properties
    this.id = id;
    this._min = validMin;
    this._max = validMax;
    this._step = validStep;
    this._value = this.clampValue(value);
    this.name = name;
    this.required = required;
    this.validation = validation;
    this.errorMessage = errorMessage;
    this._disabled = disabled;
    this.onChange = onChange;
    this.onFocus = onFocus;
    this.onBlur = onBlur;
    this.formatTooltip = formatTooltip;
    this.thumbWidth = 16; // Default, updated on mount

    this.config = {
      style,
      className,
      props: {
        value: this._value,
        disabled: this._disabled,
        id: this.id,
        name,
        min: this._min,
        max: this._max,
        step: this._step,
        ...props,
      },
    };

    this.inputElement = null;
    this.tooltipElement = null;
    this.errorElement = null;
    this.filledTrackElement = null;
  }

  clampValue(value) {
    return Math.max(this._min, Math.min(this._max, value));
  }

  createInput() {
    return new BaseWidget({
      tagName: "input",
      props: {
        type: "range",
        "aria-invalid": "false",
        "aria-describedby": `${this.id}-error`,
        ...this.config.props,
      },
      className: ["slider-input", ...this.config.className],
      style: new Style({ ...this.config.style }),
      events: {
        input: (e) => this.handleInput(e),
        blur: (e) => this.handleBlur(e),
        focus: (e) => this.handleFocus(e),
      },
      onAttached: (el) => {
        this.inputElement = el;
        el.disabled = this._disabled;
        el.value = this._value;

        // Get actual thumb size from CSS
        const thumbSize = getComputedStyle(el).getPropertyValue('--thumb-size').trim();
        this.thumbWidth = parseFloat(thumbSize) || 16;
      },
    });
  }

  createFilledTrack() {
    return new BaseWidget({
      tagName: "div",
      className: ["slider-filled-track"],
      onAttached: (el) => (this.filledTrackElement = el),
    });
  }

  createTooltip() {
    return new BaseWidget({
      tagName: "div",
      className: ["slider-tooltip"],
      props: { "aria-hidden": "true" },
      onAttached: (el) => {
        this.tooltipElement = el;
        this.updateTooltipPosition();
      },
    });
  }

  createError() {
    return new BaseWidget({
      tagName: "div",
      props: {
        id: `${this.id}-error`,
        role: "alert",
        "aria-live": "polite"
      },
      className: ["slider-error-message-widget"],
      onAttached: (el) => (this.errorElement = el),
    });
  }

  handleInput(e) {
    this._value = parseFloat(e.target.value);
    this.updateTooltipPosition();
    this.updateFilledTrack();
    this.tooltipElement.classList.add("visible");
    this.onChange?.(this._value);
    this.validate();
  }

  handleBlur(e) {
    this.tooltipElement.classList.remove("visible");
    this.onBlur?.(e);
    this.validate();
  }

  handleFocus(e) {
    this.tooltipElement.classList.add("visible");
    this.onFocus?.(e);
    this.errorElement.classList.remove("visible");
  }

  updateTooltipPosition() {
    if (!this.inputElement) return;

    const sliderRect = this.inputElement.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const percentage = (this._value - this._min) / (this._max - this._min);
    const thumbOffset = percentage * (sliderWidth - this.thumbWidth);

    this.tooltipElement.style.left = `${thumbOffset + this.thumbWidth / 2}px`;
    this.tooltipElement.textContent = this.formatTooltip(this._value);
    this.updateFilledTrack();
  }

  updateFilledTrack() {
    if (!this.inputElement || !this.filledTrackElement) return;

    const percentage = ((this._value - this._min) / (this._max - this._min)) * 100;
    this.filledTrackElement.style.width = `${percentage}%`;
  }

  validate() {
    if (!this.errorElement) return true;

    let isValid = true;
    this.errorElement.classList.remove("visible");

    if (this.required && (isNaN(this._value) || this._value.toString().trim() === "")) {
      isValid = false;
    }

    if (this.validation) {
      const result = this.validation(this._value);
      if (typeof result === "string") {
        isValid = false;
        this.errorMessage = result;
      }
    }

    if (!isValid) {
      this.inputElement.classList.add("slider-invalid-state-widget");
      this.errorElement.classList.add("visible");
      this.errorElement.textContent = this.errorMessage;
    } else {
      this.inputElement.classList.remove("slider-invalid-state-widget");
    }

    this.inputElement.setAttribute("aria-invalid", !isValid);
    return isValid;
  }

  // Getters and setters for reactive properties
  get value() {
    return this._value;
  }

  set value(newValue) {
    this._value = this.clampValue(newValue);
    if (this.inputElement) {
      this.inputElement.value = this._value;
      this.updateTooltipPosition();
      this.updateFilledTrack();
      this.validate();
    }
  }

  get min() {
    return this._min;
  }

  set min(newMin) {
    this._min = Math.min(newMin, this._max);
    if (this.inputElement) {
      this.inputElement.min = this._min;
      this.value = this._value; // Re-clamp value
    }
  }

  get max() {
    return this._max;
  }

  set max(newMax) {
    this._max = Math.max(newMax, this._min);
    if (this.inputElement) {
      this.inputElement.max = this._max;
      this.value = this._value; // Re-clamp value
    }
  }

  get step() {
    return this._step;
  }

  set step(newStep) {
    this._step = Math.max(newStep, 0.0001);
    if (this.inputElement) {
      this.inputElement.step = this._step;
    }
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(newDisabled) {
    this._disabled = newDisabled;
    if (this.inputElement) {
      this.inputElement.disabled = this._disabled;
    }
  }

  render() {
    this.children = [
      this.createInput(),
      this.createFilledTrack(),
      this.createTooltip(),
      this.createError()
    ];
    return super.render();
  }
}