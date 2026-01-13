import { _InputBaseWidget } from "./_InputBaseWidget";
import { SearchInput } from "./SearchInput";
import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../../styles/forms/select-widget.css";
import { Themes } from "../../themes/Themes";

export class SelectInput extends _InputBaseWidget {
    constructor(options) {
        super({
            ...options,
            inputType: 'select',
            onSet: (value) => {
                if (options?.multiple) {
                    return Array.isArray(value) ? value : [value].filter(Boolean);
                }
                return value;
            }
        });

        this.className = ["select-outter-container-widget"];
        this.selectOptions = options?.data || [];
        this.multiple = options?.multiple || false;
        this.searchable = options?.searchable || true;
        this.placeholder = options?.placeholder || "Select an option";
    }

    /**
     * @override
     * @method createInput
     */
    createInput({ inputClass = "select-widget" } = {}) {
        return new BaseWidget({
            tagName: "select",
            props: {
                "aria-invalid": "false",
                "aria-describedby": `${this.id}-error`,
                multiple: this.multiple,
                ...this.config.props,
            },
            className: [inputClass, ...this.options?.size || Themes.select.size.medium, ...this.config.className],
            style: new Style({ ...this.config.style, ...(this.multiple && { height: "auto" }) }),
            events: {
                change: this.handleInputBound,
                blur: this.handleBlurBound,
                focus: this.handleFocusBound,
                ...this.options?.events,
            },
            onAttached: (el) => {
                this.inputElement = el;
                el.disabled = this.disabled;
                this.populateOptions();
                this.syncValueToInput();
            },
            onMounted: () => {
                if (this.labelElement) {
                    this.labelElement.classList.add('select-label-floating-widget');
                }
            }
        });
    }

    /**
     * @method createSearchInput
     */

    createSearchInput({ inputClass = "input-widget" } = {}) {
        return new SearchInput({
            placeholder: this.placeholder,
            className: [inputClass, ...this.options?.size || Themes.input.size.medium, ...this.config.className],
            onChange: (_, e) => {
                this.handleInputBound(e);
            }
        })
    }

    /**
     * @method populateOptions
     */
    populateOptions() {
        if (!this.inputElement) return;

        // Clear existing options
        this.inputElement.innerHTML = '';

        // Add placeholder option for single select
        if (!this.multiple && this.placeholder) {
            const placeholderOption = new Option(this.placeholder, "", true, false);
            placeholderOption.disabled = true;
            placeholderOption.hidden = true;
            this.inputElement.appendChild(placeholderOption);
        }

        // Add options
        this.selectOptions.forEach(option => {
            const optionElement = new Option(
                option.label || option.value,
                option.value,
                false,
                this.isOptionSelected(option.value)
            );

            if (option.disabled) {
                optionElement.disabled = true;
            }

            if (option.group) {
                // Find or create option group
                let group = this.inputElement.querySelector(`optgroup[label="${option.group}"]`);
                if (!group) {
                    group = document.createElement('optgroup');
                    group.label = option.group;
                    this.inputElement.appendChild(group);
                }
                group.appendChild(optionElement);
            } else {
                this.inputElement.appendChild(optionElement);
            }
        });
    }

    /**
     * @method isOptionSelected
     */
    isOptionSelected(value) {
        if (this.multiple) {
            return Array.isArray(this._value) && this._value.includes(value);
        }
        return this._value === value;
    }

    /**
     * @override
     * @method handleInput
     */
    handleInput(e) {
        let selectedValue;

        if (this.multiple) {
            selectedValue = Array.from(e.target.selectedOptions).map(option => option.value);
        } else {
            selectedValue = e.target.value;
        }

        const processedValue = this.onSet ? this.onSet.call(this, selectedValue) : selectedValue;

        this._value = processedValue;
        const optionObject = e.target.selectedOptions[0];

        this.onChange?.(processedValue, e, { value: optionObject.value, label: optionObject.innerText });
        this.updateUI();
        this.validate({ validateClass: "select-invalid-state-widget" });
    }

    /**
     * @override
     * @method syncValueToInput
     */
    syncValueToInput() {
        if (!this.inputElement) return;

        if (this.multiple && Array.isArray(this._value)) {
            // For multiple select, set selected options
            Array.from(this.inputElement.options).forEach(option => {
                option.selected = this._value.includes(option.value);
            });
        } else {
            // For single select
            this.inputElement.value = this._value || "";
        }
    }

    /**
     * @method createSelectContainer
     */
    createSelectContainer() {
        return new BaseWidget({
            tagName: "div",
            className: ["select-inner-container-widget", this.options?.theme || Themes.select.type.default],
            children: [
                this.createLabel({ labelClass: ["select-label-widget", "select-label-floating-widget"] }),
                this.createInput()
            ].filter(Boolean)
        });
    }

    /**
     * @override
     * @method render
     */
    render() {
        this.children = [
            this.createSelectContainer(),
            this.createError({ errorClass: "select-error-message-widget" }),
        ];

        return super.render();
    }

    /**
     * @override
     * @method updateUI
     */
    updateUI() {
        super.updateUI({ filledStateClass: "select-empty-state", emptyStateClass: "select-filled-state" });
    }

    /**
     * @override
     * @method hasValue
     */
    hasValue() {
        if (this.multiple) {
            return Array.isArray(this._value) && this._value.length > 0;
        }
        return super.hasValue();
    }

    /**
     * Add option to select
     */
    addOption(option) {
        this.selectOptions.push(option);
        if (this.inputElement) {
            this.populateOptions();
        }
    }

    /**
     * Remove option by value
     */
    removeOption(value) {
        this.selectOptions = this.selectOptions.filter(opt => opt.value !== value);
        if (this.inputElement) {
            this.populateOptions();
        }
    }

    /**
     * Clear all options
     */
    clearOptions() {
        this.selectOptions = [];
        if (this.inputElement) {
            this.populateOptions();
        }
    }

    /**
     * Get selected options
     */
    getSelectedOptions() {
        if (this.multiple) {
            return this.selectOptions.filter(opt =>
                Array.isArray(this._value) && this._value.includes(opt.value)
            );
        }
        return this.selectOptions.filter(opt => opt.value === this._value);
    }
}