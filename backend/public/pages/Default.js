import { App } from "../../src/core/App";
import { BaseWidget } from "../../src/core/BaseWidget";
import { Themes } from "../../src/themes/Themes";
import { Image } from "../../src/widgets/elements/Image";
import { Text } from "../../src/widgets/elements/Text";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import { NavBar } from "../../src/widgets/navigation/NavBar"
import { AuthService } from "../Services/AuthService";
import { SharedUtils } from "./SharedUtils";

import "../assets/styles/default.css";

export class Default extends BaseWidget {
    constructor() {
        super({
            className: ["default-component"]
        });
        this._initializeSession();
    }

    _initializeSession() {
        try {
            this.session = AuthService.isAuthenticated();
            if (!this.session) {
                App.instance.to('/auth');
                return;
            }
            this.loggedUser = AuthService.getCurrentUser()
        } catch (error) {
            console.error("Session initialization failed:", error);
            App.instance.to('/auth');
        }
    }

    createNavBar() {
        return new NavBar({
            fixed: true,
            theme: Themes.navbar.type.primary,
            brand: {
                logo: this._createBrand()
            },
            style: {
                width: "98%",
                margin: "auto",
                borderRadius: "5rem",
                marginTop: "1rem"
            },
            items: [
                this._createNavLink({ text: "Dashboard", to: "/" }),
                this._createNavLink({ text: "Propriedades", to: "/properties" }),
                /*this._createNavLink({ text: "Blogs", to: "/blogs" }),*/
                this._createNavLink({ text: "Visitas", to: "/activities/visits" }),
                this._createNavLink({ text: "Tarefas", to: "/activities/tasks" }),
                this._createNavLink({ text: "Configurações", to: "/configurations" }),
            ],
            actions: [
                new Row({
                    rowStyle: {
                        alignItems: "center"
                    },
                    children: [
                        this._renderAvatarBadgeCell(this.loggedUser?.name),
                        new Column({
                            gap: 0,
                            style: {
                                flex: "1"
                            },
                            children: [
                                new Text({
                                    text: this.loggedUser?.username,
                                    style: {
                                        color: "#fff",
                                        fontSize: "0.7rem"
                                    }
                                }),
                                new Text({
                                    text: this.loggedUser?.role,
                                    style: {
                                        color: "#fff",
                                        fontSize: "0.6rem"
                                    }
                                }),
                            ]
                        })
                    ]
                })
            ]
        })
    }

    _createBrand() {
        return new Container({
            style: {
                display: "flex",
                alignItems: "center",
                gap: "5px",
            },
            children: [
                new Image({
                    src: new URL("../assets/images/logo.png", import.meta.url),
                    rounded: true,
                    border: true,
                    style: {
                        width: "2rem"
                    }
                }),
                new Text({
                    text: "Casa Coimbra",
                    style: {
                        color: "#fff",
                        fontSize: "0.8rem"
                    }
                })
            ]
        })
    }

    _createNavLink({ text = "", to = "", dropdown = [] }) {
        return {
            text: text,
            style: {
                fontSize: "0.8rem"
            },
            onClick: () => {
                App.instance.to(to)
            }
        }
    }

    createHero() {
        return new Container({
            className: ["default-hero-style"]
        })
    }

    createPage() {
        return new Container({
            className: ["default-style"],
            children: [
                new Container({
                    style: {
                        padding: "1rem",
                        paddingTop: "calc(5rem + 20px)"
                    },
                    children: [
                        ...this.children
                    ]
                })
            ]
        })
    }

    _renderAvatarBadgeCell(name, small = true) {
        const n = name || 'Convidado';
        return SharedUtils.createAvatarBadge(n, {
            emptyName: 'Sem cliente',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
            size: small ? 'small' : 'medium',
            style: small ? {
                size: '24px',
                fontSize: '0.6rem'
            } : undefined
        });
    }

    render() {
        this.children = [
            this.createNavBar(),
            this.createPage()
        ]
        return super.render();
    }
}