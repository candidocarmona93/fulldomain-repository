import { Column } from "../../../../src/widgets/layouts/Column";
import { SearchInput } from "../../../../src/widgets/forms/SearchInput";
import { CheckBoxInput } from "../../../../src/widgets/forms/CheckBoxInput";
import { FutureBuilder } from "../../../../src/widgets/builders/FutureBuilder";
import { Spinner } from "../../../../src/widgets/feedback/Spinner";
import { HttpClient } from "../../../Services/HttpClient";
import { BaseWidget } from "../../../../src/core/BaseWidget";

export class FeaturesSelector extends BaseWidget {
    constructor({ selected = [], onChange }) {
        super();
        this.selected = selected;
        this.onChange = onChange;
    }

    toggleFeature(id) {
        const newSelected = this.selected.includes(id)
            ? this.selected.filter(x => x !== id)
            : [...this.selected, id];
        this.selected = newSelected;
        this.onChange(newSelected);
    }

    createInputs() {
        return new FutureBuilder({
            future: HttpClient.instance.get("/features"),
            onLoading: () => new Spinner(),
            builder: ({ result }) => {
                const features = result.features || [];
                return new Column({
                    children: [
                        new SearchInput({
                            label: "Pesquisar comodidade...",
                            onChange: val => {
                                Array.from(this.featuresColumn.children).forEach(el => {
                                    const label = el.querySelector("label")?.textContent || "";
                                    el.style.display = label.toLowerCase().includes(val.toLowerCase()) ? "" : "none";
                                });
                            }
                        }),

                        new Column({
                            children: features.map(f => {
                                console.log(f)
                                return new CheckBoxInput({
                                    label: f.name,
                                    checked: this.selected.includes(f.id),
                                    onChange: () => this.toggleFeature(f.id)
                                })
                            }),
                            onMounted: el => this.featuresColumn = el
                        })
                    ]
                });
            }
        })
    }
}