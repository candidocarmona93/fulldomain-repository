import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { Themes } from "../../themes/Themes";
import { Column } from "../layouts/Column";
import "../../styles/data_display/list-tile-widget.css";

/**
 * @class ListTile
 * @extends BaseWidget
 * @description
 * A widget that creates a styled list item, similar to those found in mobile UIs.  It can contain a leading icon/widget,
 * a title, a subtitle, and a trailing icon/widget.
 *
 * @example
 * // Example usage:
 * const myTile = new ListTile({
 * theme: Themes.tile.default,
 * leading: new BaseWidget({ tagName: 'i', className: ['fas', 'fa-info-circle'] }),
 * title: 'My Title',
 * subtitle: 'My Subtitle',
 * trailing: new BaseWidget({ tagName: 'i', className: ['fas', 'fa-chevron-right'] }),
 * onTap: () => console.log('Tile tapped!'),
 * });
 */
export class ListTile extends BaseWidget {
    /**
     * @constructor
     * @param {object} [options={}] - Configuration options for the ListTile.
     * @param {string} [options.theme=Themes.tile.default] - The visual theme of the list tile.  Defaults to `Themes.tile.default`.
     * @param {BaseWidget} [options.leading] -  A widget to display at the beginning of the list tile.
     * @param {string|BaseWidget} [options.title] -  The main text content of the list tile.
     * @param {string|BaseWidget} [options.subtitle] -  Additional text content displayed below the title.
     * @param {BaseWidget} [options.trailing] - A widget to display at the end of the list tile.
     * @param {string[]} [options.className=[]] -  An array of additional CSS class names to apply to the list tile. Defaults to [].
     * @param {object} [options.leadingStyle={}] - Custom CSS styles for the leading widget. Defaults to {}.
     * @param {object} [options.trailingStyle={}] - Custom CSS styles for the trailing widget. Defaults to {}.
     * @param {object} [options.titleStyle={}] -  Custom CSS styles for the title text. Defaults to {}.
     * @param {object} [options.subtitleStyle={}] - Custom CSS styles for the subtitle text. Defaults to {}.
     * @param {function} [options.onTap] -  A callback function called when the list tile is tapped (clicked).
     * @param {object} [options.style={}] -  Custom CSS styles to apply to the list tile container. Defaults to {}.
      * @param {object} [options.events={}] -  Additional DOM events to attach to the list tile.
      * @param {function} [options.onBeforeCreated] -  A callback function called before the list tile is created.
      * @param {function} [options.onCreated] - A callback function called after the list tile is created.
      * @param {function} [options.onBeforeAttached] - A callback function called before the list tile is attached.
      * @param {function} [options.onAttached] - A callback function called after the list tile is attached to the DOM.
     */
    constructor({
        theme = Themes.tile.type.primary, // success, error, warning, info
        leading = null,
        title = null,
        subtitle = null,
        trailing = null,
        className = [],
        leadingStyle = {},
        trailingStyle = {},
        titleStyle = {},
        subtitleStyle = {},
        onTap = null,
        style = {},
        props = {},
        events = {},
        onBeforeCreated = null,
        onCreated = null,
        onBeforeAttached = null,
        onAttached = null,
        onMounted = null,
    } = {}) {
        super({
            tagName: "div",
            className: ["list-tile-widget", theme, ...className],
            style: new Style({
                ...style,
            }),
            events: onTap ? { click: onTap, ...events } : { ...events },
            props,
            onBeforeCreated: (widget) => {
                onBeforeCreated?.(widget);
            },
            onCreated: (el, widget) => {
                onCreated?.(el, widget);
            },
            onBeforeAttached: (el, widget) => {
                onBeforeAttached?.(el, widget);
            },
            onAttached: (el, widget) => {
                onAttached?.(el, {
                    leadingElement: this.leadingElement,
                    trailingElement: this.trailingElement,
                    titleElement: this.titleElement,
                    subtitleElement: this.subtitleElement
                }, widget);
            },
            onMounted: (el, widget) => {
                onMounted?.(el, {
                    leadingElement: this.leadingElement,
                    trailingElement: this.trailingElement,
                    titleElement: this.titleElement,
                    subtitleElement: this.subtitleElement
                }, widget);
            },
        });

        /**
         * @property {string|BaseWidget} title - The title of the list tile.
         */
        this.title = title;
        /**
         * @property {string|BaseWidget} subtitle - The subtitle of the list tile.
         */
        this.subtitle = subtitle;
        /**
         * @property {BaseWidget} leading - The leading widget of the list tile.
         */
        this.leading = leading;
        /**
         * @property {BaseWidget} trailing - The trailing widget of the list tile.
         */
        this.trailing = trailing;
        /**
         * @property {object} leadingStyle - The style for leading widget.
         */
        this.leadingStyle = leadingStyle;
        /**
         * @property {object} trailingStyle - The style for trailing widget.
         */
        this.trailingStyle = trailingStyle;
        /**
        * @property {object} titleStyle - The style for title widget.
        */
        this.titleStyle = titleStyle;
        /**
        * @property {object} subtitleStyle - The style for subtitle widget.
        */
        this.subtitleStyle = subtitleStyle;

        /**
         * @property {HTMLElement} leadingElement -  The DOM element of the leading widget.
         * @private
         */
        this.leadingElement = null;
        /**
         * @property {HTMLElement} trailingElement - The DOM element of the trailing widget.
         * @private
         */
        this.trailingElement = null;
        /**
         * @property {HTMLElement} titleElement - The DOM element of the title.
         * @private
         */
        this.titleElement = null;
        /**
         * @property {HTMLElement} subtitleElement - The DOM element of the subtitle.
         * @private
         */
        this.subtitleElement = null;
    }

