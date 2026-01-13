import { generateUUID } from "../utils/Helper";
import { Hooks } from "./Hooks";
import { Style } from "./Style";
import { Events } from "./Events";
import { Template } from "./Template";
import { Dom } from "./Dom";
import { ReactiveState } from "./ReactiveState";

export class BaseWidget {
  constructor({
    tagName = "div",
    rootElement = null,
    children = [],
    style = {},
    events = {},
    className = [],
    props = {},
    widgetState = {},
    args = {},
    html = "",
    path = null,
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
    onBeforeDetached = null,
    onDetached = null,
    onBeforeUpdate = null,
    onDidUpdated = null,
  } = {}) {
    // Use UUID for external ID (props, attributes)
    const externalId = `${this.constructor.name.toString().toLowerCase()}-${generateUUID()}`;

    // Use Symbol for internal tracking

    // Core properties
    this._isRootElement = false;
    this.tagName = tagName;
    this.rootElement = rootElement;
    this.children = this.notify(children || []);
    this.style = style instanceof Style ? style : new Style({ ...style });
    this.events = events;
    this.className = Array.isArray(className)
      ? className.filter(Boolean)
      : [className];
    this.props = { id: externalId, ...props };
    this.args = args;
    this.path = path;
    this.html = html;

    // Initialize modules
    this.hooks = new Hooks({
      onBeforeCreated,
      onCreated,
      onBeforeAttached,
      onAttached,
      onMounted,
      onBeforeDetached,
      onDetached,
      onBeforeUpdate,
      onDidUpdated
    });

    this.reactiveState = new ReactiveState(this, { ...widgetState });
    this.eventsManager = new Events(this);
    this.template = new Template(this);
    this.dom = new Dom(this);

    this.render = this.render.bind(this);
    this._initializeChildrenKeys();
  }

  _initializeChildrenKeys() {
    this.children.forEach((child, index) => {
      if (child instanceof BaseWidget) {
        if (!child._key) {
          const parentKey = this._key || this.constructor.name;
          const childType = child.constructor.name;
          child.index = index;
          // Stable auto-key
          child._key = `${parentKey}-${index}-${childType}`;
        }
        // Always recurse (in case deep children changed)
        child._initializeChildrenKeys();
      }
    });
  }

  // Lifecycle methods
  beforeCreated(widget) { this.hooks.beforeCreated(widget); }
  created(el, widget) { this.hooks.created(el, widget); }
  beforeAttached(el, widget) { this.hooks.beforeAttached(el, widget); }
  attached(el, widget) { this.hooks.attached(el, widget); }
  mounted(el, widget) { this.hooks.mounted(el, widget); }
  beforeDetached() { this.hooks.beforeDetached(); }
  detached(removedChildNode) { this.hooks.detached(removedChildNode); }
  beforeUpdate() { this.hooks.beforeUpdate(); }
  didUpdated() { this.hooks.didUpdated(); }

  render() {
    try {
      // If element already exists, update it
      if (this._element) {
        this.update();
        return this._element;
      }

      // Call beforeCreated hook if creating new element
      if (this.tagName && !this.rootElement) {
        this.beforeCreated(this);
      }

      // Create or get DOM element
      const el = this.dom.createElement();
      if (!el) return null;

      // Call created hook
      this.created(el, this);

      // Apply styles, classes, and attributes
      this.dom.applyStyles(el);
      this.dom.applyClasses(el);
      this.dom.applyAttributes(el);

      // Attach events and call beforeAttached hook
      this.eventsManager.attachEvents(el);
      this.beforeAttached(el, this);
      // Render children
      this.dom.renderChildren(el);

      // Store element reference and call attached hook
      this._element = el;
      this.attached(el, this);
      if (this.html.trim()) {
        el.insertAdjacentHTML('beforeend', this.html.trim())
      }

      // If this is a root element, call mounted hook
      if (this._isRootElement) {
        this.mounted(this._element, this);
      }
      return el;
    } catch (error) {
      console.error("BaseWidget render error:", error);
      return null;
    }
  }

  // State Management
  setState(updater) {
    this.reactiveState.setState(updater);
  }

