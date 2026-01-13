import { BaseWidget } from "../../core/BaseWidget";

/**
 * @class SVG
 * @extends BaseWidget
 * @description A comprehensive SVG widget with subcomponents for creating scalable vector graphics.
 */
export class SVG extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG widget.
   * @param {string} [options.viewBox="0 0 100 100"] - SVG viewBox attribute.
   * @param {string} [options.width="100%"] - SVG width.
   * @param {string} [options.height="100%"] - SVG height.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child SVG elements.
   */
  constructor({
    viewBox = "0 0 100 100",
    width = "100%",
    height = "100%",
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.viewBox = viewBox;
    this.width = width;
    this.height = height;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG element with configured attributes and children.
   * @returns {SVGElement} The rendered SVG element.
   */
  render() {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("viewBox", this.viewBox);
    svgElement.setAttribute("width", this.width);
    svgElement.setAttribute("height", this.height);

    Object.assign(svgElement.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        svgElement.appendChild(child.render());
      }
    });

    return svgElement;
  }
}

/**
 * @class SVG.Circle
 * @extends BaseWidget
 * @description SVG circle element component.
 */
SVG.Circle = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG circle.
   * @param {number} [options.cx=0] - Center x coordinate.
   * @param {number} [options.cy=0] - Center y coordinate.
   * @param {number} [options.r=0] - Radius.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child elements.
   */
  constructor({
    cx = 0,
    cy = 0,
    r = 0,
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG circle element.
   * @returns {SVGCircleElement} The rendered circle element.
   */
  render() {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.cx);
    circle.setAttribute("cy", this.cy);
    circle.setAttribute("r", this.r);
    circle.setAttribute("fill", this.fill);
    circle.setAttribute("stroke", this.stroke);
    circle.setAttribute("stroke-width", this.strokeWidth);

    Object.assign(circle.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        circle.appendChild(child.render());
      }
    });

    return circle;
  }
};

/**
 * @class SVG.Rect
 * @extends BaseWidget
 * @description SVG rectangle element component.
 */
SVG.Rect = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG rectangle.
   * @param {number} [options.x=0] - X coordinate.
   * @param {number} [options.y=0] - Y coordinate.
   * @param {number} [options.width=0] - Width.
   * @param {number} [options.height=0] - Height.
   * @param {number} [options.rx=0] - X radius for rounded corners.
   * @param {number} [options.ry=0] - Y radius for rounded corners.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child elements.
   */
  constructor({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    rx = 0,
    ry = 0,
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rx = rx;
    this.ry = ry;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG rectangle element.
   * @returns {SVGRectElement} The rendered rectangle element.
   */
  render() {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", this.x);
    rect.setAttribute("y", this.y);
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", this.height);
    rect.setAttribute("rx", this.rx);
    rect.setAttribute("ry", this.ry);
    rect.setAttribute("fill", this.fill);
    rect.setAttribute("stroke", this.stroke);
    rect.setAttribute("stroke-width", this.strokeWidth);

    Object.assign(rect.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        rect.appendChild(child.render());
      }
    });

    return rect;
  }
};

/**
 * @class SVG.Line
 * @extends BaseWidget
 * @description SVG line element component.
 */
SVG.Line = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG line.
   * @param {number} [options.x1=0] - Starting x coordinate.
   * @param {number} [options.y1=0] - Starting y coordinate.
   * @param {number} [options.x2=0] - Ending x coordinate.
   * @param {number} [options.y2=0] - Ending y coordinate.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {string} [options.strokeLinecap="butt"] - Stroke linecap style.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child elements.
   */
  constructor({
    x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0,
    stroke = "black",
    strokeWidth = 1,
    strokeLinecap = "butt",
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeLinecap = strokeLinecap;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG line element.
   * @returns {SVGLineElement} The rendered line element.
   */
  render() {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", this.x1);
    line.setAttribute("y1", this.y1);
    line.setAttribute("x2", this.x2);
    line.setAttribute("y2", this.y2);
    line.setAttribute("stroke", this.stroke);
    line.setAttribute("stroke-width", this.strokeWidth);
    line.setAttribute("stroke-linecap", this.strokeLinecap);

    Object.assign(line.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        line.appendChild(child.render());
      }
    });

    return line;
  }
};

