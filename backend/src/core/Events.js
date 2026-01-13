import { BaseWidget } from "./BaseWidget";

export class Events {
  constructor(widget) {
    this.widget = widget;
    this._attachedEvents = [];
    this._customEvents = new Map();
    this._eventListeners = new Map();
  }

  on(eventName, callback, options = {}) {
    if (!this._customEvents.has(eventName)) {
      this._customEvents.set(eventName, []);
    }

    const handlerId = Symbol('handler');
    const handlerInfo = { callback, options, handlerId };
    this._customEvents.get(eventName).push(handlerInfo);

    // Store for easy removal
    if (!this._eventListeners.has(eventName)) {
      this._eventListeners.set(eventName, new Map());
    }
    this._eventListeners.get(eventName).set(handlerId, handlerInfo);

    // Bubble up to parent if not prevented
    if (this.widget._parent && !options.noBubble) {
      this.widget._parent.events.on(eventName, callback, { ...options, noBubble: true });
    }

    // Propagate to children if not prevented
    if (this.widget.children && !options.noPropagate) {
      this.widget.children.forEach((child) => {
        if (child instanceof BaseWidget) {
          child.events.on(eventName, callback, { ...options, noPropagate: true });
        }
      });
    }

    return handlerId;
  }

  off(eventName, handlerId) {
    if (!eventName) {
      this.clear();
      return;
    }

    if (handlerId) {
      // Remove specific handler
      const handlers = this._eventListeners.get(eventName);
      if (handlers) {
        handlers.delete(handlerId);
        if (handlers.size === 0) {
          this._eventListeners.delete(eventName);
          this._customEvents.delete(eventName);
        }
      }
    } else {
      // Remove all handlers for event
      this._eventListeners.delete(eventName);
      this._customEvents.delete(eventName);
    }
  }

  once(eventName, callback) {
    const handlerId = this.on(eventName, (...args) => {
      callback(...args);
      this.off(eventName, handlerId);
    });
    return handlerId;
  }

  emit(eventName, ...args) {
    const handlers = this._customEvents.get(eventName) || [];

    // Create event object with preventDefault and stopPropagation
    const event = {
      type: eventName,
      target: this.widget,
      currentTarget: this.widget,
      args,
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      stopPropagation() {
        this.propagationStopped = true;
      }
    };

    handlers.forEach(({ callback, options }) => {
      if (event.propagationStopped) return;

      try {
        callback.call(this.widget, event, ...args);
      } catch (error) {
        console.error('Event handler error:', error, 'for event:', eventName);
      }
    });

    // Bubble up to parent if not prevented
    if (this.widget._parent && !event.propagationStopped) {
      this.widget._parent.events.emit(eventName, ...args);
    }
  }

  attachEvents(element) {
    if (!element) return;
    this._attachedEvents = [];

    Object.entries(this.widget.events).forEach(([event, handler]) => {
      const boundHandler = handler.bind(this.widget);
      element.addEventListener(event, boundHandler);
      this._attachedEvents.push({ event, boundHandler, element });
    });
  }

  detachEvents() {
    this._attachedEvents.forEach(({ event, boundHandler, element }) => {
      element.removeEventListener(event, boundHandler);
    });
    this._attachedEvents = [];
  }

  clear() {
    this.detachEvents();
    this._customEvents.clear();
    this._eventListeners.clear();
  }

  hasListeners(eventName) {
    return this._customEvents.has(eventName) && this._customEvents.get(eventName).length > 0;
  }

  getListeners(eventName) {
    return this._customEvents.get(eventName) || [];
  }
}