import { BaseWidget } from "../../src/core/BaseWidget";
import { Themes } from "../../src/themes/Themes";
import { Text } from "../../src/widgets/elements/Text";
import { Spinner } from "../../src/widgets/feedback/Spinner";
import { Toast } from "../../src/widgets/feedback/Toast";
import { Center } from "../../src/widgets/layouts/Center";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import { BottomSheet } from "../../src/widgets/overlays/BottomSheet";
import { ContentHeaderComponent } from "../Components/ContentHeaderComponent";
import { Button } from "../../src/widgets/buttons/Button";
import { OffCanvas } from "../../src/widgets/overlays/OffCanvas";

// Constants
const STYLES = {
    buttons: {
        actionButton: { width: "auto", flexGrow: "1" },
        tableButton: { width: "auto", height: "auto!important" }
    },
    alerts: {
        default: { width: "100%" }
    },
    bottomSheets: {
        fullScreen: {
            minHeight: "100dvh",
            width: "100dvw"
        }
    },
    table: {
        text: { fontWeight: "400", fontSize: ".85rem" },
        number: { fontWeight: "500", fontSize: ".95rem", textAlign: "right", color: "rgb(78, 84, 200)!important" },
        date: { color: "#6c757d", fontSize: "0.95rem", textAlign: "center" },
        statusBadge: {
            justifySelf: "center",
            textAlign: "center",
            justifyContent: "center",
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            textAlign: 'center',
        },
        actionsColumn: {
            justifyContent: "flex-end",
        }
    },
    iframe: {
        fullHeight: { height: "100dvh" }
    },
    loadingSpinner: {
        container: { height: "250px" }
    }
};

const DEFAULT_LABELS = {
    view: "Visualizar",
    approve: "Aprovar",
    reject: "Rejeitar",
    cancel: "Cancelar",
    close: "Fechar",
    confirm: "Sim, confirmo"
};

/**
 * Status e Prioridade das Tarefas
 * Tudo unificado: tema + cor + texto em português
 */
export const STATUS = {
    // === ESTADO DA TAREFA ===
    pending: {
        label: "Pendente",
        backgroundColor: "#ffc107",
        textColor: "#000"        // amarelo
    },
    in_progress: {
        label: "Em progresso",
        backgroundColor: "#0dcaf0",
        textColor: "#fff"        // azul
    },
    completed: {
        label: "Concluída",
        backgroundColor: "#198754",
        textColor: "#fff"           // verde
    },
    cancelled: {
        label: "Cancelada",
        backgroundColor: "#dc3545",
        textColor: "#fff"          // vermelho
    },

    // === PRIORIDADE DA TAREFA ===
    low: {
        label: "Baixa",
        backgroundColor: "#6c757d",
        textColor: "#fff"                  // cinzento
    },
    normal: {
        label: "Normal",
        backgroundColor: "#0d6efd",
        textColor: "#fff"                   // azul primário
    },
    high: {
        label: "Alta",
        backgroundColor: "#fd7e14",
        textColor: "#fff"                   // amarelo/laranja
    },
    urgent: {
        label: "Urgente",
        backgroundColor: "#dc3545",
        textColor: "#fff"                    // vermelho forte
    },

    active: { label: "Ativo", backgroundColor: "rgba(46, 125, 50, 0.9)", textColor: "#e8f5e8" },
    inactive: { label: "Inativo", backgroundColor: "rgba(198, 40, 40, 0.9)", textColor: "#ffebee" },
    rented: { label: "Arrendado", backgroundColor: "rgba(21, 101, 192, 0.9)", textColor: "#e3f2fd" },
    sold: { label: "Vendido", backgroundColor: "rgba(239, 108, 0, 0.9)", textColor: "#fff3e0" }
};
/**
 * UIHelper - A comprehensive utility class for creating consistent UI components
 * with predefined styles and behaviors.
 */
export class UIHelper {
    // ====================
    // Button Components
    // ====================

    /**
     * Creates a primary action button
     * @param {Object} params - Button parameters
     * @param {string} [params.label=""] - Button label
     * @param {function} [params.onPressed=null] - Click handler
     * @returns {ButtonComponent} Configured button instance
     */
    static createPrimaryButton({ label = "", onPressed = null } = {}) {
        return this._createActionButton({
            label,
            onPressed,
            theme: Themes.button.type.primary
        });
    }

