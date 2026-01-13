

import { Builder } from "../../src/widgets/builders/Builder";
import { Icon } from "../../src/widgets/elements/Icon";
import { Text } from "../../src/widgets/elements/Text";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import "../assets/styles/active-filters-display.css";
import { UIHelper } from "../Utils/UIHelper";

export class ActiveFiltersDisplay {
    constructor({
        tags = {},
        onRemoveTag,
        onClearAll,
        emptyMessage = "Nenhum filtro aplicado"
    } = {}) {
        this.tags = tags;
        this.onRemoveTag = onRemoveTag;
        this.onClearAll = onClearAll;
        this.emptyMessage = emptyMessage;
    }

    create() {
        const activeTags = Object.entries(this.tags || {}).filter(
            ([_, data]) => data?.value && data.value !== ""
        );

        if (activeTags.length === 0) {
            return new Container({
                className: ["empty-filter-container"],
                children: [
                    new Row({
                        className: ["empty-filter-row"],
                        children: [
                            new Container({
                                className: ["empty-filter-icon-container"],
                                children: [new Icon({ icon: "fas fa-filter", className: ["empty-filter-icon"] })]
                            }),
                            new Text({ text: this.emptyMessage, className: ["empty-filter-text"] })
                        ]
                    })
                ]
            });
        }

        const tagWidgets = activeTags.map(([label, data]) => {
            return new Container({
                className: ["filter-tag"],
                children: [
                    new Container({
                        className: ["filter-tag-icon-container"],
                        children: [new Icon({ icon: "fas fa-filter", className: ["filter-tag-icon"] })]
                    }),
                    new Column({
                        className: ["filter-tag-text-container"],
                        children: [
                            new Text({ text: label, className: ["filter-tag-label"] }),
                            new Text({ text: data.value, className: ["filter-tag-value"] })
                        ]
                    }),
                    new Icon({
                        icon: "fas fa-times",
                        className: ["filter-tag-remove-icon"],
                        events: {
                            click: () => {
                                this.onRemoveTag?.(label, data.key);
                                UIHelper.showInfoNotification({
                                    message: `Filtro "${label}" removido`
                                });
                            }
                        }
                    })
                ]
            });
        });

        return new Container({
            className: ["active-filters-container"],
            children: [
                new Column({
                    className: ["active-filters-content"],
                    children: [
                        new Row({
                            className: ["active-filters-header"],
                            children: [
                                new Row({
                                    className: ["active-filters-title-row"],
                                    children: [
                                        new Container({
                                            className: ["active-filters-title-icon"],
                                            children: [new Icon({ icon: "fas fa-sliders-h", className: ["active-filters-title-icon-inner"] })]
                                        }),
                                        new Text({ text: "Filtros Ativos", className: ["active-filters-title"] })
                                    ]
                                }),
                                new Container({
                                    className: ["active-filters-counter"],
                                    children: [
                                        new Text({
                                            text: `${activeTags.length} ${activeTags.length === 1 ? 'filtro' : 'filtros'}`,
                                            className: ["active-filters-counter-text"]
                                        })
                                    ]
                                })
                            ]
                        }),
                        new Row({
                            className: ["active-filters-tags-row"],
                            children: tagWidgets
                        }),
                        new Row({
                            className: ["active-filters-clear-row"],
                            children: [
                                new Container({
                                    className: ["clear-all-filters-btn"],
                                    events: { click: () => this.onClearAll?.() },
                                    children: [
                                        new Icon({ icon: "fas fa-times-circle", className: ["clear-all-filters-icon"] }),
                                        new Text({ text: "Limpar todos os filtros", className: ["clear-all-filters-text"] })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
}