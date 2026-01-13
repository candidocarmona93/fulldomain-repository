import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Button } from "../buttons/Button";
import "../../styles/data_display/paginator-widget.css";

/**
 * @class Paginator
 * @extends BaseWidget
 * @description A pagination widget for navigating through multiple pages of content.
 */
export class Paginator extends BaseWidget {
    /**
     * @constructor
     * @param {object} [options={}] - Configuration options for the Paginator widget.
     * @param {number} [options.totalItems=0] - Total number of items to paginate.
     * @param {number} [options.itemsPerPage=10] - Number of items per page.
     * @param {number} [options.currentPage=1] - Current active page.
     * @param {object} [options.params={}] - Additional parameters for query string generation.
     * @param {function} [options.onPageChange=() => {}] - Callback executed when page changes.
     * @param {number} [options.visiblePages=5] - Number of visible page buttons.
     * @param {object} [options.style={}] - Custom CSS styles.
     * @param {string[]} [options.className=[]] - Additional CSS class names.
     */
    constructor({
        totalItems = 0,
        itemsPerPage = 10,
        currentPage = 1,
        params = {},
        onPageChange = () => { },
        visiblePages = 5,
        style = {},
        className = [],
    } = {}) {
        super({
            tagName: "nav",
            className: ["paginator-widget", ...className],
            style,
        });

        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = currentPage;
        this.params = { ...params };
        this.onPageChange = onPageChange;
        this.visiblePages = visiblePages;

        this.totalPages = Math.ceil(totalItems / itemsPerPage);
    }

    /**
     * @method buildQueryString
     * @description Builds a query string with current parameters and page.
     * @param {number} page - The target page number.
     * @returns {string} The generated query string.
     * @private
     */
    buildQueryString(page) {
        const query = new URLSearchParams({
            ...this.params,
            page: page,
        }).toString();
        return `?${query}`;
    }

    /**
     * @method validatePage
     * @description Validates and normalizes a page number.
     * @param {number} page - The page number to validate.
     * @returns {number} The validated page number.
     * @private
     */
    validatePage(page) {
        return Math.max(1, Math.min(page, this.totalPages));
    }

    /**
     * @method goToPage
     * @description Navigates to a specific page.
     * @param {number} page - The target page number.
     */
    goToPage(page) {
        const validatedPage = this.validatePage(page);
        if (validatedPage !== this.currentPage) {
            this.currentPage = validatedPage;
            this.onPageChange({
                page: this.currentPage,
                limit: this.itemsPerPage,
                skip: (this.currentPage * this.itemsPerPage) - this.itemsPerPage,
                url: this.buildQueryString(this.currentPage),
            });
            this.update();
        }
    }

    /**
     * @method goToNextPage
     * @description Navigates to the next page.
     */
    goToNextPage() {
        this.goToPage(this.currentPage + 1);
    }

    /**
     * @method goToPreviousPage
     * @description Navigates to the previous page.
     */
    goToPreviousPage() {
        this.goToPage(this.currentPage - 1);
    }

    /**
     * @method goToFirstPage
     * @description Navigates to the first page.
     */
    goToFirstPage() {
        this.goToPage(1);
    }

    /**
     * @method goToLastPage
     * @description Navigates to the last page.
     */
    goToLastPage() {
        this.goToPage(this.totalPages);
    }

    /**
     * @method createPageItem
     * @description Creates a page navigation button.
     * @param {string|number} page - The page label or number.
     * @param {function} navigateTo - Navigation callback.
     * @param {boolean} active - Whether the button is active.
     * @param {boolean} disabled - Whether the button is disabled.
     * @returns {Button} The created button widget.
     * @private
     */
    createPageItem(page, navigateTo = null, active = false, disabled = false) {
        const isNavigation = typeof page === "string";
        const buttonType = active ? Themes.button.type.primary : Themes.button.type.default;

        let ariaLabel = `Page ${page}`;
        if (isNavigation) {
            switch (page) {
                case "«":
                    ariaLabel = "First page";
                    break;
                case "‹":
                    ariaLabel = "Previous page";
                    break;
                case "›":
                    ariaLabel = "Next page";
                    break;
                case "»":
                    ariaLabel = "Last page";
                    break;
            }
        }

        return new Button({
            label: `${page}`,
            theme: buttonType,
            size: Themes.button.size.small,
            className: ["paginator-button-item-widget"],
            onPressed: () => navigateTo?.(),
            disabled: disabled || active,
            props: {
                "aria-label": ariaLabel,
                ...(active && { "aria-current": "page" }),
            },
        });
    }

    /**
     * @method createEllipsis
     * @description Creates an ellipsis element for pagination.
     * @returns {BaseWidget} The ellipsis widget.
     * @private
     */
    createEllipsis() {
        return new BaseWidget({
            tagName: "span",
            className: ["paginator-ellipsis-item-widget"],
            props: { "aria-hidden": "true" },
            children: ["..."]
        });
    }

    /**
     * @method getVisiblePages
     * @description Calculates which pages should be visible in the paginator.
     * @returns {Array} Array of page numbers and ellipsis markers.
     * @private
     */
    getVisiblePages() {
        if (this.totalPages <= 1) return [];

        const pages = [];
        let start = Math.max(1, this.currentPage - Math.floor(this.visiblePages / 2));
        let end = Math.min(this.totalPages, start + this.visiblePages - 1);

        if (end - start < this.visiblePages - 1) {
            start = Math.max(1, end - this.visiblePages + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("ellipsis-start");
        }

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < this.totalPages) {
            if (end < this.totalPages - 1) pages.push("ellipsis-end");
            pages.push(this.totalPages);
        }

        return pages;
    }

    /**
     * @method render
     * @override
     * @description Renders the paginator widget.
     * @returns {HTMLElement} The rendered element.
     */
    render() {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = this.validatePage(this.currentPage);
        const navLinks = [];

        const firstButton = this.createPageItem(
            "«",
            () => this.goToFirstPage(),
            false,
            this.currentPage === 1
        );

        const prevButton = this.createPageItem(
            "‹",
            () => this.goToPreviousPage(),
            false,
            this.currentPage === 1
        );

        const nextButton = this.createPageItem(
            "›",
            () => this.goToNextPage(),
            false,
            this.currentPage === this.totalPages
        );

        const lastButton = this.createPageItem(
            "»",
            () => this.goToLastPage(),
            false,
            this.currentPage === this.totalPages
        );

        navLinks.push(firstButton, prevButton);

        this.getVisiblePages().forEach(page => {
            if (typeof page === "string") {
                navLinks.push(this.createEllipsis());
            } else {
                navLinks.push(this.createPageItem(
                    page,
                    () => this.goToPage(page),
                    page === this.currentPage
                ));
            }
        });

        navLinks.push(nextButton, lastButton);
        this.children = navLinks;

        return super.render();
    }

    /**
     * @method updateParams
     * @description Updates the paginator parameters and re-renders.
     * @param {object} newParams - New parameters to merge.
     */
    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.update();
    }

    /**
     * @method updateTotalItems
     * @description Updates the total items count and re-renders.
     * @param {number} newTotal - New total items count.
     */
    updateTotalItems(newTotal) {
        this.totalItems = newTotal;
        this.update();
    }

    /**
     * @method updateItemsPerPage
     * @description Updates the items per page count and re-renders.
     * @param {number} newCount - New items per page count.
     */
    updateItemsPerPage(newCount) {
        this.itemsPerPage = newCount;
        this.update();
    }
}