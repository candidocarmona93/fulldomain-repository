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

import "../../assets/styles/investiment-listing-page.css";

export class Index extends BaseWidget {
    constructor() {
        super();

        this.futureBuilderController = new FutureBuilderController();
        this.queryData = {};

        this.initState({
            activeCategory: 0,
            offset: 0,
            limit: 5,
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
                    text: "DIÁRIO IMOBILIÁRIO",
                    className: ["l-header-subtitle"]
                }),
                new Text({
                    text: "Oportunidade unica de investimento imobiliário só aqui",
                    className: ["l-header-title"]
                }),
                new Text({
                    text: "Uma curadoria exclusiva das melhores oportunidades em Maputo.",
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
                            future: () => HttpClient.instance.get("/categories?type_id=1"),
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
                    type_id: 1
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
                    className: ["l-investiment-feed"],
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
            className: ["l-investiment-card"],
            events: {
                click: () => {
                    App.instance.to(`/imoveis/${property.slug}`)
                }
            },
            children: [
                // 1. Big Image Section
                new Container({
                    className: ["l-investiment-image-wrapper"],
                    children: [
                        new Image({
                            src: imgUrl,
                            className: ["l-investiment-image"],
                            alt: property.title
                        }),
                        // Overlay Badges
                        new Container({
                            className: ["l-investiment-badges"],
                            children: [
                                new Container({
                                    className: ["l-badge", "primary"],
                                    children: [new Text({ text: property.finalities?.name })]
                                }),
                                Number(property.emphasis) ? new Container({
                                    className: ["l-badge", "emphasis"],
                                    children: [new Icon({icon: "fa-solid fa-star"}), new Text({ text: "Destaque" })]
                                }) : null
                            ].filter(Boolean)
                        })
                    ]
                }),

                // 2. Content Section
                new Container({
                    className: ["l-investiment-content"],
                    children: [
                        // Meta Header (Category | Location)
                        new Container({
                            className: ["l-investiment-meta"],
                            children: [
                                new Text({ text: property.categories?.name, className: ["l-meta-category"] }),
                                new Container({ className: ["l-meta-dot"] }),
                                new Icon({ icon: "fa-solid fa-location-dot", className: ["l-meta-icon"] }),
                                new Text({ text: property.address, className: ["l-meta-text"] })
                            ]
                        }),

                        // Big Title
                        new Text({
                            text: property.title,
                            className: ["l-investiment-title"]
                        }),

                        // Specs Row
                        new Container({
                            className: ["l-investiment-specs"],
                            children: [
                                this._createSpecItem("fa-solid fa-bed", `${property.room} Quartos`),
                                this._createSpecItem("fa-solid fa-bath", `${property.bathroom} Banheiros`),
                                this._createSpecItem("fa-solid fa-ruler-combined", `${property.area}m²`),
                            ]
                        }),

                        new Container({ className: ["l-divider"] }),

                        // Footer (Price & CTA)
                        new Container({
                            className: ["l-investiment-footer"],
                            children: [
                                new Container({
                                    children: [
                                        new Text({ text: "Valor do Investimento", className: ["l-price-label"] }),
                                        new Text({ text: Utils.simpleCurrencyFormat(property.price, property.currencies.code), className: ["l-investiment-price"] }),
                                    ]
                                }),
                                new Container({
                                    className: ["l-read-more-btn"],
                                    children: [
                                        new Text({ text: "Ver Detalhes" }),
                                        new Icon({ icon: "fa-solid fa-arrow-right" })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    _createSpecItem(icon, label) {
        return new Container({
            className: ["l-investiment-spec-item"],
            children: [
                new Icon({ icon: icon, className: ["l-investiment-spec-icon"] }),
                new Text({ text: label, className: ["l-investiment-spec-text"] })
            ]
        })
    }

    _handleCategoryClick(categoryId) {
        this.state.activeCategory = categoryId;
        this.queryData = { ...this.queryData, category_id: categoryId };

        this.futureBuilderController.setParams({
            query: {
                offset: 0,
                limit: this.state.limit,
                type_id: 1,
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
                            query: { limit: params.limit, offset: params.skip, type_id: 1, ...this.queryData },
                        });
                        
                        // Scroll to top on page change
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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