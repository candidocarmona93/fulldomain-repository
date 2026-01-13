import { BaseWidget } from "../../../src/core/BaseWidget"
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { Image } from "../../../src/widgets/elements/Image";
import { Icon } from "../../../src/widgets/elements/Icon";
import { FutureBuilder } from "../../../src/widgets/builders/FutureBuilder";
import { Builder } from "../../../src/widgets/builders/Builder";
import { Button } from "../../../src/widgets/buttons/Button";
import { Toast } from "../../../src/widgets/feedback/Toast";

import { HttpClient } from "../../services/HttpClient";
import { Utils } from "../../services/Utils";
import { Center } from "../../../src/widgets/layouts/Center";
import { Spinner } from "../../../src/widgets/feedback/Spinner";
import { Row } from "../../../src/widgets/layouts/Row";
import { NavigationService } from "../../services/NavegationService";

import "../../assets/styles/single-property-page.css";
import { Column } from "../../../src/widgets/layouts/Column";
import { GoogleMapService } from "../../services/GoogleMapService";
import { OpenGraphHelper } from "../../utils/OpenGraphHelper";

export class Show extends BaseWidget {
    constructor({ args }) {
        super();

        this.slug = args.slug;

        this.initState({
            activeGalleryIndex: 0,
            isFullscreenGallery: false,
        });
    }

    createSection() {
        return new Container({
            className: ["s-p-single-property-root"],
            children: [
                new FutureBuilder({
                    future: () => HttpClient.instance.get(`/properties/${this.slug}`),
                    builder: ({ result }) => {
                        const property = result.data[0];

                        if (!property) {
                            return new Container({
                                className: ["s-p-property-not-found"],
                                children: [
                                    new Icon({ icon: "fa-solid fa-house-circle-xmark", className: ["s-p-not-found-icon"] }),
                                    new Text({
                                        text: "Propriedade não encontrada.",
                                        className: ["s-p-not-found-text"]
                                    })
                                ]
                            });
                        }

                        OpenGraphHelper.instance.setArticle({
                            publishedTime: property.created_at,
                            modifiedTime: property.updated_at,
                            author: 'Full Domain, lda',
                            section: 'Imoveis',
                        });

                        OpenGraphHelper.instance.setSiteName('Casa Coimbra Maputo - Imoveis');
                        OpenGraphHelper.instance.setTitle(property.title);
                        OpenGraphHelper.instance.setDescription(property.description);
                        OpenGraphHelper.instance.setUrl(`https://casacoimbramaputo.com/imoveis/${this.slug}`);

                        const imgUrl = property?.galleries.filter(img => Number(img.isMain) === 1)?.url || property.galleries[0]?.url;
                        OpenGraphHelper.instance.setImage(imgUrl, {
                            width: 1920,
                            height: 1080,
                            alt: property.title,
                            type: 'image/png'
                        });

                        return new Container({
                            className: ["s-p-property-details-container"],
                            children: [
                                this._createTitleSection(property),
                                this._createGallerySection(property.galleries),
                                this._createDetailsAndFeatures(property),
                                this._createAgentSection(property),
                                this._createContactSection(property)
                            ]
                        });
                    },
                    onLoading: () => new Center({
                        children: [
                            new Spinner()
                        ]
                    })
                })
            ]
        });
    }

    _createTitleSection(property) {
        return new Container({
            className: ["s-p-title-section"],
            children: [
                new Container({
                    className: ["s-p-title-header"],
                    children: [
                        new Text({
                            text: property.title,
                            className: ["s-p-property-title"]
                        }),
                        new Row({
                            className: ["s-p-property-badges"],
                            children: [
                                Number(property.emphasis) ? new Container({
                                    className: ["s-p-badge", "s-p-featured-badge"],
                                    children: [
                                        new Icon({ icon: "fa-solid fa-star", className: ["s-p-badge-icon"] }),
                                        new Text({ text: "Destaque" })
                                    ]
                                }) : null,
                                property.categories?.name ? new Container({
                                    className: ["s-p-badge", "s-p-type-badge"],
                                    children: [new Text({ text: property.categories?.name })]
                                }) : null
                            ].filter(Boolean)
                        })
                    ]
                }),
                new Column({
                    className: ["s-p-property-meta"],
                    style: {
                        width: "100%",
                        justifyContent: "space-between"
                    },
                    children: [
                        new Container({
                            className: ["s-p-property-location-info"],
                            children: [
                                new Icon({ icon: "fa-solid fa-location-dot", className: ["s-p-location-icon"] }),
                                new Text({ text: property.address, className: ["s-p-location-text"] })
                            ]
                        }),
                        new Container({                                    //property currency code
                            className: ["s-p-property-price-section"],
                            children: [
                                new Text({
                                    text: Utils.simpleCurrencyFormat(property.price, property.currencies.code),
                                    className: ["s-p-property-price"]
                                }),
                            ].filter(Boolean)
                        })
                    ]
                })
            ]
        });
    }

