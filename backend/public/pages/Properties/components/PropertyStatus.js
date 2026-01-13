import { BaseWidget } from "../../../../src/core/BaseWidget";
import { CheckBoxInput } from "../../../../src/widgets/forms/CheckBoxInput";
import { RadioGroupInput } from "../../../../src/widgets/forms/RadioGroupInput";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { Row } from "../../../../src/widgets/layouts/Row";

const availability = [
    { label: "Disponível", value: 1 },//"available"
    { label: "Vendido", value: 2 },//sold
    { label: "Arrendado", value: 3 },//"rented"
    { label: "Suspenso", value: 0 }//suspended
];

export class PropertyStatus extends BaseWidget {
    constructor({ formData, onChange }) {
        super();

        this.formData = formData;
        this.onChange = onChange;
    }

    createPage() {
        return new Column({
            children: [
                new Row({
                    children: [
                        new Expand({
                            breakpoints: { lg: 3 },
                            children: [
                                new CheckBoxInput({
                                    label: "Colocar como destaque",
                                    name: "emphasis",
                                    checked: Boolean(this.formData.emphasis),
                                    onChange: v => this.onChange("emphasis", Boolean(v) ? 1 : 0)
                                })
                            ]
                        }),
                    ]
                }),

                new Row({
                    children: [
                        new Expand({
                            breakpoints: { lg: 3 },
                            children: [
                                new RadioGroupInput({
                                    name: "status",
                                    layout: "horizontal",
                                    value: this.formData.status,
                                    required: true,
                                    data: availability,
                                    onChange: v => this.onChange('status', v)
                                })
                            ]
                        })
                    ]
                })

            ]
        })
    }

    render() {
        this.children = [this.createPage()]
        return super.render()
    }
}