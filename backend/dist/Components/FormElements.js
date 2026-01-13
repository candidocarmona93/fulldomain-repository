import { Themes } from "../../src/themes/Themes";
import { Button } from "../../src/widgets/buttons/Button";
import { Icon } from "../../src/widgets/elements/Icon";
import { Form } from "../../src/widgets/forms/Form";
import { PasswordInput } from "../../src/widgets/forms/PasswordInput";
import { DateInput } from "../../src/widgets/forms/DateInput";
import { SearchInput } from "../../src/widgets/forms/SearchInput";
import { SelectBuilder } from "../../src/widgets/forms/SelectBuilder";
import { SelectInput } from "../../src/widgets/forms/SelectInput";
import { TextInput } from "../../src/widgets/forms/TextInput";
import { TextAreaInputBuilder } from "../../src/widgets/forms/TextAreaInputBuilder";
import { CheckBoxInput } from "../../src/widgets/forms/CheckBoxInput";
import { Column } from "../../src/widgets/layouts/Column";
import { Expand } from "../../src/widgets/layouts/Expand";
import { Row } from "../../src/widgets/layouts/Row";
import { HttpClient } from "../Services/HttpClient";

// Default styles and configurations
const DEFAULT_STYLES = {
    inputHeight: "3.5rem",
    textAreaHeight: "12rem",
    gap: "5px",
};

const INPUT_TYPES = {
    TextInput: "TextInput",
    PasswordInput: "PasswordInput",
    DateInput: "DateInput",
    SearchInput: "SearchInput",
    SelectBuilder: "SelectBuilder",
    SelectInput: "SelectInput",
    TextAreaInput: "TextAreaInput",
    CheckBoxInput: "CheckBoxInput",
    Custom: "Custom",
};

const DEFAULT_DEBOUNCE_MS = 300;

// Utility for debouncing functions
function debounce(fn, ms = DEFAULT_DEBOUNCE_MS) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    };
}

export class FormElements {
    constructor() {
        this.formData = {};
        this.searchTags = {};
        this.controller = null;
    }

    /**
     * Retrieves current searchTag data
     * @returns {Object} Current searchTag data
     */
    getSearchTagData() {
        return this.searchTags;
    }

    /**
     * Resets search tags data to initial state
     */
    resetSearchTagData() {
        this.searchTags = {};
    }

    /**
     * Retrieves current form data
     * @returns {Object} Current form data
     */
    getFormData() {
        return { ...this.formData };
    }

    /**
     * Resets form data to initial state
     */
    resetFormData() {
        this.formData = {};
        this.controller.reset();
    }

    /**
     * Sets initial form data
     * @param {Object} initialData - Initial form data
     */
    setFormData(initialData) {
        this.formData = { ...initialData };
    }

    /**
     * Sets initial form data
     * @param {Object} initialData - Initial form data
     */
    removeFormDataKey(key) {
        delete this.formData[key];
        this.controller.setInitialValues(this.formData)
    }

    /**
     * Creates a form based on provided configuration
     * @param {Object} config - Configuration object
     * @param {Array} config.fields - Array of field definitions
     * @param {Object} config.controller - Form controller
     * @param {Object} [config.layout] - Layout configuration
     * @param {string} [config.layout.type='row'] - Layout type ('row' or 'column')
     * @param {Object} [config.layout.style] - Layout styles
     * @param {Array} [config.actions] - Array of action button configurations
     * @param {string} [config.ariaLabel='Generic form'] - ARIA label for the form
     * @param {Object} [config.initialValues] - Initial form values
     * @returns {Column|null} Form column or null if invalid
     */
    createForm({
        fields,
        controller,
        layout = { type: "row", style: {} },
        actions = [],
        ariaLabel = "Generic form",
        initialValues = {},
    }) {
        if (!Array.isArray(fields) || !controller) {
            console.warn("Invalid form configuration: 'fields' must be an array and 'controller' is required");
            return null;
        }
        this.controller = controller;

        const inputContainer = fields
            .map((field) => this.createInputComponent(field, layout.type === "column"))
            .filter(Boolean);

        if (Object.keys(initialValues).length > 0) {
            this.setFormData(initialValues);
        }

        const formLayout =
            layout.type === "column"
                ? new Column({
                    gap: "20px",
                    children: inputContainer,
                    style: { ...layout.style },
                })
                : new Row({
                    gap: DEFAULT_STYLES.gap,
                    children: inputContainer,
                    style: { ...layout.style },
                });

        const actionButtons = actions.map((action) => this.createActionButton(action));

        return new Column({
            gap: DEFAULT_STYLES.gap,
            children: [
                new Form({
                    controller,
                    style: { width: "100%" },
                    ariaLabel,
                    children: [formLayout],
                    initialValues,
                }),
                ...(actionButtons.length > 0
                    ? [
                        new Row({
                            gap: DEFAULT_STYLES.gap,
                            style: { marginTop: layout.type === "column" ? "1rem" : "0" },
                            children: actionButtons,
                        }),
                    ]
                    : []),
            ],
        });
    }

