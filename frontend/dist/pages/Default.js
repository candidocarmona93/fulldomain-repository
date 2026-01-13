import { BaseWidget } from "../../src/core/BaseWidget";
import { Image } from "../../src/widgets/elements/Image";
import { SearchInput } from "../../src/widgets/forms/SearchInput";
import { Icon } from "../../src/widgets/elements/Icon";
import { OutlinedButton } from "../../src/widgets/buttons/OutlinedButton";
import { Column } from "../../src/widgets/layouts/Column";
import { Card } from "../../src/widgets/layouts/Card";
import { Container } from "../../src/widgets/layouts/Container";
import { Footer } from "./Footer";
import { App } from "../../src/core/App";
import { Position } from "../../src/themes/Position";
import { BottomSheet } from "../../src/widgets/overlays/BottomSheet";
import { Chat } from "./components/Chat";
import { HttpClient } from "../services/HttpClient";
import { Debouncer } from "../services/Debouncer";
import { Builder } from "../../src/widgets/builders/Builder";
import { Row } from "../../src/widgets/layouts/Row";
import { Text } from "../../src/widgets/elements/Text";
import { Spinner } from "../../src/widgets/feedback/Spinner";
import { Center } from "../../src/widgets/layouts/Center";
import { Utils } from "../services/Utils";

import "../assets/styles/default.css";

export class Default extends BaseWidget {
    constructor() {
        super({
            className: ["d-default-widget-root"]
        });

        this.currentQuery = "";
        this.performSearch = new Debouncer(350).debounce(async (query) => {
            this.currentQuery = query;

            if (!query?.trim()) {
                this.setState({
                    searchResults: [],
                    noResults: false,
                    searchQuery: ""
                });
                return;
            }

            try {
                this.setState({
                    isLoading: true,
                    searchError: null,
                    searchQuery: query
                });

                const { result } = await HttpClient.instance.post("/properties", {
                    searchKeyword: query,
                    limit: 15,
                });

                const results = result?.properties || [];
                const totalResults = results?.data.length || 0;

                this.setState({
                    searchResults: results?.data,
                    noResults: totalResults === 0,
                    totalResults,
                });

            } catch (err) {
                console.error("Search failed:", err);
                this.setState({
                    searchResults: [],
                    searchError: "Erro ao buscar resultados. Tente novamente.",
                    noResults: true
                });
            } finally {
                this.setState({ isLoading: false });
            }
        });

        this.activeMenu = "";

        this.initState({
            isLoading: false,
            searchResults: [],
            searchQuery: "",
            noResults: false,
            searchError: null,
            totalResults: 0
        });
    }

    createPage() {
        return new Container({
            className: ["d-header-container"],
            children: [
                this._createBrandSection(),
                new Container({
                    className: ["d-header-content-right"],
                    children: [
                        this._createNavigationSection(),
                        this._createSearchSection(),
                    ]
                }),
            ]
        });
    }

    _createBrandSection() {
        return new Container({
            className: ["d-brand-section"],
            events: {
                click: () => {
                    App.instance.to("/");
                    localStorage.removeItem("activeMenu");
                }
            },
            children: [
                new Image({
                    src: new URL("../assets/images/logo.png", import.meta.url),
                    className: ["d-brand-logo"],
                    alt: "Logotipo"
                })
            ]
        });
    }

    _createSearchSection() {
        return new Container({
            className: ["d-search-section"],
            children: [
                new SearchInput({
                    placeholder: "Pesquisar imóveis...",
                    className: ["d-search-input"],
                    events: {
                        focus: (e) => {
                            e.preventDefault();
                            this._showSearchSheet();
                        }
                    }
                }),
                new Icon({
                    icon: "fa fa-search",
                    className: ["d-search-icon"]
                })
            ]
        });
    }

