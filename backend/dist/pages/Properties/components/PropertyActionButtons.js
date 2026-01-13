import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Themes } from "../../../../src/themes/Themes";
import { BaseWidget } from "../../../../src/core/BaseWidget";

export class PropertyActionButtons extends BaseWidget{
    constructor({ onScheduleVisit, onShareProperty }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.onScheduleVisit = onScheduleVisit;
        this.onShareProperty = onShareProperty;
    }

    create() {
        return new Card({
            style: {
                height: "fit-content!important",
                width: "100%"
            },
            body: new Column({
                style: { gap: "0.75rem" },
                children: [
                    this._createScheduleVisitButton(),
                    this._createSharePropertyButton()
                ]
            })
        });
    }

    _createScheduleVisitButton() {
        return new Button({
            label: "Marcar Visita",
            icon: "fas fa-calendar-check",
            theme: Themes.button.type.primary,
            style: {
                width: "100%",
            },
            onPressed: this.onScheduleVisit
        });
    }

    _createSharePropertyButton() {
        return new Button({
            label: "Partilhar Imóvel",
            icon: "fas fa-share-alt",
            theme: Themes.button.type.secondary,
            style: {
                width: "100%",
                borderRadius: "12px",
                padding: "1rem",
                fontWeight: "600"
            },
            onPressed: this.onShareProperty
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}