    /**
     * Creates an input component based on type
     * @param {Object} field - Field configuration
     * @returns {Expand|null} Expand component or null if invalid
     */
    createInputComponent(field, isColumn) {
        const {
            type,
            name,
            breakpoints = { lg: 12 },
            debounceMs = DEFAULT_DEBOUNCE_MS,
            required = false,
            component,
        } = field;

        if (!INPUT_TYPES[type]) {
            console.warn(`Invalid input type: ${type}`);
            return null;
        }

        if (type !== INPUT_TYPES.Custom && !name) {
            console.warn(`Missing name for input type: ${type}`);
            return null;
        }

        if (type === INPUT_TYPES.Custom && !component) {
            console.warn("Custom input type requires a 'component' property");
            return null;
        }

        if (type === INPUT_TYPES.Custom) {
            return new Expand({
                breakpoints,
                style: {
                    marginBottom: !isColumn && "1rem"
                },
                children: [component],
            });
        }

        const componentCreator = {
            [INPUT_TYPES.TextInput]: this.createTextInput,
            [INPUT_TYPES.PasswordInput]: this.createPasswordInput,
            [INPUT_TYPES.DateInput]: this.createDateInput,
            [INPUT_TYPES.SearchInput]: this.createSearchInput,
            [INPUT_TYPES.SelectBuilder]: this.createSelectBuilder,
            [INPUT_TYPES.SelectInput]: this.createSelectInput,
            [INPUT_TYPES.TextAreaInput]: this.createTextAreaInput,
            [INPUT_TYPES.CheckBoxInput]: this.createCheckBoxInput,
        }[type];

        return new Expand({
            breakpoints,
            style: {
                marginBottom: !isColumn && "1rem"
            },
            children: [
                componentCreator.call(this, {
                    ...field,
                    onChange: debounce((val, _, options) => {
                        this.formData = { ...this.formData, [name]: val };
                        this.searchTags = { ...this.searchTags, [field.label]: (field.type === "SelectBuilder" || field.type === "Select") ? { key: [name], value: options.label } : { key: [name], value: val } };
                    }, debounceMs),
                    required,
                }),
            ],
        });
    }

    /**
     * Creates an action button
     * @param {Object} config - Button configuration
     * @returns {Button} Action button component
     */
    createActionButton({
        label,
        onPressed,
        theme = Themes.button.type.primary,
        icon = null,
        ariaLabel = label,
        breakpoints,
    }) {
        const comp = new Button({
            label,
            theme,
            prefixIcon: icon ? new Icon({ icon, ariaHidden: true }) : null,
            onPressed,
            ariaLabel,
        });

        return breakpoints ? new Expand({
            breakpoints,
            children: [
                comp
            ],
        }) : comp;
    }

    /**
     * Creates a text input
     * @param {Object} config - Input configuration
     * @returns {TextInput} Text input component
     */
    createTextInput({
        label = "",
        placeholder = "",
        name = "",
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        return new TextInput({
            label,
            placeholder,
            name,
            required,
            style,
            onChange,
            ariaLabel: label || "Text input",
        });
    }

    /**
     * Creates a password input
     * @param {Object} config - Input configuration
     * @returns {PasswordInput} Password input component
     */
    createPasswordInput({
        label = "",
        placeholder = "",
        name = "",
        validation = null,
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        return new PasswordInput({
            label,
            placeholder,
            name,
            validation,
            required,
            style,
            onChange,
            ariaLabel: label || "Password input",
        });
    }

    /**
     * Creates a date input
     * @param {Object} config - Input configuration
     * @returns {DateInput} Date input component
     */
    createDateInput({
        label = "",
        placeholder = "",
        name = "",
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        return new DateInput({
            label,
            placeholder,
            name,
            required,
            style,
            onChange,
            ariaLabel: label || "Date input",
        });
    }

    /**
     * Creates a search input
     * @param {Object} config - Input configuration
     * @returns {SearchInput} Search input component
     */
    createSearchInput({
        label = "",
        placeholder = "Pesquisar por",
        name = "",
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        return new SearchInput({
            label,
            placeholder,
            name,
            required,
            style,
            onChange,
            ariaLabel: label || "Search input",
        });
    }

    /**
     * Creates a select builder
     * @param {Object} config - Select configuration
     * @returns {SelectBuilder|null} Select builder component or null if invalid
     */
    createSelectBuilder({
        endpoint = "",
        dataMapper = ({ result }) =>
            result.data.map((option) => ({
                label: option?.name || option?.full_name,
                value: option.id,
            })),
        label = "",
        placeholder = "Seleccione uma opção",
        name = "",
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        if (!endpoint) {
            console.warn("SelectBuilder requires an endpoint");
            return null;
        }

        return new SelectBuilder({
            future: HttpClient.instance.get(endpoint),
            label,
            placeholder,
            name,
            required,
            style,
            proxyData: dataMapper,
            onChange,
            ariaLabel: label || "Select builder",
        });
    }

    /**
     * Creates a select input
     * @param {Object} config - Select configuration
     * @returns {SelectInput} Select input component
     */
    createSelectInput({
        options = [],
        label = "",
        placeholder = "Seleccione uma opção",
        name = "",
        required = false,
        onChange,
        data = [],
        style = { height: DEFAULT_STYLES.inputHeight },
    }) {
        return new SelectInput({
            options,
            label,
            placeholder,
            name,
            required,
            style,
            onChange,
            data,
            ariaLabel: label || "Select input",
        });
    }

    /**
     * Creates a textarea input
     * @param {Object} config - Input configuration
     * @returns {TextAreaInputBuilder} Textarea input component
     */
    createTextAreaInput({
        label = "",
        placeholder = "",
        name = "",
        required = false,
        onChange,
        style = { height: DEFAULT_STYLES.textAreaHeight },
    }) {
        return new TextAreaInputBuilder({
            label,
            placeholder,
            name,
            required,
            style,
            onChange,
            ariaLabel: label || "Textarea input",
        });
    }

    /**
     * Creates a checkbox input
     * @param {Object} config - Input configuration
     * @returns {CheckBoxInput} Checkbox input component
     */
    createCheckBoxInput({
        label = "",
        name = "",
        required = false,
        onChange,
        checked = false,
        style = {},
    }) {
        return new CheckBoxInput({
            label,
            name,
            required,
            onChange,
            checked,
            style,
            ariaLabel: label || "Checkbox input",
        });
    }
}