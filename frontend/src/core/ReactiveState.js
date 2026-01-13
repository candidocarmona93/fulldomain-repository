import { generateUUID } from "../utils/Helper";

/**
 * @class ReactiveState
 * @description Manages reactive state for a widget, handling dependency tracking and updates.
 */
export class ReactiveState {
  static activeEffect = new WeakMap();
  static activeWidget = null;

  constructor(widget, initialState = {}, debug = false) {
    this.widget = widget;
    this.state = null;
    this.dependencyMap = new Map(); // Simplified: Map<uniqueKey, Set<effect>>
    this.uidToKeysMap = new Map(); // Reverse map for efficient cleanup: Map<uid, Set<uniqueKey>>
    this.objectUIDs = new WeakMap(); // Stores object UIDs without mutating them: WeakMap<object, uid>
    this.batchedEffects = new Set();
    this.isScheduled = false;
    this.isBatching = false;
    this.componentState = initialState;
    this.debug = debug;
    this.rafId = null;
    this.proxyCache = new WeakMap();
  }

  /**
   * Gets or creates a unique ID for a given object without mutating it.
   */
  getObjectUID(obj) {
    if (typeof obj !== 'object' || obj === null) return null;
    if (!this.objectUIDs.has(obj)) {
      this.objectUIDs.set(obj, generateUUID());
    }
    return this.objectUIDs.get(obj);
  }

  initState(initVal = {}) {
    const stateCompound = { ...this.componentState, ...initVal };

    const createDeepProxy = (obj, path = "") => {
      if (typeof obj !== "object" || obj === null || Object.isFrozen(obj)) return obj;
      if (this.proxyCache.has(obj)) return this.proxyCache.get(obj);

      // Get or create UID without mutating the object
      const needsTracking = !Object.prototype.hasOwnProperty.call(obj, '_isNonReactive') || !obj._isNonReactive;
      let uid;
      if (needsTracking) {
        uid = this.getObjectUID(obj);
      }

      const isArray = Array.isArray(obj);
      const proxy = new Proxy(obj, {
        get: (target, prop) => {
          const value = Reflect.get(target, prop);

          // Skip tracking for non-reactive properties and methods
          if (this.shouldSkipTracking(target, prop, value, isArray)) {
            return value;
          }

          // For arrays, track the array itself for any non-internal access (coarse-grained)
          if (isArray && ReactiveState.activeWidget) {
            if (!this.isArrayInternalProperty(prop)) {
              this.track({ target, prop: '___array_self___', widget: ReactiveState.activeWidget, path });
            }
          } else if (ReactiveState.activeWidget) {
            // Normal object tracking
            this.track({ target, prop, widget: ReactiveState.activeWidget, path });
          }
          // Return proxied version for objects
          return typeof value === "object" && value !== null ? createDeepProxy(value, `${path}${prop}.`) : value;
        },
        set: (target, prop, value) => {
          if (typeof value === "object" && value !== null) {
            value = createDeepProxy(value, `${path}${prop}.`);
          }
          const oldValue = Reflect.get(target, prop);
          const result = Reflect.set(target, prop, value);

          if (oldValue !== value) {
            // Get UID from WeakMap
            const oldUid = this.objectUIDs.get(oldValue);
            if (oldUid) {
              this.cleanupObjectDependencies(oldUid);
            }

            // For arrays, trigger on the array itself for any modification
            if (isArray) {
              this.trigger({ target, prop: '___array_self___', widget: ReactiveState.activeWidget, path });
            } else {
              this.trigger({ target, prop, widget: ReactiveState.activeWidget, path });
            }
          }
          return result;
        }
      });

      this.proxyCache.set(obj, proxy);
      return proxy;
    };

    this.state = createDeepProxy(stateCompound);
    return this.state;
  }

