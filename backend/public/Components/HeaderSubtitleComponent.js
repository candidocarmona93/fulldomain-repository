import { Text } from "../../src/widgets/elements/Text";
import "../assets/styles/header-subtitle-component.css";

export class HeaderSubtitleComponent extends Text {
    constructor({
        text = "",
        style = {},
        className = [],
    } = {}) {
        super({
            text,
            style,
            className: ["header-subtitle-component", ...className]
        })
    }
}