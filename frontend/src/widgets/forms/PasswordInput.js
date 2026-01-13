import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { _TypingInput } from "./_TypingInput";

export class PasswordInput extends _TypingInput {
    constructor(options) {
        const {
            showToggle = true,
            showStrength = false,
            ...restOptions
        } = options;

        super({
            ...restOptions,
            inputType: 'password'
        });

        this.showToggle = showToggle;
        this.showStrength = showStrength;
        this.isPasswordVisible = false;
        this.toggleButton = null;
    }

    /**
     * @private
     * @method createToggleButton
     * @description Creates a toggle button to show/hide password
     */
    createToggleButton() {
        if (!this.showToggle) return null;

        return new BaseWidget({
            tagName: "button",
            props: {
                type: "button",
                "aria-label": "Toggle password visibility"
            },
            className: ["password-toggle-button"],
            style: {
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                zIndex: "2"
            },
            children: ["👁️"], // You can replace with proper icon
            events: {
                click: (e) => {
                    e.preventDefault();
                    this.togglePasswordVisibility();
                }
            },
            onAttached: (el) => {
                this.toggleButton = el;
            }
        });
    }

    /**
     * @private
     * @method togglePasswordVisibility
     */
    togglePasswordVisibility() {
        this.isPasswordVisible = !this.isPasswordVisible;
        this.inputElement.type = this.isPasswordVisible ? 'text' : 'password';

        if (this.toggleButton) {
            this.toggleButton.textContent = this.isPasswordVisible ? '🙈' : '👁️';
            this.toggleButton.setAttribute('aria-label',
                this.isPasswordVisible ? 'Hide password' : 'Show password'
            );
        }
    }

    /**
     * @private
     * @method checkPasswordStrength
     */
    checkPasswordStrength(password) {
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return strength;
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
            className: ["input-inner-container-widget", this.options.theme || Themes.input.type.default],
            // Arrange children: icon (optional), input, icon (optional), label (optional)
            // Filter out null children (e.g., if no label or icons provided)
            children: [
                this.options.prefixIcon,
                this.createInput({
                    additionalProps: {
                        placeholder: !this.options.label && (this.options.placeholder ?? "Enter your password...")
                    },
                    style: {
                        paddingLeft: this.options.prefixIcon ? "2rem": ""
                    }
                }),
                this.createToggleButton(),
                this.options.suffixIcon,
                this.createLabel(),
            ].filter(Boolean)
        });
    }

    /**
* @private
* @method updateLabelState
* @description Updates the label's CSS class (`input-label-floating-widget`) based on whether the input has a value or is currently focused.
* This controls the "floating" animation of the label.
* @returns {void}
*/
    updateLabelState() {
        // Label should float if there is a value OR if the input is focused
        const hasValue = this.hasValue();
        const isFocused = this.isFocused();

        // Only attempt to update if the label element exists
        if (this.labelElement) {
            this.labelElement.classList.toggle('input-label-floating-widget', hasValue || isFocused);
        }
    }

    updateUI() {
        super.updateUI();
        this.updateLabelState();
    }
}