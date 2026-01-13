import { BaseWidget } from "../../core/BaseWidget";

/**
 * @class NavItem
 * @extends BaseWidget
 * @description
 * Represents a single navigation item within a Navbar, supporting links and dropdown menus.
 *
 * @example
 * // Simple NavItem
 * const homeNavItem = new NavItem({ item: { text: "Home", href: "/" } });
 *
 * // NavItem with a dropdown menu
 * const productsNavItem = new NavItem({
 * item: {
 * text: "Products",
 * href: "/products",  // Optional:  You can have a link and a dropdown.
 * dropdown: [
 * { text: "Electronics", href: "/electronics" },
 * { text: "Clothing", href: "/clothing" },
 * ],
 * },
 * });
 */
export class NavItem extends BaseWidget {
  /**
   * @constructor
   * @param {object} options - Configuration options for the NavItem.
   * @param {object} options.item -  The item configuration.
   * @param {string} options.item.text - The text of the navigation item.
   * @param {string} [options.item.href="#"] - The URL for the navigation item. Defaults to "#".
   * @param {boolean} [options.item.active=false] - If true, the item is marked as active.
   * @param {object[]} [options.item.dropdown] - An array of objects defining the dropdown menu items.  Each dropdown item can have `text`, `href`, and nested `dropdown` properties.
   * @param {function} [options.item.onClick] -  A callback function to be executed when the item is clicked.
   * @param {object} [options.item.style] - Custom styles for the item.
   * @param {object} [options.item.props] -  Additional HTML attributes for the item.
   * @param {string[]} [options.item.className] -  Additional CSS class names for the item.
   */
  constructor({ item }) {
    super({
      tagName: "li",
      className: ["navbar-items-item-widget", ...(item.className || [])],
      style: item.style || {},
      props: { role: "none", ...item.props },
    });

    /**
     * @property {object} item - The item configuration.
     */
    this.item = item;
    /**
     * @property {boolean} dropdownOpen -  Flag indicating if the dropdown is open.
     * @private
     */
    this.dropdownOpen = false;
    /**
     * @property {HTMLElement|null} dropdownElement - Reference to the dropdown DOM element.
     * @private
     */
    this.dropdownElement = null;
    /**
     * @property {Function|null} clickHandler - Reference to the document click handler.
     * @private
     */
    this.clickHandler = null;
    /**
     * @property {string} ARRAY_DOWN_SVG - The SVG for the dropdown arrow icon.
     * @private
     */
    this.ARRAY_DOWN_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>';
  }

