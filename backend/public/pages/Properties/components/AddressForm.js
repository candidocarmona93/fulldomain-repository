import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { TextInput } from "../../../../src/widgets/forms/TextInput";
import { SelectBuilder } from "../../../../src/widgets/forms/SelectBuilder";
import { Container } from "../../../../src/widgets/layouts/Container";
import { HttpClient } from "../../../Services/HttpClient";
// Import the new Google service
import { GoogleMapService } from "../../../Services/GoogleMapService";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Stack } from "../../../../src/widgets/layouts/Stack";
import { Align } from "../../../../src/widgets/utilities/Align";
import { Position } from "../../../../src/themes/Position";
import { Debouncer } from "../../../Utils/Debouncer";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { Text } from "../../../../src/widgets/elements/Text";
import { Spinner } from "../../../../src/widgets/feedback/Spinner";
import { Icon } from "../../../../src/widgets/elements/Icon";

export class AddressForm extends BaseWidget {
    constructor({ formData, onChange }) {
        super();
        this.formData = formData;
        this.onChange = onChange;
        this.googleService = new GoogleMapService(); // Instance for map control

        this.performSearch = new Debouncer(300).debounce(async (query) => {
            if (!query?.trim()) {
                this.setState({ searchResults: [] });
                return;
            }

            try {
                this.setState({ isLoading: true });
                // Use Google's search (Autocomplete + Details)
                const results = await GoogleMapService.search(query, {
                    countryCode: 'mz',
                    limit: 5
                });
                this.setState({ searchResults: results || [] });
            } catch (err) {
                console.error("Google Search failed:", err);
                this.setState({ searchResults: [] });
            } finally {
                this.setState({ isLoading: false });
            }
        });

        this.initState({
            searchResults: [],
            inputHasValue: false,
            isLoading: false,
        });
    }

    createInputs() {
        return new Column({
            gap: "20px",
            children: [
                new Row({
                    children: [
                        new Expand({
                            breakpoints: { lg: 9 },
                            children: [
                                new Stack({
                                    children: [
                                        new Align({
                                            alignment: "topLeft",
                                            children: [
                                                new TextInput({
                                                    label: "Endereço do Imóvel",
                                                    value: this.formData.address || "",
                                                    placeholder: "Digite o endereço...",
                                                    onChange: (v) => {
                                                        this.onChange("address", v);
                                                        this.setState({ inputHasValue: Boolean(v.trim()) });
                                                        this.performSearch(v);
                                                    },
                                                    onMounted: (_, refs) => {
                                                        this.addressInputElement = refs.inputElement;
                                                    }
                                                })
                                            ]
                                        }),

                                        new Builder({
                                            watch: () => {
                                                const { searchResults, inputHasValue, isLoading } = this.state;
                                                return new Align({
                                                    style: {
                                                        position: "absolute",
                                                        top: "100%",
                                                        left: 0,
                                                        right: 0,
                                                        maxHeight: "300px",
                                                        overflowY: "auto",
                                                        background: "white",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "0 0 8px 8px",
                                                        padding: "1rem",
                                                        display: !inputHasValue ? "none" : "flex",
                                                        flexDirection: "column",
                                                        zIndex: Position.z.xtopmost
                                                    },
                                                    children: isLoading ? [new Spinner()] :
                                                        new Column({
                                                            children: [
                                                                new Icon({
                                                                    icon: "fa fa-times",
                                                                    style: { cursor: "pointer", padding: ".8rem" },
                                                                    events: {
                                                                        click: () => this.setState({ searchResults: [], inputHasValue: false })
                                                                    }
                                                                }),
                                                                ...searchResults.map((result, i) => (
                                                                    new Container({
                                                                        key: i,
                                                                        padding: "1rem",
                                                                        style: { cursor: "pointer", borderBottom: "1px solid #ddd" },
                                                                        hoverStyle: { backgroundColor: "#f0f8ff" },
                                                                        events: {
                                                                            click: () => {
                                                                                // Update form data
                                                                                this.onChange("address", result.address);
                                                                                this.onChange("latitude", result.lat);
                                                                                this.onChange("longitude", result.lng);

                                                                                this.setState({ searchResults: [], inputHasValue: false });

                                                                                // Update Google Map Marker and View
                                                                                if (this.googleService.map) {
                                                                                    const pos = { lat: result.lat, lng: result.lng };
                                                                                    this.googleService.map.setCenter(pos);
                                                                                    this.googleService.map.setZoom(18);
                                                                                    this.googleService.marker.position = pos;
                                                                                    this.googleService.marker.title = result.address;
                                                                                }
                                                                            }
                                                                        },
                                                                        children: [
                                                                            new Text({
                                                                                text: result.address || result.name,
                                                                                style: { fontSize: "14px" }
                                                                            })
                                                                        ]
                                                                    })
                                                                ))
                                                            ]
                                                        })
                                                });
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        // Neighborhood selection remains unchanged
                        new Expand({
                            breakpoints: { lg: 3 },
                            children: [
                                new SelectBuilder({
                                    future: HttpClient.instance.get("/neighborhoods"),
                                    label: "Bairro",
                                    placeholder: "Selecione o bairro",
                                    value: this.formData.neighborhood_id,
                                    proxyData: d => d.result.neighborhoods.map(n => ({ label: n.name, value: n.id })),
                                    onChange: v => this.onChange("neighborhood_id", v)
                                })
                            ]
                        })
                    ]
                }),

                // Google Map Container
                new Expand({
                    breakpoints: { lg: 12 },
                    children: [
                        new Container({
                            style: { height: "25rem", width: "100%", borderRadius: "8px", overflow: "hidden" },
                            onMounted: async (el) => {
                                // Initialize the Google Map
                                await this.googleService.initMap(el, {
                                    lat: parseFloat(this.formData.latitude) || -25.9267,
                                    lng: parseFloat(this.formData.longitude) || 32.6338,
                                    title: this.formData.address || "Localização"
                                });

                                // Ensure zoom is correct if data exists
                                if (this.formData.latitude && this.googleService.map) {
                                    this.googleService.map.setZoom(18);
                                }
                            }
                        })
                    ]
                })
            ]
        });
    }
}