    _createGallerySection(galleries) {
        if (!galleries || galleries.length === 0) {
            return new Container({
                className: ["s-p-no-gallery"],
                children: [
                    new Icon({ icon: "fa-solid fa-image", className: ["s-p-no-image-icon"] }),
                    new Text({ text: "Nenhuma imagem disponível." })
                ]
            });
        }

        return new Builder({
            watch: () => {
                const currentImage = galleries[this.state.activeGalleryIndex];

                return new Container({
                    className: ["s-p-gallery-section"],
                    children: [
                        // Fullscreen Overlay
                        this.state.isFullscreenGallery ? new Container({
                            className: ["s-p-fullscreen-overlay"],
                            events: {
                                click: () => this.state.isFullscreenGallery = false
                            },
                            children: [
                                new Container({
                                    className: ["s-p-fullscreen-content"],
                                    events: {
                                        click: (e) => e.stopPropagation()
                                    },
                                    children: [
                                        new Image({
                                            src: currentImage.url,
                                            className: ["s-p-fullscreen-image"],
                                            alt: `Image ${this.state.activeGalleryIndex + 1}`
                                        }),
                                        new Container({
                                            className: ["s-p-fullscreen-controls"],
                                            children: [
                                                new Container({
                                                    className: ["s-p-gallery-nav", "s-p-prev-btn"],
                                                    children: [new Icon({ icon: "fa-solid fa-chevron-left" })],
                                                    events: {
                                                        click: (e) => {
                                                            e.stopPropagation();
                                                            this.state.activeGalleryIndex =
                                                                (this.state.activeGalleryIndex - 1 + galleries.length) % galleries.length;
                                                        }
                                                    }
                                                }),
                                                new Container({
                                                    className: ["s-p-image-counter"],
                                                    children: [
                                                        new Text({
                                                            text: `${this.state.activeGalleryIndex + 1} / ${galleries.length}`,
                                                            className: ["s-p-counter-text"]
                                                        })
                                                    ]
                                                }),
                                                new Container({
                                                    className: ["s-p-gallery-nav", "s-p-next-btn"],
                                                    children: [new Icon({ icon: "fa-solid fa-chevron-right" })],
                                                    events: {
                                                        click: (e) => {
                                                            e.stopPropagation();
                                                            this.state.activeGalleryIndex =
                                                                (this.state.activeGalleryIndex + 1) % galleries.length;
                                                        }
                                                    }
                                                }),
                                                new Container({
                                                    className: ["s-p-close-fullscreen-btn"],
                                                    children: [new Icon({ icon: "fa-solid fa-times" })],
                                                    events: {
                                                        click: () => this.state.isFullscreenGallery = false
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }) : null,

                        // Main Gallery Container
                        new Container({
                            className: ["s-p-main-image-wrapper"],
                            children: [
                                // Blurred Background Layer
                                new Container({
                                    className: ["s-p-blur-bg"],
                                    style: {
                                        backgroundImage: `url('${currentImage.url}')`
                                    }
                                }),
                                // Main Image Container with aspect ratio preservation
                                new Container({
                                    className: ["s-p-image-container"],
                                    children: [
                                        new Image({
                                            src: currentImage.url,
                                            className: ["s-p-main-image"],
                                            alt: `Image ${this.state.activeGalleryIndex + 1}`,
                                            onAttached: (imgEl) => {
                                                // Handle image load to ensure proper fitting
                                                imgEl.onload = () => {
                                                    this._adjustImageFit(imgEl);
                                                };
                                                // Also handle if image is already loaded
                                                if (imgEl.complete) {
                                                    this._adjustImageFit(imgEl);
                                                }
                                            }
                                        })
                                    ]
                                }),
                                new Container({
                                    className: ["s-p-gallery-controls"],
                                    children: [
                                        new Container({
                                            className: ["s-p-gallery-nav", "s-p-prev-btn"],
                                            children: [new Icon({ icon: "fa-solid fa-chevron-left" })],
                                            events: {
                                                click: (e) => {
                                                    e.stopPropagation();
                                                    this.state.activeGalleryIndex =
                                                        (this.state.activeGalleryIndex - 1 + galleries.length) % galleries.length;
                                                }
                                            }
                                        }),
                                        new Container({
                                            className: ["s-p-gallery-nav", "s-p-next-btn"],
                                            children: [new Icon({ icon: "fa-solid fa-chevron-right" })],
                                            events: {
                                                click: (e) => {
                                                    e.stopPropagation();
                                                    this.state.activeGalleryIndex =
                                                        (this.state.activeGalleryIndex + 1) % galleries.length;
                                                }
                                            }
                                        }),
                                        new Container({
                                            className: ["s-p-fullscreen-btn"],
                                            children: [new Icon({ icon: "fa-solid fa-expand" })],
                                            events: {
                                                click: () => this.state.isFullscreenGallery = !this.state.isFullscreenGallery
                                            }
                                        })
                                    ]
                                }),
                                new Container({
                                    className: ["s-p-image-counter"],
                                    children: [
                                        new Text({
                                            text: `${this.state.activeGalleryIndex + 1} / ${galleries.length}`,
                                            className: ["s-p-counter-text"]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Container({
                            className: ["s-p-thumbnails-container"],
                            children: galleries.map((image, index) => this._createThumbnail(image, index))
                        })
                    ].filter(Boolean)
                });
            }
        });
    }

    _adjustImageFit(imgEl) {
        const container = imgEl.parentElement.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const imgWidth = imgEl.naturalWidth;
        const imgHeight = imgEl.naturalHeight;

        // Calculate aspect ratios
        const containerRatio = containerWidth / containerHeight;
        const imgRatio = imgWidth / imgHeight;

        // Determine fitting strategy
        if (imgRatio > containerRatio) {
            // Image is wider than container - fit to width
            imgEl.style.width = '100%';
            imgEl.style.height = 'auto';
            imgEl.style.maxHeight = '100%';
            imgEl.style.objectFit = 'contain';
        } else {
            // Image is taller than container - fit to height
            imgEl.style.width = 'auto';
            imgEl.style.height = '100%';
            imgEl.style.maxWidth = '100%';
            imgEl.style.objectFit = 'contain';
        }
    }

    _createThumbnail(image, index) {
        const isActive = this.state.activeGalleryIndex === index;

        return new Container({
            className: ["s-p-thumbnail-wrapper", isActive ? "active" : ""],
            children: [
                new Image({
                    src: image.url,
                    className: ["s-p-thumbnail-image"],
                    alt: `Thumbnail ${index + 1}`
                }),
                isActive ? new Container({
                    className: ["s-p-thumbnail-overlay"],
                    children: [new Icon({ icon: "fa-solid fa-check", className: ["s-p-active-icon"] })]
                }) : null
            ].filter(Boolean),
            events: {
                click: () => this.state.activeGalleryIndex = index
            }
        });
    }

    _createDetailsAndFeatures(property) {
        return new Container({
            className: ["s-p-details-features-section"],
            children: [
                new Container({
                    className: ["s-p-details-section"],
                    children: [
                        new Text({
                            text: "Descrição da Propriedade",
                            className: ["s-p-section-heading"]
                        }),
                        new Container({
                            className: ["s-p-property-description-container"],
                            children: [
                                new Text({
                                    text: property?.description || "Nenhuma descrição fornecida.",
                                    className: ["s-p-property-description"],
                                    onAttached: (el) => {
                                        if (property?.description) {
                                            el.innerHTML = property.description;
                                        }
                                    }
                                })
                            ]
                        }),

                        new Text({
                            text: "Especificações Técnicas",
                            className: ["s-p-section-heading"]
                        }),
                        new Container({
                            className: ["s-p-specs-grid"],
                            children: [
                                this._createDetailItem("fa-solid fa-bed", `${property.room || "N/A"}`, "Quartos", "#8b5cf6"),
                                this._createDetailItem("fa-solid fa-bath", `${property.bathroom || "N/A"}`, "Casas de banho", "#06b6d4"),
                                this._createDetailItem("fa-solid fa-ruler-combined", `${property.area || "N/A"}m²`, "Área Total", "#10b981"),
                                this._createDetailItem("fa-solid fa-car", `${property.garage || "0"}`, "Garagem", "#f59e0b"),
                                this._createDetailItem("fa-solid fa-building", `${property.year_built || "N/A"}`, "Ano de Construção", "#ef4444"),
                                this._createDetailItem("fa-solid fa-layer-group", `${property.floor || "N/A"}`, "Andar", "#6366f1")
                            ]
                        }),

                        this._createFeaturesList(property.features)
                    ]
                }),

                new Container({
                    className: ["s-p-sidebar-section"],
                    children: [
                        this._createPropertyInfoCard(property),
                        new BaseWidget({
                            style: {
                                backgroundColor: "#f0f0f0",
                                height: "500px",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "1px solid #ccc"
                            },
                            onAttached: async (el) => {
                                const googleMapService = new GoogleMapService();
                                const { map } = await googleMapService.initMap(el, {
                                    lat: Number(property.latitude),
                                    lng: Number(property.longitude),
                                    title: property.title,
                                });
                            }
                        })
                    ]
                })
            ]
        });
    }

    _createDetailItem(icon, value, label, color) {
        return new Container({
            className: ["s-p-detail-card"],
            children: [
                new Container({
                    className: ["s-p-detail-icon-wrapper"],
                    style: { backgroundColor: `${color}15` },
                    children: [
                        new Icon({
                            icon: icon,
                            className: ["s-p-detail-icon"],
                            style: { color: color }
                        })
                    ]
                }),
                new Container({
                    className: ["s-p-detail-content"],
                    children: [
                        new Text({
                            text: value,
                            className: ["s-p-detail-value"],
                            style: { color: color }
                        }),
                        new Text({
                            text: label,
                            className: ["s-p-detail-label"]
                        })
                    ]
                })
            ]
        });
    }

    _createFeaturesList(features) {
        if (!features || features.length === 0) {
            return new Container({
                className: ["s-p-no-features"],
                children: [
                    new Text({
                        text: "Comodidades e Características",
                        className: ["s-p-section-heading"]
                    }),
                    new Text({
                        text: "Nenhuma comodidade listada.",
                        className: ["s-p-no-features-text"]
                    })
                ]
            });
        }

        return new Container({
            className: ["s-p-features-section"],
            children: [
                new Text({
                    text: "Comodidades e Características",
                    className: ["s-p-section-heading"]
                }),
                new Container({
                    className: ["s-p-features-grid"],
                    children: features.map(({ feature }) =>
                        new Container({
                            className: ["s-p-feature-card"],
                            children: [
                                new BaseWidget({
                                    className: ["s-p-feature-icon"],
                                    onAttached: (el) => {
                                        el.insertAdjacentHTML("afterbegin", feature.icon_svg)
                                    }
                                }),
                                new Text({
                                    text: feature.name,
                                    className: ["s-p-feature-name"]
                                })
                            ]
                        })
                    )
                })
            ]
        });
    }

    _createPropertyInfoCard(property) {
        return new Container({
            className: ["s-p-info-card"],
            children: [
                new Text({
                    text: "Informações da Propriedade",
                    className: ["s-p-card-title"]
                }),
                new Container({
                    className: ["s-p-info-list"],
                    children: [
                        this._createInfoItem("fa-solid fa-tag", "Código", property.code || "N/A"),
                        this._createInfoItem("fa-solid fa-calendar", "Publicado em", property.created_at ?
                            new Date(property.created_at).toLocaleDateString('pt-MZ') : "N/A"),
                        this._createInfoItem("fa-solid fa-refresh", "Status", "Disponível"),
                        this._createInfoItem("fa-solid fa-compass", "Como chegar", new Text({
                            text: "Navegar com google route",
                            style: {
                                fontSize: "0.8rem"
                            },
                            tag: "a",
                            props: {
                                href: "",
                                target: "_blank"
                            },
                            events: {
                                click: (e) => {
                                    e.preventDefault();
                                    NavigationService.navigateFromCurrentLocation(property.latitude, property.longitude, property.address)
                                }
                            }
                        }))
                    ]
                })
            ]
        });
    }

    _createInfoItem(icon, label, value) {
        return new Container({
            className: ["s-p-info-item"],
            children: [
                new Container({
                    className: ["s-p-info-label"],
                    children: [
                        new Icon({ icon: icon, className: ["s-p-info-icon"] }),
                        new Text({ text: label })
                    ]
                }),

                value instanceof BaseWidget ? value : new Text({
                    text: value,
                    className: ["s-p-info-value"]
                })
            ]
        });
    }

    _createAgentSection(property) {
        if (!property.agent) return null;

        return new Container({
            className: ["s-p-agent-section"],
            children: [
                new Text({
                    text: "Agente Responsável",
                    className: ["s-p-section-heading"]
                }),
                new Container({
                    className: ["s-p-agent-card"],
                    children: [
                        new Image({
                            src: property.agent.photo || "/default-avatar.jpg",
                            className: ["s-p-agent-photo"],
                            alt: property.agent.name
                        }),
                        new Container({
                            className: ["s-p-agent-info"],
                            children: [
                                new Text({
                                    text: property.agent.name,
                                    className: ["s-p-agent-name"]
                                }),
                                new Text({
                                    text: property.agent.title || "Agente Imobiliário",
                                    className: ["s-p-agent-title"]
                                }),
                                new Container({
                                    className: ["s-p-agent-contact"],
                                    children: [
                                        new Container({
                                            className: ["s-p-contact-item"],
                                            children: [
                                                new Icon({ icon: "fa-solid fa-phone", className: ["s-p-contact-icon"] }),
                                                new Text({ text: property.agent.phone, className: ["s-p-contact-text"] })
                                            ]
                                        }),
                                        new Container({
                                            className: ["s-p-contact-item"],
                                            children: [
                                                new Icon({ icon: "fa-solid fa-envelope", className: ["s-p-contact-icon"] }),
                                                new Text({ text: property.agent.email, className: ["s-p-contact-text"] })
                                            ]
                                        })
                                    ]
                                }),
                                new Text({
                                    text: property.agent.bio || "Especialista em propriedades com anos de experiência no mercado.",
                                    className: ["s-p-agent-bio"]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    _createContactSection(property) {
        return new Container({
            className: ["s-p-contact-section"],
            children: [
                new Container({
                    className: ["s-p-contact-card"],
                    children: [
                        new Container({
                            className: ["s-p-contact-header"],
                            children: [
                                new Icon({ icon: "fa-solid fa-headset", className: ["s-p-contact-header-icon"] }),
                                new Text({
                                    text: "Interessado nesta propriedade?",
                                    className: ["s-p-contact-title"]
                                })
                            ]
                        }),
                        new Text({
                            text: "Entre em contacto connosco para mais informações, agendar uma visita ou fazer uma proposta.",
                            className: ["s-p-contact-description"]
                        }),
                        new Container({
                            className: ["s-p-contact-buttons"],
                            children: [
                                new Button({
                                    className: ["s-p-contact-btn", "s-p-whatsapp-btn"],
                                    prefixIcon: new Icon({ icon: "fa-brands fa-whatsapp", className: ["s-p-btn-icon"] }),
                                    label: "WhatsApp",
                                    onPressed: () => window.open(`https://wa.me/258${property.agents?.phone || '842083827'}`, '_blank')
                                }),
                                new Button({
                                    className: ["s-p-contact-btn", "s-p-call-btn"],
                                    prefixIcon: new Icon({ icon: "fa-solid fa-phone", className: ["s-p-btn-icon"] }),
                                    label: "Ligar Agora",
                                    onPressed: () => window.location.href = `tel:${property.agents?.phone || '+258842083827'}`
                                }),
                                new Button({
                                    className: ["s-p-contact-btn", "s-p-email-btn"],
                                    prefixIcon: new Icon({ icon: "fa-solid fa-envelope", className: ["s-p-btn-icon"] }),
                                    label: "Email",
                                    onPressed: () => window.location.href = `mailto:${property.agents?.email || 'casacoimbramaputo@gmail.com'}`
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    _createScheduleVisitCard() {
        return new Container({
            className: ["s-p-schedule-card"],
            children: [
                new Text({
                    text: "Agendar Visita",
                    className: ["s-p-card-title"]
                }),
                new Text({
                    text: "Agende uma visita personalizada para conhecer esta propriedade.",
                    className: ["s-p-card-description"]
                }),

                new Button({
                    className: ["s-p-contact-btn", "s-p-email-btn"],
                    prefixIcon: new Icon({ icon: "fa-solid fa-calendar", className: ["s-p-btn-icon"] }),
                    label: "Agendar visita",
                    onPressed: () => {
                        new Toast({
                            message: "Por favor, entre em contacto com a nossa equipe para mais detalhes"
                        }).show()
                    }
                })
            ]
        });
    }

    render() {
        this.children = [this.createSection()];
        const el = super.render();
        return el;
    }
}