    /**
     * @method createLeading
     * @description Creates the leading widget.
     * @returns {BaseWidget}
     */
    createLeading() {
        return new BaseWidget({
            children: [this.leading],
            className: ["list-tile-leading-widget"],
            style: new Style({ ...this.leadingStyle }),
            onAttached: (el) => {
                this.leadingElement = el;
            }
        });
    }

    /**
     * @method createTrailing
     * @description Creates the trailing widget.
     * @returns {BaseWidget}
     */
    createTrailing() {
        return new BaseWidget({
            children: [this.trailing],
            className: ["list-tile-trailing-widget"],
            style: new Style({ ...this.trailingStyle }),
            onAttached: (el) => {
                this.trailingElement = el;
            }
        });
    }

    /**
     * @method createTitle
     * @description Creates the title widget.
     * @returns {BaseWidget}
     */
    createTitle() {
        if (Array.isArray(this.title)) return;

        return new BaseWidget({
            tagName: "div",
            className: ["title-widget"],
            children: [this.title],
            style: new Style({
                ...this.titleStyle
            }),
            onAttached: (el) => {
                this.titleElement = el;
            }
        });
    }

    /**
     * @method createSubtitle
     * @description Creates the subtitle widget.
     * @returns {BaseWidget}
     */
    createSubtitle() {
        if (Array.isArray(this.subtitle)) return;

        return new BaseWidget({
            tagName: "div",
            children: [this.subtitle],
            className: ["subtitle-widget"],
            style: new Style({
                ...this.subtitleStyle
            }),
            onAttached: (el) => {
                this.subtitleElement = el;
            }
        });
    }

    /**
     * @method render
     * @override
     * @description Renders the list tile.
     * @returns {HTMLElement}
     */
    render() {
        this.children = [
            this.leading ? this.createLeading() : null,
            new Column({
                gap: 2,
                children: [
                    this.createTitle(),
                    this.createSubtitle(),
                ]
            }),
            this.trailing ? this.createTrailing() : null,
        ].filter(Boolean);

        return super.render();
    }
}
