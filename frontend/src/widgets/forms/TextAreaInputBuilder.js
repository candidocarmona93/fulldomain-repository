import { TextAreaInput } from "./TextAreaInput";
import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import "../../styles/forms/text-area-builder.css";

export class TextAreaInputBuilder extends TextAreaInput {
    constructor(options) {
        super({
            ...options
        });

        // --- FIX: Initialize internal value state ---
        this._value = options.value || "";

        this.className = ["text-area-builder-outter-container-widget"];
        this.options = {
            toolbar: true, // Enable toolbar by default
            ...options
        };

        // Store toolbar reference
        this.toolbarElement = null;
        // Track if content is being set programmatically
        this.isSettingContent = false;
    }

    // --- FIX: Add value getter ---
    /**
     * @override
     * Gets the value
     * @returns {string}
     */
    get value() {
        return this._value;
    }

    // --- FIX: Add value setter ---
    /**
     * @override
     * Sets the value and syncs it to the innerHTML
     * @param {string} newValue
     */
    set value(newValue) {
        const val = newValue || "";
        if (this._value === val) return;

        this._value = val;
        this.syncValueToInput();

        // We also call updateUI to ensure validation state reflects the new value
        this.updateUI();
    }

    /**
     * Creates the toolbar with formatting buttons
     * @private
     * @returns {BaseWidget} The toolbar widget
     */
    createToolbar() {
        if (!this.options.toolbar) return null;

        return new BaseWidget({
            tagName: "div",
            className: ["text-area-builder-toolbar"],
            children: [
                this.createButton({
                    icon: "B",
                    title: "Bold",
                    command: "bold",
                    className: "text-area-builder-button-bold"
                }),
                this.createButton({
                    icon: "I",
                    title: "Italic",
                    command: "italic",
                    className: "text-area-builder-button-italic"
                }),
                this.createButton({
                    icon: "U",
                    title: "Underline",
                    command: "underline",
                    className: "text-area-builder-button-underline"
                })
            ].filter(Boolean),
            onAttached: (el) => {
                this.toolbarElement = el;
            }
        });
    }

    /**
     * Creates a single toolbar button
     * @private
     * @param {Object} options - Button options
     * @returns {BaseWidget} The button widget
     */
    createButton({ icon, title, command, className }) {
        return new BaseWidget({
            tagName: "button",
            className: ["text-area-builder-button", className],
            props: {
                type: "button",
                title: title,
                "aria-label": title,
                tabIndex: -1 // Prevent toolbar buttons from being focusable
            },
            children: [icon],
            events: {
                click: (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event bubbling
                    this.applyFormatting(command);
                },
                mousedown: (e) => {
                    e.preventDefault(); // Prevent focus loss from input
                }
            }
        });
    }

    /**
     * Applies formatting to the selected text
     * @private
     * @param {string} command - The formatting command
     */
    applyFormatting(command) {
        if (this.inputElement && this.isEditable()) {
            try {
                // Ensure the editable div is focused
                this.inputElement.focus();

                // Save current selection
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                // Apply the formatting command
                const success = document.execCommand(command, false, null);
                if (!success) {
                    console.warn(`Failed to execute ${command} command`);
                }

                // Restore selection if it was lost
                if (range && selection.rangeCount === 0) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                // Trigger input handling to sync value
                this.handleInput();

                // Update toolbar state
                this.updateToolbarState();
            } catch (error) {
                console.error(`Error applying ${command} formatting:`, error);
            }
        }
    }

    /**
     * Check if the input is editable
     * @private
     * @returns {boolean}
     */
    isEditable() {
        // Fix: Removed .disabled check as it's not valid for a div
        return this.inputElement &&
            this.inputElement.contentEditable === "true";
    }

