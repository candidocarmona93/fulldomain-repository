// src/layouts/Stack.js
import { BaseWidget } from "../../core/BaseWidget.js";
import "../../styles/layouts/stack-widget.css";

export class Stack extends BaseWidget {
  constructor({
    children = [],
    style = {},
    className = [],
    props = {},
    events = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    super({
      tagName: "div",
      children,
      style: {
        position: "relative",
        minHeight: "1px",
        ...style,
      },
      className: [
        "stack-widget",
        "stack-widget--medium",
        "stack-widget--vertical",
        ...className,
      ],
      props,
      events,
      onBeforeCreated,
      onCreated,
      onBeforeAttached,
      onAttached,
      onMounted,
    });
  }
}