  shouldSkipTracking(target, prop, value, isArray = false) {
    // Skip non-reactive properties
    const nonReactiveProps = [
      '_isNonReactive', 'constructor', 'toString', 'toLocaleString',
      'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
      'toLocaleString'
    ];

    if (nonReactiveProps.includes(prop)) {
      return true;
    }

    // For arrays, skip internal properties. Numeric indices are NOT internal.
    if (isArray) {
      return this.isArrayInternalProperty(prop);
    }

    // Skip array methods and other built-in methods
    if (typeof value === 'function' &&
      (Array.prototype[prop] || Object.prototype[prop])) {
      return true;
    }

    // Skip prototype properties
    if (!Object.prototype.hasOwnProperty.call(target, prop)) {
      return true;
    }

    return false;
  }

  isArrayInternalProperty(prop) {
    // 'length' is left here for the coarse-grained '___array_self___' tracking.
    // Numeric indices are NOT internal and will pass this check, triggering a track.
    const arrayInternals = ['length', Symbol.iterator, Symbol.toStringTag];
    return arrayInternals.includes(prop);
  }

  setState(updater) {
    if (!this.state) {
      console.error("setState Error: State has not been initialized.", this.widget);
      return;
    }

    let newState;
    if (typeof updater === 'function') {
      // Temporarily disable tracking during updater execution to prevent re-entrancy
      const currentWidget = ReactiveState.activeWidget;
      const currentEffect = ReactiveState.activeEffect.get(currentWidget);
      ReactiveState.activeWidget = null;
      if (currentWidget) ReactiveState.activeEffect.delete(currentWidget);

      try {
        newState = updater(this.state);
      } catch (error) {
        console.error("setState updater function error:", error);
        return;
      } finally {
        // Restore tracking
        ReactiveState.activeWidget = currentWidget;
        if (currentWidget && currentEffect) {
          ReactiveState.activeEffect.set(currentWidget, currentEffect);
        }
      }
    } else {
      newState = updater;
    }

    if (typeof newState !== 'object' || newState === null) {
      console.error("setState Error: Updater must be an object or a function that returns an object.", newState);
      return;
    }

    try {
      const changedKeys = [];
      for (const key in newState) {
        if (Object.prototype.hasOwnProperty.call(newState, key)) {
          const oldValue = this.state[key];
          if (oldValue !== newState[key]) {
            // Get UID from WeakMap
            const oldUid = this.objectUIDs.get(oldValue);
            if (oldUid) {
              this.cleanupObjectDependencies(oldUid);
            }
            changedKeys.push({ key, value: newState[key] });
          }
        }
      }

      // Apply changes and trigger effects
      changedKeys.forEach(({ key, value }) => {
        this.state[key] = value; // Triggers set trap
      });
    } catch (error) {
      console.error("Error applying setState:", error);
    }
  }

  /**
   * Efficiently cleans up all dependencies for an object using the reverse map.
   */
  cleanupObjectDependencies(uid) {
    const keys = this.uidToKeysMap.get(uid);
    if (!keys) return;

    keys.forEach(uniqueKey => {
      this.dependencyMap.delete(uniqueKey);
    });

    this.uidToKeysMap.delete(uid);
  }

  effectRenderFn(textNode, value, templateEngine) {
    const expression = templateEngine.templateExpression(String(value));

    // This logic replaces the old implicit getState() behavior
    const getContextualState = (widget) => {
      let current = widget;
      while (current) {
        // Use the explicit getState() which we know only gets *local* state
        const localState = current.getState();
        if (localState) {
          return localState;
        }
        // Use the explicit getParent() from BaseWidget
        current = current.getParent();
      }
      return null;
    };

    const renderFn = () => {
      // Get the contextual state *inside* the effect function
      // This ensures it's re-evaluated every time the effect runs
      const state = getContextualState(this.widget);

      if (!ReactiveState.activeWidget) {
        ReactiveState.activeWidget = this.widget;
      }

      if (!ReactiveState.activeEffect.has(this.widget)) {
        ReactiveState.activeEffect.set(this.widget, renderFn);
      }

      try {
        const template = templateEngine.evaluateTemplate(expression, state, this.widget);
        textNode.nodeValue = template(state, this.widget);
      } catch (error) {
        console.error('Template evaluation error:', error);
        textNode.nodeValue = value; // Fallback to original text
      } finally {
        ReactiveState.activeWidget = null;
        ReactiveState.activeEffect.delete(this.widget);
      }
    };

    // Explicitly tag the effect for the batch scheduler
    renderFn.isDOMRelated = true;
    renderFn();
  }

