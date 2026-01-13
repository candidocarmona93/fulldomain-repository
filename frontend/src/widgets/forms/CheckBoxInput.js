import { _InputBaseWidget } from "./_InputBaseWidget";
import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { Themes } from "../../themes/Themes";
import "../../styles/forms/checkbox-widget.css";

export class CheckBoxInput extends _InputBaseWidget {
    constructor(options) {
        const {
            checked = false,
            indeterminate = false,
            labelPosition = "right", // 'right', 'left', 'top', 'bottom'
            ...restOptions
        } = options;

        super({
            ...restOptions,
            inputType: 'checkbox',
            value: checked,
            onSet: (value) => {
                // Transform to boolean
                return Boolean(value);
            }
        });

        this.labelPosition = labelPosition;
        this.indeterminate = indeterminate;
    }

    /**
     * @override
     * @method createInput
     */
    createInput({ inputClass = "checkbox-widget", additionalProps = {}, additionalEvents = {} } = {}) {
        return new BaseWidget({
            tagName: "input",
            props: {
                type: this.inputType,
                "aria-invalid": "false",
                "aria-describedby": `${this.id}-error`,
                ...this.config.props,
                ...additionalProps,
            },
            className: [inputClass, ...this.config.className],
            style: new Style({ ...this.config.style }),
            events: {
                change: this.handleInputBound,
                blur: this.handleBlurBound,
                focus: this.handleFocusBound,
                ...additionalEvents,
            },
            onAttached: (el) => {
                this.inputElement = el;
                el.disabled = this.disabled;
                el.checked = Boolean(this._value);
                el.indeterminate = this.indeterminate;
            },
        });
    }

    /**
     * @override
     * @method handleInput
     */
    handleInput(e) {
        const checked = e.target.checked;
        const processedValue = this.onSet ? this.onSet.call(this, checked) : checked;

        this._value = processedValue;
        this.onChange?.(processedValue, e);
        this.updateUI();
        this.validate();
    }

    /**
     * @override
     * @method syncValueToInput
     */
    syncValueToInput() {
        if (this.inputElement) {
            this.inputElement.checked = Boolean(this._value);
            this.inputElement.indeterminate = this.indeterminate;
        }
    }

    /**
     * @method createCheckboxContainer
     */
    createCheckboxContainer() {
        const checkboxElements = [
            this.createInput(),
            this.createLabel({ labelClass: "checkbox-label-widget" }),
        ].filter(Boolean);

        return new BaseWidget({
            tagName: "div",
            props: {
                for: this.id,
            },
            className: [
                "checkbox-container-widget",
                `checkbox-label-${this.labelPosition}`,
                , this.options?.theme || Themes.checkbox.type.primary
            ],
            style: {
                ...(this.labelPosition === 'top' || this.labelPosition === 'bottom') && {
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }
            },
            children: checkboxElements,
            onAttached: (el) => {
                this.labelElement = el;
            }
        });
    }

    /**
     * @override
     * @method render
     */
    render() {
        this.children = [
            this.createCheckboxContainer(),
            this.createError({ errorClass: "checkbox-error-message-widget" }),
        ];

        return super.render();
    }

    /**
     * @override
     * @method updateUI
     */
    updateUI() {
        if (!this.inputElement) return;

        const isChecked = Boolean(this._value);
        this.inputElement.classList.toggle("checkbox-checked", isChecked);
        this.inputElement.classList.toggle("checkbox-unchecked", !isChecked);
    }

    /**
     * @override
     * @method hasValue
     */
    hasValue() {
        return Boolean(this._value);
    }

    /**
     * Set indeterminate state
     * @param {boolean} state 
     */
    setIndeterminate(state) {
        this.indeterminate = state;
        if (this.inputElement) {
            this.inputElement.indeterminate = state;
        }
    }

    /**
     * Toggle checked state
     */
    toggle() {
        this.value = !this._value;
    }
}