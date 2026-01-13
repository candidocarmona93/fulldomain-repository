import { TextAreaInput } from "./TextAreaInput";
import { SelectInput } from "./SelectInput";
import { Button } from "../buttons/Button";
import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/forms/text-area-builder.css";

// Extended SVG Icons configuration
const ICONS = {
    undo: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`,
    redo: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></svg>`,
    bold: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>`,
    italic: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`,
    underline: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>`,
    alignLeft: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`,
    alignCenter: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>`,
    alignRight: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>`,
    alignJustify: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`,
    ul: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    ol: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>`
};

export class TextAreaInputBuilder extends TextAreaInput {
    constructor(options) {
        super({ ...options });
        this._value = options.value || "";
        this.className = ["text-area-builder-outter-container-widget"];
        this.options = { toolbar: true, ...options };
        this.toolbarElement = null;
        this.isSettingContent = false;
    }

    get value() { return this._value; }

    set value(newValue) {
        const val = newValue || "";
        if (this._value === val) return;
        this._value = val;
        this.syncValueToInput();
        this.updateUI();
    }

    /**
     * Creates the toolbar structure
     */
    createToolbar() {
        if (!this.options.toolbar) return null;

        return new BaseWidget({
            tagName: "section",
            className: ["text-area-builder-toolbar"],
            children: [
                // --- Group 1: History ---
                this.createButton({ icon: ICONS.undo, title: "Undo", command: "undo", className: "btn-undo" }),
                this.createButton({ icon: ICONS.redo, title: "Redo", command: "redo", className: "btn-redo" }),

                // --- Group 2: Block Formatting (Headers, Fonts) ---

                this.createSelect({
                    title: "Formatting",
                    command: "formatBlock",
                    className: "select-format",
                    options: [
                        { label: "Normal", value: "p" },
                        { label: "Heading 1", value: "h1" },
                        { label: "Heading 2", value: "h2" },
                        { label: "Heading 3", value: "h3" }
                    ]
                }),
                this.createSelect({
                    title: "Font Family",
                    command: "fontName",
                    className: "select-font",
                    options: [
                        { label: "Sans Serif", value: "Arial, Helvetica, sans-serif" },
                        { label: "Serif", value: "'Times New Roman', Times, serif" },
                        { label: "Monospace", value: "'Courier New', Courier, monospace" }
                    ]
                }),
                this.createSelect({
                    title: "Size",
                    command: "fontSize",
                    className: "select-size",
                    options: [
                        { label: "Small", value: "2" },
                        { label: "Normal", value: "3" },
                        { label: "Large", value: "5" },
                        { label: "Huge", value: "7" }
                    ]
                }),
                // --- Group 3: Inline Style ---
                this.createButton({ icon: ICONS.bold, title: "Bold", command: "bold", className: "btn-bold" }),
                this.createButton({ icon: ICONS.italic, title: "Italic", command: "italic", className: "btn-italic" }),
                this.createButton({ icon: ICONS.underline, title: "Underline", command: "underline", className: "btn-underline" }),

                // --- Group 4: Alignment ---
                this.createButton({ icon: ICONS.alignLeft, title: "Left", command: "justifyLeft", className: "btn-left" }),
                this.createButton({ icon: ICONS.alignCenter, title: "Center", command: "justifyCenter", className: "btn-center" }),
                this.createButton({ icon: ICONS.alignRight, title: "Right", command: "justifyRight", className: "btn-right" }),
                this.createButton({ icon: ICONS.alignJustify, title: "Justify", command: "justifyFull", className: "btn-justify" }),
                // --- Group 5: Lists ---
                this.createButton({ icon: ICONS.ul, title: "Bullet", command: "insertUnorderedList", className: "btn-ul" }),
                this.createButton({ icon: ICONS.ol, title: "Numbered", command: "insertOrderedList", className: "btn-ol" })

            ].filter(Boolean),
            onAttached: (el) => { this.toolbarElement = el; }
        });
    }

