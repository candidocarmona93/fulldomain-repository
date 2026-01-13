import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";

/**
 * @class FutureBuilder
 * @extends BaseWidget
 * @description
 * A widget that builds its content based on the result of an asynchronous operation (a Future, Promise, or a function that returns a Promise).
 * It simplifies handling different states of an asynchronous operation, such as loading, success, and error.
 * Supports cancellation of asynchronous operations using AbortController.
 *
 * @example
 * // Example 1: Fetching data from an API with cancellation
 * const dataFetcher = (params, signal) => fetch('/api/data', { signal }).then(res => res.json());
 *
 * const futureBuilder = new FutureBuilder({
 *   future: dataFetcher,
 *   builder: (data) => new BaseWidget({ children: [JSON.stringify(data)] }),
 *   onLoading: () => new BaseWidget({ children: ['Loading data...'] }),
 *   onError: (error) => new BaseWidget({ children: ['Error: ' + error.message] }),
 * });
 *
 * // Example 2: Using a FutureBuilderController
 * const controller = new FutureBuilderController();
 *
 * const futureBuilder = new FutureBuilder({
 *   future: (params, signal) => fetch(`/api/items?category=${params.category}`, { signal }).then(res => res.json()),
 *   params: { category: 'electronics' },
 *   builder: (data) => new BaseWidget({ children: data.map(item => `<div>${item.name}</div>`) }),
 *   controller: controller,
 * });
 *
 * // To change the category and reload (aborts previous request):
 * controller.setParams({ category: 'books' });
 */
export class FutureBuilder extends BaseWidget {
  /**
   * @constructor
   * @param {object} options - Configuration options for the FutureBuilder.
   * @param {Promise|function(params: object, signal: AbortSignal): Promise} options.future - The asynchronous operation.
   * @param {function(data: any): BaseWidget} options.builder - A function that takes the resolved data and returns a BaseWidget.
   * @param {FutureBuilderController} [options.controller] - An optional controller to manage this FutureBuilder externally.
   * @param {function(): BaseWidget} [options.onLoading] - An optional function for the loading state.
   * @param {function(error: any): BaseWidget} [options.onError] - An optional function for the error state.
   * @param {function} [options.onComplete] - An optional function called when the future completes.
   * @param {function(state: object)} [options.onStateChange] - An optional function called when the state changes (NEW).
   * @param {object} [options.style={}] - Optional CSS styles for the container.
   * @param {object} [options.props={}] - Optional HTML attributes for the container.
   * @param {object} [options.params={}] - Optional parameters for the `future` function.
   * @param {object} [options.customStates={}] - Optional custom state handlers (NEW).
   */
  constructor({
    future,
    builder,
    controller = null,
    onLoading = null,
    onError = null,
    onComplete = null,
    onStateChange = null,
    className = [],
    style = {},
    props = {},
    params = {},
    customStates = {},
  } = {}) {
    super({
      tagName: "section",
      className: ["future-widget", ...className],
      style: {
        width: "100%",
        ...style,
      },
      props,
      onAttached: () => { },
    });

    this.future = future;
    this.params = params;
    this.builder = builder?.bind(this);
    this.onLoading = onLoading?.bind(this);
    this.onError = onError?.bind(this);
    this.onComplete = onComplete?.bind(this);
    this.onStateChange = onStateChange?.bind(this);
    this.customStates = customStates;
    this.currentState = { status: "initial", data: null, error: null };
    this.stateQueue = [];
    this.abortController = null;
    this.isProcessing = false;

    this.subscribeToFuture();

    if (controller) {
      controller.attach(this);
    }
  }

  /**
   * @method onNotify
   * @description A placeholder method, it's not used.
   * @param {object} args - Arguments.
   * @returns {void}
   */
  onNotify() { }

