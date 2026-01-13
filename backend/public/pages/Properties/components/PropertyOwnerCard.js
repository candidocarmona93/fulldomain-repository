import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Text } from "../../../../src/widgets/elements/Text";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { SharedUtils } from "../../SharedUtils";

export class PropertyOwnerCard extends BaseWidget {
    constructor({ property }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.property = property;
    }

    create() {
        return new Card({
            style: {
                flexGrow: "0",
                height: "fit-content!important"
            },
            body: new Column({
                gap: 0,
                children: [
                    this._createHeader(),
                    this._createOwnerInfo()
                ]
            })
        });
    }

    _createHeader() {
        return new Row({
            style: { alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
            children: [
                new Text({
                    text: "Proprietário",
                    style: {
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "#1a1a1a"
                    }
                }),
                new Icon({
                    icon: "fas fa-user-tie",
                    style: { color: "#667eea", fontSize: "1.2rem" }
                })
            ]
        });
    }

    _createOwnerInfo() {
        return new Row({
            rowStyle: {
                alignItems: "center"
            },
            children: [
                new Row({
                    children: [
                        this._renderAvatarBadgeCell(this.property?.owners?.name),
                        new Column({
                            children: [
                                new Text({
                                    text: this.property?.owners?.name,
                                    style: {
                                        color: "#495057",
                                        fontWeight: "500",
                                        fontSize: "0.9rem"
                                    }
                                }),
                                new Text({
                                    text: this.property?.owners?.contact_1,
                                    style: {
                                        fontSize: "0.8rem",
                                        color: "#888"
                                    }
                                }),
                            ]
                        })
                    ]
                }),
            ]
        });
    }

    _renderAvatarBadgeCell(name) {
        const n = name || 'N/A';
        return SharedUtils.createAvatarBadge(n, {
            emptyName: 'N/A',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}