import { BaseWidget } from "../../core/BaseWidget";
import { Expand } from "./Expand";
import "../../styles/layouts/row-widget.css";

/**
 * @class Row
 * @extends BaseWidget
 * @description A widget that arranges its children in a row layout with configurable spacing.
 */
export class Row extends BaseWidget {
    /**
     * @constructor
     * @param {object} [options={}] - Configuration options for the Row widget.
     * @param {string} [options.tag="div"] - The HTML tag name for the row container.
     * @param {BaseWidget[]} [options.children=[]] - Child widgets to be arranged in row.
     * @param {object} [options.rowContainerStyle={}] - Styles for the row container.
     * @param {object} [options.rowStyle={}] - Styles for the inner row element.
     * @param {string} [options.gap="15px"] - The gap between children (sets --gutter-x).
     * @param {string|boolean} [options.containerPadding=false] - Container padding. Can be CSS value or true for default.
     * @param {string[]} [options.className=[]] - Additional CSS class names.
     * @param {object} [options.props={}] - Additional HTML properties.
     * @param {function} [options.onBeforeCreated=null] - Lifecycle hook called before creation.
     * @param {function} [options.onCreated=null] - Lifecycle hook called after creation.
     * @param {function} [options.onBeforeAttached=null] - Lifecycle hook called before attachment.
     * @param {function} [options.onAttached=null] - Lifecycle hook called after attachment.
     */
    constructor({
        tag = "div",
        children = [],
        rowContainerStyle = {},
        style = {},
        rowStyle = {},
        gap = "15px",
        containerPadding = false,
        className = [],
        props = {},
        onBeforeCreated = null,
        onCreated = null,
        onBeforeAttached = null,
        onAttached = null,
        onMounted = null,
    } = {}) {
        const containerClasses = ["row-container-widget", "row-container-widget--fluid"];

        if (containerPadding === true) {
            containerClasses.push("row-container-widget--spaced");
        } else if (containerPadding && typeof containerPadding === 'string') {
            rowContainerStyle.paddingLeft = containerPadding;
            rowContainerStyle.paddingRight = containerPadding;
        }

        super({
            tagName: tag,
            style: rowContainerStyle,
            className: [...containerClasses, ...className],
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
                    rowElement: this.rowElement
                }, widget);
            },
            onMounted: (el, widget) => {
                onMounted?.(el, {
                    rowElement: this.rowElement
                }, widget);
            },
        });

        this.gap = gap;
        this.children = this.createRowElement(children, { ...style, ...rowStyle });
    }

    validateChildrenIntegrity(children) {
        let isExpandChild = 0;
        let isNonExpandChild = 0;

        children.filter(Boolean).forEach(child => {
            if (child instanceof Expand) {
                isExpandChild++;
            } else {
                isNonExpandChild++;
            }
        });

        return {
            isExpandChild,
            isNonExpandChild
        }
    }

    /**
     * @method createRowElement
     * @description Creates the inner row element with configured styles and children.
     * @param {BaseWidget[]} children - Child widgets to be arranged.
     * @param {object} rowStyle - Styles for the row element.
     * @returns {BaseWidget} The configured row element widget.
     * @private
     */
    createRowElement(children, rowStyle) {
        const childIntegrity = this.validateChildrenIntegrity(children);

        if (childIntegrity.isExpandChild > 0 && childIntegrity.isNonExpandChild > 0) {
            console.error("You must provide only Expand widget or non Expand widget, do not mix Expand widget with any other widget");
            return;
        }

        const isValid = (childIntegrity.isNonExpandChild > 0 && childIntegrity.isExpandChild === 0);
        return [
            new BaseWidget({
                tagName: "div",
                className: ["row-widget"],
                style: {
                    ...rowStyle,
                    '--gutter-x': this.gap,
                    gap: isValid && this.gap
                },
                children,
                onAttached: (el) => {
                    this.rowElement = el;
                }
            })
        ];
    }
}