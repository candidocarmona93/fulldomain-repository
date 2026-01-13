import { Text } from "../../src/widgets/elements/Text";
import "../assets/styles/header-title-component.css";

export class HeaderTitleComponent extends Text {
    constructor({
        text = "",
        style = {},
        className = [],
    } = {}) {
        super({
            text,
            style,
            className: ["header-title-component", ...className]
        })
    }
}