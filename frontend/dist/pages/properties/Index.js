import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Image } from "../../../src/widgets/elements/Image";
import { Icon } from "../../../src/widgets/elements/Icon";
import { FutureBuilder } from "../../../src/widgets/builders/FutureBuilder";
import { FutureBuilderController } from "../../../src/widgets/builders/FutureBuilderController";
import { Builder } from "../../../src/widgets/builders/Builder";
import { Paginator } from "../../../src/widgets/data-display/Paginator";
import { HttpClient } from "../../services/HttpClient";
import { Utils } from "../../services/Utils";
import { App } from "../../../src/core/App";
import { Center } from "../../../src/widgets/layouts/Center";
import { Spinner } from "../../../src/widgets/feedback/Spinner";

import "../../assets/styles/property-listing-page.css";

export class Index extends BaseWidget {
    constructor() {
        super();

        this.futureBuilderController = new FutureBuilderController();
        this.queryData = {};

        this.initState({
            activeCategory: 0,
            offset: 0,
            limit: 12,
            currentPage: 1,
            totalItems: 0
        })
    }

    createSection() {
        return new Container({
            className: ["l-listing-page-root"],
            children: [
                this._createHeader(),
                this._createCategoriesSection(),
                this._createListingGrid(),
                this._createPaginator()
            ]
        })
    }

    _createHeader() {
        return new Container({
            className: ["l-section-header"],
            children: [
                new Text({
                    text: "IMÓVEIS PREMIUM",
                    className: ["l-header-subtitle"]
                }),
                new Text({
                    text: "Descubra Sua Próxima Oportunidade",
                    className: ["l-header-title"]
                }),
                new Text({
                    text: "Explore nossa exclusiva coleção de propriedades premium em Maputo. Clique nas categorias para filtrar.",
                    className: ["l-header-description"]
                })
            ]
        })
    }

    _createCategoriesSection() {
        return new Container({
            className: ["l-categories-section"],
            children: [
                new Container({
                    className: ["l-categories-container"],
                    children: [
                        this._createScrollButton('left'),
                        new FutureBuilder({
                            future: () => HttpClient.instance.get("/categories?type_id=2"),
                            builder: ({ result }) => {
                                const categories = result.categories;

                                return new Container({
                                    className: ["l-categories-scroll"],
                                    children: categories.map(category => this._createCategoryTag(category))
                                });
                            },
                            onLoading: () => new Center({
                                children: [
                                    new Spinner()
                                ]
                            })
                        }),
                        this._createScrollButton('right')
                    ]
                })
            ]
        })
    }

    _createCategoryTag(category) {
        return new Builder({
            watch: () => {
                const isActive = this.state.activeCategory === category.id;

                return new Container({
                    className: ["l-category-tag", isActive ? "active" : ""],
                    children: [
                        new Icon({ icon: category.icon, className: ["l-category-icon"] }),
                        new Text({ text: category.name, style: { textWrap: "nowrap" } }),
                        new Container({
                            className: ["l-category-count"],
                            children: [new Text({ text: `${category.totalItems}` })]
                        })
                    ],
                    events: {
                        click: () => this._handleCategoryClick(category.id)
                    }
                })
            }
        })
    }

    _createScrollButton(direction) {
        const icon = direction === 'left' ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right';

        return new Container({
            className: ["l-scroll-button", direction],
            children: [
                new Icon({ icon: icon })
            ],
            events: {
                click: () => this._handleScroll(direction)
            }
        })
    }

    _createListingGrid() {
        return new FutureBuilder({
            future: (params) => HttpClient.instance.post("/properties", params.query),
            controller: this.futureBuilderController,
            params: {
                query: {
                    limit: this.state.limit,
                    offset: 0,
                    type_id: 2
                },
            },
            builder: ({ result }) => {
                const properties = result.properties.data;

                this.setState(prev => {
                    return {
                        totalItems: result.properties?.totalItems
                    }
                });

                return new Container({
                    className: ["l-property-grid"],
                    children: properties.map(property => this._createPropertyCard({ property }))
                })
            },
            onLoading: () => new Center({
                children: [
                    new Spinner()
                ]
            })
        })
    }

