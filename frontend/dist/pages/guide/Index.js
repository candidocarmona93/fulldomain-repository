import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Image } from "../../../src/widgets/elements/Image";
import { Icon } from "../../../src/widgets/elements/Icon";

import "../../assets/styles/property-guide.css"

export class Index extends BaseWidget {
    constructor() {
        super()
    }

    createGuide() {
        return new Container({
            className: ["psg-guide-root"],
            children: [
                this._createHeader(),
                
                this._createStepCard({
                    number: "01",
                    title: "Comece na Página Inicial",
                    description: "Na página principal, encontre a barra de pesquisa destacada no topo da página. Pode pesquisar por localidade, tipo de propriedade ou número de quartos.",
                    image: "homepage-search.jpg",
                    tip: "Dica: Use termos gerais como 'Coimbra centro' ou 'T2' para melhores resultados"
                }),

                this._createStepCard({
                    number: "02",
                    title: "Use Filtros Avançados",
                    description: "Clique em 'Mais Filtros' para refinar sua busca por preço, área, características especiais (varanda, garagem, etc.) ou data de disponibilidade.",
                    image: "filters.jpg",
                    tip: "Dica: Salve os seus filtros favoritos para pesquisas futuras",
                    isReversed: true
                }),

                this._createStepCard({
                    number: "03",
                    title: "Navegue pelos Resultados",
                    description: "Veja as propriedades em formato de lista ou mapa. Clique em qualquer anúncio para ver fotos, descrição completa, características e localização exata.",
                    image: "results-view.jpg",
                    tip: "Dica: Use o botão de coração para guardar propriedades favoritas"
                }),

                this._createStepCard({
                    number: "04",
                    title: "Agende uma Visita",
                    description: "Encontrou uma propriedade interessante? Use o botão 'Agendar Visita' para marcar uma visita presencial ou virtual com um dos nossos agentes.",
                    image: "schedule-visit.jpg",
                    tip: "Dica: Tenha os seus documentos prontos para acelerar o processo",
                    isReversed: true
                }),

                this._createFeaturesSection(),

                this._createTipsSection(),

                this._createCTASection()
            ]
        })
    }

    _createSearchDemo() {
        return new Container({
            className: ["psg-search-demo"],
            children: [
                new Icon({
                    icon: "fa fa-search",
                    className: ["psg-search-icon"]
                }),
                new Text({
                    text: "Localidade, tipo de imóvel ou palavra-chave...",
                    className: ["psg-search-placeholder"]
                })
            ]
        })
    }

    _createHeader() {
        return new Container({
            className: ["psg-section-header"],
            children: [
                new Text({
                    text: "GUIA DO UTILIZADOR",
                    className: ["psg-header-subtitle"]
                }),
                new Text({
                    text: "Como Encontrar a Propriedade Perfeita",
                    className: ["psg-header-title"]
                }),
                new Text({
                    text: "Um guia passo-a-passo para ajudar na sua busca imobiliária",
                    className: ["psg-header-description"]
                }),
            ]
        })
    }

    _createStepCard({ number, title, description, image, tip, isReversed = false }) {
        const imgUrl = new URL(`../../assets/images/guide/${image}`, import.meta.url);
        const rowClass = isReversed ? ["psg-step-row", "psg-reversed-row"] : ["psg-step-row", "psg-standard-row"];

        const textContent = new Container({
            className: ["psg-step-text-content"],
            children: [
                new Container({
                    className: ["psg-step-number"],
                    children: [
                        new Text({
                            text: number,
                            className: ["psg-step-number-text"]
                        })
                    ]
                }),
                new Text({
                    text: title,
                    className: ["psg-step-title"]
                }),
                new Text({
                    text: description,
                    className: ["psg-step-description"]
                }),
                new Container({
                    className: ["psg-tip-box"],
                    children: [
                        new Icon({
                            icon: "fa fa-lightbulb",
                            className: ["psg-tip-icon"]
                        }),
                        new Text({
                            text: tip,
                            className: ["psg-tip-text"]
                        })
                    ]
                })
            ]
        });

        const imageContent = new Container({
            className: ["psg-step-image-content"],
            children: [
                new Image({
                    src: imgUrl,
                    className: ["psg-step-image"],
                    alt: `Imagem ilustrativa: ${title}`
                })
            ]
        });

        return new Container({
            className: rowClass,
            children: isReversed ? [textContent, imageContent] : [imageContent, textContent]
        })
    }