  /**
   * @method createItemLink
   * @description Creates the link element for the navigation item.
   * @returns {BaseWidget} A BaseWidget instance representing the link.
   */
  createItemLink() {
    const linkEvents = this.item.dropdown?.length
      ? {
        click: (e) => this.toggleDropdown(e),
        keydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            this.toggleDropdown(e);
          }
        },
      }
      : this.item.onClick
        ? {
          click: (e) => {
            e.preventDefault();
            this.item.onClick(e);
          },
        }
        : {};

    return new BaseWidget({
      tagName: "a",
      children: [this.item.text],
      className: [this.item.active ? "active" : ""],
      style: { ...this.item.style },
      props: {
        href: this.item.href || "#",
        title: this.item.text,
        role: "menuitem",
        "aria-haspopup": this.item.dropdown?.length ? "true" : undefined,
        "aria-expanded": "false",
        tabIndex: "0",
      },
      events: linkEvents,
      onAttached: (el, _, __) => {
        if (this.item.dropdown?.length) {
          el.insertAdjacentHTML("beforeend", this.ARRAY_DOWN_SVG);
        }
        this.anchorElement = el;
      },
    });
  }

  /**
   * @method createDropdown
   * @description Creates the dropdown menu for the navigation item.
   * @returns {BaseWidget} A BaseWidget instance representing the dropdown menu.
   */
  createDropdown() {
    return new BaseWidget({
      tagName: "ul",
      className: ["navbar-items-dropdown-widget"],
      children: (this.item.dropdown || []).map(
        (dropdownItem) => new NavItem({ item: dropdownItem })
      ),
      props: { role: "menu" },
      onAttached: (el) => {
        this.dropdownElement = el;
      },
    });
  }

  /**
   * @method toggleDropdown
   * @description Toggles the visibility of the dropdown menu.
   * @param {Event} event - The event object.
   * @returns {void}
   */
  toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.dropdownElement || !this.anchorElement) return;

    const isExpanded = this.anchorElement.getAttribute("aria-expanded") === "true";
    const newExpandedState = !isExpanded;

    // Update aria-expanded attribute
    this.anchorElement.setAttribute("aria-expanded", newExpandedState.toString());

    // Toggle dropdown visibility
    this.dropdownElement.classList.toggle("show");
    this.anchorElement.classList.toggle("active");

    // Position dropdown based on viewport
    if (newExpandedState && this.dropdownElement) {
      this.positionDropdown();

      // Add click outside handler
      this.setupClickOutsideHandler();
    } else {
      // Remove click outside handler when closing
      this.removeClickOutsideHandler();
    }
  }

  /**
   * @method positionDropdown
   * @description Positions the dropdown based on viewport space.
   * @private
   * @returns {void}
   */
  positionDropdown() {
    if (!this.dropdownElement) return;

    // Remove existing positioning classes
    this.dropdownElement.classList.remove("right", "left");

    // Calculate position
    const rect = this.dropdownElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Check if dropdown would overflow on the right
    if (rect.right > viewportWidth - 20) {
      // Not enough space on the right, position to the left
      this.dropdownElement.classList.add("left");
    } else if (rect.left < 20) {
      // Not enough space on the left, position to the right
      this.dropdownElement.classList.add("right");
    }
    // Default positioning (CSS should handle)
  }

  /**
   * @method setupClickOutsideHandler
   * @description Sets up event listener to close dropdown when clicking outside.
   * @private
   * @returns {void}
   */
  setupClickOutsideHandler() {
    // Remove any existing handler first
    this.removeClickOutsideHandler();

    this.clickHandler = (e) => {
      if (
        this.dropdownElement &&
        this.anchorElement &&
        !this.dropdownElement.contains(e.target) &&
        !this.anchorElement.contains(e.target)
      ) {
        this.closeDropdown();
      }
    };

    // Use setTimeout to avoid immediate closing when clicking the trigger
    setTimeout(() => {
      document.addEventListener("click", this.clickHandler);
      document.addEventListener("keydown", this.handleEscapeKey);
    }, 0);
  }

  /**
   * @method handleEscapeKey
   * @description Handles Escape key press to close dropdown.
   * @private
   * @param {KeyboardEvent} e - The keyboard event.
   * @returns {void}
   */
  handleEscapeKey = (e) => {
    if (e.key === "Escape" && this.dropdownElement?.classList.contains("show")) {
      this.closeDropdown();
    }
  };

  /**
   * @method closeDropdown
   * @description Closes the dropdown menu.
   * @private
   * @returns {void}
   */
  closeDropdown() {
    if (this.anchorElement) {
      this.anchorElement.setAttribute("aria-expanded", "false");
      this.anchorElement.classList.remove("active");
    }

    if (this.dropdownElement) {
      this.dropdownElement.classList.remove("show");
    }

    this.removeClickOutsideHandler();
  }

  /**
   * @method removeClickOutsideHandler
   * @description Removes the click outside event listener.
   * @private
   * @returns {void}
   */
  removeClickOutsideHandler() {
    if (this.clickHandler) {
      document.removeEventListener("click", this.clickHandler);
      document.removeEventListener("keydown", this.handleEscapeKey);
      this.clickHandler = null;
    }
  }

  /**
   * @method isElementInViewport
   * @description Checks if an element is within the viewport.
   * @param {HTMLElement} el - The element to check.
   * @returns {boolean} True if the element is in the viewport.
   */
  isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  /**
   * @method onDetached
   * @override
   * @description Removes the click listener when the component is unmounted.
   * @returns {void}
   */
  detach() {
    this.removeClickOutsideHandler();
    super.detach?.();
  }

  /**
   * @method render
   * @override
   * @description Overrides the `render` method of `BaseWidget`.  It assembles the nav item structure.
   * @returns {HTMLElement} The root DOM element of the nav item widget.
   */
  render() {
    this.children = [this.createItemLink()];
    if (this.item.dropdown?.length) {
      this.children.push(this.createDropdown());
    }
    return super.render();
  }
}