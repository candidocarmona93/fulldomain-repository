import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Button } from "../../../src/widgets/buttons/Button";
import { TextInput } from "../../../src/widgets/forms/TextInput";
import { TextAreaInput } from "../../../src/widgets/forms/TextAreaInput";

import "../../assets/styles/contact-page.css";
import { OutlinedButton } from "../../../src/widgets/buttons/OutlinedButton";
import { GoogleMapService } from "../../services/GoogleMapService";

export class Index extends BaseWidget {
    constructor() {
        super()
    }

    createSection() {
        return new Container({
            className: ["c-contact-page-root"],
            children: [
                this._createHeader(),
                this._createContactFormSection(),
                this._createMapSection(),
            ]
        })
    }

    _createHeader() {
        return new Container({
            className: ["c-section-header"],
            children: [
                new Text({
                    text: "FALE CONOSCO",
                    className: ["c-header-subtitle"]
                }),
                new Text({
                    text: "Vamos Começar a Conversar",
                    className: ["c-header-title"]
                }),
                new Text({
                    text: "Tem alguma dúvida, precisa de um orçamento, ou quer agendar uma consultoria? Preencha o formulário abaixo ou use nossos contactos.",
                    className: ["c-header-description"]
                })
            ]
        })
    }

    _createContactFormSection() {
        return new Container({
            className: ["c-contact-form-section"],
            children: [
                this._createForm(),
                this._createContactInfo()
            ]
        })
    }

    _createForm() {
        return new Container({
            className: ["c-contact-form"],
            children: [
                new TextInput({
                    placeholder: "Seu Nome Completo",
                    className: ["c-form-input", "c-form-name"]
                }),
                new TextInput({
                    placeholder: "Seu Email",
                    className: ["c-form-input", "c-form-email"]
                }),
                new TextInput({
                    placeholder: "Seu Contacto Telefónico",
                    className: ["c-form-input", "c-form-phone"]
                }),
                new TextAreaInput({
                    placeholder: "Como podemos ajudar? (Descrição da necessidade)",
                    className: ["c-form-textarea"],
                    rows: 5
                }),
                new OutlinedButton({
                    label: "Enviar Mensagem",
                    className: ["c-form-submit-button", "c-form-submit-standard-button"]
                })
            ]
        })
    }

    _createContactInfo() {
        return new Container({
            className: ["c-contact-info-block"],
            children: [
                this._createDetailItem("fa fa-phone", "Ligue-nos", "+258 84 549 8519 | +258 84 208 3827"),
                this._createDetailItem("fa fa-envelope", "Envie um Email", "casacoimbramaputo@gmail.com"),
                this._createDetailItem("fa fa-map-marker-alt", "Encontre-nos", "Rua da Massala, 312 Inova Space, Maputo, Moçambique")
            ]
        })
    }

    _createDetailItem(icon, title, value) {
        return new Container({
            className: ["c-detail-item"],
            children: [
                new Icon({
                    icon: icon,
                    className: ["c-detail-icon"]
                }),
                new Container({
                    className: ["c-detail-text-content"],
                    children: [
                        new Text({
                            text: title,
                            className: ["c-detail-title"]
                        }),
                        new Text({
                            text: value,
                            className: ["c-detail-value"]
                        })
                    ]
                })
            ]
        })
    }

    _createMapSection() {
        return new Container({
            className: ["c-map-section"],
            children: [
                new Text({
                    text: "Onde Estamos Localizados",
                    className: ["c-map-title"]
                }),
                // Placeholder for an actual map embed/iframe/image
                new Container({
                    className: ["c-map-placeholder"],
                    style: {
                        backgroundColor: "#f0f0f0",
                        height: "400px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #ccc"
                    },
                    onAttached: async (el) => {
                        const googleMapService = new GoogleMapService();
                        const { map } = await googleMapService.initMap(el);
                        map.setZoom(18);
                    }
                })
            ]
        })
    }

    render() {
        this.children = [this.createSection()]
        return super.render();
    }
}