    /**
     * Creates a danger action button
     * @param {Object} params - Button parameters
     * @param {string} [params.label=""] - Button label
     * @param {function} [params.onPressed=null] - Click handler
     * @returns {ButtonComponent} Configured button instance
     */
    static createDangerButton({ label = "", onPressed = null } = {}) {
        return this._createActionButton({
            label,
            onPressed,
            theme: Themes.button.type.danger
        });
    }

    /**
     * Creates a view button for tables
     * @param {Object} params - Button parameters
     * @param {string} [params.label=DEFAULT_LABELS.view] - Button label
     * @param {function} [params.onPressed=null] - Click handler
     * @returns {ButtonComponent} Configured button instance
     */
    static createViewButton({ label = DEFAULT_LABELS.view, onPressed = null } = {}) {
        return this._createTableButton({
            label,
            onPressed,
            theme: Themes.button.type.secondary
        });
    }

    /**
     * Creates an approve button for tables
     * @param {Object} params - Button parameters
     * @param {string} [params.label=DEFAULT_LABELS.approve] - Button label
     * @param {function} [params.onPressed=null] - Click handler
     * @returns {ButtonComponent} Configured button instance
     */
    static createApproveButton({ label = DEFAULT_LABELS.approve, onPressed = null } = {}) {
        return this._createTableButton({
            label,
            onPressed,
            theme: Themes.button.type.primary
        });
    }

    /**
     * Creates a reject button for tables
     * @param {Object} params - Button parameters
     * @param {string} [params.label=DEFAULT_LABELS.reject] - Button label
     * @param {function} [params.onPressed=null] - Click handler
     * @returns {ButtonComponent} Configured button instance
     */
    static createRejectButton({ label = DEFAULT_LABELS.reject, onPressed = null } = {}) {
        return this._createTableButton({
            label,
            onPressed,
            theme: Themes.button.type.danger
        });
    }

    // ====================
    // Alert Components
    // ====================

    /**
     * Creates an info alert component
     * @param {Object} params - Alert parameters
     * @param {string} [params.message=""] - Alert message
     * @returns {Alert} Configured alert instance
     */
    static showInfoAlert({ message = "" } = {}) {
        return this._createAlert({
            message,
            type: Themes.alert.type.info
        });
    }

    /**
     * Creates a success alert component
     * @param {Object} params - Alert parameters
     * @param {string} [params.message=""] - Alert message
     * @returns {Alert} Configured alert instance
     */
    static showSuccessAlert({ message = "" } = {}) {
        return this._createAlert({
            message,
            type: Themes.alert.type.success
        });
    }

    /**
 * Creates a success alert component
 * @param {Object} params - Alert parameters
 * @param {string} [params.message=""] - Alert message
 * @returns {Alert} Configured alert instance
 */
    static showErrorAlert({ message = "" } = {}) {
        return this._createAlert({
            message,
            type: Themes.alert.type.error
        });
    }

    static showSuccessNotification({ message = "" } = {}) {
        return new Toast({
            message,
            theme: Themes.toast.type.success,
        }).show();
    }

    static showErrorNotification({ message = "" } = {}) {
        return new Toast({
            message,
            theme: Themes.toast.type.error,
        }).show();
    }

    static showWarningNotification({ message = "" } = {}) {
        return new Toast({
            message,
            theme: Themes.toast.type.warning,
        }).show();
    }

    static showInfoNotification({ message = "" } = {}) {
        return new Toast({
            message,
            theme: Themes.toast.type.info,
        }).show();
    }

    // ====================
    // Dialog Components
    // ====================