    _createPropertyCard({ property }) {
        const imgUrl = property?.galleries.filter(img => img.isMain == 1)?.url || property.galleries[0]?.url;

        return new Container({
            className: ["l-property-card"],
            events: {
                click: () => {
                    App.instance.to(`/imoveis/${property.slug}`)
                }
            },
            children: [
                new Container({
                    className: ["l-card-image-wrapper"],
                    children: [
                        new Image({
                            src: imgUrl,
                            className: ["l-card-image"],
                            alt: property.title
                        }),
                        new Container({
                            className: ["l-card-type-tag"],
                            children: [new Text({ text: property.finalities?.name })]
                        }),
                        Number(property.emphasis) && new Container({
                            className: ["l-featured-badge"],
                            children: [new Text({ text: "⭐ Destaque" })]
                        }),
                        new Container({
                            className: ["l-status-indicator"],
                            children: [
                                new Container({
                                    className: ["l-status-dot"]
                                }),
                                new Text({
                                    text: property.categories?.name,
                                    style: {
                                        color: '#10b981',
                                        fontSize: "0.8rem",
                                        fontWeight: "bold"
                                    }
                                })
                            ]
                        })
                    ]
                }),

                new Container({
                    className: ["l-card-details"],
                    children: [
                        new Text({
                            text: property.title,
                            className: ["l-card-title"]
                        }),
                        new Container({
                            className: ["l-card-location"],
                            children: [
                                new Icon({ icon: "fa-solid fa-location-dot", className: ["l-location-icon"] }),
                                new Text({ text: property.address, className: ["l-location-text"] })
                            ]
                        }),
                        new Container({
                            className: ["l-card-specs"],
                            children: [
                                this._createSpecItem("fa-solid fa-bed", `${property.room}`, "Quartos"),
                                this._createSpecItem("fa-solid fa-bath", `${property.bathroom}`, "Banhos"),
                                this._createSpecItem("fa-solid fa-ruler-combined", `${property.area}m²`, "Área"),
                            ]
                        }),
                        new Container({
                            className: ["l-card-footer"],
                            children: [
                                new Text({ text: Utils.simpleCurrencyFormat(property.price, property.currencies.code), className: ["l-card-price"] }),
                            ]
                        })
                    ]
                })
            ]
        })
    }

    _createSpecItem(icon, value, label) {
        return new Container({
            className: ["l-spec-item"],
            children: [
                new Container({
                    children: [
                        new Icon({ icon: icon, className: ["l-spec-icon"] }),
                        new Text({ text: value, className: ["l-spec-value"] })
                    ],
                    style: { display: "flex", alignItems: "center", gap: "8px" }
                }),
                new Text({
                    text: label,
                    className: ["l-spec-label"]
                })
            ]
        })
    }

    _handleCategoryClick(categoryId) {
        this.state.activeCategory = categoryId;
        this.queryData = { ...this.queryData, category_id: categoryId };

        this.futureBuilderController.setParams({
            query: {
                offset: 0,
                limit: 12,
                type_id: 2,
                ...this.queryData
            }
        })
    }

    _handleScroll(direction) {
        const scrollContainer = document.querySelector('.l-categories-scroll');
        if (scrollContainer) {
            const scrollAmount = 300;
            scrollContainer.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    _createPaginator() {
        return new Builder({
            watch: () => {
                const { totalItems, limit, currentPage } = this.state;
                if (totalItems <= limit) return new Container();
                return new Paginator({
                    currentPage,
                    totalItems,
                    itemsPerPage: limit,
                    visiblePages: 3,
                    onPageChange: (params) => {
                        this.state.currentPage = params.page;
                        this.state.offset = params.skip;

                        this.futureBuilderController.setParams({
                            query: { limit: params.limit, offset: params.skip, type_id: 2, ...this.queryData },
                        });
                    },
                });
            },
        });
    }

    render() {
        this.children = [this.createSection()]
        return super.render();
    }
}