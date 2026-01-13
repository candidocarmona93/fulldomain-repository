import { _InputBaseWidget } from "./_InputBaseWidget";
import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/forms/text-area-widget.css";

export class TextAreaInput extends _InputBaseWidget {
    constructor(options, onAttached = null) {
        super({
            ...options
        });

        this.className = ["text-area-outter-container-widget"];
        this.options = options;
    }

    /**
     * @override
     * @method createInput
     */
    createInput({ inputClass = "text-area-widget", additionalProps = {}, additionalEvents = {} } = {}) {
        return new BaseWidget({
            tagName: "textarea",
            props: {
                id: this.id,
                "aria-invalid": "false",
                "aria-describedby": `${this.id}-error`,
                rows: this.options?.rows,
                cols: this.options?.cols,
                maxLength: this.options?.maxLength,
                ...this.options?.props,
                ...additionalProps,
            },
            className: [inputClass, this.options?.size || Themes.textArea.size.medium, , ...this.config.className],
            style: {
                ...this.options?.style,
                paddingTop: "1.5rem",
                resize: this.options?.resize || 'vertical'
            },
            events: {
                input: this.handleInputBound,
                blur: this.handleBlurBound,
                focus: this.handleFocusBound,
                ...additionalEvents,
            },
            onAttached: (el) => {
                this.inputElement = el;
                el.disabled = this.disabled;
                this.syncValueToInput();
            },
        });
    }

    /**
     * @override
     * @method createInputContainer
     */
    createInputContainer() {
        return new BaseWidget({
            tagName: "div",
            className: ["text-area-inner-container-widget", this.options?.themes || Themes.textArea.type.default],
            children: [
                this.createLabel({ labelClass: 'text-area-label-widget' }),
                this.createInput({ additionalProps: { placeholder: !this.options?.label && (this.options?.placeholder || "Please enter your text...") } })
            ].filter(Boolean)
        });
    }

    validate() {
        return super.validate({ validateClass: "text-area-invalid-state-widget" });
    }

    /**
   * @private
   * @method updateLabelState
   * @description Updates the label's CSS class (`text-area-label-floating-widget`) based on whether the text area has a value or is currently focused.
   * This controls the "floating" animation of the label.
   * @returns {void}
   */
    updateLabelState() {
        // Label should float if there is a value OR if the text area is focused
        const hasValue = this.hasValue();
        const isFocused = this.isFocused();

        // Only attempt to update if the label element exists
        if (this.labelElement) {
            this.labelElement.classList.toggle('text-area-label-floating-widget', hasValue || isFocused);
        }
    }

    /**
     * @override
     * @method render
     */
    render() {
        this.children = [
            this.createInputContainer(),
            this.createError({ errorClass: "text-area-error-message-widget" }),
        ];

        return super.render();
    }

    /**
     * @override
     * @method updateUI
     */
    updateUI() {
        super.updateUI();
        this.updateLabelState();
    }
}