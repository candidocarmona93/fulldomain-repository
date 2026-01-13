import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { TextInput } from "../../../../src/widgets/forms/TextInput";
import { SelectBuilder } from "../../../../src/widgets/forms/SelectBuilder";
import { TextAreaInputBuilder } from "../../../../src/widgets/forms/TextAreaInputBuilder";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { HttpClient } from "../../../Services/HttpClient";
import { Themes } from "../../../../src/themes/Themes";
import { BaseWidget } from "../../../../src/core/BaseWidget";
export class PropertyDetailsForm extends BaseWidget {
    constructor({ formData, onChange, onAIGenerate }) {
        super();
        this.formData = formData;
        this.onChange = onChange;
        this.onAIGenerate = onAIGenerate;
    }

    createInputs() {
        return new Column({
            gap: "20px",
            children: [
                new Row({
                    children: [
                        new Expand({ breakpoints: { lg: 7 }, children: [new TextInput({ label: "Título do Imóvel", name: "title", value: this.formData.title || "", onChange: v => this.onChange("title", v) })] }),
                        new Expand({ breakpoints: { lg: 3 }, children: [new TextInput({ label: "Preço", name: "price", value: this.formData.price || "", onChange: v => this.onChange("price", v) })] }),
                        new Expand({
                            breakpoints: { lg: 2 }, children: [
                                new SelectBuilder({
                                    future: HttpClient.instance.get("/currencies"),
                                    label: "Moeda",
                                    name: "currency_id",
                                    placeholder: "Selecione",
                                    value: this.formData.currency_id,
                                    proxyData: d => d.result.currencies.map(c => ({ label: c.name, value: c.id })),
                                    onChange: v => this.onChange("currency_id", v)
                                })
                            ]
                        })
                    ]
                }),

                new Row({
                    children: [
                        new Expand({ breakpoints: { lg: 4 }, children: [new TextInput({ label: "Quartos", name: "room", value: this.formData.room || "", onChange: v => this.onChange("room", v) })] }),
                        new Expand({ breakpoints: { lg: 4 }, children: [new TextInput({ label: "Casas de banho", name: "bathroom", value: this.formData.bathroom || "", onChange: v => this.onChange("bathroom", v) })] }),
                        new Expand({ breakpoints: { lg: 4 }, children: [new TextInput({ label: "Área (m²)", name: "area", value: this.formData.area || "", onChange: v => this.onChange("area", v) })] })
                    ]
                }),

                new Row({
                    children: [
                        new Expand({ breakpoints: { lg: 3 }, children: [new SelectBuilder({ future: HttpClient.instance.get("/categories"), label: "Categoria", name: "category_id", value: this.formData.category_id, proxyData: d => d.result.categories.map(c => ({ label: c.name, value: c.id })), onChange: v => this.onChange("category_id", v) })] }),
                        new Expand({ breakpoints: { lg: 3 }, children: [new SelectBuilder({ future: HttpClient.instance.get("/finalities"), label: "Finalidade", name: "finality_id", value: this.formData.finality_id, proxyData: d => d.result.finalities.map(c => ({ label: c.name, value: c.id })), onChange: v => this.onChange("finality_id", v) })] }),
                        new Expand({ breakpoints: { lg: 3 }, children: [new SelectBuilder({ future: HttpClient.instance.get("/owners"), label: "Proprietário", name: "owner_id", value: this.formData.owner_id, proxyData: d => d.result.owners.map(c => ({ label: c.name, value: c.id })), onChange: v => this.onChange("owner_id", v) })] }),
                        new Expand({ breakpoints: { lg: 3 }, children: [new SelectBuilder({ future: HttpClient.instance.get("/users"), label: "Responsável", name: "responsible_id", value: this.formData.responsible_id, proxyData: d => d.result.users.map(c => ({ label: c.name, value: c.id })), onChange: v => this.onChange("responsible_id", v) })] })
                    ]
                }),

                new Row({
                    children: [new Expand({
                        breakpoints: { lg: 12 }, children: [new TextAreaInputBuilder({
                            name: "description",
                            label: "Descrição do Imóvel",
                            value: this.formData.description || "",
                            style: { height: "12rem" },
                            onChange: v => this.onChange("description", v)
                        })]
                    })]
                }),

                new Row({
                    children: [
                        new Expand({
                            breakpoints: { lg: 3 },
                            children: [
                                new Button({
                                    label: "Gerar com IA",
                                    prefixIcon: new Icon({ icon: "fa-solid fa-robot" }),
                                    theme: Themes.button.type.secondary,
                                    style: { height: "3rem" },
                                    onPressed: this.onAIGenerate
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }
}