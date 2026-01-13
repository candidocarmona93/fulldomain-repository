export class FormValidator {
    constructor({
        onValidate,
        onSubmit,
        onError,
        onSuccess,
        onInvalid,
    } = {}) {
        this.onValidate = onValidate?.bind(this);
        this.onSubmit = onSubmit?.bind(this);
        this.onError = onError?.bind(this);
        this.onSuccess = onSuccess?.bind(this);
        this.onInvalid = onInvalid?.bind(this);

        this._validationTimeouts = new Map();
        this._inputs = new Map();
        this._isValidating = false;
        this._isSubmitting = false;
        this._submitPromise = null;
    }

    register(input) {
        if (!input.id) {
            console.warn("Input must have an ID to be registered");
            return;
        }

        if (this._inputs.has(input.id)) {
            return;
        }

        this._inputs.set(input.id, input);

        const originalValidate = input.validate.bind(input);
        input.validate = async (options) => {
            const result = await originalValidate(options);
            this.onInputValidated(input.id, result);
            return result;
        };

        const originalOnDetached = input.onDetached?.bind(input) || (() => { });
        input.onDetached = () => {
            this._inputs.delete(input.id);
            originalOnDetached();
        };
    }

    unregister(inputId) {
        this._inputs.delete(inputId);
    }

    get inputs() {
        return Array.from(this._inputs.values());
    }

    getFormData() {
        const data = {};
        for (const [id, input] of this._inputs) {
            const name = input.name || id;
            data[name] = input.value;
        }
        return data;
    }

    async validateAll({ focusFirstInvalid = true } = {}) {
        this._isValidating = true;
        const results = await Promise.all(
            this.inputs.map(input => input.validate({ force: true }))
        );

        const isValid = results.every(r => r.isValid);
        this._isValidating = false;

        this.onValidate?.(isValid);

        if (!isValid && focusFirstInvalid) {
            await this.focusFirstInvalid();
        }

        return isValid;
    }

    async validate() {
        try {
            // Run full validation via the validator
            await this.validateAll({ focusFirstInvalid: true });

            // Process all inputs in parallel
            const validationPromises = this.inputs.map(async (inp) => {
                try {
                    const rs = await inp.validate?.({ force: true });
                    return {
                        key: inp.name || inp.id,
                        error: rs.error,
                        isValid: rs.isValid
                    };
                } catch (error) {
                    console.warn(`Validation failed for input ${inp.name || inp.id}:`, error);
                    return {
                        key: inp.name || inp.id,
                        error: "Validation error",
                        isValid: false
                    };
                }
            }) || [];

            const results = await Promise.all(validationPromises);

            // Convert to errors object and also compute overall validity
            this._errors = {};
            results.forEach(({ key, error }) => {
                if (error) {
                    this._errors[key] = error;
                }
            });

            return this._errors;

        } catch (error) {
            console.error('Form validation failed:', error);
            return {};
        }
    }

    async submit(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this._isSubmitting) return this._submitPromise;

        const isValid = await this.validateAll({ focusFirstInvalid: true });

        if (!isValid) {
            this.onInvalid?.();
            return false;
        }

        this._isSubmitting = true;
        this._submitPromise = this.performSubmit();
        const result = await this._submitPromise;
        this._isSubmitting = false;
        this._submitPromise = null;

        return result;
    }

    async performSubmit() {
        const data = this.getFormData();

        try {
            const response = this.onSubmit ? await this.onSubmit(data) : null;
            this.onSuccess?.(data, response);
            return { success: true, data, response };
        } catch (error) {
            const errors = this.extractServerErrors(error);
            if (errors) {
                this.applyServerErrors(errors);
            }
            this.onError?.(error, data);
            return { success: false, error, data };
        }
    }

    reset() {
        this.inputs.forEach(input => input.reset());
        this.clearServerErrors();
    }

    async focusFirstInvalid() {
        for (const input of this.inputs) {
            if (!input.validate) continue;
            const isValid = await input.validate({ force: true });
            if (!isValid) {
                console.log(input, isValid)
                input.focus();
                break;
            }
        }
    }

    onInputValidated(inputId, isValid) {
        if (this._validationTimeouts.has(inputId)) {
            clearTimeout(this._validationTimeouts.get(inputId));
        }

        this._validationTimeouts.set(inputId, setTimeout(() => {
            this._validationTimeouts.delete(inputId);
        }, 300));
    }

    applyServerErrors(errors) {
        this.clearServerErrors();

        for (const [fieldName, message] of errors) {
            const input = this.findInputByName(fieldName);
            if (input) {
                input.errorMessage = message;
                input.validate({ force: true });
            }
        }
    }

    clearServerErrors() {
        this.inputs.forEach(input => {
            input.errorMessage = null;
        });
    }

    findInputByName(name) {
        let byIdMatch = null;
        for (const input of this.inputs) {
            // 1. Prefer an exact match on 'name'
            if (input.name === name) {
                return input;
            }
            // 2. Store a match on 'id' as a fallback
            if (input.id === name) {
                byIdMatch = input;
            }
        }
        // 3. Return the 'id' match if no 'name' match was found
        return byIdMatch;
    }

    extractServerErrors(error) {
        // Better: handle multiple error formats
        const data = error.response || error.data || error;
        if (!data || typeof data !== "object") return null;

        // Handle common error formats (Laravel, Django, Express, etc.)
        const errors = new Map();

        // Format 1: { errors: { field: "message" } }
        if (data.errors && typeof data.errors === 'object') {
            Object.entries(data.errors).forEach(([field, message]) => {
                errors.set(field, Array.isArray(message) ? message[0] : message);
            });
        }

        // Format 2: { field: ["message1", "message2"] }
        Object.entries(data).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
                errors.set(field, messages[0]);
            } else if (typeof messages === 'string') {
                errors.set(field, messages);
            }
        });

        return errors.size > 0 ? errors : null;
    }

    cancelSubmit() {
        this._isSubmitting = false;
        this._submitPromise = null;
    }

    get isValidating() { return this._isValidating; }
    get isSubmitting() { return this._isSubmitting; }
    get hasErrors() { return this.inputs.some(i => !i.validate()); }
}