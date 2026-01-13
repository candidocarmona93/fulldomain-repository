import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import { StreamBuilderController } from "./StreamBuilderController"; // NEW: Import controller

/**
 * @typedef {Object} StreamBuilderOptions
 * @property {Observable|function(params: object): Observable} stream - The stream to listen to or a function returning a stream.
 * @property {(data: any) => BaseWidget} builder - Function to build the widget based on stream data.
 * @property {StreamBuilderController} [controller] - Optional controller for external management.
 * @property {() => BaseWidget} [onLoading] - Optional function for the loading state.
 * @property {(error: Error) => BaseWidget} [onError] - Optional function for the error state.
 * @property {() => void} [onComplete] - Optional function called when the stream completes.
 * @property {(state: object) => void} [onStateChange] - Optional function called on state changes.
 * @property {Record<string, any>} [style] - Optional CSS styles for the container.
 * @property {Record<string, any>} [props] - Optional HTML attributes for the container.
 * @property {Record<string, any>} [params] - Optional parameters for the stream function.
 * @property {Record<string, () => BaseWidget>} [customStates] - Optional custom state handlers.
 * @property {boolean} [debug] - Optional flag to enable debug logging.
 */

/**
 * @class StreamBuilder
 * @extends BaseWidget
 * @description
 * A widget that builds its content based on data emitted by a stream (e.g., an RxJS Observable).
 * Supports states like loading, success, and error, with cancellation via stream unsubscription.
 *
 * @example
 * // Example 1: Basic stream
 * const streamBuilder = new StreamBuilder({
 *   stream: new Observable(...),
 *   builder: (data) => new BaseWidget({ children: [JSON.stringify(data)] }),
 *   onLoading: () => new BaseWidget({ children: ['Loading...'] }),
 *   onError: (error) => new BaseWidget({ children: [`Error: ${error.message}`] }),
 * });
 *
 * // Example 2: Using a controller with params
 * const controller = new StreamBuilderController();
 * const streamBuilder = new StreamBuilder({
 *   stream: (params) => new Observable(...),
 *   params: { category: 'electronics' },
 *   builder: (data) => new BaseWidget({ children: data.map(item => `<div>${item.name}</div>`) }),
 *   controller,
 * });
 * controller.setParams({ category: 'books' });
 */
export class StreamBuilder extends BaseWidget {
  /**
   * @constructor
   * @param {StreamBuilderOptions} options - Configuration options.
   */
  constructor({
    stream,
    builder,
    controller = null,
    onLoading = null,
    onError = null,
    onComplete = null,
    onStateChange = null, // NEW: State change callback
    style = {},
    props = {},
    params = {}, // NEW: Support for params
    customStates = {}, // NEW: Support for custom states
    debug = false, // NEW: Debug flag
  } = {}) {
    super({
      tagName: "section", // NEW: Consistent with FutureBuilder
      className: ["stream-widget"], // NEW: Unique class name
      style: new Style({ width: "100%", ...style }), // NEW: Consistent styling
      props,
      onAttached: () => {},
    });

    this.stream = stream;
    this.params = params; // NEW: Store params
    this.builder = builder?.bind(this);
    this.onLoading = onLoading?.bind(this);
    this.onError = onError?.bind(this);
    this.onComplete = onComplete?.bind(this);
    this.onStateChange = onStateChange?.bind(this); // NEW: Bind state change callback
    this.customStates = customStates; // NEW: Store custom state handlers
    this.debug = debug; // NEW: Debug flag
    this.state = { status: "initial", data: null, error: null }; // NEW: Initialize with 'initial'
    this.stateQueue = []; // NEW: Queue for debouncing
    this.isProcessing = false; // NEW: Flag for debouncing
    this.streamSubscription = null;

    // NEW: Validate stream input
    if (!stream || (typeof stream !== "function" && !stream.subscribe)) {
      this.setState({ status: "error", data: null, error: new Error("Invalid stream provided") });
      return;
    }

    this.subscribeToStream();

    if (controller) {
      controller.attach(this); // NEW: Use controller
    }
  }

