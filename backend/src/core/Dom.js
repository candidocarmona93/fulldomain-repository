import { BaseWidget } from "./BaseWidget";
import { Style } from "./Style";

export class Dom {
  constructor(widget) {
    this.widget = widget;
    this.operations = [];
  }

  createElement() {
    try {
      if (this.widget.rootElement) {
        const el = document.querySelector(this.widget.rootElement);
        if (!el) {
          throw new Error(`BaseWidget: rootElement "${this.widget.rootElement}" not found.`);
        }
        // Clear existing content but preserve attributes
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        return el;
      } else {
        return document.createElement(this.widget.tagName);
      }
    } catch (error) {
      console.error('DOM element creation error:', error);
      return document.createElement('div'); // Fallback element
    }
  }

  applyAttributes(element) {
    if (this.widget.rootElement) return;

    try {
      Object.entries(this.widget.props).forEach(([key, value]) => {
        if (value === false || value === null || value === undefined) {
          element.removeAttribute(key);
        } else if (value === true) {
          element.setAttribute(key, "");
        } else {
          element.setAttribute(key, value);
        }
      });
    } catch (error) {
      console.error('DOM attribute application error:', error);
    }
  }

  applyStyles(element) {
    try {
      if (this.widget.style instanceof Style) {
        element.style.cssText = this.widget.style.generate();
      } else if (typeof this.widget.style === 'object') {
        Object.assign(element.style, this.widget.style);
      }
    } catch (error) {
      console.error('DOM style application error:', error);
    }
  }

  applyClasses(element) {
    try {
      // FIX: Improved class application logic.
      // NOTE: For full diffing (removal of old classes), the widget must track 
      // its previous class list, which isn't done here. This only safely adds classes.

      const newClasses = this.widget.className || [];

      // A simple approach for class management: clear all and re-add. 
      // This is safe if the element only contains classes managed by this widget.
      // If external classes exist, the original logic had issues.
      // Reverting to the simplest safe add-only fix, assuming class clearing happens elsewhere 
      // or that the framework controls all classes on elements it creates.

      // If the intent is simply to add new classes and assume the user manages removal:
      if (newClasses.length > 0) {
        element.classList.add(...newClasses.filter(cls => cls));
      }

    } catch (error) {
      console.error('DOM class application error:', error);
    }
  }

