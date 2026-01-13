import { Row } from "../../../src/widgets/layouts/Row";
import { Column } from "../../../src/widgets/layouts/Column";
import { Card } from "../../../src/widgets/layouts/Card";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Text } from "../../../src/widgets/elements/Text";
import { UIHelper } from "../../Utils/UIHelper";
import { App } from "../../../src/core/App";
import { Image } from "../../../src/widgets/elements/Image";
import { FormElements } from "../../Components/FormElements";
import { ADD_OR_UPDATE_PAGE_TYPES, BaseEntityHomePage } from "../BaseEntityHomePage";
import { PROPERTY_FILTER_FIELDS } from "../../Constants/Filters";
import { PropertyService } from "../../Services/PropertyService";
import { SharedUtils } from "../SharedUtils";
import { OffCanvas } from "../../../src/widgets/overlays/OffCanvas";
import { HeaderTitleComponent } from "../../Components/HeaderTitleComponent";
import { Stack } from "../../../src/widgets/layouts/Stack";
import { Align } from "../../../src/widgets/utilities/Align";
import { Position } from "../../../src/themes/Position";
import { Builder } from "../../../src/widgets/builders/Builder";
import "../../assets/styles/property-index.css";
import { ActiveFiltersDisplay } from "../../Components/ActiveFiltersDisplay";
import { MenuContext } from "../../Components/MenuContext";
import { VISIT_MENU } from "../../Constants/Menu";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Imóveis",
            endpoint: "/property",
            dataMapper: "properties",
            handleAddOrUpdatePageType: ADD_OR_UPDATE_PAGE_TYPES.NEW_PAGE,
            onFilter: () => {
                this.createOnFilterInputs()
            },
            displayType: "grid",
            downloadEndpoint: "/property/download",
            downloadLabel: "propriedades"
        });

        this.formElements = new FormElements();
    }

    toNewPage(params) {
        this.upated = false;
        App.instance.to(`properties/save/${params.id}`);
    }

    openMenuContext(property) {
        this.menuContext = new MenuContext({
            items: VISIT_MENU({
                view: {
                    onTap: () => {
                        App.instance.to(`/properties/${property.id}`)
                        this.menuContext?.close();
                    }
                },
                edit: {
                    onTap: () => {
                        App.instance.to(`/properties/save/${property.id}`)
                        this.menuContext?.close();
                    }
                },
                remove: {
                    onTap: () => {
                        const removeBottomSheet = UIHelper.showConfirmationDialog({
                            title: "Deseja realmente remover esse registo?",
                            subtitle: "Esta ação é irreversível. Toda informação relacionado com este registo vai ser removido do sistema permanentemente, confirme antes de continuar.",
                            confirmText: "Sim, remover",
                            cancelText: "Cancelar",
                            onConfirm: async () => {
                                await PropertyService.removeProperty(property.id);
                                this.refreshData();
                                removeBottomSheet?.close();
                                this.menuContext?.close();
                            },
                            onCancel: () => {
                                removeBottomSheet?.close();
                            }
                        });
                    }
                }
            })
        });
        this.menuContext.show();
    }

    createOnFilterInputs() {
        this.filtersOffCanvas = new OffCanvas({
            content: new Column({
                style: {
                    overflowY: "auto",
                    height: "100%",
                    padding: "1rem"
                },
                children: [
                    new HeaderTitleComponent({
                        text: "Filtros"
                    }),
                    ...SharedUtils.createFilterInputs(
                        this.formElements,
                        this.controller,
                        PROPERTY_FILTER_FIELDS,
                        () => this._applyFilters(),
                        () => this._clearFilters(),
                        this.formData
                    )
                ]
            })
        });

        this.filtersOffCanvas.show();
    }

    createFilterInputs() {
        return [
            new Builder({
                watch: () => {
                    const tags = this.state.tags;

                    return new ActiveFiltersDisplay({
                        tags,
                        onRemoveTag: (label, key) => {
                            this.formData = this.formElements.getFormData();
                            delete this.formData[key];
                            this.formElements.removeFormDataKey?.[key];

                            this.setState(prev => ({
                                tags: Object.fromEntries(Object.entries(prev.tags || {}).filter(([k]) => k !== label))
                            }));

                            this.refreshData();
                        },
                        onClearAll: () => {
                            this._clearFilters();
                            this.setState({ tags: {} });
                        },
                        emptyMessage: "Nenhum filtro aplicado"
                    }).create()
                }
            })
        ]
    }

    _showTagRemovedFeedback(label) {
        UIHelper.showInfoNotification({ message: `Filtro "${label}" removido` });
    }

    createGridItem(property) {
        return new Card({
            className: ["property-card"],
            bodyClassName: ["property-card-body"],
            events: {
                click: () => {
                    this.openMenuContext(property);
                },
            },
            body: new Column({
                children: [
                    new Stack({
                        className: ["property-card-image-stack"],
                        children: [
                            new Align({
                                position: Position.absolute.topRight,
                                zIndex: Position.z.topmost,
                                className: ["property-status-badge-container"],
                                children: [
                                    UIHelper.createBadge(this._getStatus(property.status))
                                ]
                            }),
                            new Align({
                                position: Position.absolute.topLeft,
                                zIndex: Position.z.tooltip,
                                className: ["property-image-container"],
                                children: [
                                    new Image({
                                        src: this._getMainImage(property.galleries)?.url,
                                        fallbackSrc: new URL("../../assets/images/failed-to-load.png", import.meta.url),
                                        className: ["property-main-image"],
                                        figureClassName: ["property-main-image-container"]
                                    }),
                                ]
                            }),
                            new Align({
                                position: Position.absolute.topLeft,
                                zIndex: Position.z.sticky,
                                className: ["property-image-overlay"],
                                children: []
                            }),
                            new Align({
                                position: Position.absolute.bottomLeft,
                                zIndex: Position.z.topmost,
                                className: ["property-price-overlay"],
                                children: [
                                    new Text({
                                        text: UIHelper.simpleCurrencyFormat(property.price, property.currencies.code),
                                        className: ["property-price-text"]
                                    })
                                ]
                            })
                        ]
                    }),

                    new Column({
                        className: ["property-card-content"],
                        children: [
                            new Text({
                                text: property.title || "Sem título",
                                className: ["property-title"]
                            }),
                            new Column({
                                className: ["property-details-grid"],
                                children: [
                                    this._createEnhancedDetailRow("fas fa-layer-group", "Categoria", property.categories?.name || "—"),
                                    this._createEnhancedDetailRow("fas fa-bullseye", "Finalidade", property.finalities?.name || "—"),
                                    this._createEnhancedDetailRow("fas fa-user-tie", "Proprietário", property.owners?.name || "—"),
                                    this._createEnhancedDetailRow("fas fa-map-marker-alt", "Localização", property.address || "—")
                                ]
                            }),
                            this._createFooterSection(property),
                        ]
                    })
                ]
            })
        });
    }

    _createEnhancedDetailRow(icon, label, value) {
        return new Row({
            className: ["property-detail-row"],
            rowStyle: {
                alignItems: "center"
            },
            children: [
                this._renderAvatarBadgeCell(value),
                new Column({
                    className: ["property-detail-text-container"],
                    children: [
                        new Text({
                            text: label,
                            className: ["property-detail-label"]
                        }),
                        new Text({
                            text: value,
                            className: ["property-detail-value"]
                        })
                    ]
                })
            ]
        });
    }

    _getMainImage(galleries) {
        const mainImage = galleries?.find(img => img.isMain == 1) || galleries[0];
        return mainImage;
    }

    _createFooterSection(property) {
        return new Row({
            className: ["property-details-footer-row"],
            children: [
                new Row({
                    className: ["property-details-created-at-row"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-calendar-plus",
                            className: ["property-details-created-at-icon"]
                        }),
                        new Text({
                            text: `Criado: ${property.updated_at || "Data não disponível"}`,
                            className: ["property-details-created-at-text"]
                        })
                    ]
                }),
                new Row({
                    className: ["property-details-more-info-row"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-arrow-right",
                            className: ["property-details-more-info-icon"]
                        }),
                        new Text({
                            text: "Ver detalhes",
                            className: ["property-details-more-info-text"]
                        })
                    ]
                })
            ]
        });
    }

    _getStatus(val) {
        let status = "unknown";
        switch (val) {
            case 1:
                status = "active";
                break;
            case 2:
                status = "inactive";
                break;
            case 3:
                status = "rented";
                break;
            case 4:
                status = "sold";
                break;
        }

        return status;
    }

    _renderAvatarBadgeCell(name, small = false) {
        const n = name || 'N/A';
        return SharedUtils.createAvatarBadge(n, {
            emptyName: 'N/A',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
            style: small ? {
                width: '24px',
                height: '24px',
                fontSize: '0.6rem'
            } : undefined
        });
    }

    _applyFilters() {
        this.formData = this.formElements.getFormData();
        this.refreshData();
        this.filtersOffCanvas?.close();

        this.setState(prev => {
            const newTags = { ...this.formElements.getSearchTagData() }

            return {
                tags: newTags,
            }
        })
    }

    _clearFilters() {
        this.formData = {};
        this.refreshData();
        this.formElements.resetFormData();
        this.formElements.resetSearchTagData();
        this.filtersOffCanvas?.close();
    }
}