    _createFeaturesSection() {
        return new Container({
            className: ["psg-features-section"],
            children: [
                new Text({
                    text: "Funcionalidades Úteis",
                    className: ["psg-section-title"]
                }),
                new Container({
                    className: ["psg-features-grid"],
                    children: [
                        this._createFeatureItem(
                            "Comparador",
                            "fa fa-balance-scale",
                            "Compare até 3 propriedades lado a lado",
                            "#3b82f6"
                        ),
                        this._createFeatureItem(
                            "Alertas por Email",
                            "fa fa-bell",
                            "Receba notificações de novos anúncios",
                            "#10b981"
                        ),
                        this._createFeatureItem(
                            "Mapa Interativo",
                            "fa fa-map-marker-alt",
                            "Veja propriedades por localização no mapa",
                            "#ef4444"
                        ),
                        this._createFeatureItem(
                            "Favoritos",
                            "fa fa-heart",
                            "Guarde propriedades para ver mais tarde",
                            "#f59e0b"
                        )
                    ]
                })
            ]
        })
    }

    _createFeatureItem(title, icon, description, color) {
        return new Container({
            className: ["psg-feature-item"],
            children: [
                new Container({
                    className: ["psg-feature-icon-container"],
                    style: { backgroundColor: color + "20" },
                    children: [
                        new Icon({
                            icon: icon,
                            className: ["psg-feature-icon"],
                            style: { color: color }
                        })
                    ]
                }),
                new Text({
                    text: title,
                    className: ["psg-feature-title"]
                }),
                new Text({
                    text: description,
                    className: ["psg-feature-description"]
                })
            ]
        })
    }

    _createTipsSection() {
        return new Container({
            className: ["psg-tips-section"],
            children: [
                new Text({
                    text: "Dicas para uma Busca Eficiente",
                    className: ["psg-section-title"]
                }),
                new Container({
                    className: ["psg-tips-list"],
                    children: [
                        this._createTip(
                            "Seja específico na sua pesquisa, mas não demasiado restritivo",
                            "fa fa-bullseye"
                        ),
                        this._createTip(
                            "Consulte o mercado regularmente - novas propriedades surgem diariamente",
                            "fa fa-sync-alt"
                        ),
                        this._createTip(
                            "Contacte diretamente o agente para questões específicas sobre a propriedade",
                            "fa fa-user-tie"
                        ),
                        this._createTip(
                            "Veja as propriedades em diferentes horários para avaliar luz e ruído",
                            "fa fa-sun"
                        )
                    ]
                })
            ]
        })
    }

    _createTip(text, icon) {
        return new Container({
            className: ["psg-tip-item"],
            children: [
                new Icon({
                    icon: icon,
                    className: ["psg-tip-item-icon"]
                }),
                new Text({
                    text: text,
                    className: ["psg-tip-item-text"]
                })
            ]
        })
    }

    _createCTASection() {
        return new Container({
            className: ["psg-cta-section"],
            children: [
                new Text({
                    text: "Precisa de Ajuda Personalizada?",
                    className: ["psg-cta-title"]
                }),
                new Text({
                    text: "Os nossos agentes estão disponíveis para o guiar em cada passo do processo",
                    className: ["psg-cta-description"]
                }),
                new Container({
                    className: ["psg-cta-buttons"],
                    children: [
                        new Container({
                            className: ["psg-cta-button-primary"],
                            children: [
                                new Icon({
                                    icon: "fa fa-phone-alt",
                                    className: ["psg-button-icon"]
                                }),
                                new Text({ 
                                    text: "Falar com Agente",
                                    className: ["psg-button-text"]
                                })
                            ]
                        }),
                        new Container({
                            className: ["psg-cta-button-secondary"],
                            children: [
                                new Icon({
                                    icon: "fa-brands fa-whatsapp",
                                    className: ["psg-button-icon"]
                                }),
                                new Text({ 
                                    text: "WhatsApp",
                                    className: ["psg-button-text"]
                                })
                            ]
                        })
                    ]
                }),
                new Container({
                    className: ["psg-contact-info"],
                    children: [
                        new Icon({
                            icon: "fa fa-clock",
                            className: ["psg-contact-icon"]
                        }),
                        new Text({
                            text: "Disponíveis 2ª a 6ª, 9h às 18h",
                            className: ["psg-contact-text"]
                        })
                    ]
                })
            ]
        })
    }

    render() {
        this.children = [this.createGuide()]
        return super.render();
    }
}