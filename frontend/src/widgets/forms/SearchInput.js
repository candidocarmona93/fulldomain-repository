import { _TypingInput } from "./_TypingInput";

export class SearchInput extends _TypingInput {
    constructor(options) {
        super({ 
            ...options, 
            inputType: 'search',
            placeholder: options?.placeholder || "Search...",
            onSet: (value) => {
                // Debounce search if needed
                return value;
            },
            ...options
        });

        this.debounceTimeout = null;
        this.debounceDelay = options?.debounceDelay || 300;
    }

    /**
     * @override
     * @method handleInput
     */
    handleInput(e) {
        const rawValue = e.target.value;
        const processedValue = this.onSet ? this.onSet.call(this, rawValue) : rawValue;

        this._value = processedValue;
        
        // Clear previous timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Set new timeout for debouncing
        this.debounceTimeout = setTimeout(() => {
            this.onChange?.(processedValue, e);
            this.updateUI();
            this.validate();
        }, this.debounceDelay);
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

    /**
     * @override
     * @method onDetached
     */
    onDetached() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        super.onDetached();
    }
}