  track(dependency) {
    const { target, prop, widget } = dependency;
    if (!widget) return;

    const effect = ReactiveState.activeEffect.get(widget);
    if (!effect) return;

    // Get UID from WeakMap
    const _uid = this.getObjectUID(target);
    if (!_uid) return; // Not a trackable object

    // For arrays, use the special array self property
    const actualProp = prop === '___array_self___' ? '___array_self___' : prop;
    const uniqueKey = `${_uid}.${actualProp}`;

    // Simplified dependencyMap: Map<uniqueKey, Set<effect>>
    if (!this.dependencyMap.has(uniqueKey)) {
      this.dependencyMap.set(uniqueKey, new Set());
    }

    const effects = this.dependencyMap.get(uniqueKey);

    // Only add effect if it's not already tracked
    if (!effects.has(effect)) {
      effects.add(effect);

      // Update reverse-lookup map for efficient cleanup
      if (!this.uidToKeysMap.has(_uid)) {
        this.uidToKeysMap.set(_uid, new Set());
      }
      this.uidToKeysMap.get(_uid).add(uniqueKey);

      if (this.debug) {
        const propName = actualProp === '___array_self___' ? '[array]' : actualProp;
        console.log(`Tracking ${propName} (uid: ${_uid}) for:`, widget, effect.name || 'anonymous');
      }
    }
  }

  trigger(dependency) {
    const { target, prop } = dependency;

    // Get UID from WeakMap
    const _uid = this.getObjectUID(target);
    if (!_uid) return;

    // For arrays, use the special array self property
    const actualProp = prop === '___array_self___' ? '___array_self___' : prop;
    const uniqueKey = `${_uid}.${actualProp}`;

    // Dependencies are now persistent. The `finally` block that
    // called cleanupDependencies has been removed as it was a bug.
    const effects = this.dependencyMap.get(uniqueKey) || new Set();
    effects.forEach(effect => this.batchedEffects.add(effect));
    this.scheduleBatchExecEffect();
  }

  scheduleBatchExecEffect() {
    if (this.isScheduled) {
      if (this.debug) console.warn("Redundant scheduling attempt ignored.");
      return;
    }
    this.isScheduled = true;

    queueMicrotask(() => {
      const nonDOMEffects = new Set();
      const DOMEffects = new Set();

      this.batchedEffects.forEach(effect => {
        // Use the reliable `isDOMRelated` flag
        if (effect.isDOMRelated) {
          DOMEffects.add(effect);
        } else {
          nonDOMEffects.add(effect);
        }
      });

      try {
        nonDOMEffects.forEach(effect => {
          try {
            effect();
          } catch (error) {
            console.error("Non-DOM effect error:", error);
          }
        });
      } catch (error) {
        console.error("Microtask error:", error);
      }

      if (DOMEffects.size > 0) {
        this.rafId = requestAnimationFrame(() => {
          this.isBatching = true;
          try {
            DOMEffects.forEach(effect => {
              try {
                effect();
              } catch (error) {
                console.error("DOM effect error:", error);
              }
            });
          } catch (error) {
            console.error("Animation frame error:", error);
          } finally {
            this.batchedEffects.clear();
            this.isBatching = false;
            this.isScheduled = false;
            this.rafId = null;
          }
        });
      } else {
        this.batchedEffects.clear();
        this.isBatching = false;
        this.isScheduled = false;
      }
    });
  }

  // Removed `cleanupDependencies` as it was part of a bug.
  // Dependencies are now cleaned up via `cleanupObjectDependencies` or `detach`.

  detach() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.batchedEffects.clear();
    this.dependencyMap.clear();
    this.uidToKeysMap.clear(); // Clear the reverse map
    this.objectUIDs = new WeakMap(); // Clear UIDs
    this.proxyCache = new WeakMap();
  }
}