    /**
     * Shows a confirmation dialog with confirm/cancel buttons
     * @param {Object} params - Dialog parameters
     * @param {string} params.title - Dialog title
     * @param {string} params.subtitle - Dialog subtitle
     * @param {string} [params.confirmLabel=DEFAULT_LABELS.confirm] - Confirm button label
     * @param {string} [params.cancelLabel=DEFAULT_LABELS.cancel] - Cancel button label
     * @param {function} params.onConfirm - Confirm button callback
     * @param {function} params.onCancel - Cancel button callback
     * @returns {BottomSheet} The created bottom sheet instance
     */
    static showConfirmationDialog({
        title,
        subtitle,
        body = [],
        confirmLabel = DEFAULT_LABELS.confirm,
        cancelLabel = DEFAULT_LABELS.close,
        onConfirm,
        onCancel
    } = {}) {
        const content = [
            new ContentHeaderComponent({ title, subtitle }),
            ...body,
            new Row({
                gap: "5px",
                rowStyle: {
                    justifyContent: "center"
                },
                children: [
                    this.createPrimaryButton({ label: confirmLabel, onPressed: onConfirm }),
                    this.createDangerButton({ label: cancelLabel, onPressed: onCancel })
                ]
            })
        ];
        return this.showOffCanvas({ content, style: { alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" } });
    }

    /**
     * Shows a bottom sheet with given content
     * @param {Object} params - Bottom sheet parameters
     * @param {Array} params.content - Content to display
     * @returns {BottomSheet} The created bottom sheet instance
     */
    static showBottomSheet({ content }) {
        const bottomSheet = new BottomSheet({ style: { maxWidth: "600px" }, content });
        bottomSheet.show();
        return bottomSheet;
    }

    /**
     * Shows offcanvas with given content
     * @param {Object} params - offcanvas parameters
     * @param {Array} params.content - Content to display
     * @returns {OffCanvas} The created offcanvas instance
     */
    static showOffCanvas({ content, style = {} }) {
        const offCanvas = new OffCanvas({ style: { maxWidth: "600px", ...style }, content });
        offCanvas.show();
        return offCanvas;
    }

    /**
     * Shows a document preview in a full-screen bottom sheet
     * @param {Object} params - Preview parameters
     * @param {string} [params.title=""] - Document title
     * @param {string} [params.src=null] - Document source URL
     * @param {string} [params.employerId=""] - Employer ID for document path
     * @returns {BottomSheet} The created bottom sheet instance
     */
    static showDocumentPreview({ title = "", src = null, employerId = "" } = {}) {
        const documentSrc = src || `${APIEndpoints.ASSETS_ENV}/${employerId}/documents/${src}`;
        const content = [
            new Text({ text: title }),
            new BaseWidget({
                tagName: "iframe",
                style: STYLES.iframe.fullHeight,
                props: { src: documentSrc }
            })
        ];

        return this.showBottomSheet({
            style: STYLES.bottomSheets.fullScreen,
            content
        });
    }

    // ====================
    // Loading Indicators
    // ====================

    /**
     * Creates a loading spinner component
     * @returns {Container} Container with centered spinner
     */
    static createLoadingSpinner({ height = '250px' } = {}) {
        return new Container({
            style: height,
            children: [
                new Center({
                    children: [new Spinner()]
                })
            ]
        });
    }

    // ====================
    // Table Components
    // ====================

    /**
     * Creates text type column configuration
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} [params.width="auto"] - Column width
     * @returns {Object} Column configuration
     */
    static createTextColumn({ label, key, width = "auto", format = val => val, filterable = false, renderFn } = {}) {
        return this._createColumn({
            label,
            key,
            filterable,
            width,
            renderFn: (val, row) => {
                if (!val) return "";

                return renderFn ? renderFn(val, row) : new Text({
                    text: `${format(val, row)}`,
                    style: STYLES.table.text
                })
            }
        });
    }

    /**
     * Creates number type column configuration
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} [params.width="auto"] - Column width
     * @returns {Object} Column configuration
     */
    static createNumberColumn({ label, key, width = "auto", format = val => val, filterable = false } = {}) {
        return this._createColumn({
            label,
            key,
            filterable,
            width,
            renderFn: (val) => new Text({
                text: format(val),
                style: STYLES.table.number
            })
        });
    }

    /**
     * Creates formatted currency column configuration
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} [params.width="auto"] - Column width
     * @returns {Object} Column configuration
     */
    static createMoneyColumn({ label, key, width = "auto", filterable = false, symbol = "MZN" } = {}) {
        return this._createColumn({
            label,
            key,
            filterable,
            width,
            renderFn: (val, row) => new Text({
                text: this.simpleCurrencyFormat(val, row?.currencies?.code),
                style: STYLES.table.number
            })
        });
    }

    /**
     * Creates status badge column configuration
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} [params.width="auto"] - Column width
     * @returns {Object} Column configuration
     */
    static createStatusColumn({ label, key, width = "auto", format = val => val, filterable = false, renderFn = null } = {}) {
        return this._createColumn({
            label,
            key,
            filterable,
            width,
            renderFn: (val) => renderFn ? renderFn(val) : UIHelper.createBadge(val)
        });
    }

    static createBadge(val) {

        return new Container({
            style: {
                background: "transaprent!important",
                backgroundColor: STATUS[val]?.backgroundColor,
                padding: "0.25rem 0.75rem",
                borderRadius: "12px",
                display: "inline-block",
                width: "fit-content"
            },
            children: [
                new Text({
                    text: STATUS[val]?.label,
                    style: { color: `${STATUS[val]?.textColor}!important`, fontSize: "0.7rem", fontWeight: "bold" }
                })
            ]
        });
    }

    /**
     * Creates date formatted column configuration
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} [params.width="auto"] - Column width
     * @returns {Object} Column configuration
     */
    static createDateColumn({ label, key, width = "auto", filterable = false } = {}) {
        return this._createColumn({
            label,
            key,
            filterable,
            width,
            renderFn: (val) => new Text({
                style: STYLES.table.date
            })
        });
    }

    /**
     * Creates standard actions column configuration
     * @param {Object} params - Action parameters
     * @returns {Object} Column configuration
     */
    /**
 * Creates a configurable actions column for tables
 * @param {Object} params - Configuration parameters
 * @param {string} [params.label=""] - Column header label
 * @param {string} [params.key="id"] - Data property key
 * @param {Array<ActionConfig>} params.actions - Array of action configurations
 * @returns {Object} Column configuration
 */
    static createActionsColumn({
        label = "",
        key = "id",
        rowStyle = {},
        width = {},
        actions = []
    } = {}) {
        return {
            label,
            key,
            style: { width },
            renderFn: (val, row) => new Row({
                gap: "5px",
                rowStyle: { ...STYLES.table.actionsColumn, ...rowStyle },
                children: actions.map(action => {
                    let isDisabled = false;

                    if (action.hasOwnProperty('disabled')) {
                        if (typeof action?.disabled === 'function') {
                            isDisabled = action?.disabled(val, row);
                        } else {
                            isDisabled = Boolean(action?.disabled);
                        }
                    }

                    const button = this._createTableButton({
                        label: action?.label,
                        theme: action?.theme || Themes.button.type.secondary,
                        size: action?.size || Themes.button.size.small,
                        disabled: isDisabled,
                        onPressed: () => action.onAction(val, row)
                    });

                    if (action?.style) {
                        button.style = { ...button.style, ...action?.style };
                    }

                    return button;
                })
            })
        };
    }

    // ====================
    // Private Helpers
    // ====================

    /**
     * Creates a standard action button
     * @private
     * @param {Object} params - Button parameters
     * @param {string} params.label - Button label
     * @param {function} params.onPressed - Click handler
     * @param {string} params.theme - Button theme
     * @returns {Button} Configured button instance
     */
    static _createActionButton({ label, style, onPressed, theme }) {
        return new Button({
            label,
            theme,
            onPressed
        });
    }

    /**
     * Creates a table button with consistent styling
     * @private
     * @param {Object} params - Button parameters
     * @param {string} params.label - Button label
     * @param {function} params.onPressed - Click handler
     * @param {string} params.theme - Button theme
     * @returns {Button} Configured button instance
     */
    static _createTableButton({ label, style, disabled = false, onPressed, theme } = {}) {
        return new Button({
            style: { ...STYLES.buttons.tableButton, ...style },
            label,
            size: Themes.button.size.small,
            theme,
            disabled,
            onPressed
        });
    }

    /**
     * Creates an alert with consistent styling
     * @private
     * @param {Object} params - Alert parameters
     * @param {string} params.message - Alert message
     * @param {string} params.type - Alert type
     * @returns {Alert} Configured alert instance
     */
    static _createAlert({ message, type }) {
        return new Alert({
            style: STYLES.alerts.default,
            theme: type,
            message
        });
    }

    /**
     * Creates a standard column configuration
     * @private
     * @param {Object} params - Column parameters
     * @param {string} params.label - Column header label
     * @param {string} params.key - Data property key
     * @param {string} params.width - Column width
     * @param {function} params.renderFn - Cell render function
     * @returns {Object} Column configuration
     */
    static _createColumn({ label, key, width, renderFn }) {
        return {
            label,
            key,
            style: { width },
            renderFn
        };
    }

    /**
     * Gets badge theme based on status
     * @private
     * @param {string} status - Status value
     * @returns {string} Badge theme type
     */
    static _getBadgeTheme(key) {
        return STATUS[key]?.theme;
    }

    /**
     * Converts a formatted currency string into a numeric value.
     * It removes thousands separators, replaces the decimal separator with a dot,
     * and removes any non-digit characters except the decimal point.
     *
     * @param {string} formattedCurrency - The currency string to convert (e.g., "MZN 1.234,56").
     * @param {string} [decimalSeparator='.'] - The character used as the decimal separator (default is '.').
     * @param {string} [thousandsSeparator=','] - The character used as the thousands separator (default is ',').
     * @returns {number} The numeric value of the currency string. Returns 0 if the input is null, undefined, or empty.
     */
    static numericValue(formattedCurrency, decimalSeparator = '.', thousandsSeparator = ',') {
        if (!formattedCurrency) return 0;

        // Helper function to escape special characters for regex
        const regexEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Remove thousands separator, replace decimal separator with '.', and remove non-digit/non-'.' characters
        const clean = formattedCurrency.toString()
            .replace(new RegExp(regexEscape(thousandsSeparator), 'g'), '')
            .replace(new RegExp(regexEscape(decimalSeparator)), '.')
            .replace(/[^\d.]/g, '');

        // Parse as float. Use || 0 to handle cases where parsing results in NaN.
        return parseFloat(clean) || 0;
    }

    /**
     * Formats a numeric value as a simple currency string.
     * Rounds the value to two decimal places and applies thousands and decimal separators.
     *
     * @param {number | null | undefined | string} value - The numeric value to format.
     * @param {string} [currencySymbol='MZN '] - The currency symbol to prepend (default is 'MZN ').
     * @param {string} [decimalSeparator='.'] - The character to use as the decimal separator (default is '.').
     * @param {string} [thousandsSeparator=','] - The character to use as the thousands separator (default is ',').
     * @returns {string} The formatted currency string (e.g., "MZN 1,234.56"). Returns "MZN 0.00" for null/undefined/empty input.
     */
    static simpleCurrencyFormat(value, currencySymbol = 'MZN ', decimalSeparator = '.', thousandsSeparator = ',') {
        // Handle null/undefined/empty input
        if (value === null || value === undefined || value === '') {
            return currencySymbol + '0' + decimalSeparator + '00';
        }

        // Round to two decimal places to handle floating point inaccuracies
        value = Math.round(value * 100) / 100;

        const parts = value.toString().split('.');
        let numeric = parts[0];
        let cents = parts.length > 1 ? parts[1] : '00';

        // Ensure cents always has two digits
        if (cents.length < 2) cents = cents.padEnd(2, '0');

        // Add thousands separators using regex
        numeric = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

        return currencySymbol + " " + numeric + decimalSeparator + cents;
    }

    /**
     * Formats the value of a number input field as currency as the user types.
     * It cleans the input, formats it, and attempts to maintain the cursor position.
     * This method is typically used as an input event listener.
     *
     * @param {HTMLInputElement} element - The input element to format.
     */
    static formatNumberInput(element) {
        // Store current cursor position
        const cursorPosition = element.selectionStart;

        // Clean the input: remove non-digits
        let value = element.value.replace(/[^\d]/g, '');

        // Convert the cleaned integer string to a float representing the value in units (assuming cents input)
        const numberValue = parseFloat(value) / 100;

        // Format the number value back into the input field
        element.value = Helper.simpleCurrencyFormat(numberValue);

        // Log the formatted value to the console (optional, for debugging)
        //console.log(element.value);

        // Attempt to restore cursor position
        // This logic is a basic attempt and might need refinement for complex cases
        const formattedLength = element.value.length;
        // Calculate the change in length due to formatting and adjust cursor position
        const newCursorPosition = cursorPosition + (formattedLength - (value.length + 1)); // +1 accounts for potential decimal point
        // Ensure the new cursor position is not negative
        element.setSelectionRange(Math.max(0, newCursorPosition), Math.max(0, newCursorPosition));
    }

    // Utility for debouncing functions
    static debounce(fn, ms = DEFAULT_DEBOUNCE_MS) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), ms);
        };
    }

}