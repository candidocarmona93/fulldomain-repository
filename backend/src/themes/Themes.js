/**
 * @class Themes
 * @description A static class that manages themes for UI components. It allows registration of components and their theme variants, merging of new configurations, validation, and retrieval of theme-specific class names.
 */
export class Themes {
    /**
     * @property {Map<string, VariantMap>} registry - A map storing the registered components and their theme configurations.
     * @static
     */
    static registry = new Map();
    /**
     * @property {boolean} initialized - A flag indicating whether the default themes have been initialized.
     * @static
     */
    static initialized = false;

    /**
     * @method initialize
     * @static
     * @description Initializes the default component themes. This method is automatically called upon import.
     * @returns {void}
     */
    static initialize() {
        if (this.initialized) return;

        // Register core components with optional size variants
        this.register('text', { hasSize: true });
        this.register('button', { hasSize: true });
        this.register('floatingButton', { hasSize: true });
        this.register('outlinedButton', { hasSize: true });
        this.register('input', { hasSize: true });
        this.register('tagInput', { hasSize: true });
        this.register('textArea', { hasSize: true });
        this.register('select', { hasSize: true });
        this.register('checkbox', { hasSize: true });
        this.register('radio', { hasSize: true });
        this.register('toast', { hasSize: true });
        this.register('alert', { hasSize: true });
        this.register('badge', { hasSize: true });
        this.register('tile', { hasSize: true });
        this.register('navbar', { hasSize: true });
        this.register('table', { hasSize: true });
        this.register('modal', { hasSize: true });
        this.register('listTile', { hasSize: true });
        this.register('expansionTile', { hasSize: true });
        this.register('spinner', { hasSize: true });
        this.register('card', { hasSize: true });


        this.initialized = true;
    }

    /**
     * @method register
     * @static
     * @description Registers a new component and its theme variants.
     * @param {string} component - The name of the component to register.
     * @param {object} options - Configuration options for the component.
     * @param {boolean} [options.hasSize=false] - Indicates whether the component supports size variants.
     * @returns {void}
     */
    static register(component, { hasSize = false } = {}) {
        const config = {
            type: this.createVariants(component, 'type', [
                'default', 'basic', 'primary', 'secondary', 'danger',
                'info', 'success', 'warning', 'dark', 'error'
            ]),
            ...(hasSize && {
                size: this.createVariants(component, 'size', [
                    'xsmall', 'small', 'medium', 'large', 'xlarge'
                ])
            })
        };

        this.registry.set(component, config);
    }

    /**
     * @method createVariants
     * @static
     * @description Creates a set of variant classes for a component.
     * @param {string} component - The base name of the component.
     * @param {string} variantType - The type of variant being created (e.g., 'type', 'size').
     * @param {string[]} variants - An array of variant names (e.g., ['default', 'primary']).
     * @returns {Record<string, string[]>} An object mapping variant names to an array of CSS class names.
     */
    static createVariants(component, variantType, variants) {
        const baseClass = `${component.replace(/([A-Z])/g, '-$1').toLowerCase()}-widget`;
        return variants.reduce((acc, variant) => {
            acc[variant] = [`${baseClass}--${variant}`];
            return acc;
        }, {});
    }

    /**
     * @method merge
     * @static
     * @description Merges new theme configurations into an existing component.
     * @param {string} component - The name of the registered component.
     * @param {object} newConfig - An object containing the new theme configurations to merge.
     * @returns {void}
     * @throws {Error} If the specified component is not registered.
     */
    static merge(component, newConfig) {
        if (!this.registry.has(component)) {
            throw new Error(`Cannot merge: Component "${component}" is not registered.`);
        }

        const existing = this.registry.get(component);
        const merged = {};

        for (const key of Object.keys(newConfig)) {
            if (!Object.hasOwn(existing, key)) {
                console.warn(`Warning: "${key}" is not a recognized variant for "${component}"`);
            }

            merged[key] = {
                ...(existing[key] || {}),
                ...(newConfig[key] || {})
            };
        }

        this.registry.set(component, { ...existing, ...merged });
    }

    /**
     * @method validate
     * @static
     * @description Validates a component's theme structure to ensure it has the necessary variants.
     * @param {string} component - The name of the component to validate.
     * @returns {string[]|true} Returns `true` if the component's theme is valid, otherwise returns an array of error messages.
     */
    static validate(component) {
        const config = this.registry.get(component);
        const errors = [];

        if (!config) {
            errors.push(`Component "${component}" is not registered.`);
            return errors;
        }

        if (!config.type || !config.type.default) {
            errors.push(`Missing "default" type variant for "${component}".`);
        }

        if ('size' in config && (!config.size || !config.size.medium)) {
            errors.push(`Missing "medium" size variant for "${component}".`);
        }

        return errors.length ? errors : true;
    }