/**
 * @class SVG.Path
 * @extends BaseWidget
 * @description SVG path element component.
 */
SVG.Path = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG path.
   * @param {string} [options.d=""] - Path data commands.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {string} [options.strokeLinecap="butt"] - Stroke linecap style.
   * @param {string} [options.strokeLinejoin="miter"] - Stroke linejoin style.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child elements.
   */
  constructor({
    d = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    strokeLinecap = "butt",
    strokeLinejoin = "miter",
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.d = d;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeLinecap = strokeLinecap;
    this.strokeLinejoin = strokeLinejoin;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG path element.
   * @returns {SVGPathElement} The rendered path element.
   */
  render() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.d);
    path.setAttribute("fill", this.fill);
    path.setAttribute("stroke", this.stroke);
    path.setAttribute("stroke-width", this.strokeWidth);
    path.setAttribute("stroke-linecap", this.strokeLinecap);
    path.setAttribute("stroke-linejoin", this.strokeLinejoin);

    Object.assign(path.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        path.appendChild(child.render());
      }
    });

    return path;
  }
};

/**
 * @class SVG.Group
 * @extends BaseWidget
 * @description SVG group element for grouping multiple SVG elements.
 */
SVG.Group = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG group.
   * @param {string} [options.className=""] - CSS class name.
   * @param {object} [options.style={}] - Custom CSS styles.
   * @param {BaseWidget[]} [options.children=[]] - Child SVG elements.
   */
  constructor({
    className = "",
    style = {},
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.className = className;
    this.style = style;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG group element.
   * @returns {SVGGElement} The rendered group element.
   */
  render() {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    if (this.className) {
      group.setAttribute("class", this.className);
    }

    Object.assign(group.style, this.style);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        group.appendChild(child.render());
      }
    });

    return group;
  }
};

/**
 * @class SVG.Animate
 * @extends BaseWidget
 * @description SVG animation element for animating SVG attributes.
 */
SVG.Animate = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG animation.
   * @param {string} [options.attributeName=""] - Name of the attribute to animate.
   * @param {string} [options.values=""] - Semicolon-separated list of values.
   * @param {string} [options.dur="1s"] - Duration of the animation.
   * @param {string} [options.begin="0s"] - When the animation should begin.
   * @param {string} [options.repeatCount="1"] - Number of times to repeat.
   * @param {string} [options.keyTimes=""] - Semicolon-separated list of key times.
   * @param {string} [options.keySplines=""] - Semicolon-separated list of Bézier curve parameters.
   * @param {string} [options.calcMode="linear"] - Animation calculation mode.
   * @param {string} [options.fill="remove"] - Fill behavior after animation ends.
   */
  constructor({
    attributeName = "",
    values = "",
    dur = "1s",
    begin = "0s",
    repeatCount = "1",
    keyTimes = "",
    keySplines = "",
    calcMode = "linear",
    fill = "remove"
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.attributeName = attributeName;
    this.values = values;
    this.dur = dur;
    this.begin = begin;
    this.repeatCount = repeatCount;
    this.keyTimes = keyTimes;
    this.keySplines = keySplines;
    this.calcMode = calcMode;
    this.fill = fill;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG animation element.
   * @returns {SVGAnimateElement} The rendered animation element.
   */
  render() {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", this.attributeName);
    animate.setAttribute("values", this.values);
    animate.setAttribute("dur", this.dur);
    animate.setAttribute("begin", this.begin);
    animate.setAttribute("repeatCount", this.repeatCount);
    animate.setAttribute("calcMode", this.calcMode);
    animate.setAttribute("fill", this.fill);
    
    if (this.keyTimes) {
      animate.setAttribute("keyTimes", this.keyTimes);
    }
    
    if (this.keySplines) {
      animate.setAttribute("keySplines", this.keySplines);
    }

    return animate;
  }
};

/**
 * @class SVG.Defs
 * @extends BaseWidget
 * @description SVG definitions container for reusable elements.
 */
SVG.Defs = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG definitions.
   * @param {BaseWidget[]} [options.children=[]] - Child definition elements.
   */
  constructor({
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG definitions element.
   * @returns {SVGDefsElement} The rendered definitions element.
   */
  render() {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        defs.appendChild(child.render());
      }
    });
    
    return defs;
  }
};

