import { Text } from "../../src/widgets/elements/Text";
import { Container } from "../../src/widgets/layouts/Container";
import "../assets/styles/card-kpi-component.css";

export class CardKPIComponent extends Container {
    constructor({
        theme = "success",
        label = "",
        value = 0,
        icon = null,
    } = {}) {
        super({
            className: ["card-kpi-component", theme]
        });

        this.label = label;
        this.icon = icon;
        this.value = typeof value === "string" ? value : String(value);
    }

    createKPIContent() {
        return new Container({
            className: ["kpi-content-component"],
            children: [
                this.createLabel(),
                this.icon,
            ]
        })
    }

    createLabel() {
        return new Text({
            className: ["kpi-label-component"],
            text: this.label,
        })
    }

    createValue() {
        return new Text({
            className: ["kpi-value-component"],
            text: this.value,
        })
    }

    createBottomGradient() {
        return new Container({
            className: ["kpi-border-bottom-gradient"]
        })
    }

    render() {
        this.children = [this.createKPIContent(), this.createValue(), this.createBottomGradient()];
        return super.render();
    }
}