import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Position } from "../../themes/Position";
import "../../styles/feedback/toast-widget.css";

/**
 * @class Toast
 * @extends BaseWidget
 * @description A transient, non-disruptive message that appears temporarily to provide feedback.
 */
export class Toast extends BaseWidget {
  static containers = new Map();

  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Toast widget.
   * @param {string} [options.position=Position.absolute.center] - The screen position where the toast will appear.
   * @param {string} [options.theme=Themes.toast.type.success] - The theme of the toast.
   * @param {string} [options.message="Default message"] - The message content of the toast.
   * @param {number} [options.duration=5000] - The time in milliseconds before auto-dismissal.
   * @param {function} [options.onClose=null] - Callback executed when the toast is dismissed.
   * @param {boolean} [options.showLeadingIcon=true] - Whether to display a thematic leading icon.
   * @param {boolean} [options.showCloseButton=true] - Whether to display a close button.
   * @param {boolean} [options.autoDismiss=true] - Whether the toast should auto-dismiss after duration.
   * @param {number} [options.priority=0] - Priority for toast ordering in container.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {string[]} [options.className=[]] - Additional CSS class names.
   * @param {object} [options.props={}] - Additional HTML properties.
   * @param {string} [options.id=`toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`] - Unique identifier.
   */
  constructor({
    position = Position.absolute.center,
    theme = Themes.toast.type.success,
    message = "Default message",
    duration = 5000,
    onClose = null,
    showLeadingIcon = true,
    showCloseButton = true,
    autoDismiss = true,
    priority = 0,
    style = {},
    className = [],
    props = {},
    id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  } = {}) {
    super({ tagName: "div", className: ["toast-container-widget"] });

    // Store configuration as instance properties
    this.position = position;
    this.theme = theme;
    this.message = message;
    this.duration = duration;
    this.onClose = onClose;
    this.showLeadingIcon = showLeadingIcon;
    this.showCloseButton = showCloseButton;
    this.autoDismiss = autoDismiss;
    this.priority = priority;
    this.id = id;
    this.config = { style, props, className };
    this.toastElement = null;
  }

  /**
   * @method createToastWidget
   * @description Creates the inner toast widget, which is the actual visible component.
   * @returns {BaseWidget} The configured inner toast widget.
   * @private
   */
  createToastWidget() {
    return new BaseWidget({
      tagName: "div",
      className: ["toast-widget", this.theme, ...this.config.className],
      props: {
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-toast-id": this.id,
        ...this.config.props,
      },
      style: {
        opacity: "0",
        transform: "translateY(-20px)",
        ...this.config.style,
      },
      children: [
        this.showLeadingIcon ? this.createIcon() : null,
        this.createMessage(),
        this.showCloseButton ? this.createCloseButton() : null,
        this.autoDismiss ? this.createProgressBar() : null,
      ].filter(Boolean),
      onAttached: (el) => this.setupToastLifecycle(el),
    });
  }

  /**
   * @method createMessage
   * @description Creates the message content widget.
   * @returns {BaseWidget} The message widget.
   * @private
   */
  createMessage() {
    return new BaseWidget({
      tagName: "span",
      className: ["toast-message-widget"],
      children: [this.message],
    });
  }

  /**
   * @method createProgressBar
   * @description Creates the element used for the auto-dismiss countdown.
   * @returns {BaseWidget} The progress bar widget.
   * @private
   */
  createProgressBar() {
    return new BaseWidget({
      tagName: "div",
      className: ["toast-progress-bar-widget"],
      style: { width: "100%" },
    });
  }

  /**
   * @method createIcon
   * @description Creates the thematic leading icon widget.
   * @returns {BaseWidget} The icon widget.
   * @private
   */
  createIcon() {
    return new BaseWidget({
      tagName: "span",
      className: ["toast-icon-widget"],
      props: { "aria-hidden": "true" },
    });
  }

  /**
   * @method createCloseButton
   * @description Creates the close button widget.
   * @returns {BaseWidget} The close button widget.
   * @private
   */
  createCloseButton() {
    return new BaseWidget({
      tagName: "span",
      children: [""],
      className: ["toast-close-icon-widget"],
      events: {
        click: (e) => {
          e.stopPropagation();
          this.dismiss();
        }
      },
      onAttached: (el) => {
        el.insertAdjacentHTML("beforeend", '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>');
      }
    });
  }

  /**
   * @method getSharedContainer
   * @description Retrieves or creates the static container for this toast's position.
   * @returns {object} An object containing the container widget and its list of toasts.
   * @private
   */
  getSharedContainer() {
    if (!Toast.containers.has(this.position)) {
      const container = new BaseWidget({
        tagName: "div",
        className: ["toast-container-widget", this.position],
      });
      Toast.containers.set(this.position, {
        widget: container,
        toasts: [],
      });
      document.body.appendChild(container.render());
    }
    return Toast.containers.get(this.position);
  }