/**
 * @class SVG.LinearGradient
 * @extends BaseWidget
 * @description SVG linear gradient for fill and stroke definitions.
 */
SVG.LinearGradient = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the linear gradient.
   * @param {string} [options.id] - Unique identifier for the gradient.
   * @param {string} [options.x1="0%"] - Starting x coordinate.
   * @param {string} [options.y1="0%"] - Starting y coordinate.
   * @param {string} [options.x2="100%"] - Ending x coordinate.
   * @param {string} [options.y2="0%"] - Ending y coordinate.
   * @param {string} [options.gradientUnits="objectBoundingBox"] - Coordinate system units.
   * @param {BaseWidget[]} [options.children=[]] - Gradient stop elements.
   */
  constructor({
    id,
    x1 = "0%",
    y1 = "0%",
    x2 = "100%",
    y2 = "0%",
    gradientUnits = "objectBoundingBox",
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.id = id;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.gradientUnits = gradientUnits;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG linear gradient element.
   * @returns {SVGLinearGradientElement} The rendered linear gradient element.
   */
  render() {
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    
    if (this.id) {
      gradient.setAttribute("id", this.id);
    }
    
    gradient.setAttribute("x1", this.x1);
    gradient.setAttribute("y1", this.y1);
    gradient.setAttribute("x2", this.x2);
    gradient.setAttribute("y2", this.y2);
    gradient.setAttribute("gradientUnits", this.gradientUnits);
    
    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        gradient.appendChild(child.render());
      }
    });
    
    return gradient;
  }
};

/**
 * @class SVG.Stop
 * @extends BaseWidget
 * @description SVG gradient stop for defining gradient color transitions.
 */
