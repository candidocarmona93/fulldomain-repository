import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { _InputBaseWidget } from "./_InputBaseWidget";
import "../../styles/forms/input-widget.css";

export class _TypingInput extends _InputBaseWidget {
    constructor(options) {
        super({ ...options });

        this.className = ["input-outter-container-widget"];
        this.options = options;
        this.initializeIcons();
    }

    /**
     * @private
     * @method initializeIcons
     * @description Applies necessary inline styles (positioning, z-index) to prefix and suffix icons
     * if they are provided as BaseWidget instances (like the Icon component). Also ensures class names on icons are properly formatted.
     * @returns {void}
     */
    initializeIcons() {
        [this.options.prefixIcon, this.options.suffixIcon].forEach((icon, index) => {
            // Check if the icon is a BaseWidget instance (to access its style and config)
            if (icon instanceof BaseWidget) {
                // Apply absolute positioning within the inner container
                Object.assign(icon.style.styles, {
                    position: "absolute",
                    [index === 0 ? "left" : "right"]: "12px", // Position left for prefix, right for suffix
                    zIndex: "1", // Ensure icon is visually above the input field if needed
                    pointerEvents: "auto", // Allow interactions with the icon (e.g., click)
                });

                // Ensure class names provided via config are flat arrays (handles space-separated strings)
                // This might be specific to how BaseWidget handles className config
                if (icon && icon.className) {
                    icon.className = [...icon.className];
                }

                icon.onAttached = (el, widget) => {
                    index === 0 ? this.prefixIconElement = el : this.suffixIconElement = el;
                }
            }
        });
    }

    /**
       * @private
       * @method createInputContainer
       * @description Creates the inner container div (`input-inner-container-widget`)
       * that groups the prefix icon, the native input element, the suffix icon, and the label.
       * Applies theme classes to this container.
       * @returns {BaseWidget} The inner container widget instance.
       */
    createInputContainer() {
        return new BaseWidget({
            tagName: "div",
            // Apply base class and theme classes to the inner container
            className: ["input-inner-container-widget", this.options.themes || Themes.input.type.default],
            // Arrange children: icon (optional), input, icon (optional), label (optional)
            // Filter out null children (e.g., if no label or icons provided)
            children: [
                this.options.prefixIcon,
                this.createInput({
                    additionalProps: {
                        placeholder: !this.options?.label && (this.options?.placeholder || "Please enter your text...")
                    }, 
                    style: {
                        paddingLeft: this.options.prefixIcon ? "2rem": ""
                    }
                }),
                this.options.suffixIcon,
                this.createLabel(),
            ].filter(Boolean)
        });
    }

    updateUI() {
        super.updateUI();
    }

    render() {
        this.children = [
            this.createInputContainer(),
            this.createError(),
        ];

        return super.render();
    }
}