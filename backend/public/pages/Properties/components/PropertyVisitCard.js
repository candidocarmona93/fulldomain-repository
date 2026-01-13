import { App } from "../../../../src/core/App";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Themes } from "../../../../src/themes/Themes";
import { FutureBuilder } from "../../../../src/widgets/builders/FutureBuilder";
import { Text } from "../../../../src/widgets/elements/Text";
import { Badge } from "../../../../src/widgets/feedback/Badge";
import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { OffCanvas } from "../../../../src/widgets/overlays/OffCanvas";
import { MenuContext } from "../../../Components/MenuContext";
import { VisitsCard } from "../../../Components/VisitsCard";
import { VisitsSharedComponents } from "../../../Components/VisitsSharedComponents";
import { VISIT_MENU } from "../../../Constants/Menu";
import { AuthService } from "../../../Services/AuthService";
import { HttpClient } from "../../../Services/HttpClient";
import { VisitService } from "../../../Services/VisitService";
import { UIHelper } from "../../../Utils/UIHelper";


export class PropertyVisitCard extends BaseWidget {
    constructor({ property, controller }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.property = property;
        this.controller = controller;

        this.selectedVisitId = null;
        this.notes = "";

        this.initState({
            visitsCount: 0
        })
    }

    create() {
        return new Card({
            style: {
                height: "fit-content!important"
            },
            body: new Column({
                children: [
                    this._createHeader(),
                    new FutureBuilder({
                        controller: this.controller,
                        future: () => HttpClient.instance.get(`/visits/property/${this.property.id}`),
                        builder: ({ result }) => {
                            const visits = result.visits;

                            this.setState((prev) => {
                                return {
                                    visitsCount: visits.length
                                };
                            })

                            const component = visits.map(visit => {
                                return new VisitsCard({
                                    visit,
                                    showProperty: false,
                                    onClick: (visit) => {
                                        this.openMenuContext();
                                    }
                                }).create()
                            });

                            return new Column({
                                children: component
                            });
                        }
                    })
                ]
            })
        });
    }

    openMenuContext() {
        this.menuContext = new MenuContext({
            items: VISIT_MENU({
                view: {
                    onTap: () => this.onView?.(),
                },
                edit: {
                    onTap: () => this.onEdit?.(),
                },
                remove: {
                    onTap: () => this.onRemove?.(),
                }
            })
        });
        this.menuContext.show();
    }


    _createHeader() {
        return new Row({
            rowStyle: { alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
            children: [
                new Text({
                    text: "Próximas Visitas",
                    style: {
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "#1a1a1a"
                    }
                }),
                new Badge({
                    label: `{{ visitsCount }}`,
                    theme: Themes.badge.type.primary,
                    style: {
                        fontWeight: "bold"
                    }
                })
            ]
        });
    }

    render() {
        this.children = [this.create()];
        return super.render();
    }
}