  renderChildren(parentElement) {
    try {
      // Clear existing children first
      while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
      }

      this.widget.children.forEach((child, index) => {
        if (child instanceof BaseWidget) {
          child._parent = this.widget;
          const childElement = child.render();

          if (childElement && parentElement) {
            parentElement.appendChild(childElement);
            this.widget.hooks.addDeferredMountedCall(child, () =>
              child.mounted(child._element, child)
            );
          }
        } else if (typeof child === "string" || typeof child === "number") {
          const textNode = document.createTextNode("");
          const textValue = String(child);
          parentElement.appendChild(textNode);

          if (textValue.includes("{{")) {
            if (textValue.includes("@") || textValue.includes("${@")) {
              // Widget targeting detected - defer evaluation
              this.renderDeferredTextNode(textNode, textValue, parentElement);
            } else {
              // Regular state evaluation
              const cleanup = this.widget.reactiveState.effectRenderFn(
                textNode,
                textValue,
                this.widget.template
              );
              if (typeof cleanup === 'function') {
                this.widget._textNodeCleanups.set(textNode, cleanup);
              }
            }
          } else {
            textNode.nodeValue = textValue;
          }
        } else if (child instanceof Node) {
          parentElement.appendChild(child);
        } else {
          parentElement.appendChild(document.createTextNode(String(child)));
        }
      });
    } catch (error) {
      console.error('DOM child rendering error:', error);
    }
  }

  getChildKey(child) {
    if (!(child instanceof BaseWidget)) return null;
    return child._key ?? child.key ?? null;
  }

  patchChildren() {
    try {
      const oldChildren = this.widget._previousChildren || [];
      const newChildren = [...this.widget.children] || [];

      this.widget._previousChildren = [...newChildren];

      // First render → full render
      if (oldChildren.length === 0) {
        this.renderChildren(this.widget._element);
        this.widget.mounted(this.widget._element, this.widget);
        return;
      }

      this.performKeyedDiff(oldChildren[0]?.children, newChildren[0]?.children);
    } catch (error) {
      console.error('DOM patch children error:', error);
      this.renderChildren(this.widget._element);
      this.widget.mounted(this.widget._element, this.widget);
    }
  }

  performKeyedDiff(oldChildren = [], newChildren = []) {
    const oldMap = new Map();
    const newMap = new Map();
    const operations = [];

    // Build maps of keyed children
    oldChildren.forEach((child, index) => {
      const key = this.getChildKey(child);
      if (key !== null) {
        oldMap.set(key, { child, element: child._element, index });
      }
    });

    const newKeyed = new Map();
    const newUnkeyed = [];

    newChildren.forEach((child, index) => {
      const key = this.getChildKey(child);
      if (key !== null) {
        newKeyed.set(key, { child, desiredIndex: index });
      } else {
        newUnkeyed.push({ child, desiredIndex: index });
      }
    });

    const parent = this.widget._element;
    const usedKeys = new Set();

    // Phase 1: Update/Move existing keyed nodes
    for (const [key, newInfo] of newKeyed) {
      const oldInfo = oldMap.get(key);

      // In performKeyedDiff → reuse case
      // Inside the reuse block:
      if (oldInfo) {
        usedKeys.add(key);

        const { child: oldWidget, element } = oldInfo;
        const { child: newWidget, desiredIndex } = newInfo;

        // Transfer live DOM node to the new widget instance
        newWidget._element = element;
        element.__widget = newWidget;

        this.patchWidget(oldWidget, newWidget);

        const currentIndex = Array.from(parent.children).indexOf(element);
        if (currentIndex !== desiredIndex && currentIndex !== -1) {
          operations.push({
            type: 'move',
            element,           // guaranteed to be a real node
            toIndex: desiredIndex
          });
        }

        // No "else" add needed here – we reused the node
      } else {
        // Pure addition (brand new keyed widget)
        operations.push({ type: 'add', child: newInfo.child, atIndex: newInfo.desiredIndex });
      }
    }

    // Phase 2: Remove old keyed widgets not present anymore
    for (const [key, oldInfo] of oldMap) {
      if (!usedKeys.has(key)) {
        operations.push({ type: 'remove', element: oldInfo.element, child: oldInfo.child });
      }
    }

    // Phase 3: Handle unkeyed children (simple full replace for simplicity & safety)
    // You can enhance this later with sequence diffing if needed
    const oldUnkeyedElements = Array.from(parent.children).filter(el =>
      !oldChildren.some(c => this.getChildKey(c) !== null && c._element === el)
    );

    oldUnkeyedElements.forEach(el => {
      const childWidget = el.__widget;
      if (childWidget) {
        operations.push({ type: 'remove', element: el, child: childWidget });
      }
    });

    // Insert new unkeyed children at correct positions
    newUnkeyed.forEach(({ child, desiredIndex }) => {
      operations.push({ type: 'add', child, atIndex: desiredIndex });
    });

    // Sort operations to minimize DOM mutations
    this.operations = operations.sort((a, b) => {
      if (a.type === 'remove') return -1;
      if (b.type === 'remove') return 1;
      return 0;
    });

    this.executeOperations(parent);
  }

  patchWidget(oldWidget, newWidget) {
    // Merge everything from new → old (preserves instance)
    oldWidget.props = { ...newWidget.props };
    oldWidget.className = [...newWidget.className || []];
    oldWidget.style = newWidget.style instanceof Style ? newWidget.style : { ...newWidget.style };
    oldWidget.events = { ...newWidget.events };
    oldWidget.children = [...newWidget.children];

    if (oldWidget._element) {
      oldWidget.dom.applyAttributes(oldWidget._element);
      oldWidget.dom.applyClasses(oldWidget._element);
      oldWidget.dom.applyStyles(oldWidget._element);
      oldWidget.eventsManager.clear();
      oldWidget.eventsManager.attachEvents(oldWidget._element);
    }
  }

  executeOperations(parent) {
    // Collect all moves first to compute correct reference nodes
    const moves = this.operations.filter(op => op.type === 'move');
    const others = this.operations.filter(op => op.type !== 'move');

    // Process removes first
    others.filter(op => op.type === 'remove').forEach(op => {
      this.handleRemoveOperation(op);
    });

    // Then adds
    others.filter(op => op.type === 'add').forEach(op => {
      this.handleAddOperation(op, parent);
    });

    // Finally moves (now safe because all nodes exist and removes are done)
    moves.forEach(op => {
      this.handleMoveOperation(op, parent);
    });

    this.operations = [];
  }

  handleAddOperation(op, parent) {
    try {
      const newElement = op.child.render();           // renders → creates element
      op.child._element = newElement;                 // ← always set
      newElement.__widget = op.child;

      const atIndex = op.atIndex ?? parent.children.length;
      const referenceNode = parent.children[atIndex] || null;

      if (referenceNode) {
        parent.insertBefore(newElement, referenceNode);
      } else {
        parent.appendChild(newElement);
      }

      this.widget.hooks.addDeferredMountedCall(op.child, () =>
        op.child.mounted(newElement, op.child)
      );
    } catch (error) {
      console.error('Add operation failed:', error);
    }
  }

  handleMoveOperation(op, parent) {
    try {
      if (!op.element || !parent) return;

      const toIndex = op.toIndex;
      const referenceNode = parent.children[toIndex] || null;

      // If the node is not in the DOM yet (rare race), re-insert it
      if (!op.element.parentNode) {
        if (referenceNode) {
          parent.insertBefore(op.element, referenceNode);
        } else {
          parent.appendChild(op.element);
        }
        return;
      }

      // Only perform move when position actually changed
      if (op.element.nextSibling !== (referenceNode || null)) {
        parent.insertBefore(op.element, referenceNode);
      }
    } catch (error) {
      console.error('Move operation failed:', error, op);
    }
  }

  handleReplaceOperation(op, parent) {
    // Not used in new logic, but kept for compatibility
    this.handleRemoveOperation({ element: op.oldChild._element, child: op.oldChild });
    this.handleAddOperation({ child: op.newChild, atIndex: op.index }, parent);
  }

  handleRemoveOperation(op) {
    try {
      if (op.element && op.element.parentNode) {
        op.element.parentNode.removeChild(op.element);
        if (op.child && typeof op.child.detach === 'function') {
          op.child.detach();
        }
        this.widget.hooks.deleteDeferredMountedCall(op.child);
      }
    } catch (error) {
      console.error('Remove operation failed:', error);
    }
  }

  renderDeferredTextNode(textNode, textValue) {
    textNode.nodeValue = ""; // Start empty

    requestAnimationFrame(() => {
      try {
        const cleanup = this.widget.reactiveState.effectRenderFn(
          textNode,
          textValue,
          this.widget.template
        );
        if (typeof cleanup === 'function') {
          this.widget._textNodeCleanups.set(textNode, cleanup);
        }
      } catch (error) {
        console.error('Deferred text rendering error:', error);
        textNode.nodeValue = textValue; // Fallback to raw text
      }
    });
  }

  detachChildren() {
    try {
      // Clean up text node effects
      if (this.widget._textNodeCleanups) {
        this.widget._textNodeCleanups.forEach(cleanup => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        });
        this.widget._textNodeCleanups.clear();
      }

      while (this.widget._element?.firstChild) {
        const removedChild = this.widget._element.removeChild(this.widget._element.firstChild);
        this.widget.hooks.detached(removedChild);
      }
    } catch (error) {
      console.error('DOM child detachment error:', error);
    }
  }

  insertChildAtIndex(child, index) {
    if (!this.widget._element) return;

    try {
      if (child instanceof BaseWidget) {
        const childElement = child.render();
        if (childElement) {
          const referenceNode = this.widget._element.children[index];
          if (referenceNode) {
            this.widget._element.insertBefore(childElement, referenceNode);
          } else {
            this.widget._element.appendChild(childElement);
          }
          this.widget.hooks.addDeferredMountedCall(child, () =>
            child.mounted(child._element, child)
          );
        }
      }
    } catch (error) {
      console.error('DOM child insertion error:', error);
    }
  }

  removeChild(child) {
    if (!this.widget._element) return;

    try {
      if (child instanceof BaseWidget && child._element) {
        if (child._element.parentNode === this.widget._element) {
          this.widget._element.removeChild(child._element);
          this.widget.hooks.deleteDeferredMountedCall(child);
          child.detach();
        }
      }
    } catch (error) {
      console.error('DOM child removal error:', error);
    }
  }
}