  initState(initVal = {}) {
    this.state = this.reactiveState.initState(initVal);
  }

  /**
   * Gets the widget's *own* reactive state.
   * This is explicit and does not search the parent tree.
   */
  getState() {
    return this.reactiveState?.state || null;
  }

  /**
   * Explicitly gets the state of another widget.
   * @param {BaseWidget | string} targetWidget - The widget instance or its ID.
   * Note: This searches from the root widget down, which is a safer "global" search.
   */
  getStateOf(targetWidget) {
    let widget = null;
    if (typeof targetWidget === 'string') {
      // Search from the root widget down to find any widget by ID
      widget = this.getRootWidget().findDescendantById(targetWidget);
    } else if (targetWidget instanceof BaseWidget) {
      widget = targetWidget;
    }

    return widget?.reactiveState?.state || null;
  }

  /**
   * Finds a widget by its ID, searching self and all descendants.
   */
  findDescendantById(widgetId) {
    // Check self first
    if (this.props?.id === widgetId) {
      return this;
    }

    // Check children recursively
    for (const child of this.children) {
      if (child instanceof BaseWidget) {
        const found = child.findDescendantById(widgetId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Finds a widget by its key, searching self and all descendants.
   */
  findDescendantByKey(widgetKey) {
    // Check self first
    if (this.props?.key === widgetKey) {
      return this;
    }

    // Check children recursively
    for (const child of this.children) {
      if (child instanceof BaseWidget) {
        const found = child.findDescendantByKey(widgetKey);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * Finds the first widget of a given type, searching self and all descendants.
   */
  findDescendantByType(widgetType) {
    const targetType = widgetType.toLowerCase();

    // Check self first
    if (this.constructor.name.toLowerCase() === targetType) {
      return this;
    }

    // Check children recursively
    for (const child of this.children) {
      if (child instanceof BaseWidget) {
        const found = child.findDescendantByType(widgetType);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Finds the first widget of a given type, searching self and all ancestors.
   */
  findAncestorByType(widgetType) {
    const targetType = widgetType.toLowerCase();
    let widget = this;

    while (widget) {
      if (widget.constructor.name.toLowerCase() === targetType) {
        return widget;
      }
      widget = widget._parent;
    }
    return null;
  }

  /**
   * Gets the root widget of the component tree.
   */
  getRootWidget() {
    let widget = this;
    while (widget._parent) {
      widget = widget._parent;
    }
    return widget;
  }

  /**
   * Finds all widgets of a given type, searching self and all descendants.
   */
  findAllDescendantsByType(widgetType) {
    const results = [];
    const targetType = widgetType.toLowerCase();

    // Check self
    if (this.constructor.name.toLowerCase() === targetType) {
      results.push(this);
    }

    // Check children recursively
    for (const child of this.children) {
      if (child instanceof BaseWidget) {
        results.push(...child.findAllDescendantsByType(widgetType));
      }
    }
    return results;
  }

  /**
   * Emits an event to all widgets of a specific type found *within* this widget (descendants).
   */
  broadcastToWidgets(widgetType, eventName, ...args) {
    const targets = this.findAllDescendantsByType(widgetType);
    targets.forEach(widget => {
      widget.emit(eventName, ...args);
    });
  }

  // Event handling
  on(eventName, callback, options) {
    return this.eventsManager.on(eventName, callback, options);
  }

  off(eventName, handlerId) {
    this.eventsManager.off(eventName, handlerId);
  }

  once(eventName, callback) {
    return this.eventsManager.once(eventName, callback);
  }

  emit(eventName, ...args) {
    this.eventsManager.emit(eventName, ...args);
  }

  // DOM utilities
  getParent() { return this._parent; }
  getElement() { return this._element; }
  getWidget() { return this._currentWidget; }
  getChildIndex(child) { return this.children.indexOf(child); }

  appendChild(child) {
    if (child instanceof BaseWidget) {
      child._parent = this;
      this.children.push(child);

      if (this._element) {
        const childElement = child.render();
        if (childElement) {
          this._element.appendChild(childElement);
          this.hooks.addDeferredMountedCall(child, () =>
            child.mounted(child._element, child)
          );
        }
      }
    }
  }

  insertChild(child, index) {
    if (child instanceof BaseWidget) {
      child._parent = this;
      this.children.splice(index, 0, child);

      if (this._element) {
        this.dom.insertChildAtIndex(child, index);
      }
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      this.dom.removeChild(child);
    }
  }

  detach() {
    if (this._element) {
      this.beforeDetached();

      // Clean up events
      this.eventsManager.clear();

      // Detach children
      this.children.forEach((child) => {
        if (child instanceof BaseWidget) {
          child.detach();
          if (this._parent) {
            this.hooks.deleteDeferredMountedCall(child);
          }
        }
      });

      // Remove DOM children
      this.dom.detachChildren();

      // Clean up state
      this.reactiveState?.detach();
    }
  }

  update() {
    if (!this._element || this._element == null) return;
    this.beforeUpdate();
    this.detach();
    this.dom.renderChildren(this._element);
    this.didUpdated();
    this.mounted(this._element, this);
  }

  patch() {
    if (!this._element || this._element == null) return;
    this.beforeUpdate();
    this.dom.patchChildren();
    this.didUpdated();
  }

  updateStyles(newStyles = {}) {
    this.style = { ...this.style, ...newStyles };
    this.dom.applyStyles(this._element);
  }

  updateClasses(newClassesName = []) {
    // Convert to array, clean, and get unique classes
    const classesToAdd = newClassesName
      .map(cls => cls.trim())
      .filter(Boolean);

    // Add only new classes
    classesToAdd.forEach(className => {
      if (this.className.indexOf(className) === -1) {
        this.className.push(className);
      }
    });

    this.dom.applyClasses(this._element);
  }

  updateEvents(newEvents = {}) {
    this.events = { ...this.events, ...newEvents };
    this.eventsManager.clear();
    this.eventsManager.attachEvents();
  }

  // Reactive children array
  notify(children) {
    const target = Array.isArray(children) ? [...children].filter(Boolean) : [children].filter(Boolean);
    let isMutating = false;
    let scheduled = false;
    let lastNotifyInfo = null;

    const scheduleNotify = (info) => {
      lastNotifyInfo = info;
      if (!scheduled) {
        scheduled = true;
        this._parent?.onNotify?.(lastNotifyInfo);
        this._initializeChildrenKeys();
        lastNotifyInfo = null;
        scheduled = false;
      }
    };

    return new Proxy(target, {
      set: (target, prop, value) => {
        const prev = target[prop];
        const result = Reflect.set(target, prop, value);

        const isIndex = !isNaN(prop);
        const isLengthChange = prop === "length";

        const changed = (isIndex && prev !== value) || (isLengthChange && value !== target.length);

        if (!isMutating && changed) {
          scheduleNotify({ type: "set", target, prop, value, previous: prev });
        }

        return result;
      },

      get: (target, prop) => {
        const mutatingMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin"];

        if (mutatingMethods.includes(prop)) {
          return (...args) => {
            isMutating = true;
            const result = Array.prototype[prop].apply(target, args);
            isMutating = false;

            scheduleNotify({ type: "method", method: prop, args, target });
            return result;
          };
        }

        return Reflect.get(target, prop);
      }
    });
  }

  onNotify(info) {
    this._parent?.onNotify?.(info);
  }

  // Utility methods
  setRootElement(isRoot = true) {
    this._isRootElement = isRoot;
  }

  isRootElement() {
    return this._isRootElement;
  }

  // Method to manually trigger mounted hook (useful for testing)
  triggerMounted() {
    if (this._element) {
      this.mounted(this._element, this);
    }
  }

  // Method to manually trigger detached hook
  triggerDetached(removedChildNode) {
    this.detached(removedChildNode);
  }

  // Method to check if widget is attached to DOM
  isMounted() {
    return this._element && this._element.isConnected;
  }

  // Method to destroy widget completely
  destroy() {
    this.detach();
    this.hooks.clearDeferredMountedCalls();
  }
}