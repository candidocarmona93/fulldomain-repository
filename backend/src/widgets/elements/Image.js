import { BaseWidget } from "../../core/BaseWidget";
import { Style } from "../../core/Style";
import "../../styles/elements/image-widget.css";
import { Center } from "../layouts/Center";
import { Spinner } from "../feedback/Spinner";

/**
 * @class Image
 * @extends BaseWidget
 * @description A widget for displaying images with various styling options, lazy loading, error handling with fallback, and a placeholder while loading.
 */
export class Image extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the Image widget.
   * @param {string} [options.src=""] - The source URL of the image.
   * @param {string} [options.alt=""] - The alternative text for the image, for accessibility.
   * @param {boolean} [options.rounded=false] - If `true`, applies rounded corners to the image.
   * @param {boolean} [options.shadow=true] - If `true`, applies a shadow effect to the image.
   * @param {boolean} [options.border=true] - If `true`, adds a border around the image.
   * @param {boolean} [options.hoverEffect=true] - If `true`, applies a subtle hover effect to the image.
   * @param {object} [options.style={}] - An object containing CSS styles to apply to the image.
   * @param {object} [options.figureStyle={}] - An object containing CSS styles to apply to the figure container.
   * @param {Array<string>} [options.className=[]] - An array of CSS class names to add to the image.
   * @param {object} [options.events={}] - An object mapping event names to their handler functions for the image element.
   * @param {object} [options.props={}] - An object containing HTML attributes to set on the image element.
   * @param {boolean} [options.lazyLoad=false] - If `true`, the image will be loaded lazily.
   * @param {string} [options.fallbackSrc=""] - An optional fallback source URL to use if the main image fails to load.
   * @param {BaseWidget} [options.placeholder=new Center({ children: [new Spinner()] })] - A widget to display while the image is loading.
   * @param {Function} [options.onBeforeCreated=null] - Lifecycle hook called before the Image's container is created.
   * @param {Function} [options.onCreated=null] - Lifecycle hook called after the Image's container is created.
   * @param {Function} [options.onBeforeAttached=null] - Lifecycle hook called before the Image's container is attached to the DOM.
   * @param {Function} [options.onAttached=null] - Lifecycle hook called after the Image's container is attached to the DOM.
   */
  constructor({
    src = "",
    alt = "",
    rounded = false,
    shadow = true,
    border = true,
    hoverEffect = true,
    style = {},
    figureStyle = {},
    className = [],
    figureClassName = [],
    events = {},
    props = {},
    lazyLoad = false,
    fallbackSrc = "",
    placeholder = new Center({ children: [new Spinner()] }),
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    if (typeof alt !== "string") {
      throw new Error("alt parameter in Image widget expects a string");
    }

    super({
      tagName: "figure",
      style: figureStyle,
      className: figureClassName,
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
        this.setupImageContainer(el);
        onAttached?.(el, this.getImageReferences(), widget);
      },
      onMounted: (el, widget) => {
        this.setupImageContainer(el);
        onMounted?.(el, this.getImageReferences(), widget);
      },
    });

    this.className = [...this.className, ...this.createImageContainerClasses()];
    this.storeImageConfig({src, alt, rounded, shadow, border, hoverEffect, style, className, props, events, lazyLoad, fallbackSrc, placeholder});
    this.initializeImageState();
  }

  getImageReferences() {
    return { imageElement: this.imageElement, imageContainerElement: this.imageContainerElement };
  }

  /**
   * @method createImageContainerClasses
   * @description Creates the image container CSS class array.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createImageContainerClasses() {
    return ["image-container-widget"];
  }

  /**
   * @method createImageContainerStyles
   * @description Creates the image container style object.
   * @param {object} figureStyle - Custom container styles.
   * @returns {Style} The style object.
   * @private
   */
  createImageContainerStyles(figureStyle) {
    return figureStyle;
  }

  /**
   * @method setupImageContainer
   * @description Sets up the image container element reference.
   * @param {HTMLElement} el - The container element.
   * @private
   */
  setupImageContainer(el) {
    this.imageContainerElement = el;
  }

  /**
   * @method storeImageConfig
   * @description Stores image configuration as instance properties.
   * @param {string} src - Image source URL.
   * @param {string} alt - Image alt text.
   * @param {boolean} rounded - Rounded corners setting.
   * @param {boolean} shadow - Shadow effect setting.
   * @param {boolean} border - Border setting.
   * @param {boolean} hoverEffect - Hover effect setting.
   * @param {object} style - Image styles.
   * @param {string[]} className - Image class names.
   * @param {object} props - Image properties.
   * @param {object} events - Image events.
   * @param {boolean} lazyLoad - Lazy loading setting.
   * @param {string} fallbackSrc - Fallback source URL.
   * @param {BaseWidget} placeholder - Placeholder widget.
   * @private
   */
  storeImageConfig({src, alt, rounded, shadow, border, hoverEffect, style, className, props, events, lazyLoad, fallbackSrc, placeholder}) {
    this.config = {
      src,
      alt,
      rounded,
      shadow,
      border,
      hoverEffect,
      style,
      className: ["image-widget", ...className],
      props,
      events,
      lazyLoad,
      fallbackSrc,
    };
    this.placeholder = placeholder;
  }

  /**
   * @method initializeImageState
   * @description Initializes the image loading state.
   * @private
   */
  initializeImageState() {
    this.currentState = {
      loaded: false,
      error: false,
    };
  }

  /**
   * @method createImage
   * @description Creates the image element with configured properties and event listeners.
   * @returns {BaseWidget} The BaseWidget instance representing the image element.
   * @private
   */
  createImage() {
    return new BaseWidget({
      tagName: "img",
      className: this.createImageClasses(),
      style: this.createImageStyles(),
      props: this.createImageProps(),
      events: this.createImageEvents(),
      onAttached: (el) => {
        this.setupImageElement(el);
      }
    });
  }

  /**
   * @method createImageClasses
   * @description Creates the image CSS class array.
   * @returns {string[]} Array of CSS classes.
   * @private
   */
  createImageClasses() {
    return [
      ...this.config.className,
      this.config.rounded && "rounded",
      this.config.shadow && "shadow",
      this.config.border && "border",
      this.config.hoverEffect && "hover-effect",
    ].filter(Boolean);
  }

  /**
   * @method createImageStyles
   * @description Creates the image style object.
   * @returns {Style} The style object.
   * @private
   */
  createImageStyles() {
    return { ...this.config.style };
  }

  /**
   * @method createImageProps
   * @description Creates the image HTML properties.
   * @returns {object} HTML properties object.
   * @private
   */
  createImageProps() {
    return {
      decoding: "async",
      loading: this.config.lazyLoad ? "lazy" : "eager",
      ...this.config.props,
      alt: this.config.alt,
    };
  }

  /**
   * @method createImageEvents
   * @description Creates the image event handlers.
   * @returns {object} Event handlers object.
   * @private
   */
  createImageEvents() {
    return {
      load: (e) => this.handleImageLoad(e),
      error: (e) => this.handleImageError(e),
      ...this.config.events,
    };
  }

  /**
   * @method setupImageElement
   * @description Sets up the image element reference and initial state.
   * @param {HTMLElement} el - The image element.
   * @private
   */
  setupImageElement(el) {
    this.imageElement = el;
    el.src = this.currentState.error ? this.config.fallbackSrc : this.config.src;
    el.style.display = "none";
  }

  /**
   * @method handleImageLoad
   * @description Handles the image load event.
   * @param {Event} e - The load event object.
   * @private
   */
  handleImageLoad(e) {
    this.currentState.loaded = true;
    this.currentState.error = false;

    e.target.style.display = "";
    e.target.classList.add("loaded");
    this.imageContainerElement.classList.add("loaded");
    const placeholder = this.placeholder?.render();
    placeholder.remove();
  }

  /**
   * @method handleImageError
   * @description Handles the image error event.
   * @param {Event} e - The error event object.
   * @private
   */
  handleImageError(e) {
    console.log("Fallback")
    this.currentState.error = true;
    if (this.config.fallbackSrc) {
      e.target.src = this.config.fallbackSrc;
    } else {
      console.error("Image failed to load:", this.config.src);
      this.placeholder?.render().remove();
    }
  }

  /**
   * @method setSource
   * @description Updates the image source.
   * @param {string} newSrc - The new image source URL.
   */
  setSource(newSrc) {
    this.validateImageParameters(newSrc, this.config.alt);
    this.config.src = newSrc;

    if (this.imageElement && !this.currentState.error) {
      this.currentState.loaded = false;
      this.imageElement.style.display = "none";
      this.imageElement.src = newSrc;
    }
  }

  /**
   * @method render
   * @description Renders the Image widget.
   * @returns {HTMLElement} The root DOM element of the Image widget.
   */
  render() {
    this.children = [
      this.placeholder,
      this.createImage(),
    ];

    return super.render();
  }
}