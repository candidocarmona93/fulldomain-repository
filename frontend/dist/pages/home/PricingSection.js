import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Button } from "../../../src/widgets/buttons/Button";

import "../../assets/styles/pricing-section.css"
import { Card } from "../../../src/widgets/layouts/Card";

export class PricingSection extends BaseWidget {
    constructor() {
        super()
    }

    createSection() {
        return new Container({
            className: ["p-pricing-section-root"],
            children: [
                this._createPricingHeader(),
                this._createPricingCards()
            ]
        });
    }

    _createPricingHeader() {
        return new Container({
            className: ["p-pricing-header"],
            children: [
                new Text({
                    text: "ESCOLHA O SEU PLANO IDEAL",
                    className: ["p-header-subtitle"]
                }),
                new Text({
                    text: "Cuide do que é seu, no seu próprio ritmo.",
                    className: ["p-header-title"]
                })
            ]
        });
    }

    _createPricingCards() {
        const plans = [
            {
                name: "ESSENCIAL",
                commission: "8%",
                price: "12.000,00 MZN",
                tagline: "Para proprietários experientes",
                features: ["Cobrança de mensal", "Relatórios simples", "Acompanhamento presencial"],
                isFeatured: false
            },
            {
                name: "PROFISSIONAL",
                commission: "10%",
                price: "18.000,00 MZN",
                tagline: "Para quem não quer preocupações",
                features: ["Atendimento aos inquilinos", "Apoio em contratos", "Gestão básica de manutenção"],
                isFeatured: true
            },
            {
                name: "PREMIUM",
                commission: "12-15%",
                price: "20.000,00 à 25.000,00 MZN",
                tagline: "Para valorização do seu imóvel",
                features: ["Inspeções periódicas", "Acompanhamento jurídica", "Supervisão de obras/manutenção", "Relatórios financeiros detalhados"],
                isFeatured: false
            }
        ];

        return new Container({
            className: ["p-pricing-cards-grid"],
            children: plans.map(plan => this._createPricingCard(plan))
        });
    }

    _createPricingCard({ name, commission, price, tagline, features, isFeatured }) {
        const cardClass = isFeatured ? ["p-pricing-card", "p-featured-card"] : ["p-pricing-card", "p-standard-card"];
        const titleClass = isFeatured ? ["p-card-title", "p-featured-title"] : ["p-card-title", "p-standard-title"];
        const bodyClass = isFeatured ? ["p-card-body-text", "p-featured-body"] : ["p-card-body-text", "p-standard-body"];
        const commissionClass = isFeatured ? ["p-card-commission", "p-featured-commission"] : ["p-card-commission", "p-standard-commission"];
        const priceClass = isFeatured ? ["p-card-price", "p-featured-price"] : ["p-card-price", "p-standard-price"];

        return new Card({
            className: cardClass,
            body: [
                new Text({
                    text: name,
                    className: titleClass
                }),
                new Text({
                    text: tagline,
                    className: bodyClass
                }),
                new Container({
                    className: ["p-commission-wrapper"],
                    children: [
                        new Text({
                            text: commission,
                            className: commissionClass
                        }),
                        new Text({
                            text: "comissão",
                            className: [...bodyClass, "p-commission-label"]
                        })
                    ]
                }),
                new Text({
                    text: price,
                    className: priceClass
                }),
                this._createFeatureList(features, isFeatured),
                this._createPricingButton(name, isFeatured)
            ]
        });
    }

    _createFeatureList(features, isFeatured) {
        const listClass = ["p-feature-list"];
        const itemClass = isFeatured ? ["p-featured-item", "p-feature-item"] : ["p-feature-item", "p-standard-item"];
        const iconClass = isFeatured ? ["p-feature-icon", "p-featured-icon"] : ["p-feature-icon", "p-standard-icon"];
        const textClass = isFeatured ? ["p-feature-text", "p-featured-text"] : ["p-feature-text", "p-standard-text"];

        return new Container({
            className: listClass,
            children: features.map(feature => new Container({
                className: itemClass,
                children: [
                    new Icon({
                        icon: "fa fa-check-circle",
                        className: iconClass
                    }),
                    new Text({
                        text: feature,
                        className: textClass
                    })
                ]
            }))
        });
    }

    _createPricingButton(planName, isFeatured) {
        const buttonClass = isFeatured ? ["p-pricing-button", "p-featured-button"] : ["p-pricing-button", "p-standard-button"];

        return new Button({
            className: buttonClass,
            label: `Escolher ${planName}`
        });
    }

    render() {
        this.children = [this.createSection()]
        return super.render();
    }
}