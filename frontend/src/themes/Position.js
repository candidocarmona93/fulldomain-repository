import "../styles/utilities/position-widget.css";

export class Position {
  static get PREFIX() { return "position-widget-"; }

  // Flex positions
  static get flex() {
    return Object.freeze({
      start: `${this.PREFIX}flex-start`,
      end: `${this.PREFIX}flex-end`,
      center: `${this.PREFIX}flex-center`,
      top: `${this.PREFIX}flex-top`,
      bottom: `${this.PREFIX}flex-bottom`,
      centerLeft: `${this.PREFIX}flex-center-left`,
      centerRight: `${this.PREFIX}flex-center-right`,
      topLeft: `${this.PREFIX}flex-top-left`,
      topRight: `${this.PREFIX}flex-top-right`,
      bottomLeft: `${this.PREFIX}flex-bottom-left`,
      bottomRight: `${this.PREFIX}flex-bottom-right`,
    });
  }

  // Absolute positions
  static get absolute() {
    return Object.freeze({
      topLeft: `${this.PREFIX}absolute-top-left`,
      topRight: `${this.PREFIX}absolute-top-right`,
      bottomLeft: `${this.PREFIX}absolute-bottom-left`,
      bottomRight: `${this.PREFIX}absolute-bottom-right`,
      top: `${this.PREFIX}absolute-top`,
      bottom: `${this.PREFIX}absolute-bottom`,
      left: `${this.PREFIX}absolute-left`,
      right: `${this.PREFIX}absolute-right`,
      center: `${this.PREFIX}absolute-center`,
    });
  }
  
  // Absolute positions
  static get fixed() {
    return Object.freeze({
      topLeft: `${this.PREFIX}fixed-top-left`,
      topRight: `${this.PREFIX}fixed-top-right`,
      bottomLeft: `${this.PREFIX}fixed-bottom-left`,
      bottomRight: `${this.PREFIX}fixed-bottom-right`,
      top: `${this.PREFIX}fixed-top`,
      bottom: `${this.PREFIX}fixed-bottom`,
      left: `${this.PREFIX}fixed-left`,
      right: `${this.PREFIX}fixed-right`,
      center: `${this.PREFIX}fixed-center`,
    });
  }

  // Z-index layers
  static get z() {
    return Object.freeze({
      auto: "auto",
      base: `${this.PREFIX}z-0`,
      raised: `${this.PREFIX}z-1`,
      dropdown: `${this.PREFIX}z-10`,
      sticky: `${this.PREFIX}z-20`,
      overlay: `${this.PREFIX}z-30`,
      modal: `${this.PREFIX}z-40`,
      popover: `${this.PREFIX}z-50`,
      tooltip: `${this.PREFIX}z-60`,
      topmost: `${this.PREFIX}z-999`,
      xtopmost: `${this.PREFIX}z-9999`,
    });
  }

  static get static() { return `${this.PREFIX}static`; }
  static get relative() { return `${this.PREFIX}relative`; }

  // Responsive helper
  static responsive(config) { return config; }
  static get breakpoints() {
    return Object.freeze({ sm: "sm", md: "md", lg: "lg", xl: "xl", xxl: "xxl" });
  }

  constructor() {
    throw new Error("Position is a static utility class");
  }
}