  /**
   * @method subscribeToFuture
   * @description
   * Subscribes to the `future` and updates the component state based on the result. Uses AbortController for cancellation.
   * Handles synchronous errors in future execution (NEW).
   * @returns {void}
   * @private
   */
  subscribeToFuture() {
    // CHANGED: Ensure proper cleanup of AbortController
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.enqueueState({ status: "loading", data: null, error: null });

    // NEW: Handle synchronous errors in future execution
    let futurePromise;
    try {
      futurePromise = typeof this.future === "function"
        ? this.future(this.params, signal)
        : this.future;
    } catch (error) {
      this.enqueueState({ status: "error", data: null, error });
      this.onComplete?.();
      return;
    }

    futurePromise
      .then((data) => {
        if (!signal.aborted) {
          this.enqueueState({ status: "success", data, error: null });
        }
      })
      .catch((error) => {
        if (!signal.aborted) {
          if (error.name === "AbortError") {
            return;
          }
          this.enqueueState({ status: "error", data: null, error });
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          this.onComplete?.();
        }
      });
  }

  /**
   * @method setParams
   * @description Updates the parameters used when calling the `future` function and aborts any ongoing operation.
   * @param {object} params - The new parameters.
   * @returns {void}
   */
  setParams(params) {
    this.params = params;
    this.subscribeToFuture();
  }

  /**
   * @method enqueueState
   * @description Adds a new state to the queue and triggers state change callback (NEW).
   * @param {object} newState - The new state to add.
   * @returns {void}
   * @private
   */
  enqueueState(newState) {
    this.stateQueue.push(newState);
    this.onStateChange?.(newState);
    this.processStateQueue();
  }

  /**
   * @method processStateQueue
   * @description Processes the state queue, debouncing updates using requestAnimationFrame (NEW).
   * @returns {void}
   * @private
   */
  processStateQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    requestAnimationFrame(() => {
      while (this.stateQueue.length > 0) {
        const nextState = this.stateQueue.shift();
        if (nextState) {
          this.currentState = { ...this.currentState, ...nextState };
        }
      }
      this.update();
      this.isProcessing = false;
    });
  }

  /**
   * @method setFuture
   * @description Sets a new `future` and aborts any ongoing operation.
   * @param {Promise|function(params: object, signal: AbortSignal): Promise} newFuture - The new future.
   * @returns {void}
   */
  setFuture(newFuture) {
    this.future = newFuture;
    this.subscribeToFuture();
  }

  /**
   * @method reload
   * @description Triggers the `future` to be re-executed, fetching data again.
   * @returns {void}
   */
  reload() {
    this.subscribeToFuture();
  }

  /**
   * @method setCurrentState
   * @description Sets the current state.
   * @param {object} newState - The new state.
   * @returns {void}
   */
  setCurrentState(newState) {
    this.enqueueState(newState);
  }

  /**
   * @method onDetached
   * @description Cleans up resources, including aborting any ongoing asynchronous operation.
   * @returns {void}
   */
  detach() {
    if (this.abortController && this.currentState.status !== "loading") {
      this.abortController.abort();
      this.abortController = null;
    }
    this.stateQueue = [];
    super.detach();
  }

  update() {
    let widget = null;
    switch (this.currentState.status) {
      case "loading":
        widget = this.onLoading
          ? this.onLoading()
          : new BaseWidget({ children: ["Loading..."] });
        break;

      case "success":
        widget = this.builder
          ? this.builder(this.currentState.data)
          : new BaseWidget({ children: ["No builder provided"] });
        break;

      case "error":
        widget = this.onError
          ? this.onError(this.currentState.error)
          : new BaseWidget({
            children: [
              `Error: ${this.currentState.error?.message || "Unknown error"}`,
            ],
          });
        break;

      default:
        widget = this.customStates[this.currentState.status]?.() ??
          new BaseWidget({ children: ["Unknown state"] });
    }

    const widgets = Array.isArray(widget) ? widget : [widget];

    widgets.forEach((w, index) => {
      this.children[index] = w
    });

    super.update();
  }

  /**
   * @method render
   * @override
   * @description
   * Renders the appropriate widget based on the current state, with support for custom states (NEW) and fallback for missing builder (NEW).
   * @returns {HTMLElement} The root DOM element of the FutureBuilder widget.
   */
  render() {
    return super.render();
  }
}