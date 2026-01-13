import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Themes } from "../../../../src/themes/Themes";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { Image } from "../../../../src/widgets/elements/Image";
import { Text } from "../../../../src/widgets/elements/Text";
import { Badge } from "../../../../src/widgets/feedback/Badge";
import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Container } from "../../../../src/widgets/layouts/Container";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { Row } from "../../../../src/widgets/layouts/Row";
import { RowBuilder } from "../../../../src/widgets/layouts/RowBuilder";
import { GalleryImageViewer } from "../../../Components/GalleryImageViewer";
import { PropertyUtils } from "../../../Utils/PropertyUtils"

export class PropertyOverviewCard extends BaseWidget {
    constructor({ property }) {
        super({
            style: {
                width: "100%"
            }
        });

        this.property = property;
    }

    create() {
        const mainImage = PropertyUtils.getMainImage(this.property.galleries);

        return new Card({
            style: {
                height: "fit-content!important",
                width: "100%"
            },
            body: new Column({
                gap: "20px",
                children: [
                    this._createHeaderSection(),
                    this._createGallerySection({ property: this.property }),
                    this._createStatsSection(),
                    this._createDescriptionSection()
                ]
            })
        });
    }

    _createHeaderSection() {
        return new Column({
            children: [
                new Row({
                    children: [
                        new Expand({
                            breakpoints: { lg: 10 },
                            children: [
                                new Text({
                                    text: this.property?.title,
                                    style: {
                                        fontSize: "2rem"
                                    }
                                }),
                            ]
                        }),
                        new Expand({
                            breakpoints: { lg: 2 },
                            children: [
                                new Column({
                                    style: { alignItems: "flex-end", gap: "0.5rem" },
                                    children: [
                                        new Text({
                                            text: "Código do Imóvel",
                                            size: Themes.text.size.small
                                        }),
                                        new Badge({
                                            label: this.property?.code,
                                            theme: Themes.badge.type.primary,
                                            style: {
                                                fontSize: "1rem",
                                                fontWeight: "700",
                                                padding: "0.5rem 1rem"
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                new Row({
                    rowStyle: {
                        justifyContent: "space-between"
                    },
                    children: [
                        this._createLocationRow(),
                        this._createViewsRow()
                    ]
                }),
            ]
        });
    }

    _createGallerySection() {
        return new RowBuilder({
            count: this.property.galleries.length,
            breakpoints: {
                lg: 2
            },
            builder: (index) => {
                const img = this.property.galleries[index];

                return new Image({
                    src: img.url,
                    events: {
                        click: () => {
                            this.imageViewer = new GalleryImageViewer({
                                images: this.property.galleries,
                                initialIndex: index,
                                showMainBadge: false,
                            });

                            this.imageViewer.open();
                        }
                    }
                });
            }
        });
    }

    _createLocationRow() {
        return new Row({
            rowContainerStyle: { alignItems: "center", gap: "0.5rem", width: "auto", margin: 0 },
            children: [
                new Icon({ icon: "fas fa-map-marker-alt", style: { color: "#667eea" } }),
                new Text({
                    text: this.property?.address || "Localização não especificada",
                    style: { color: "#666", fontWeight: "500" }
                })
            ]
        });
    }

    _createViewsRow() {
        return new Row({
            rowContainerStyle: { alignItems: "center", gap: "0.5rem", width: "auto", margin: 0 },
            children: [
                new Icon({ icon: "fas fa-eye", style: { color: "#667eea" } }),
                new Text({
                    text: `${this.property?.views || 0} visualizações`,
                    style: { color: "#666", fontWeight: "500" }
                })
            ]
        });
    }

    _createMainImage(mainImage) {
        return new Image({
            src: mainImage?.url,
            fallbackSrc: new URL("../../../assets/images/failed-to-load.png", import.meta.url),
            rounded: true,
            shadow: true,
            border: true,
            style: {
                aspectRatio: "16/9",
            },
            figureStyle: {
                width: "100%!important"
            }
        })
    }

    _createStatsSection() {
        const stats = [
            PropertyUtils.createStatItem("fas fa-bed", "Quartos", this.property?.bedrooms || "-"),
            PropertyUtils.createStatItem("fas fa-bath", "Casas de banho", this.property?.bathrooms || "-"),
            PropertyUtils.createStatItem("fas fa-ruler-combined", "Área", this.property?.area ? `${this.property?.area} m²` : "-"),
            PropertyUtils.createStatItem("fas fa-car", "Garagens", this.property?.garages || "-"),
            PropertyUtils.createStatItem("fas fa-building", "Andar", this.property?.floor || "-")
        ];

        return new Container({
            style: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                textAlign: "center",
                flexWrap: "wrap",
                gap: "1rem",
                width: "100%",
                backgroundColor: "rgb(248, 249, 250)",
                padding: "1rem"
            },
            children: stats.map(stat => this._createStatItem(stat))
        });
    }

    _createStatItem(stat) {
        return new Column({
            style: { alignItems: "center", gap: "0.5rem", width: "auto!important" },
            children: [
                new Icon({ icon: stat.icon, style: { fontSize: "1.5rem", color: "#667eea" } }),
                new Text({
                    text: stat.value,
                    style: { fontSize: "1.5rem", fontWeight: "700", color: "#1a1a1a" }
                }),
                new Text({
                    text: stat.label,
                    style: { fontSize: "0.8rem", color: "#666", fontWeight: "500" }
                })
            ]
        });
    }

    _createDescriptionSection() {
        return new Column({
            style: {
                padding: "2rem",
                backgroundColor: "rgb(248, 249, 250)",
                height: "fit-content!important",
                flexGrow: "0!important"
            },
            children: [
                new Text({
                    textAsHtml: this.property.description
                })
            ]
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}