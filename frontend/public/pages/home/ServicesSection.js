import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Image } from "../../../src/widgets/elements/Image";
import { Icon } from "../../../src/widgets/elements/Icon";

import "../../assets/styles/service-section.css"

export class ServicesSection extends BaseWidget {
    constructor() {
        super()
    }

    createSection() {
        return new Container({
            className: ["s-services-section-root"],
            children: [
                this._createHeader(),
                
                this._createFeatureRow({
                    image: "1.jpeg",
                    title: "Ser proprietário não precisa ser um pesadelo",
                    text: "Manutenção inesperada, inquilinos complicados e papelada infinita. A gestão própria consome seu tempo e paz de espírito. Nós assumimos essa carga para que você possa apenas desfrutar dos rendimentos.",
                    isReversed: false,
                    accent: "#ef4444"
                }),

                this._createFeatureRow({
                    image: "4.jpeg",
                    title: "Seu Parceiro no Sucesso",
                    text: "Mais do que gestores, somos parceiros. Com a Casa Coimbra, você tem uma equipe dedicada a garantir a valorização do seu ativo e a estabilidade dos seus contratos.",
                    isReversed: true,
                    accent: "#0f172a"
                }),

                this._createFeatureRow({
                    image: "2.jpeg",
                    title: "Encontramos o Cliente Ideal",
                    text: "Seja para vender ou arrendar, nossa rede de contatos e marketing estratégico garante que encontramos os compradores ou inquilinos certos, mais rápido.",
                    isReversed: false,
                    accent: "#cca43b"
                }),

                this._createFeatureRow({
                    image: "3.jpeg",
                    title: "Adeus às Dores de Cabeça!",
                    text: "Relatórios pontuais, rendas em dia e imóveis bem cuidados. A satisfação de ver o seu património gerido com profissionalismo e resultados visíveis.",
                    isReversed: true,
                    accent: "#10b981"
                }),
            ]
        })
    }

    _createHeader() {
        return new Container({
            className: ["s-section-header"],
            children: [
                new Text({
                    text: "NOSSA ABORDAGEM",
                    className: ["s-header-subtitle"]
                }),
                new Text({
                    text: "Do Caos à Tranquilidade",
                    className: ["s-header-title"]
                })
            ]
        })
    }

    _createFeatureRow({ image, title, text, isReversed, accent }) {
        const imgUrl = new URL(`../../assets/images/${image}`, import.meta.url);
        const rowClass = isReversed ? ["s-feature-row", "s-reversed-row"] : ["s-feature-row", "s-standard-row"];

        const textContent = new Container({
            className: ["s-feature-text-content"],
            children: [
                new Container({
                    className: ["s-feature-accent-line"],
                    style: { background: accent }
                }),
                new Text({
                    text: title,
                    className: ["s-feature-title"]
                }),
                new Text({
                    text: text,
                    className: ["s-feature-description"]
                })
            ]
        });

        const imageContent = new Container({
            className: ["s-feature-image-content"],
            children: [
                new Image({
                    src: imgUrl,
                    className: ["s-feature-image"]
                })
            ]
        });

        return new Container({
            className: rowClass,
            children: [imageContent, textContent]
        })
    }

    _createServicesGrid() {
        return new Container({
            className: ["s-services-grid"],
            children: [
                this._createServiceCard("Gestão Financeira", "fa fa-chart-pie"),
                this._createServiceCard("Manutenção", "fa fa-tools"),
                this._createServiceCard("Jurídico", "fa fa-gavel"),
                this._createServiceCard("Marketing", "fa fa-bullhorn")
            ]
        })
    }

    _createServiceCard(title, icon) {
        return new Container({
            className: ["s-service-card"],
            children: [
                new Icon({
                    icon: icon,
                    className: ["s-service-icon"]
                }),
                new Text({
                    text: title,
                    className: ["s-service-title"]
                })
            ]
        })
    }

    _createCTA() {
        return new Container({
            className: ["s-cta-container"],
            children: [
                new Text({
                    text: "Valorize o seu Património",
                    className: ["s-cta-title"]
                }),
                new Text({
                    text: "Agende uma conversa gratuita com nossos especialistas.",
                    className: ["s-cta-subtitle"]
                }),
                new Container({
                    className: ["s-cta-button"],
                    children: [new Text({ text: "Agendar Agora" })]
                })
            ]
        })
    }

    render() {
        this.children = [this.createSection()]
        return super.render();
    }
}