    /**
     * Helper to create a visual vertical divider
     */
    createDivider() {
        return new BaseWidget({
            tagName: "div",
            className: ["text-area-toolbar-divider"]
        });
    }

    /**
     * Helper to create a group wrapper for buttons
     */
    createButtonGroup(buttons) {
        return new BaseWidget({
            tagName: "div",
            className: ["text-area-btn-group"],
            children: buttons
        });
    }

    /**
     * Creates a Dropdown (Select) widget
     */
    createSelect({ options, command, title, className }) {
        return new SelectInput({
            className: Array.isArray(className) ? className : [className],
            label: title,
            data: options,
            style: {
                height: "auto!important"
            },
            onChange: (_, e) => {
                e.preventDefault();
                this.applyFormatting(command, e.target.value);
            }
        });
    }

    createButton({ icon, title, command, className }) {
        return new Button({
            className: ["text-area-builder-button", className],
            theme: Themes.button.type.default,
            size: Themes.button.size.small,
            label: title,
            html: icon,
            style: {
                height: "auto!important"
            },
            onPressed: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.applyFormatting(command);
            }
        });
    }

    /**
     * Applies formatting
     * @param {string} command 
     * @param {string|null} value - Optional value for commands like fontName, fontSize
     */
    applyFormatting(command, value = null) {
        if (this.inputElement && this.isEditable()) {
            try {
                this.inputElement.focus();
                document.execCommand(command, false, value);
                this.handleInput();
                this.updateToolbarState();
            } catch (error) {
                console.error(`Error applying ${command}:`, error);
            }
        }
    }

    isEditable() {
        return this.inputElement && this.inputElement.contentEditable === "true";
    }

    createInput({ inputClass = "text-area-builder-widget", additionalProps = {}, additionalEvents = {} } = {}) {
        const placeholderText = !this.options?.label && (this.options?.placeholder || "Type something...");

        return new BaseWidget({
            tagName: "div",
            props: {
                id: this.id,
                "aria-invalid": "false",
                contentEditable: "true",
                "data-placeholder": placeholderText,
                ...this.options?.props,
                ...additionalProps
            },
            className: [inputClass, this.options?.size || Themes.textArea.size.medium, ...this.config.className],
            style: {
                ...this.options?.style,
                minHeight: this.options?.rows ? `${this.options.rows * 1.5}em` : "120px",
                resize: this.options?.resize || "vertical",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
            },
            events: {
                input: this.handleInputBound,
                blur: this.handleBlurBound,
                focus: (e) => {
                    this.handleFocusBound(e);
                    if (this.editorWrapper) this.editorWrapper.classList.add('focused');
                    this.updateToolbarState(); // Check state on focus
                },
                blur: (e) => {
                    this.handleBlurBound(e);
                    if (this.editorWrapper) this.editorWrapper.classList.remove('focused');
                },
                mouseup: () => this.updateToolbarState(), // Check state on click
                keyup: (e) => {
                    this.updateToolbarState(); // Check state on keyup
                    additionalEvents.keyup?.(e);
                },
                keydown: (e) => {
                    if (e.key === "Tab") {
                        e.preventDefault();
                        this.insertTab();
                    }
                    additionalEvents.keydown?.(e);
                },
                paste: (e) => {
                    this.handlePaste(e);
                    additionalEvents.paste?.(e);
                },
                ...additionalEvents
            },
            onAttached: (el) => {
                this.inputElement = el;
                if (this._value) {
                    this.isSettingContent = true;
                    el.innerHTML = this._value;
                    this.isSettingContent = false;
                }
                this.setupMutationObserver();
            }
        });
    }

    handlePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        this.handleInput();
    }

    insertTab() {
        if (this.inputElement && this.isEditable()) {
            document.execCommand('insertText', false, '\t');
            this.handleInput();
        }
    }

    setupMutationObserver() {
        if (!this.inputElement) return;
        this.mutationObserver = new MutationObserver(() => {
            if (!this.isSettingContent) this.handleInput();
        });
        this.mutationObserver.observe(this.inputElement, { childList: true, subtree: true, characterData: true });
    }

    createInputContainer() {
        const editorWrapper = new BaseWidget({
            tagName: "div",
            className: ["text-area-builder-frame"],
            children: [
                this.createToolbar(),
                this.createInput()
            ],
            onAttached: (el) => { this.editorWrapper = el; }
        });

        return new BaseWidget({
            tagName: "div",
            className: ["text-area-builder-inner-container-widget", this.options?.themes || Themes.textArea.type.default],
            children: [
                this.createLabel({ labelClass: "text-area-label-widget" }),
                editorWrapper
            ].filter(Boolean)
        });
    }

    render() {
        this.children = [
            this.createInputContainer(),
            this.createError({ errorClass: "text-area-error-message-widget" })
        ];
        return super.render();
    }

    updateUI() {
        super.updateUI();
        if (this.options.toolbar && this.inputElement) {
            this.updateToolbarState();
        }
    }

    /**
     * Updates the Active state of buttons and Selects
     */
    updateToolbarState() {
        if (!this.isEditable() || !this.toolbarElement) return;

        // 1. Update Buttons (Boolean states)
        const btnMap = {
            "bold": ".btn-bold",
            "italic": ".btn-italic",
            "underline": ".btn-underline",
            "insertUnorderedList": ".btn-ul",
            "insertOrderedList": ".btn-ol",
            "justifyLeft": ".btn-left",
            "justifyCenter": ".btn-center",
            "justifyRight": ".btn-right",
            "justifyFull": ".btn-justify"
        };

        Object.keys(btnMap).forEach((command) => {
            const button = this.toolbarElement.querySelector(btnMap[command]);
            console.log(button)
            if (button) {
                const isActive = document.queryCommandState(command);
                button.classList.toggle("active", isActive);

                button.disabled = !this.isEditable();
            }
        });

        // 2. Update Dropdowns (Value states)
        try {
            const formatSelect = this.toolbarElement.querySelector('.select-format');
            if (formatSelect) {
                // queryCommandValue returns 'h1', 'p', etc.
                const format = document.queryCommandValue('formatBlock');
                formatSelect.value = format ? format.toLowerCase() : 'p';
            }

            const fontSelect = this.toolbarElement.querySelector('.select-font');
            if (fontSelect) {
                // Browser might return "Times New Roman" with or without quotes
                const fontName = document.queryCommandValue('fontName');
                // Simple matching logic could be improved
                if (fontName) {
                    Array.from(fontSelect.options).forEach(opt => {
                        if (opt.value.includes(fontName.replace(/['"]/g, ''))) {
                            fontSelect.value = opt.value;
                        }
                    });
                }
            }

            const sizeSelect = this.toolbarElement.querySelector('.select-size');
            if (sizeSelect) {
                const fontSize = document.queryCommandValue('fontSize');
                if (fontSize) sizeSelect.value = fontSize;
            }
        } catch (e) {
            // Ignore errors in queryCommandValue
        }
    }

    syncValueToInput() {
        if (this.inputElement && this.inputElement.innerHTML !== this._value) {
            this.isSettingContent = true;
            this.inputElement.innerHTML = this._value || "";
            this.isSettingContent = false;
        }
    }

    handleInput() {
        if (this.inputElement && !this.isSettingContent) {
            this._value = this.inputElement.innerHTML;
            this.updateUI();
            this.options?.onChange?.(this._value);
        }
    }

    detach() {
        if (this.mutationObserver) this.mutationObserver.disconnect();
        super.detach();
    }

    setDisabled(disabled) {
        super.setDisabled(disabled);
        if (this.inputElement) {
            this.inputElement.contentEditable = !disabled;
            if (this.editorWrapper) {
                this.editorWrapper.classList.toggle('disabled', disabled);
            }
        }
    }
}