SVG.Stop = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the gradient stop.
   * @param {string} [options.offset="0%"] - Position of the stop (0% to 100%).
   * @param {string} [options.stopColor] - Color at this stop position.
   * @param {number} [options.stopOpacity=1] - Opacity at this stop position.
   */
  constructor({
    offset = "0%",
    stopColor,
    stopOpacity = 1
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.offset = offset;
    this.stopColor = stopColor;
    this.stopOpacity = stopOpacity;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG gradient stop element.
   * @returns {SVGStopElement} The rendered gradient stop element.
   */
  render() {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", this.offset);
    
    if (this.stopColor) {
      stop.setAttribute("stop-color", this.stopColor);
    }
    
    stop.setAttribute("stop-opacity", this.stopOpacity.toString());
    
    return stop;
  }
};

/**
 * @class SVG.ClipPath
 * @extends BaseWidget
 * @description SVG clipping path for defining clipping regions.
 */
SVG.ClipPath = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the clipping path.
   * @param {string} [options.id] - Unique identifier for the clip path.
   * @param {string} [options.clipPathUnits="userSpaceOnUse"] - Coordinate system units.
   * @param {BaseWidget[]} [options.children=[]] - Path elements defining the clip region.
   */
  constructor({
    id,
    clipPathUnits = "userSpaceOnUse",
    children = []
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.id = id;
    this.clipPathUnits = clipPathUnits;
    this.children = children;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG clipping path element.
   * @returns {SVGClipPathElement} The rendered clipping path element.
   */
  render() {
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    
    if (this.id) {
      clipPath.setAttribute("id", this.id);
    }
    
    clipPath.setAttribute("clipPathUnits", this.clipPathUnits);

    this.children.forEach(child => {
      if (child instanceof BaseWidget) {
        clipPath.appendChild(child.render());
      }
    });

    return clipPath;
  }
};

/**
 * @class SVG.Text
 * @extends BaseWidget
 * @description SVG text element for rendering text within SVG.
 */
SVG.Text = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG text.
   * @param {number} [options.x=0] - X coordinate of text anchor.
   * @param {number} [options.y=0] - Y coordinate of text anchor.
   * @param {string} [options.text=""] - Text content.
   * @param {string} [options.fill="black"] - Text fill color.
   * @param {string} [options.fontSize="16"] - Font size.
   * @param {string} [options.fontFamily="Arial"] - Font family.
   * @param {string} [options.textAnchor="start"] - Text alignment.
   * @param {object} [options.style={}] - Custom CSS styles.
   */
  constructor({
    x = 0,
    y = 0,
    text = "",
    fill = "black",
    fontSize = "16",
    fontFamily = "Arial",
    textAnchor = "start",
    style = {}
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.x = x;
    this.y = y;
    this.text = text;
    this.fill = fill;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.textAnchor = textAnchor;
    this.style = style;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG text element.
   * @returns {SVGTextElement} The rendered text element.
   */
  render() {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", this.x.toString());
    textElement.setAttribute("y", this.y.toString());
    textElement.setAttribute("fill", this.fill);
    textElement.setAttribute("font-size", this.fontSize);
    textElement.setAttribute("font-family", this.fontFamily);
    textElement.setAttribute("text-anchor", this.textAnchor);
    
    Object.assign(textElement.style, this.style);
    
    textElement.textContent = this.text;
    
    return textElement;
  }
};

/**
 * @class SVG.Polygon
 * @extends BaseWidget
 * @description SVG polygon element for drawing closed shapes.
 */
SVG.Polygon = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG polygon.
   * @param {string} [options.points=""] - List of polygon points.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {object} [options.style={}] - Custom CSS styles.
   */
  constructor({
    points = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    style = {}
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.style = style;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG polygon element.
   * @returns {SVGPolygonElement} The rendered polygon element.
   */
  render() {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", this.points);
    polygon.setAttribute("fill", this.fill);
    polygon.setAttribute("stroke", this.stroke);
    polygon.setAttribute("stroke-width", this.strokeWidth.toString());
    
    Object.assign(polygon.style, this.style);
    
    return polygon;
  }
};

/**
 * @class SVG.Polyline
 * @extends BaseWidget
 * @description SVG polyline element for drawing open shapes.
 */
SVG.Polyline = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG polyline.
   * @param {string} [options.points=""] - List of polyline points.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {object} [options.style={}] - Custom CSS styles.
   */
  constructor({
    points = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    style = {}
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.style = style;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG polyline element.
   * @returns {SVGPolylineElement} The rendered polyline element.
   */
  render() {
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", this.points);
    polyline.setAttribute("fill", this.fill);
    polyline.setAttribute("stroke", this.stroke);
    polyline.setAttribute("stroke-width", this.strokeWidth.toString());
    
    Object.assign(polyline.style, this.style);
    
    return polyline;
  }
};

/**
 * @class SVG.Ellipse
 * @extends BaseWidget
 * @description SVG ellipse element for drawing ellipses and ovals.
 */
SVG.Ellipse = class extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the SVG ellipse.
   * @param {number} [options.cx=0] - Center x coordinate.
   * @param {number} [options.cy=0] - Center y coordinate.
   * @param {number} [options.rx=0] - X radius.
   * @param {number} [options.ry=0] - Y radius.
   * @param {string} [options.fill="none"] - Fill color.
   * @param {string} [options.stroke="black"] - Stroke color.
   * @param {number} [options.strokeWidth=1] - Stroke width.
   * @param {object} [options.style={}] - Custom CSS styles.
   */
  constructor({
    cx = 0,
    cy = 0,
    rx = 0,
    ry = 0,
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    style = {}
  } = {}) {
    super({
      onAttached: (el) => {
        this.rootElement = el;
      }
    });

    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.style = style;
  }

  /**
   * @method render
   * @override
   * @description Renders the SVG ellipse element.
   * @returns {SVGEllipseElement} The rendered ellipse element.
   */
  render() {
    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("cx", this.cx.toString());
    ellipse.setAttribute("cy", this.cy.toString());
    ellipse.setAttribute("rx", this.rx.toString());
    ellipse.setAttribute("ry", this.ry.toString());
    ellipse.setAttribute("fill", this.fill);
    ellipse.setAttribute("stroke", this.stroke);
    ellipse.setAttribute("stroke-width", this.strokeWidth.toString());
    
    Object.assign(ellipse.style, this.style);
    
    return ellipse;
  }
};