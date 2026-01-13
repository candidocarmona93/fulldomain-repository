import { _TypingInput } from "./_TypingInput";

export class EmailInput extends _TypingInput {
    constructor(options) {
        super({
            ...options,
            inputType: 'email',
            validation: (value) => {
                if (options.validation) {
                    const result = options.validation(value);
                    if (result !== true) return result;
                }

                if (value && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return options.errorMessage || "Please enter a valid email address";
                }

                return true;
            },
            ...options
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