    _showSearchSheet() {
        this.searchBottomSheet = new BottomSheet({
            className: ["d-search-bottom-sheet"],
            content: [
                new Container({
                    className: ["d-search-sheet-header"],
                    children: [
                        new SearchInput({
                            label: "Pesquisar imóveis...",
                            className: ["d-search-sheet-input"],
                            value: this.currentQuery,
                            onChange: (val) => {
                                this.performSearch(val);
                            },
                            onAttached: (el) => {
                                setTimeout(() => el.focus(), 100);
                            },
                            rightIcon: new Icon({
                                icon: "fa fa-search",
                                className: ["d-search-sheet-icon"]
                            })
                        }),
                    ]
                }),
                new Builder({
                    watch: () => {
                        const { searchResults, isLoading, noResults, searchError, searchQuery } = this.state;

                        // Show empty state
                        if (!searchQuery?.trim()) {
                            return new Center({
                                className: ["d-empty-state"],
                                children: [
                                    new Icon({
                                        icon: "fa fa-search",
                                        className: ["d-empty-state-icon"]
                                    }),
                                    new Text({
                                        text: "Pesquise por imóveis",
                                        className: ["d-empty-state-title"]
                                    }),
                                    new Text({
                                        text: "Digite palavras-chave como localização, tipo de imóvel, etc.",
                                        className: ["d-empty-state-subtitle"]
                                    })
                                ]
                            });
                        }

                        // Show loading state
                        if (isLoading) {
                            return new Center({
                                className: ["d-loading-state"],
                                children: [
                                    new Spinner({
                                        size: 70,
                                        className: ["d-search-spinner"]
                                    }),
                                    new Text({
                                        text: "Pesquisando imóveis...",
                                        className: ["d-loading-text"]
                                    })
                                ]
                            });
                        }

                        // Show error state
                        if (searchError) {
                            return new Center({
                                className: ["d-error-state"],
                                children: [
                                    new Icon({
                                        icon: "fa fa-exclamation-circle",
                                        className: ["d-error-icon"]
                                    }),
                                    new Text({
                                        text: searchError,
                                        className: ["d-error-text"]
                                    }),
                                    new OutlinedButton({
                                        label: "Tentar novamente",
                                        onPressed: () => this.performSearch(this.currentQuery),
                                        className: ["d-retry-button"]
                                    })
                                ]
                            });
                        }

                        // Show no results state
                        if (noResults && searchQuery.trim()) {
                            return new Center({
                                className: ["d-no-results-state"],
                                children: [
                                    new Icon({
                                        icon: "fa fa-home",
                                        className: ["d-no-results-icon"]
                                    }),
                                    new Text({
                                        text: "Nenhum imóvel encontrado",
                                        className: ["d-no-results-title"]
                                    }),
                                    new Text({
                                        text: `Não encontramos resultados para "${searchQuery}". Tente outros termos.`,
                                        className: ["d-no-results-subtitle"]
                                    })
                                ]
                            });
                        }

                        // Show results
                        return new Container({
                            className: ["d-search-results-container"],
                            children: [
                                new Column({
                                    className: ["d-search-results-list"],
                                    children: searchResults.map((property, index) => {
                                        const mainImage = property.galleries?.find(img => Number(img.isMain)) || property.galleries?.[0];

                                        return new Card({
                                            className: ["d-search-result-card"],
                                            bodyStyle: {
                                                padding: "0 .5rem"
                                            },
                                            events: {
                                                click: (e) => {
                                                    App.instance.to(`/imoveis/${property.slug}`);
                                                    this.searchBottomSheet?.close();
                                                }
                                            },
                                            body: new Row({
                                                className: ["d-search-result-content"],
                                                children: [
                                                    new Container({
                                                        className: ["d-search-result-image-container"],
                                                        children: [
                                                            new Image({
                                                                src: mainImage?.url,
                                                                className: ["d-search-result-image"],
                                                                alt: property.title || "Imóvel"
                                                            })
                                                        ]
                                                    }),
                                                    new Column({
                                                        gap: 0,
                                                        className: ["d-search-result-details"],
                                                        children: [
                                                            new Text({
                                                                text: property.title || "Sem título",
                                                                className: ["d-search-result-title"]
                                                            }),
                                                            new Row({
                                                                className: ["d-search-result-features"],
                                                                children: [
                                                                    property.categories && new Text({
                                                                        text: property.categories?.name || "N/A",
                                                                        className: ["d-property-type-badge"]
                                                                    }),
                                                                ].filter(Boolean)
                                                            }),
                                                            new Text({
                                                                text: property.address || "Endereço não disponível",
                                                                className: ["d-search-result-address"]
                                                            }),
                                                            property.price && new Text({
                                                                text: Utils.simpleCurrencyFormat(property.price, property.currencies.code),
                                                                className: ["d-search-result-price"]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        });
                                    })
                                })
                            ]
                        });
                    }
                })
            ]
        });

        this.searchBottomSheet?.show();
    }

    _createNavigationSection() {
        return new Container({
            className: ["d-navigation-section"],
            children: [
                this._createNavigationLink({
                    label: "Imóveis",
                    icon: "fa fa-home",
                    key: "properties",
                    onPressed: () => {
                        App.instance.to("/imoveis");
                        localStorage.setItem("activeMenu", "properties");
                    }
                }),
                this._createNavigationLink({
                    label: "Investimentos",
                    icon: "fa fa-chart-line",
                    key: "investiments",
                    onPressed: () => {
                        App.instance.to("/investimentos");
                        localStorage.setItem("activeMenu", "investiments");
                    }
                }),
                this._createNavigationLink({
                    label: "Contacto",
                    icon: "fa fa-phone",
                    key: "contact-us",
                    onPressed: () => {
                        App.instance.to("/contacte-nos");
                        localStorage.setItem("activeMenu", "contact-us");
                    }
                }),
            ]
        });
    }

    _createNavigationLink({ label = "", icon = "", key = "", onPressed = null }) {
        return new OutlinedButton({
            label,
            onPressed,
            prefixIcon: new Icon({ icon: icon}),
            className: ["d-nav-link-button", localStorage.getItem("activeMenu") == key ? "active" : null].filter(Boolean)
        });
    }

    render() {
        this.children = [
            this.createPage(),
            ...this.children,
            new Footer(),
            new Container({
                position: Position.fixed.bottomRight,
                className: ["d-chat-container"],
                children: [
                    new Column({
                        children: [
                            new Chat(),
                        ]
                    })
                ]
            })
        ];
        return super.render();
    }
}