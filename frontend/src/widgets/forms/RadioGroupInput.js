import { BaseWidget } from "../../core/BaseWidget";
import { RadioInput } from "./RadioInput";

export class RadioGroupInput extends BaseWidget {
    constructor(options) {
        super({
            ...options,
            tagName: "div",
        });

        this.className = ["radio-group-widget", `radio-group-${layout}`];
        this.name = options?.name || `radio-group-${Date.now()}`;
        this.radioOptions = options?.data || [];
        this._value = options?.value;
        this.layout = options?.layout || "vertical";
        this.required = options?.required || false;
        this.onChange = options?.onChange;
        this.radioInputs = [];
    }

    /**
     * @method createRadioOptions
     */
    createRadioOptions() {
        return this.radioOptions.map((option, index) => {
            const radioId = `${this.name}-${index}`;
            const isChecked = this._value === option.value;

            const radioInput = new RadioInput({
                id: radioId,
                label: option.label,
                value: option.value,
                checked: isChecked,
                groupName: this.name,
                disabled: option.disabled || false,
                theme: option.theme || this.theme,
                onChange: (value, event) => {
                    if (value) {
                        this._value = option.value;
                        this.onRadioChange(option.value, event);
                    }
                }
            });

            this.radioInputs.push(radioInput);
            return radioInput.render();
        });
    }

    /**
     * @private
     * @method onRadioChange
     */
    onRadioChange(value, event) {
        // Update all radios to reflect correct checked state
        this.radioInputs.forEach(radio => {
            radio.value = radio._value === value;
        });

        this._value = value;
        this.onChange?.(value, event);
    }

    /**
     * @override
     * @method render
     */
    render() {
        this.children = [
            ...this.createRadioOptions()
        ];

        return super.render();
    }

    // ————————————————————————
    // Public Value Accessors
    // ————————————————————————

    get value() {
        return this._value;
    }

    set value(newValue) {
        this._value = newValue;

        // Update all radio buttons
        this.radioInputs.forEach(radio => {
            radio.value = radio._value === newValue;
        });
    }

    /**
     * Get selected radio option
     */
    getSelectedOption() {
        return this.radioOptions.find(option => option.value === this._value);
    }

    /**
     * Validate group
     */
    validate() {
        if (this.required && !this._value) {
            return false;
        }
        return true;
    }

    /**
     * Reset group
     */
    reset() {
        this.value = null;
        this.radioInputs.forEach(radio => {
            radio.value = false;
        });
    }
}