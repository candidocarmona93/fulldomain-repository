import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Text } from "../../../../src/widgets/elements/Text";
import { PropertyUtils } from "../../../Utils/PropertyUtils";
import { BaseWidget } from "../../../../src/core/BaseWidget";

export class PropertyPriceCard extends BaseWidget {
    constructor({ property }) {
        super({
            style: {
                width: "100%"
            }
        })
        this.property = property;
    }

    create() {
        return new Card({
            style: {
                background: "var(--primary)",
                height: "fit-content!important",
                width: "100%"
            },
            body: new Column({
                gap: 0,
                style: { alignItems: "center", textAlign: "center" },
                children: [
                    new Text({
                        text: "Preço",
                        style: {
                            fontSize: "1rem",
                            opacity: 0.9,
                            marginBottom: "0.5rem",
                            color: "#fff!important"
                        }
                    }),
                    new Text({
                        text: PropertyUtils.formatPrice(this.property?.price),
                        style: {
                            fontSize: "2.5rem",
                            fontWeight: "800",
                            marginBottom: "1rem",
                            color: "#fff!important"
                        }
                    }),
                    new Text({
                        text: this.property?.price_type || "Venda",
                        style: {
                            fontSize: "1rem",
                            opacity: 0.9,
                            background: "rgba(255,255,255,0.2)",
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            backdropFilter: "blur(10px)",
                            color: "#fff!important"
                        }
                    })
                ]
            })
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}