import { BaseWidget } from "../../src/core/BaseWidget";
import { Container } from "../../src/widgets/layouts/Container";
import { Text } from "../../src/widgets/elements/Text";
import { Icon } from "../../src/widgets/elements/Icon";

import "../assets/styles/footer.css";
import { App } from "../../src/core/App";

export class Footer extends BaseWidget {
    constructor() {
        super();
    }

    createSection() {
        return new Container({
            className: ["f-footer-root"],
            children: [
                new Container({
                    className: ["f-footer-content-container"],
                    children: [
                        this._createLogoAndCopyright(),
                        this._createSupportSection(),
                        this._createNavigationSection(),
                        this._createContactSection(),
                        new Text({
                            text: "2025© Casa Coimbra Maputo",
                            className: ["f-footer-copyright"]
                        }),
                    ]
                }),
                this._createBottomBar()
            ]
        });
    }

    _createLogoAndCopyright() {
        return new Container({
            className: ["f-footer-brand-section"],
            children: [
                new Text({
                    text: "Casa Coimbra Maputo",
                    className: ["f-footer-brand-name"]
                }),
                new Container({
                    className: ["f-footer-social-links"],
                    children: [
                        this._createSocialIcon("fa-brands fa-facebook-f"),
                        this._createSocialIcon("fa-brands fa-instagram"),
                        this._createSocialIcon("fa-brands fa-linkedin"),
                        this._createSocialIcon("fa-brands fa-whatsapp"),
                    ]
                }),
            ]
        });
    }

    _createSocialIcon(iconClass) {
        return new Icon({
            icon: iconClass,
            className: ["f-social-icon"]
        });
    }

    _createSupportSection() {
        return new Container({
            className: ["f-footer-column"],
            children: [
                new Text({
                    text: "Apoio",
                    className: ["f-footer-column-title"]
                }),
                this._createLink("Centro de Apoio", () => App.instance.to("/centro-de-apoio") ),
            ]
        });
    }

    _createNavigationSection() {
        return new Container({
            className: ["f-footer-column"],
            children: [
                new Text({
                    text: "Links Rápidos",
                    className: ["f-footer-column-title"]
                }),
                this._createLink("Página príncipal", () => App.instance.to("/")),
            ]
        });
    }

    _createLink(label, onPressed = null) {
        return new Container({
            className: ["f-footer-link"],
            events: {
                click: () => onPressed?.(),
            },
            children: [
                new Text({
                    text: label,
                    className: ["f-footer-link-text"]
                })
            ]
        });
    }

    _createContactSection() {
        return new Container({
            className: ["f-footer-column", "f-contact-column"],
            children: [
                new Text({
                    text: "Contacto",
                    className: ["f-footer-column-title"]
                }),
                this._createContactItem("fa fa-phone", "+258 84 016 9593"),
                this._createContactItem("fa fa-envelope", "casacoimbramaputo@gmail.com"),
                this._createContactItem("fa fa-map-marker-alt", "Rua da Massala, 312 Inova Space, Maputo, Moçambique"),
            ]
        });
    }

    _createContactItem(iconClass, text) {
        return new Container({
            className: ["f-footer-contact-item"],
            children: [
                new Icon({
                    icon: iconClass,
                    className: ["f-footer-contact-icon"]
                }),
                new Text({
                    text: text,
                    className: ["f-footer-contact-text"]
                })
            ]
        });
    }

    _createBottomBar() {
        return new Container({
            className: ["f-footer-bottom-bar"],
        });
    }

    render() {
        this.children = [this.createSection()];
        return super.render();
    }
}