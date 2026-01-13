import { Themes } from "../../themes/Themes";
import { IconButton } from "./IconButton";
import { Position } from "../../themes/Position";

import "../../styles/buttons/floating-button-widget.css";

export class FloatingButton extends IconButton {
  constructor({
    theme = Themes.floatingButton.type.primary,
    size = Themes.floatingButton.size.large,
    position = Position.fixed.bottomRight,
    reverse = false,
    icon = null,
    label = null,
    image = null,
    style = {},
    className = [],
    onPressed = null,
  } = {}) {
    super({
      icon,
      label,
      image,
      theme,
      size,
      reverse,
      style: { ...style },
      className: ["floating-button-widget", position, ...className],
      onPressed,
    });
  }
}