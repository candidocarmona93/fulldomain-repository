import { BaseWidget } from "../../core/BaseWidget";
import { ReactiveState } from "../../core/ReactiveState";
import { Style } from "../../core/Style";

export class Builder extends BaseWidget {
  constructor({
    watch = () => { },
    className = [],
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
      className,
      style: new Style({ width: "100%", ...style }),
      props,
      events,
      onBeforeCreated: (widget) => onBeforeCreated?.(widget),
      onCreated: (el, widget) => onCreated?.(el, widget),
      onBeforeAttached: (el, widget) => onBeforeAttached?.(el, widget),
      onAttached: (el, widget) => {
        onAttached?.(el, widget);
      },
      onMounted: (el, widget) => {
        onMounted?.(el, widget);
      },
    });

    this._previousWidget = null;
    this._currentWidget = null;
    this.isUpdating = false;
    this.watch = watch;

    // Initialize with first render
    this.updateEffect();
  }

  updateEffect = () => {
    try {
      if (this.isUpdating) return;
      this.isUpdating = true;

      // Set reactive context
      const previousActiveWidget = ReactiveState.activeWidget;
      const previousActiveEffect = ReactiveState.activeEffect.get(previousActiveWidget);

      ReactiveState.activeWidget = this;
      ReactiveState.activeEffect.set(this, this.updateEffect);

      // Execute watch function to get new widget
      const newWidget = this.watch();

      // Store previous widget before updating
      this._previousWidget = this._currentWidget;
      this._currentWidget = newWidget;

      // Update children - ensure it's always an array
      this.children[0] = newWidget || "";

      // If element exists, trigger update
      if (this._element) {
        super.update();
      }

    } catch (error) {
      console.error("Builder updateEffect error:", error);
      this.children = [];
      if (this._element) {
        super.update();
      }
    } finally {
      // Restore previous reactive context
      ReactiveState.activeWidget = null;
      ReactiveState.activeEffect.delete(this);
      this.isUpdating = false;
    }
  };

  render() {
    // Ensure we have current widget before rendering
    if (!this._currentWidget) {
      this.updateEffect();
    }

    return super.render();
  }

  // Override patch to use our reactive update system
  patch() {
    this.updateEffect();
  }

  detach() {
    super.detach();
    ReactiveState.activeEffect.delete(this);

    // Clean up current widget
    if (this._currentWidget && this._currentWidget.detach) {
      this._currentWidget.detach();
    }
  }

  getCurrentWidget() {
    return this._currentWidget;
  }

  getPreviousWidget() {
    return this._previousWidget;
  }
}