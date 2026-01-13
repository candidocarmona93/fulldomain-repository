import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Image } from "../../../src/widgets/elements/Image";
import { ServicesSection } from "./ServicesSection";
import { PricingSection } from "./PricingSection";
import { Icon } from "../../../src/widgets/elements/Icon";
import { OutlinedButton } from "../../../src/widgets/buttons/OutlinedButton";

import "../../assets/styles/index.css"
import { App } from "../../../src/core/App";

export class Index extends BaseWidget {
    constructor() {
        super()
    }

    createPage() {
        return new Container({
            className: ["i-hero-page-container"],
            children: [
                this._createDecorativeGlow(),
                this._createHeroText(),
                this._createHeroBanner(),
            ]
        })
    }

    _createHeroText() {
        return new Container({
            className: ["i-hero-text-section"],
            children: [
                new Container({
                    className: ["i-hero-subtitle-wrapper"],
                    children: [
                        new Text({
                            text: "CASA COIMBRA",
                            className: ["i-hero-subtitle"]
                        })
                    ]
                }),
                new Text({
                    text: "Excelência em Gestão Patrimonial",
                    className: ["i-hero-title"]
                }),
                new Text({
                    text: "Maximizamos o valor do seu património imobiliário através de estratégias de investimento inteligentes e uma gestão rigorosa e transparente.",
                    className: ["i-hero-description"]
                }),
                this._createPrimaryButton("Consultar Especialista")
            ]
        })
    }

    _createPrimaryButton(label) {
        return new OutlinedButton({
            className: ["i-button", "i-standard-button"],
            label,
            onPressed: () => App.instance.to("/contacte-nos")
        })
    }

    _createHeroBanner() {
        return new Container({
            className: ["i-hero-banner-section"],
            children: [
                new Image({
                    src: new URL("../../assets/images/banner.jpg", import.meta.url),
                    className: ["i-hero-banner-image"]
                }),
                this._createFloatingStats()
            ]
        })
    }

    _createFloatingStats() {
        return new Container({
            className: ["i-floating-stats-container"],
            children: [
                this._createStatItem("500+", "Imóveis Geridos"),
                this._createStatItem("25", "Anos de Mercado")
            ]
        })
    }

    _createStatItem(value, label) {
        return new Container({
            className: ["i-stat-item"],
            children: [
                new Text({
                    text: value,
                    className: ["i-stat-value"]
                }),
                new Text({
                    text: label,
                    className: ["i-stat-label"]
                })
            ]
        })
    }

    _createDecorativeGlow() {
        return new Container({
            className: ["i-decorative-glow"]
        })
    }
    
    _createCTASection() {
        return new Container({
            className: ["i-cta-section-root"],
            children: [
                new Text({
                    text: "Adira ao Modelo 3",
                    className: ["i-cta-main-title"]
                }),

                new Container({
                    className: ["i-cta-subsection"],
                    children: [
                        new Text({
                            text: "Como funciona?",
                            className: ["i-cta-subtitle"]
                        }),
                        this._createProcessList([
                            "Cobramos as rendas",
                            "Fazemos contratos e acompanhamento do imóvel",
                            "Resolvemos problemas do dia-a-dia"
                        ], "process")
                    ]
                }),

                // 2. Vantagens.
                new Container({
                    className: ["i-cta-subsection"],
                    children: [
                        new Text({
                            text: "Vantagens.",
                            className: ["i-cta-subtitle"]
                        }),
                        this._createProcessList([
                            "Imóvel sempre bem cuidado",
                            "Renda pontual",
                            "Zero dores de cabeça"
                        ], "advantage")
                    ]
                }),

                // 3. Contact Info
                new Container({
                    className: ["i-cta-contact-block"],
                    children: [
                        new Text({
                            text: "Ainda tem dúvida? Quer conversar e saber mais?",
                            className: ["i-contact-prompt"]
                        }),
                        new Container({
                            className: ["i-contact-people-list"],
                            children: [
                                this._createContactItem("Hermínio Wiliamo", "+258 84 549 8519"),
                                this._createContactItem("Cleuzia Muthisse", "+258 84 208 3827")
                            ]
                        })
                    ]
                })
            ]
        });
    }

    _createProcessList(items, type) {
        return new Container({
            className: ["i-process-list", `i-${type}-list`],
            children: items.map(item => new Container({
                className: ["i-list-item"],
                children: [
                    new Icon({
                        icon: type === "advantage" ? "fa fa-check-circle" : "fa fa-arrow-right",
                        className: ["i-list-icon", `i-${type}-icon`]
                    }),
                    new Text({
                        text: item,
                        className: ["i-list-text"]
                    })
                ]
            }))
        })
    }

    _createContactItem(name, phone) {
        return new Container({
            className: ["i-contact-item"],
            events: {
                click: () => {
                    window.location.href = `tel:${phone}`
                }
            },
            children: [
                new Icon({
                    icon: "fa fa-phone",
                    className: ["i-contact-icon"]
                }),
                new Text({
                    text: name,
                    className: ["i-contact-name"]
                }),
                new Text({
                    text: phone,
                    className: ["i-contact-phone"]
                })
            ]
        })
    }

    render() {
        this.children = [this.createPage(), new ServicesSection(), new PricingSection(), this._createCTASection()]
        return super.render();
    }
}