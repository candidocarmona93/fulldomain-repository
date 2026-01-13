import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";

/**
 * @class InkWell
 * @extends BaseWidget
 * @description A widget that provides material design ink ripple effects on interaction.
 */
export class InkWell extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the InkWell widget.
   * @param {function} [options.onTap=null] - Callback for tap events.
   * @param {BaseWidget[]} [options.children=[]] - Child widgets.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {string} [options.rippleColor="currentColor"] - Color of the ripple effect.
   * @param {boolean} [options.disabled=false] - Whether the inkwell is disabled.
   * @param {object} [options.hoverStyle={}] - Styles applied on hover.
   * @param {object} [options.focusStyle={}] - Styles applied on focus.
   * @param {number} [options.rippleDuration=600] - Duration of ripple animation in ms.
   * @param {boolean} [options.disableRipple=false] - Whether to disable ripple effects.
   * @param {object} [options.props={}] - Additional HTML properties.
   */
  constructor({
    onTap = null,
    children = [],
    style = {},
    className = [],
    rippleColor = "currentColor",
    disabled = false,
    hoverStyle = {},
    focusStyle = {},
    rippleDuration = 600,
    disableRipple = false,
    props = {}
  } = {}) {
    const defaultStyles = this.createDefaultStyles(style, disabled, disableRipple);

    super({
      tagName: "div",
      children,
      style: defaultStyles,
      className: [...className, "inkwell"],
      props,
      onAttached: (el) => {
        this.inkwellElement = el;
        this.setupAccessibilityAttributes(disabled);
      }
    });

    this.initializeInkwellState(rippleColor, disabled, rippleDuration, disableRipple);
    this.setupEventHandlers(onTap);
    this.ensureGlobalStyles();
  }

  /**
   * @method createDefaultStyles
   * @description Creates the default styles for the inkwell.
   * @param {object} style - Custom styles.
   * @param {boolean} disabled - Whether disabled.
   * @param {boolean} disableRipple - Whether ripple is disabled.
   * @returns {Style} The composed style object.
   * @private
   */
  createDefaultStyles(style, disabled, disableRipple) {
    return new Style({
      position: "relative",
      overflow: "hidden",
      cursor: disabled ? "default" : "pointer",
      userSelect: "none",
      transition: "opacity 150ms, transform 100ms",
      touchAction: "manipulation",
      "&:active": !disabled && !disableRipple ? {
        transform: "scale(0.97)"
      } : {},
      ...style,
    });
  }

  /**
   * @method initializeInkwellState
   * @description Initializes inkwell state variables.
   * @param {string} rippleColor - Ripple color.
   * @param {boolean} disabled - Whether disabled.
   * @param {number} rippleDuration - Ripple duration.
   * @param {boolean} disableRipple - Whether ripple is disabled.
   * @private
   */
  initializeInkwellState(rippleColor, disabled, rippleDuration, disableRipple) {
    this.isPressed = false;
    this.rippleElements = new Set();
    this.disabled = disabled;
    this.rippleColor = rippleColor;
    this.rippleDuration = rippleDuration;
    this.disableRipple = disableRipple;
  }

  /**
   * @method setupAccessibilityAttributes
   * @description Sets up accessibility attributes.
   * @param {boolean} disabled - Whether disabled.
   * @private
   */
  setupAccessibilityAttributes(disabled) {
    this.inkwellElement.setAttribute("role", "button");
    this.inkwellElement.setAttribute("tabindex", disabled ? "-1" : "0");
    if (disabled) {
      this.inkwellElement.setAttribute("aria-disabled", "true");
    }
  }

  /**
   * @method setupEventHandlers
   * @description Sets up event handlers for interactions.
   * @param {function} onTap - Tap callback.
   * @private
   */
  setupEventHandlers(onTap) {
    if (!this.disabled) {
      this.events = {
        click: (e) => this.handleTap(e, onTap),
        keydown: (e) => this.handleKeyPress(e, onTap),
        mousedown: (e) => this.startRipple(e),
        mouseup: this.clearScale,
        mouseleave: this.clearScale,
        touchstart: (e) => this.startRipple(e),
        touchend: this.clearScale,
        touchcancel: this.clearScale,
      };
    }
  }

  /**
   * @method ensureGlobalStyles
   * @description Ensures global ripple styles are added to the document.
   * @private
   */
  ensureGlobalStyles() {
    if (!document.getElementById("inkwell-global-styles")) {
      const rippleStyles = document.createElement("style");
      rippleStyles.innerHTML = this.createRippleStyles();
      document.head.appendChild(rippleStyles);
      rippleStyles.id = "inkwell-global-styles";
    }
  }

  /**
   * @method createRippleStyles
   * @description Creates the CSS for ripple animations.
   * @returns {string} The CSS styles.
   * @private
   */
  createRippleStyles() {
    return `
      .inkwell-ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: inkwell-ripple 600ms linear;
        pointer-events: none;
        background-color: currentColor;
        opacity: 0.3;
      }

      @keyframes inkwell-ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
  }

  /**
   * @method handleTap
   * @description Handles tap/click events.
   * @param {Event} e - Click event.
   * @param {function} callback - Tap callback.
   * @private
   */
  handleTap(e, callback) {
    if (this.disabled) return;
    callback?.(e);
  }

  /**
   * @method handleKeyPress
   * @description Handles keyboard events for accessibility.
   * @param {Event} e - Key event.
   * @param {function} callback - Tap callback.
   * @private
   */
  handleKeyPress(e, callback) {
    if (this.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      this.createRipple(this.inkwellElement.getBoundingClientRect());
      this.handleTap(e, callback);
    }
  }

  /**
   * @method startRipple
   * @description Starts the ripple effect on interaction.
   * @param {Event} e - Interaction event.
   * @private
   */
  startRipple(e) {
    if (this.disabled || this.isPressed) return;
    this.isPressed = true;
    
    const rect = this.inkwellElement.getBoundingClientRect();
    const isTouch = e.type === "touchstart";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    this.createRipple({
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width,
      height: rect.height
    });
  }

  /**
   * @method createRipple
   * @description Creates and animates a ripple element.
   * @param {object} position - Ripple position and size.
   * @private
   */
  createRipple({ x, y, width, height }) {
    if (this.disabled || this.disableRipple) return;

    const maxSize = Math.max(width, height);
    const ripple = document.createElement("div");
    ripple.className = "inkwell-ripple";
    
    this.styleRippleElement(ripple, x, y, maxSize);
    this.attachRippleElement(ripple);
  }

  /**
   * @method styleRippleElement
   * @description Applies styles to the ripple element.
   * @param {HTMLElement} ripple - The ripple element.
   * @param {number} x - X position.
   * @param {number} y - Y position.
   * @param {number} maxSize - Maximum size.
   * @private
   */
  styleRippleElement(ripple, x, y, maxSize) {
    ripple.style.width = ripple.style.height = `${maxSize}px`;
    ripple.style.left = `${x - maxSize / 2}px`;
    ripple.style.top = `${y - maxSize / 2}px`;
    ripple.style.animationDuration = `${this.rippleDuration}ms`;

    if (this.rippleColor !== "currentColor") {
      ripple.style.backgroundColor = this.rippleColor;
    }
  }

  /**
   * @method attachRippleElement
   * @description Attaches and manages the ripple element lifecycle.
   * @param {HTMLElement} ripple - The ripple element.
   * @private
   */
  attachRippleElement(ripple) {
    this.inkwellElement.appendChild(ripple);
    this.rippleElements.add(ripple);

    const removeRipple = () => {
      ripple.remove();
      this.rippleElements.delete(ripple);
    };

    ripple.addEventListener("animationend", removeRipple);
    ripple.addEventListener("animationcancel", removeRipple);
  }

  /**
   * @method clearScale
   * @description Clears the scale transform after interaction.
   * @private
   */
  clearScale = () => {
    this.isPressed = false;
    this.inkwellElement.style.transform = "";
  };

  /**
   * @method onDestroy
   * @description Cleans up inkwell resources.
   */
  onDestroy() {
    this.rippleElements.forEach(ripple => ripple.remove());
    this.rippleElements.clear();
    
    if (this.inkwellElement) {
      this.inkwellElement.removeAttribute("role");
      this.inkwellElement.removeAttribute("tabindex");
      this.inkwellElement.removeAttribute("aria-disabled");
    }
  }

  /**
   * @method setDisabled
   * @description Sets the disabled state of the inkwell.
   * @param {boolean} state - The disabled state.
   */
  setDisabled(state) {
    this.disabled = state;
    if (this.inkwellElement) {
      this.inkwellElement.setAttribute("aria-disabled", state.toString());
      this.inkwellElement.style.cursor = state ? "default" : "pointer";
      this.inkwellElement.setAttribute("tabindex", state ? "-1" : "0");
    }
  }
}