  /**
   * @method show
   * @description Displays the toast, managing container creation and priority ordering.
   * @returns {void}
   */
  show() {
    const containerInfo = this.getSharedContainer();
    const container = containerInfo.widget.render();
    const toastWidget = this.createToastWidget();

    containerInfo.toasts.push({ widget: toastWidget, priority: this.priority });
    containerInfo.toasts.sort((a, b) => b.priority - a.priority);

    container.innerHTML = "";
    containerInfo.toasts.forEach(({ widget }) => {
      if (widget instanceof BaseWidget) {
        container.appendChild(widget.render());
      }
    });
  }

  /**
   * @method setupToastLifecycle
   * @description Handles auto-dismissal, progress bar animation, and pause/resume on hover/focus.
   * @param {HTMLElement} el - The root DOM element of the toast.
   * @private
   */
  setupToastLifecycle(el) {
    this.toastElement = el;
    
    if (!this.autoDismiss) {
      this.animateIn(el);
      return;
    }

    this.setupAutoDismiss(el);
  }

  /**
   * @method setupAutoDismiss
   * @description Sets up the auto-dismiss timer with pause/resume functionality.
   * @param {HTMLElement} el - The root DOM element of the toast.
   * @private
   */
  setupAutoDismiss(el) {
    let dismissTimeout;
    let progressBar = el.querySelector(".toast-progress-bar-widget");
    let startTime = Date.now();
    let remaining = this.duration;
    let isPaused = false;

    const startDismissTimer = () => {
      if (!isPaused) {
        dismissTimeout = setTimeout(() => this.dismissToast(el), remaining);
        if (progressBar) {
          this.animateProgressBar(progressBar, remaining);
        }
      }
    };

    const pauseDismissTimer = () => {
      isPaused = true;
      clearTimeout(dismissTimeout);
      remaining -= Date.now() - startTime;
      if (progressBar) {
        progressBar.style.transition = "none";
        progressBar.style.width = `${(remaining / this.duration) * 100}%`;
      }
    };

    const resumeDismissTimer = () => {
      if (isPaused) {
        isPaused = false;
        startTime = Date.now();
        startDismissTimer();
      }
    };

    this.animateIn(el);
    this.setupEventListeners(el, pauseDismissTimer, resumeDismissTimer);
    startDismissTimer();
  }

  /**
   * @method setupEventListeners
   * @description Sets up event listeners for pause/resume functionality.
   * @param {HTMLElement} el - The root DOM element of the toast.
   * @param {function} pauseCallback - Function to call when pausing.
   * @param {function} resumeCallback - Function to call when resuming.
   * @private
   */
  setupEventListeners(el, pauseCallback, resumeCallback) {
    el.addEventListener("mouseenter", pauseCallback);
    el.addEventListener("mouseleave", resumeCallback);
    el.addEventListener("focusin", pauseCallback);
    el.addEventListener("focusout", resumeCallback);
  }

  /**
   * @method animateIn
   * @description Applies the entrance animation to the toast element.
   * @param {HTMLElement} el - The root DOM element of the toast.
   * @private
   */
  animateIn(el) {
    requestAnimationFrame(() => {
      el.style.transition = "opacity 300ms ease, transform 300ms ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  /**
   * @method animateProgressBar
   * @description Starts the progress bar countdown animation.
   * @param {HTMLElement} progressBar - The progress bar DOM element.
   * @param {number} duration - The remaining duration for the animation.
   * @private
   */
  animateProgressBar(progressBar, duration) {
    progressBar.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => {
      progressBar.style.width = "0%";
    });
  }

  /**
   * @method dismissToast
   * @description Applies the exit animation and removes the toast from the DOM.
   * @param {HTMLElement} toastElement - The root DOM element of the toast.
   * @private
   */
  dismissToast(toastElement) {
    toastElement.style.transition = "opacity 300ms ease, transform 300ms ease";
    toastElement.style.opacity = "0";
    toastElement.style.transform = "translateY(-20px)";

    setTimeout(() => {
      this.removeToastFromContainer(toastElement);
      if (this.onClose) this.onClose();
    }, 300);
  }

  /**
   * @method removeToastFromContainer
   * @description Removes the toast from the container and cleans up if empty.
   * @param {HTMLElement} toastElement - The root DOM element of the toast.
   * @private
   */
  removeToastFromContainer(toastElement) {
    const containerInfo = Toast.containers.get(this.position);
    if (containerInfo) {
      containerInfo.toasts = containerInfo.toasts.filter(
        ({ widget }) => widget.render().dataset.toastId !== this.id
      );
      toastElement.remove();

      if (containerInfo.toasts.length === 0) {
        containerInfo.widget.render().remove();
        Toast.containers.delete(this.position);
      }
    }
  }

  /**
   * @method updateMessage
   * @description Updates the message content of the active toast instance.
   * @param {string} newMessage - The new message content.
   */
  updateMessage(newMessage) {
    this.message = newMessage;
    const toastEl = document.querySelector(`[data-toast-id="${this.id}"]`);
    if (toastEl) {
      const messageEl = toastEl.querySelector(".toast-message-widget");
      if (messageEl) {
        messageEl.textContent = newMessage;
      }
    }
  }

  /**
   * @method dismiss
   * @description Programmatically dismisses the toast by finding its active DOM element.
   */
  dismiss() {
    const toastEl = document.querySelector(`[data-toast-id="${this.id}"]`);
    if (toastEl) {
      this.dismissToast(toastEl);
    }
  }
}