import { BaseWidget } from "../../src/core/BaseWidget";
import { Builder } from "../../src/widgets/builders/Builder";
import { FutureBuilder } from "../../src/widgets/builders/FutureBuilder";
import { FutureBuilderController } from "../../src/widgets/builders/FutureBuilderController";
import { IconButton } from "../../src/widgets/buttons/IconButton";
import { Icon } from "../../src/widgets/elements/Icon";
import { Text } from "../../src/widgets/elements/Text";
import { SearchInput } from "../../src/widgets/forms/SearchInput";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import { OffCanvas } from "../../src/widgets/overlays/OffCanvas";
import { HttpClient } from "../Services/HttpClient";
import { Debouncer } from "../Utils/Debouncer";
import { UIHelper } from "../Utils/UIHelper";
import { HeaderTitleComponent } from "./HeaderTitleComponent";

const STYLES = {
    container: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        transition: "all 0.2s ease",
        padding: "0.5rem"
    },
    headerRow: {
        alignItems: "center",
        padding: "0.75rem 1rem",
        backgroundColor: "#f9f9f9",
        borderBottom: "1px solid #eee",
    },
    title: {
        fontSize: "1.1rem",
        fontWeight: "600",
        color: "#2c3e50",
        flex: 1,
    },
    searchButton: {
        padding: "0.65rem",
        borderRadius: "50%",
        backgroundColor: "transparent",
        transition: "background-color 0.2s ease",
    },
    icon: { fontSize: "1.1rem", color: "#666" },
    content: {
        padding: "1.5rem 1rem",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    placeholder: {
        color: "#888",
        fontSize: "0.95rem",
        textAlign: "center",
        fontStyle: "italic",
    },
};

export class SearchComponent extends BaseWidget {
    constructor({
        title = "Pesquisar",
        placeholder = "Pesquisar...",
        endpoint = null,
        dataMapper = (response) => response?.data || [],
        itemBuilder = (item) => new Text({ text: item.name || "Item" }),
        onItemSelected = null,
        onInit = null,
    } = {}) {
        super({ style: { width: "100%", marginBottom: "1rem" } });

        this.title = title;
        this.placeholder = placeholder;
        this.endpoint = endpoint;
        this.dataMapper = dataMapper;
        this.itemBuilder = itemBuilder;
        this.onItemSelected = onItemSelected;
        this.onInit = onInit;

        this.controller = new FutureBuilderController();
        this.debouncer = new Debouncer(300);

        this.limit = 50

        this.performSearch = new Debouncer(300).debounce(async (search) => {
            this.controller.setParams({
                query: {
                    searchKeyword: search,
                    limit: this.limit
                }
            });
        });

        this.initState({
            selectedItem: null,
        })
    }

    createHeader() {
        return new Row({
            rowContainerStyle: { width: "100%", marginBottom: "0.5rem" },
            rowStyle: STYLES.headerRow,
            children: [
                new Text({ text: this.title, style: STYLES.title }),
                new IconButton({
                    icon: new Icon({ icon: "fa fa-search", style: STYLES.icon }),
                    style: STYLES.searchButton,
                    ariaLabel: "Abrir busca",
                    onPressed: () => this.openSearchOffCanvas(),
                }),
            ],
        });
    }

    createPlaceholder() {
        return new Container({
            style: STYLES.content,
            children: [
                new Text({
                    text: "Toque no ícone de pesquisa para selecionar",
                    style: STYLES.placeholder,
                }),
            ],
        });
    }

    openSearchOffCanvas() {
        if (!this.endpoint) {
            console.warn("SearchComponent: endpoint not provided");
            return;
        }

        this.offCanvas = new OffCanvas({
            content: [
                new Column({
                    style: { height: "100%", padding: "1rem", overflowY: "auto" },
                    children: [
                        new HeaderTitleComponent({ text: this.title }),

                        new SearchInput({
                            label: this.placeholder,
                            debounce: 400,
                            onChange: (value) => {
                                this.performSearch(value)
                            },
                        }),

                        new FutureBuilder({
                            future: (params) => HttpClient.instance.get(`${this.endpoint}?${new URLSearchParams(params.query)}`),
                            params: {
                                query: {
                                    searchKeyword: "",
                                    limit: this.limit
                                }
                            },
                            controller: this.controller,
                            builder: ({ result, status }) => {
                                if (status !== 200) {
                                    return new Text({ text: "Erro ao carregar dados", style: { color: "red", textAlign: "center" } });
                                }

                                const items = this.dataMapper(result);

                                if (!Array.isArray(items) || items.length === 0) {
                                    return new Text({ text: "Nenhum resultado encontrado", style: { color: "#888", padding: "2rem" } });
                                }

                                return new Column({
                                    children: items.map((item) => {
                                        const childWidget = this.itemBuilder(item);
                                        return new Container({
                                            style: {
                                                width: "100%"
                                            },
                                            children: [childWidget],
                                            events: {
                                                click: () => {
                                                    this.onItemSelected?.(item);
                                                    this.setState(() => {
                                                        return {
                                                            selectedItem: item
                                                        }
                                                    });

                                                    this.offCanvas?.close();
                                                }
                                            },
                                        });
                                    }),
                                });
                            },
                            onLoading: () => UIHelper.createLoadingSpinner(),
                        }),
                    ],
                }),
            ],
        });

        this.offCanvas.show();
    }

    create() {
        const item = this.onInit?.();
        console.log(item)
        if (item) {
            this.setState(() => {
                return {
                    selectedItem: item
                }
            })
        }

        return new Container({
            style: STYLES.container,
            children: [
                this.createHeader(),
                new Builder({
                    watch: () => {
                        const selectedItem = this.state.selectedItem;
                        if (!selectedItem) return this.createPlaceholder();

                        return this.itemBuilder(selectedItem);
                    }
                })
            ],
        });
    }

    render() {
        this.children = [this.create()];
        return super.render();
    }
}