import { App } from "../../src/core/App";
import { Themes } from "../../src/themes/Themes";
import { Text } from "../../src/widgets/elements/Text";
import { Container } from "../../src/widgets/layouts/Container";

/**
 * Shared utilities for entity home pages
 */
export class SharedUtils {
    // =========================================================================
    // COLOR & AVATAR UTILITIES
    // =========================================================================

    /**
     * Generates a consistent color from a string
     * @param {string} str - Input string
     * @returns {string} Hex color code
     */
    static stringToColor(str) {
        if (!str) return '#6c757d';

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    /**
     * Extracts initials from a name
     * @param {string} name - Full name
     * @param {Object} options - Configuration options
     * @param {string} options.defaultValue - Default value when name is empty
     * @param {string} options.emptyValue - Value for empty names
     * @returns {string} Initials (2 characters)
     */
    static getInitials(name, options = {}) {
        const { defaultValue = "?", emptyValue = "?" } = options;

        if (!name || name?.trim() === '') return emptyValue;

        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /**
     * Creates an avatar badge component
     * @param {string} name - Display name
     * @param {Object} config - Configuration options
     * @returns {Container} Avatar badge component
     */
    static createAvatarBadge(name, config = {}) {
        const {
            emptyName = 'Não Atribuído',
            emptyBackgroundColor = '#f0f0f0',
            emptyTextColor = '#999',
            fontSize = '0.8rem',
            border = '2px solid #fff',
            showShadow = true,
            size,
        } = config;

        const displayName = name || emptyName;
        const isEmpty = !name || name === emptyName;

        const backgroundColor = isEmpty ? emptyBackgroundColor : this.stringToColor(displayName);
        const textColor = isEmpty ? emptyTextColor : '#FFF';
        const initials = this.getInitials(displayName, { emptyValue: emptyName === '' ? 'NA' : 'NA' });

        return new Container({
            style: {
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: backgroundColor,
                border: border,
                boxShadow: showShadow ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                flexShrink: 0,
                width: "40px",
                height: "40px",
            },
            attributes: { title: displayName },
            children: [
                new Text({
                    text: initials,
                    style: {
                        fontWeight: "600",
                        color: textColor,
                        fontSize: fontSize,
                        lineHeight: 1
                    }
                })
            ]
        });
    }

    // =========================================================================
    // FILTER UTILITIES
    // =========================================================================

    /**
     * Common filter configuration for entity pages
     * @param {FormElements} formElements - Form elements instance
     * @param {Array} filterFields - Filter fields configuration
     * @param {Function} applyCallback - Apply filters callback
     * @param {Function} clearCallback - Clear filters callback
     * @returns {Array} Filter inputs configuration
     */
    static createFilterInputs(formElements, controller, filterFields, applyCallback, clearCallback, initialValues = {}) {
        return [
            formElements.createForm({
                fields: filterFields || [],
                controller: controller,
                initialValues,
                actions: [
                    {
                        label: "Pesquisar",
                        icon: "fa fa-search",
                        onPressed: applyCallback,
                    },
                    {
                        label: "Limpar",
                        icon: "fa fa-times",
                        theme: Themes.button.type.danger,
                        onPressed: clearCallback
                    }
                ]
            })
        ];
    }

    // =========================================================================
    // ACTION COLUMN UTILITIES
    // =========================================================================

    /**
     * Creates standard table actions (View, Edit, Delete)
     * @param {Object} config - Action configuration
     * @returns {Array} Table actions array
     */
    static createTableActions(config = {}) {
        const {
            viewUrl = '',
            editUrl = '',
            onDelete = null,
            viewIcon = "fa-solid fa-eye",
            editIcon = "fa-solid fa-pen",
            deleteIcon = "fa-solid fa-trash",
            customActions = []
        } = config;

        const actions = [
            {
                icon: viewIcon,
                theme: Themes.button.type.primary,
                onAction: (id) => App.instance.to(viewUrl.replace('{id}', id))
            },
            {
                icon: editIcon,
                onAction: (id) => App.instance.to(editUrl.replace('{id}', id))
            }
        ];

        if (onDelete) {
            actions.push({
                icon: deleteIcon,
                theme: Themes.button.type.danger,
                onAction: onDelete
            });
        }

        return [...actions, ...customActions];
    }

    // =========================================================================
    // CARD STYLE UTILITIES
    // =========================================================================

    /**
     * Standard card styles for grid items
     * @param {Object} overrides - Style overrides
     * @returns {Object} Card style object
     */
    static getCardStyles(overrides = {}) {
        const baseStyles = {
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            backgroundColor: "#fff"
        };

        return { ...baseStyles, ...overrides };
    }

    /**
     * Standard text styles
     * @returns {Object} Text style definitions
     */
    static getTextStyles() {
        return {
            MUTED: { fontSize: "0.75rem", color: "#9aa0ac", fontWeight: "500" },
            BOLD: { fontWeight: "600", fontSize: "1rem", color: "#333" },
            REGULAR: { fontSize: "0.9rem", color: "#555", fontWeight: "500" }
        };
    }

    static formatPrice(price) {
        if (!price || price <= 0) return "Preço sob consulta";
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    static formatDate(dateString) {
        if (!dateString) return "Data não disponível";
        return new Intl.DateTimeFormat('pt-MZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(dateString));
    }

    static formatDateTime(dateString) {
        if (!dateString) return "Data não disponível";
        return new Intl.DateTimeFormat('pt-MZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }
}