    /**
     * @method get
     * @static
     * @description Retrieves CSS class names for a component based on the specified variant types and sizes.
     * @param {string} component - The name of the component.
     * @param {object} options - An object specifying the theme variants to retrieve.
     * @param {string} [options.type='default'] - The type variant to retrieve (e.g., 'default', 'primary').
     * @param {string} [options.size] - The size variant to retrieve (e.g., 'small', 'large').
     * @returns {string[]} An array of CSS class names for the component.
     */
    static get(component, { type = 'default', size } = {}) {
        const config = this.registry.get(component);
        if (!config) return [];

        const classes = [];

        if (config.type?.[type]) {
            classes.push(...config.type[type]);
        }

        if (size && config.size?.[size]) {
            classes.push(...config.size[size]);
        }

        return classes;
    }

    /**
     * @typedef {Object} VariantMap
     * @property {Record<string, string[]>} type
     * @property {Record<string, string[]>=} size
     */

    /**
     * @method safeGet
     * @static
     * @description Safely retrieves the theme configuration for a component. If the component is not registered, it returns an empty configuration object to avoid errors.
     * @param {string} component - The name of the component.
     * @returns {VariantMap} The theme configuration for the component.
     */
    static safeGet(component) {
        const config = this.registry.get(component) || {};
        return {
            type: config.type || {},
            size: config.size || {}
        };
    }

    /**
     * @readonly
     * @static
     * @property {VariantMap} text - Accessor for the theme variants of the 'navbar' component.
     */
    static get navbar() { return this.safeGet('navbar'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} text - Accessor for the theme variants of the 'text' component.
     */
    static get text() { return this.safeGet('text'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} button - Accessor for the theme variants of the 'button' component.
     */
    static get button() { return this.safeGet('button'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} floatingButton - Accessor for the theme variants of the 'floatingButton' component.
     */
    static get floatingButton() { return this.safeGet('floatingButton'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} outlinedButton - Accessor for the theme variants of the 'outlinedButton' component.
     */
    static get outlinedButton() { return this.safeGet('outlinedButton'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} table - Accessor for the theme variants of the 'table' component.
     */
    static get table() { return this.safeGet('table'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} alert - Accessor for the theme variants of the 'alert' component.
     */
    static get alert() { return this.safeGet('alert'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} input - Accessor for the theme variants of the 'input' component.
     */
    static get input() { return this.safeGet('input'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} select - Accessor for the theme variants of the 'select' component.
     */
    static get select() { return this.safeGet('select'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} checkbox - Accessor for the theme variants of the 'checkbox' component.
     */
    static get checkbox() { return this.safeGet('checkbox'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} radio - Accessor for the theme variants of the 'radio' component.
     */
    static get radio() { return this.safeGet('radio'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} textArea - Accessor for the theme variants of the 'textArea' component.
     */
    static get textArea() { return this.safeGet('textArea'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} toast - Accessor for the theme variants of the 'toast' component.
     */
    static get toast() { return this.safeGet('toast'); }
    /**
     * @readonly
     * @static
     * @property {VariantMap} tile - Accessor for the theme variants of the 'tile' component.
     */
    static get tile() { return this.safeGet('tile'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} badge - Accessor for the theme variants of the 'badge' component.
     */
    static get badge() { return this.safeGet('badge'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} alert - Accessor for the theme variants of the 'alert' component.
     */
    static get alert() { return this.safeGet('alert'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} modal - Accessor for the theme variants of the 'modal' component.
     */
    static get modal() { return this.safeGet('modal'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} listTile - Accessor for the theme variants of the 'listTile' component.
     */
    static get listTile() { return this.safeGet('listTile'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} expansionTile - Accessor for the theme variants of the 'expansionTile' component.
     */
    static get expansionTile() { return this.safeGet('expansionTile'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} spinner - Accessor for the theme variants of the 'spinner' component.
     */
    static get spinner() { return this.safeGet('spinner'); }

    /**
     * @readonly
     * @static
     * @property {VariantMap} card - Accessor for the theme variants of the 'card' component.
     */
    static get card() { return this.safeGet('card'); }
}

/**
 * @typedef {Object} VariantMap
 * @property {Record<string, string[]>} type - An object mapping type variant names (e.g., 'default', 'primary') to arrays of CSS class names.
 * @property {Record<string, string[]>=} size - An optional object mapping size variant names (e.g., 'xsmall', 'large') to arrays of CSS class names.
 */

// Initialize on import
Themes.initialize();