import { Themes } from "../../themes/Themes";
import { IconButton } from "./IconButton";
import "../../styles/buttons/floating-button-widget.css";
import { Position } from "../../themes/Position";

export class FloatingButton extends IconButton {
  constructor({
    theme = Themes.floatingButton.type.primary,
    size = Themes.floatingButton.size.large,
    position = Position.absolute.bottomRight,
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