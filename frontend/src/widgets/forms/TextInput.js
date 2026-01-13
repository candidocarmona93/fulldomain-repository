import { _TypingInput } from "./_TypingInput"

export class TextInput extends _TypingInput {
    constructor(options) {
        super({ ...options, inputType: 'text' })
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