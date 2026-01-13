import { Column } from "../../../../src/widgets/layouts/Column";
import { ListTile } from "../../../../src/widgets/data-display/ListTile";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { STEPS } from "../../../Constants/PropertyRegistrationStepper";
import { BaseWidget } from "../../../../src/core/BaseWidget";

export class StepperSidebar extends BaseWidget {
    constructor({ activeStep, onStepChange }) {
        super({
            style: { position: "sticky", top: "calc(5rem + 20px)" },
        });
        this.activeStep = activeStep;
        this.onStepChange = onStepChange;
    }

    render() {
        this.children = [
            new Builder({
                watch: () => new Column({
                    children: STEPS.map((step, i) => {
                        return new ListTile({
                            className: ["settings-item-component"],
                            style: { borderRadius: "1rem", ...(this.activeStep === i ? { backgroundColor: "#cad3ff", } : {}) },
                            title: step.title,
                            subtitle: step.subtitle,
                            leading: new Icon({ icon: step.leading }),
                            trailing: new Icon({ icon: this.activeStep === i ? "fa fa-check-circle" : "fa fa-circle" }),
                            onTap: () => this.onStepChange(i)
                        });
                    })
                })
            })
        ]
        return super.render();
    }
}