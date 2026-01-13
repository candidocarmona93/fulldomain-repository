import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Icon } from "../../src/widgets/elements/Icon";
import { IconButton } from "../../src/widgets/buttons/IconButton";
import { HeaderSubtitleComponent } from "./HeaderSubtitleComponent";
import { HeaderTitleComponent } from "./HeaderTitleComponent";
import "../assets/styles/content-header-component.css";
import { BaseWidget } from "../../src/core/BaseWidget";

export class ContentHeaderComponent extends Container {
    constructor({
        leading = null,
        title = "",
        subtitle = "",
        onFilter = null,
        onExport = null,
        onBack = null,
    } = {}) {
        super({
            className: ["content-header-component"],
        });

        this.leading = leading;
        this.title = title;
        this.subtitle = subtitle;
        this.onFilter = onFilter;
        this.onExport = onExport;
        this.onBack = onBack;
    }

    createActions() {
        return new Container({
            className: ["content-header-actions-component"],
            children: [
                this.onFilter ? new IconButton({
                    style: {
                        gap: "10px"
                    },
                    className: ["actions-filter-component"],
                    onPressed: this.onFilter,
                    label: "Filtrar",
                    icon: new Icon({
                        icon: "fa-solid fa-filter",
                    }),
                }) : null,
                this.onExport ? new IconButton({
                    style: {
                        gap: "10px"
                    },
                    className: ["actions-sort-component"],
                    onPressed: this.onExport,
                    label: "Exportar",
                    icon: new Icon({
                        icon: "fa-solid fa-download",
                    }),
                }) : null,
                this.onBack ? new IconButton({
                    style: {
                        gap: "10px"
                    },
                    className: ["actions-back-component"],
                    onPressed: this.onBack,
                    label: "Voltar",
                    icon: new Icon({
                        icon: "fa-solid fa-arrow-left",
                    }),
                }) : null,
            ].filter(Boolean)
        });
    }

    onUpdate() {
        super.update();
    }

    render() {
        this.children = [
            new Column({
                children: [
                    new Container({
                        style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "10px",
                        },
                        children: [
                            this.leading ? this.leading : null,
                            new Column({
                                children: [
                                    this.title instanceof BaseWidget ? this.title : new HeaderTitleComponent({ style: { lineHeight: "1" }, text: this.title }),
                                    this.subtitle instanceof BaseWidget ? this.subtitle : new HeaderSubtitleComponent({ style: { lineHeight: "1.4", }, text: this.subtitle })
                                ]
                            })
                        ]
                    })
                ]
            }),
            this.createActions()
        ];
        return super.render();
    }
}