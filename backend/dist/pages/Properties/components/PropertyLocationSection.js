import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Container } from "../../../../src/widgets/layouts/Container";
import { Text } from "../../../../src/widgets/elements/Text";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { MapService } from "../../../Services/MapService";

export class PropertyLocationSection extends BaseWidget {
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
                height: "fit-content!important",
                width: "100%"
            },
            body: new Column({
                children: [
                    this._createHeader(),
                    this._createAddressSection(),
                    this._createMapSection()
                ]
            })
        });
    }

    _createHeader() {
        return new Container({
            style: { padding: "1.5rem 1.5rem 0 1.5rem" },
            children: new Row({
                style: { alignItems: "center", justifyContent: "space-between" },
                children: [
                    new Text({
                        text: "Localização",
                        style: {
                            fontSize: "1.3rem",
                            fontWeight: "700",
                            color: "#1a1a1a"
                        }
                    }),
                    new Icon({
                        icon: "fas fa-map-marked-alt",
                        style: { color: "#667eea", fontSize: "1.5rem" }
                    })
                ]
            })
        });
    }

    _createMapSection() {
        return (this.property?.latitude && this.property?.longitude) ?
            this._createMapComponent() :
            this._createNoLocationPlaceholder();
    }

    _createMapComponent() {
        return new Container({
            style: { height: "25rem", width: "100%!important", borderRadius: "8px", overflow: "hidden" },
            onMounted: (el) => {
                // Save reference for later use
                this.mapContainer = el;

                MapService.initMap(el, {
                    center: (this.property.latitude && this.property.longitude)
                        ? { lat: this.property.latitude, lng: this.property.longitude }
                        : { lat: -18.665695, lng: 35.529562 },
                    zoom: (this.property.latitude && this.property.longitude) ? 20 : 6,
                    showMarker: true,
                    popup: this.property.address || null
                });

                // Optional: If form already has coords on load, place marker correctly
                if (this.property.latitude && this.property.longitude) {
                    MapService.setMainMarkerPosition(
                        el,
                        this.property.latitude,
                        this.property.longitude,
                        this.property.address || 'Localização selecionada',
                        {
                            zoom: 18
                        }
                    );
                }
            }
        });
    }

    _createNoLocationPlaceholder() {
        return new Container({
            style: {
                height: "100%",
                background: "#f8f9fa",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "1rem"
            },
            children: [
                new Icon({ icon: "fas fa-map-marker-alt", style: { fontSize: "3rem", color: "#ccc" } }),
                new Text({
                    text: "Localização não disponível",
                    style: { color: "#999", fontWeight: "500" }
                })
            ]
        });
    }

    _createAddressSection() {
        return new Container({
            style: { padding: "0 1.5rem 1.5rem 1.5rem" },
            children: new Column({
                style: { gap: "0.5rem" },
                children: [
                    this._createAddressRow(),
                    this.property?.neighborhood && this._createNeighborhoodRow()
                ]
            })
        });
    }

    _createAddressRow() {
        return new Row({
            style: { alignItems: "center", gap: "0.75rem" },
            children: [
                new Icon({ icon: "fas fa-map-pin", style: { color: "#667eea" } }),
                new Text({
                    text: this.property?.address || "Endereço não especificado",
                    style: { fontWeight: "500" }
                })
            ]
        });
    }

    _createNeighborhoodRow() {
        return new Row({
            style: { alignItems: "center", gap: "0.75rem" },
            children: [
                new Icon({ icon: "fas fa-compass", style: { color: "#667eea" } }),
                new Text({
                    text: this.property?.neighborhood,
                    style: { color: "#666" }
                })
            ]
        });
    }

    render() {
        this.children = [this.create()]
        return super.render();
    }
}