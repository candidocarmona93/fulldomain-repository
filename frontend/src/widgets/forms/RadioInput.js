import { _InputBaseWidget } from "./_InputBaseWidget";
import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../../styles/forms/radio-widget.css";

export class RadioInput extends _InputBaseWidget {
    constructor(options) {
        const {
            checked = false,
            labelPosition = "right",
            groupName = "radio-group",
            ...restOptions
        } = options;

        super({ 
            ...restOptions, 
            inputType: 'radio',
            value: checked,
            name: groupName,
            onSet: (value) => Boolean(value)
        });

        this.labelPosition = labelPosition;
        this.groupName = groupName;
    }

    /**
     * @override
     * @method createInput
     */
    createInput({ inputClass = "radio-input-widget", additionalProps = {}, additionalEvents = {} } = {}) {
        return new BaseWidget({
            tagName: "input",
            props: {
                type: this.inputType,
                "aria-invalid": "false",
                "aria-describedby": `${this.id}-error`,
                name: this.groupName,
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
        }
    }

    /**
     * @method createRadioContainer
     */
    createRadioContainer() {
        const radioElements = [
            this.createInput(),
            this.createLabel(),
        ].filter(Boolean);

        return new BaseWidget({
            tagName: "label",
            props: {
                htmlFor: this.id,
            },
            className: [
                "radio-container-widget",
                `radio-label-${this.labelPosition}`,
                ...this.theme
            ],
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: this.disabled ? 'not-allowed' : 'pointer',
                ...(this.labelPosition === 'top' || this.labelPosition === 'bottom') && {
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }
            },
            children: radioElements,
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
            this.createRadioContainer(),
            this.createError(),
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
        this.inputElement.classList.toggle("radio-checked", isChecked);
        this.inputElement.classList.toggle("radio-unchecked", !isChecked);
    }

    /**
     * @override
     * @method hasValue
     */
    hasValue() {
        return Boolean(this._value);
    }

    /**
     * Select this radio button
     */
    select() {
        this.value = true;
    }
}