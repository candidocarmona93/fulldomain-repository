import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Button } from "../buttons/Button";
import { OffCanvas } from "../overlays/OffCanvas";
import { Style } from "../../core/Style";
import { NavItem } from "./NavItem";
import "../../styles/navigation/navbar-widget.css";

export class NavBar extends BaseWidget {
  constructor({
    fixed = false,
    brand = null,
    actions = [],
    items = [],
    theme = Themes.navbar.type.secondary,
    style = {},
    navBrandStyle = {},
    navItemsStyle = {},
    navActionsStyle = {},
    className = [],
    navBrandClassName = [],
    navItemsClassName = [],
    navActionsClassName = [],
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
  } = {}) {
    super({
      tagName: "nav",
      className: ["navbar-widget", "navbar-widget--medium", fixed ? "navbar-widget--fixed" : null, theme, ...className].filter(Boolean),
      style: new Style({ ...style }),
      props: { role: "navigation", ...props },
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
          brandElement: this.brandElement,
          navItemsElement: this.navItemsElement,
          actionsElement: this.actionsElement
        }, widget);
      },
    });

    this.brand = brand;
    this.actions = actions;
    this.items = items;
    this.navBrandStyle = navBrandStyle;
    this.navItemsStyle = navItemsStyle;
    this.navActionsStyle = navActionsStyle;
    this.navBrandClassName = navBrandClassName;
    this.navItemsClassName = navItemsClassName;
    this.navActionsClassName = navActionsClassName;
    
    this.isMobileMenuOpen = false;
    this.mobileOffCanvas = null;
    this.mobileToggleEl = null;
    this.navItemsContainer = null;
    this.brandElement = null;
    this.navItemsElement = null;
    this.actionsElement = null;
    
    this.resizeHandler = null;
    this.escapeHandler = null;
  }

  createBrand() {
    if (!this.brand) return null;
    
    return new BaseWidget({
      tagName: "div",
      className: ["navbar-brand-container-widget", ...this.navBrandClassName],
      style: { ...this.navBrandStyle },
      children: [
        new BaseWidget({
          tagName: "a",
          children: [this.brand.logo || this.brand.text],
          className: ["navbar-brand-widget", ...(this.brand.className || [])],
          events: this.brand.onClick ? { click: (e) => this.handleBrandClick(e) } : {},
          style: this.brand.style || {},
          props: {
            href: "javascript:void(0)",
            "aria-label": this.brand.ariaLabel || "Home",
            ...this.brand.props
          },
          onAttached: (el) => (this.brandElement = el)
        }),
      ],
    });
  }

  handleBrandClick(e) {
    e.preventDefault();
    this.brand.onClick?.(e);
  }

  createMobileToggle() {
    const toggleButton = new Button({
      className: ["navbar-mobile-toggle"],
      onPress: (e) => this.toggleMobileMenu(e),
      events: {
        keydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            this.toggleMobileMenu(e);
          }
        }
      },
      props: {
        "aria-label": "Toggle navigation",
        "aria-expanded": "false",
        role: "button",
        type: "button"
      },
      onAttached: (el) => {
        this.mobileToggleEl = el;
        el.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>')
      },
    });
    
    return toggleButton;
  }

  toggleMobileMenu(e) {
    e?.preventDefault();
    e?.stopPropagation();

    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    if (this.isMobileMenuOpen) return;

    this.isMobileMenuOpen = true;
    
    // Update toggle button state
    if (this.mobileToggleEl) {
      this.mobileToggleEl.setAttribute("aria-expanded", "true");
      this.mobileToggleEl.classList.add("active");
    }

    // Create offcanvas for mobile menu
    this.mobileOffCanvas = new OffCanvas({
      dismissable: true,
      className: ["navbar-offcanvas-widget"],
      content: [
        new BaseWidget({
          tagName: "div",
          className: ["navbar-mobile-content"],
          children: [
            new BaseWidget({
              tagName: "button",
              className: ["offcanvas-close"],
              children: ["×"],
              events: {
                click: () => this.closeMobileMenu()
              },
              props: {
                "aria-label": "Close menu",
                type: "button"
              }
            }),
            this.createNavItems(true)
          ]
        })
      ],
      onClose: () => {
        this.closeMobileMenu();
      },
      onAttached: (el) => {
        // Add escape key handler for mobile menu
        this.escapeHandler = (e) => {
          if (e.key === 'Escape') {
            this.closeMobileMenu();
          }
        };
        document.addEventListener('keydown', this.escapeHandler);
        
        // Focus the close button for accessibility
        const closeBtn = el.querySelector('.offcanvas-close');
        if (closeBtn) {
          setTimeout(() => closeBtn.focus(), 100);
        }
      }
    });
    
    this.mobileOffCanvas.show();

    // Handle window resize
    this.resizeHandler = () => {
      if (window.innerWidth > 992 && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  closeMobileMenu() {
    if (!this.isMobileMenuOpen) return;

    this.isMobileMenuOpen = false;
    
    // Update toggle button
    if (this.mobileToggleEl) {
      this.mobileToggleEl.setAttribute("aria-expanded", "false");
      this.mobileToggleEl.classList.remove("active");
      this.mobileToggleEl.focus();
    }

    // Close offcanvas
    if (this.mobileOffCanvas) {
      this.mobileOffCanvas.close();
      this.mobileOffCanvas = null;
    }

    // Clean up event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
    
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  createNavItems(forMobile = false) {
    const navItems = this.items.map((item) => new NavItem({ item }));
    
    return new BaseWidget({
      tagName: "ul",
      className: ["navbar-items-widget", forMobile ? "navbar-mobile-items" : ""],
      children: navItems,
      props: { role: "menubar" },
      onAttached: (el) => {
        if (!forMobile) {
          this.navItemsElement = el;
        }
      }
    });
  }

  createNavItemsContainer() {
    return new BaseWidget({
      tagName: "div",
      className: ["navbar-items-container-widget", ...this.navItemsClassName],
      style: { ...this.navItemsStyle },
      children: [this.createNavItems()],
      onAttached: (el) => (this.navItemsContainer = el),
    });
  }

  createActions() {
    return new BaseWidget({
      tagName: "div",
      className: ["navbar-actions-widget", ...this.navActionsClassName],
      style: { ...this.navActionsStyle },
      children: this.actions,
      props: { role: "toolbar" },
      onAttached: (el) => (this.actionsElement = el)
    });
  }

  render() {
    this.children = [
      this.createBrand(),
      this.createNavItemsContainer(),
      this.actions.length ? this.createActions() : null,
      this.createMobileToggle(),
    ].filter(Boolean);
    return super.render();
  }

  detach() {
    this.closeMobileMenu();
    
    // Clean up all event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    
    super.detach?.();
  }
}