  /**
   * @method subscribeToStream
   * @description
   * Subscribes to the stream and updates the state. Handles stream creation if stream is a function.
   * @returns {void}
   * @private
   */
  subscribeToStream() {
    // NEW: Clean up existing subscription
    this.cancel();

    this.enqueueState({ status: "loading", data: null, error: null });

    // NEW: Handle stream as a function
    let stream;
    try {
      stream = typeof this.stream === "function" ? this.stream(this.params) : this.stream;
      if (!stream || !stream.subscribe) {
        throw new Error("Stream function did not return a valid Observable");
      }
    } catch (error) {
      this.enqueueState({ status: "error", data: null, error });
      this.onComplete?.();
      return;
    }

    this.streamSubscription = stream.subscribe({
      next: (data) => {
        this.enqueueState({ status: "success", data, error: null });
      },
      error: (error) => {
        this.enqueueState({ status: "error", data: null, error });
      },
      complete: () => {
        this.onComplete?.();
      },
    });
  }

  /**
   * @method setParams
   * @description Updates the parameters and resubscribes to the stream.
   * @param {object} params - The new parameters.
   * @returns {void}
   */
  setParams(params) {
    this.params = params;
    this.subscribeToStream();
  }

  /**
   * @method setStream
   * @description Sets a new stream and resubscribes.
   * @param {Observable|function(params: object): Observable} newStream - The new stream.
   * @returns {void}
   */
  setStream(newStream) {
    this.stream = newStream;
    this.subscribeToStream();
  }

  /**
   * @method reload
   * @description Resubscribes to the current stream.
   * @returns {void}
   */
  reload() {
    this.subscribeToStream();
  }

  /**
   * @method enqueueState
   * @description Adds a new state to the queue and triggers state change callback.
   * @param {object} newState - The new state.
   * @returns {void}
   * @private
   */
  enqueueState(newState) {
    this.stateQueue.push(newState);
    if (this.debug) {
      console.log(`[StreamBuilder] State enqueued: ${JSON.stringify(newState)}`);
    }
    this.onStateChange?.(newState); // NEW: Emit state change event
    this.processStateQueue();
  }

  /**
   * @method processStateQueue
   * @description Processes the state queue, debouncing updates using requestAnimationFrame.
   * @returns {void}
   * @private
   */
  processStateQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    requestAnimationFrame(() => {
      while (this.stateQueue.length > 0) {
        const nextState = this.stateQueue.shift();
        this.state = { ...this.state, ...nextState };
      }
      this.render();
      this.isProcessing = false;
    });
  }

  /**
   * @method setState
   * @description Sets the current state through the queue.
   * @param {object} newState - The new state.
   * @returns {void}
   */
  setState(newState) {
    this.enqueueState(newState);
  }

  /**
   * @method cancel
   * @description Cancels the current stream subscription.
   * @returns {void}
   */
  cancel() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = null;
    }
  }

  /**
   * @method onDetached
   * @description Cleans up resources by canceling the subscription.
   * @returns {void}
   */
  detach() {
    this.cancel();
    this.stateQueue = []; // NEW: Clear queue
    super.detach();
  }

  /**
   * @method onUpdate
   * @override
   * @description Overrides the update method of BaseWidget.
   * @returns {void}
   */
  onUpdate() {
    super.update();
  }

  /**
   * @method render
   * @override
   * @description Renders the widget based on the current state, with custom state support and builder fallback.
   * @returns {HTMLElement} The root DOM element.
   */
  render() {
    let widget = null;

    switch (this.state.status) {
      case "loading":
        widget = this.onLoading
          ? this.onLoading()
          : new BaseWidget({ children: ["Loading..."] });
        break;

      case "success":
        widget = this.builder
          ? this.builder(this.state.data)
          : new BaseWidget({ children: ["No builder provided"] }); // NEW: Fallback for missing builder
        break;

      case "error":
        widget = this.onError
          ? this.onError(this.state.error) // CHANGED: Pass error to onError
          : new BaseWidget({
              children: [`Error: ${this.state.error?.message || "Unknown error"}`],
            });
        break;

      default:
        widget = this.customStates[this.state.status]?.() ?? // NEW: Custom state support
                 new BaseWidget({ children: ["Unknown state"] });
    }

    this.children[0] = widget;
    return super.render();
  }
}