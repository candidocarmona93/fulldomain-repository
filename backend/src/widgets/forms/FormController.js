/**
 * @class FormController
 *
 * This class provides a public, imperative API to interact with and manage a Form
 * instance externally, abstracting away the direct use of the FormValidator.
 */
export class FormController {

    constructor() {
        /** @type {Form|null} */
        this._form = null; // Form instance
    }

    /**
     * @private
     * Used by the Form class during its construction to link the controller to the form.
     * @param {Form} form The Form instance this controller manages.
     */
    attach(form) {
        this._form = form;
    }

    // -----------------------------------------------------------------
    // GETTERS
    // -----------------------------------------------------------------

    /** * @returns {Form|null} The linked Form instance.
     */
    get form() {
        return this._form;
    }

    /** * @returns {FormValidator|null} The underlying FormValidator instance.
     */
    get validator() {
        return this._form?.validator ?? null;
    }

    // -----------------------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------------------

    /**
     * Triggers the form's submit process, including validation.
     */
    submit() {
        this.validator?.submit();
    }

    /**
     * Retrieves the current values of all registered form fields.
     * @returns {object} An object of key/value pairs (field name: value).
     */
    getValues() {
        return this.validator?.getFormData() ?? {};
    }

    /**
     * Retrieves the value of a single field by name.
     * @param {string} name The name of the field.
     * @returns {object} An object containing the single field's name and value.
     */
    getField(name) {
        const input = this.validator?.findInputByName(name);
        return input ? { [name]: input.value } : { [name]: undefined };
    }
    /**
     * Retrieves the input by name.
     * @param {string} name The name of the field.
     * @returns {HTMLElement} input HTMLElement.
     */
    getInput(name) {
        return  this.validator?.findInputByName(name);
    }

    /**
     * Retrieves the value of all the fields by name.
     * @returns {object} An array of object containing the field's name and value.
     */
    getFields() {
        return this.validator?.inputs;
    }

    /**
     * Updates the values of multiple fields.
     * @param {object} values An object of field names and new values.
     */
    updateValues(values = {}) {
        this.validator?.inputs.forEach((inp) => {
            if (values[inp.name] !== undefined) inp.value = values[inp.name];
        });
    }

    /**
     * Sets Field value for the form and updates the current values.
     * @param {object} values An object of field names and initial values.
     */
    setFieldValue(name, value) {
        const input = this.validator?.findInputByName(name);
        input.value = value;
    }

    /**
     * Sets the initial values for the form and updates the current values.
     * @param {object} values An object of field names and initial values.
     */
    setInitialValues(values = {}) {
        this._form?.setInitialValues(values);
    }

    /**
     * Checks if the form is currently valid.
     * @returns {boolean} True if all fields are valid, otherwise false.
     */
    async isValid() {
        try {
            const errors = await this.validator?.validate();
            const result = Object.keys(errors).length;

            return !Boolean(result);
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    /**
     * Resets the form elements and sets field values back to their initial state.
     */
    reset() {
        this._form?.formElement?.reset();
        this.validator?.inputs.forEach(input => input.reset());
        this.updateValues(this._form?.initialValues ?? {});
    }

    /**
     * Focuses the first input field that is currently invalid.
     */
    focusFirstInvalid() {
        this.validator?.inputs.find((i) => !i.validate?.({ force: true }))?.focus();
    }
}