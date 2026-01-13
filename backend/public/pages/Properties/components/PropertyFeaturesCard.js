import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Text } from "../../../../src/widgets/elements/Text";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { BaseWidget } from "../../../../src/core/BaseWidget";

export class PropertyFeaturesCard extends BaseWidget{
    constructor({ property }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.property = property;
    }

    create() {
        const features = this.property.features.length ? this.property.features : [];

        return new Card({
            style: {
                flexGrow: "0",
                height: "fit-content!important"
            },
            body: new Column({
                style: {
                    overflowY: "auto",
                },
                children: [
                    this._createHeader(),
                    this._createFeaturesList(features)
                ]
            })
        });
    }

    _createHeader() {
        return new Row({
            style: { alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
            children: [
                new Text({
                    text: "Comodidades",
                    style: {
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "#1a1a1a"
                    }
                }),
                new Icon({
                    icon: "fas fa-star",
                    style: { color: "#667eea", fontSize: "1.2rem" }
                })
            ]
        });
    }

    _createFeaturesList(features) {
        return new Column({
            style: { gap: "0.75rem" },
            children: features.map(feature => this._createFeatureItem(feature))
        });
    }

    _createFeatureItem(feature) {
        return new Row({
            style: { alignItems: "center", gap: "0.75rem" },
            children: [
                new BaseWidget({
                    style: { color: "#667eea", width: "20px" },
                    onAttached: (el) => {
                        el.insertAdjacentHTML("afterbegin", feature.feature.icon_svg)
                    }
                }),
                new Text({
                    text: feature.feature.name,
                    style: { fontWeight: "500" }
                })
            ]
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}