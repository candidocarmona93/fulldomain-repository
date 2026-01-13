import { BaseWidget } from "../../core/BaseWidget";
import { Position } from "../../themes/Position";

export class Align extends BaseWidget {
  constructor({
    children = [],
    position = Position.flex.start,
    zIndex = null,
    responsive = null,
    className = [],
    style = {},
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null
  } = {}) {
    const classes = [];
    const responsiveClasses = [];

    // === Base position ===
    const isAbsolute = Object.values(Position.absolute).includes(position);
    classes.push(
      isAbsolute
        ? "position-widget-absolute-container"
        : "position-widget-flex-container"
    );
    classes.push(position);

    // === Base z-index ===
    let baseZClass = Position.z.base;
    if (zIndex !== null) {
      baseZClass = typeof zIndex === "string"
        ? zIndex
        : Position.z[zIndex] || Position.z.auto;
    } else if (isAbsolute) {
      baseZClass = Position.z.raised;
    }
    if (baseZClass !== "auto") classes.push(baseZClass);

    // === Responsive overrides ===
    if (responsive) {
      Object.entries(responsive).forEach(([bp, cfg]) => {
        if (!cfg) return;

        if (cfg.position) {
          const pos = cfg.position;
          const isAbs = Object.values(Position.absolute).includes(pos);
          const key = pos.split("-").pop();
          responsiveClasses.push(`position-widget-${bp}:${isAbs ? "absolute" : "flex"}-${key}`);
          if (isAbs) responsiveClasses.push(`position-widget-${bp}:absolute-container`);
        }

        if (cfg.zIndex !== undefined) {
          const zVal = typeof cfg.zIndex === "number"
            ? cfg.zIndex
            : Position.z[cfg.zIndex]?.split("-").pop() || "0";
          responsiveClasses.push(`position-widget-${bp}:z-${zVal}`);
        }
      });
    }

    super({
      children,
      className: [...classes, ...responsiveClasses, ...className],
      style: {
        ...(isAbsolute && { position: "absolute", margin: 0 }),
        ...(!isAbsolute && { width: "100%", minWidth: 0 }),
        ...(typeof zIndex === "number" && { zIndex }),
        boxSizing: "border-box",
        ...style,
      },
      props,
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
        onAttached?.(el, {}, widget)
      },
      onMounted: (el, widget) => {
        onMounted?.(el, {}, widget);
      },
    });

    this.position = position;
    this.zIndex = zIndex;
    this.responsive = responsive;
  }
}