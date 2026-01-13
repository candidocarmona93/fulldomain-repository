import { BaseWidget } from "../../../src/core/BaseWidget";
import { Expand } from "../../../src/widgets/layouts/Expand";
import { Row } from "../../../src/widgets/layouts/Row";
import { CardKPIComponent } from "../../Components/CardKPIComponent";
import { ContentHeaderComponent } from "../../Components/ContentHeaderComponent";

export class Index extends BaseWidget {
    constructor() {
        super();
    }

    createPage() {
        return new Row({
            children: [
                new Expand({
                    breakpoints: {
                        lg: 3
                    },
                    children: [
                        new CardKPIComponent({
                            label: "Imoveis activos",
                            value: 0
                        }),
                    ]
                }),

                new Expand({
                    breakpoints: {
                        lg: 3
                    },
                    children: [
                        new CardKPIComponent({
                            theme: "danger",
                            label: "Imoveis inactivos",
                            value: 0
                        }),
                    ]
                }),

                new Expand({
                    breakpoints: {
                        lg: 3
                    },
                    children: [
                        new CardKPIComponent({
                            theme: "info",
                            label: "Imoveis arrendados",
                            value: 0
                        }),
                    ]
                }),

                new Expand({
                    breakpoints: {
                        lg: 3
                    },
                    children: [
                        new CardKPIComponent({
                            theme: "info",
                            label: "Imoveis vendidos",
                            value: 0
                        }),
                    ]
                }),
            ]
        })
    }

    render() {
        this.children = [
            new ContentHeaderComponent({
                title: "Dashboard",
                subtitle: "Visão geral",
                onFilter: () => {},
            }),
            this.createPage()
        ]
        return super.render();
    }
}