    /**
     * @override
     * @method createInput
     */
    createInput({ inputClass = "text-area-builder-widget", additionalProps = {}, additionalEvents = {} } = {}) {
        return new BaseWidget({
            tagName: "div", // Use div instead of textarea for rich text
            props: {
                id: this.id,
                "aria-invalid": "false",
                "aria-describedby": `${this.id}-error`,
                contentEditable: "true", // Enable rich text editing
                ...this.options?.props,
                ...additionalProps
            },
            className: [inputClass, this.options?.size || Themes.textArea.size.medium, ...this.config.className],
            style: {
                ...this.options?.style,
                minHeight: this.options?.rows ? `${this.options.rows * 1.5}em` : "100px",
                resize: this.options?.resize || "vertical",
                overflowY: "auto", // Allow scrolling
                whiteSpace: "pre-wrap", // Preserve whitespace and wrap text
                wordWrap: "break-word"
            },
            events: {
                input: this.handleInputBound,
                blur: this.handleBlurBound,
                focus: this.handleFocusBound,
                keydown: (e) => {
                    // Handle tab key to prevent losing focus
                    if (e.key === "Tab") {
                        e.preventDefault();
                        this.insertTab();
                    }
                    additionalEvents.keydown?.(e);
                },
                paste: (e) => {
                    // Handle paste to clean up content if needed
                    this.handlePaste(e);
                    additionalEvents.paste?.(e);
                },
                ...additionalEvents
            },
            onAttached: (el) => {
                this.inputElement = el;
                // Fix: Removed el.disabled, it's not valid for a div

                // --- FIX: Set initial content from internal _value ---
                if (this._value) {
                    this.isSettingContent = true;
                    el.innerHTML = this._value;
                    this.isSettingContent = false;
                }

                // Add mutation observer to detect content changes
                this.setupMutationObserver();
            }
        });
    }

    /**
     * Handle paste events to clean up content
     * @private
     * @param {ClipboardEvent} e 
     */
    handlePaste(e) {
        e.preventDefault();

        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');

        // Insert text at cursor position
        document.execCommand('insertText', false, text);

        // Trigger input event
        this.handleInput();
    }

    /**
     * Insert tab at cursor position
     * @private
     */
    insertTab() {
        if (this.inputElement && this.isEditable()) {
            document.execCommand('insertText', false, '\t');
            this.handleInput(); // Fix: Ensure value is synced
        }
    }

    /**
     * Set up mutation observer to detect content changes
     * @private
     */
    setupMutationObserver() {
        if (!this.inputElement) return;

        this.mutationObserver = new MutationObserver((mutations) => {
            if (!this.isSettingContent) {
                this.handleInput();
            }
        });

        this.mutationObserver.observe(this.inputElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /**
     * @override
     * @method createInputContainer
     */
    createInputContainer() {
        return new BaseWidget({
            tagName: "div",
            className: ["text-area-builder-inner-container-widget", this.options?.themes || Themes.textArea.type.default],
            children: [
                this.createToolbar(),
                this.createLabel({ labelClass: "text-area-label-widget" }),
                this.createInput({
                    additionalProps: {
                        placeholder: !this.options?.label && (this.options?.placeholder || "Please enter your text...")
                    }
                })
            ].filter(Boolean)
        });
    }

    /**
     * @override
     * @method render
     */
    render() {
        this.children = [
            this.createInputContainer(),
            this.createError({ errorClass: "text-area-error-message-widget" })
        ];
        return super.render();
    }

    /**
     * @override
     * @method updateUI
     */
    updateUI() {
        super.updateUI();
        if (this.options.toolbar && this.inputElement) {
            this.updateToolbarState();
        }
    }

    /**
     * Updates toolbar buttons' active state
     * @private
     */
    updateToolbarState() {
        // Fix: Use isEditable() and query from this.toolbarElement.element
        if (!this.isEditable() || !this.toolbarElement) return;

        const commands = ["bold", "italic", "underline"];
        commands.forEach((command) => {
            const button = this.toolbarElement.querySelector(
                `.text-area-builder-button-${command}`
            );
            if (button) {
                try {
                    const isActive = document.queryCommandState(command);
                    button.classList.toggle("active", isActive);
                    button.disabled = !this.isEditable(); // Use isEditable for disabled state
                } catch (error) {
                    console.warn(`Error checking ${command} state:`, error);
                }
            }
        });
    }

    /**
     * @override
     * @method syncValueToInput
     */
    syncValueToInput() {
        // --- FIX: Use internal _value and check if update is needed ---
        if (this.inputElement && this.inputElement.innerHTML !== this._value) {
            this.isSettingContent = true;
            this.inputElement.innerHTML = this._value || "";
            this.isSettingContent = false;
        }
    }

    /**
     * @override
     * @method handleInput
     */
    handleInput() {
        if (this.inputElement && !this.isSettingContent) {
            // --- FIX: Update internal _value state ---
            this._value = this.inputElement.innerHTML;
            this.updateUI();
            this.options?.onChange?.(this._value);
        }
    }

    /**
     * @override
     * @method destroy
     */
    detach() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        super.detach();
    }

    /**
     * Set disabled state
     * @override
     * @param {boolean} disabled 
     */
    setDisabled(disabled) {
        super.setDisabled(disabled);
        if (this.inputElement) {
            this.inputElement.contentEditable = !disabled;
            this.updateToolbarState();
        }
    }
}