
import { BaseWidget } from "../../src/core/BaseWidget";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { SVG } from "../../src/widgets/utilities/SVG";
import "../assets/styles/svg-animation-component.css";
import { HeaderSubtitleComponent } from "./HeaderSubtitleComponent";
import { HeaderTitleComponent } from "./HeaderTitleComponent";

export class NotAllowedComponent extends BaseWidget {
    constructor({ onGoBack = null } = {}) {
        super({
            style: {
                width: "100%",
                marginTop: "-1.5rem"
            }
        });
        this.onGoBack = onGoBack;
    }

    render() {
        this.children = [
            new Column({
                style: {
                    textAlign: "center",
                    padding: "1.5rem .5rem",
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                },
                children: [
                    // Decorative elements
                    this._buildDecorativeElements(),
                    // Animated SVG
                    this._buildAnimatedSVG(),
                    // Content
                    new HeaderTitleComponent({
                        text: "Acesso não permitido",
                        style: {
                            color: "#b91c1c!important", // Red tone for error/restriction
                        }
                    }),
                    new HeaderSubtitleComponent({
                        text: "Você não tem permissão para acessar esta página. Entre em contacto com o administrador, caso se trate de um erro.",
                        style: {
                            marginBottom: "1rem"
                        }
                    }),
                ]
            })
        ];
        return super.render();
    }

    _buildDecorativeElements() {
        return new Container({
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
                zIndex: 0
            },
            children: [
                new Container({
                    style: {
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        background: "rgba(185, 28, 28, 0.1)", // Red tone
                        animation: "pulse 6s ease-in-out infinite"
                    }
                }),
                new Container({
                    style: {
                        position: "absolute",
                        bottom: "-30px",
                        left: "-30px",
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        background: "rgba(185, 28, 28, 0.08)", // Red tone
                        animation: "pulse 8s ease-in-out infinite 2s"
                    }
                })
            ]
        });
    }

    _buildAnimatedSVG() {
        return new Container({
            style: {
                height: "220px",
                position: "relative"
            },
            children: [
                new SVG({
                    viewBox: "0 0 200 200",
                    style: {
                        width: "100%",
                        height: "100%",
                        filter: "drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04))"
                    },
                    children: [
                        // Background circle with gradient
                        new SVG.Defs({
                            children: [
                                new SVG.LinearGradient({
                                    id: "notAllowedGradient",
                                    x1: "0%",
                                    y1: "0%",
                                    x2: "100%",
                                    y2: "100%",
                                    children: [
                                        new SVG.Stop({
                                            offset: "0%",
                                            stopColor: "#fee2e2" // Light red
                                        }),
                                        new SVG.Stop({
                                            offset: "100%",
                                            stopColor: "#fecaca" // Medium red
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Background circle
                        new SVG.Circle({
                            cx: 100,
                            cy: 100,
                            r: 80,
                            fill: "url(#notAllowedGradient)",
                            style: {
                                animation: "float 6s ease-in-out infinite",
                                transformOrigin: "center"
                            }
                        }),

                        // Stop sign
                        new SVG.Group({
                            className: "stop-sign",
                            style: {
                                animation: "float 4s ease-in-out infinite",
                                transformOrigin: "center"
                            },
                            children: [
                                // Octagon shape
                                // Exclamation mark
                                new SVG.Rect({
                                    x: 95,
                                    y: 80,
                                    width: 10,
                                    height: 50,
                                    rx: 2,
                                    fill: "white"
                                }),
                                new SVG.Circle({
                                    cx: 100,
                                    cy: 150,
                                    r: 5,
                                    fill: "white"
                                })
                            ]
                        }),

                        // Animated shield with cross
                        new SVG.Group({
                            className: "shield",
                            children: [
                                // Shield shape
                                new SVG.Path({
                                    d: "M100 40 L140 60 L140 100 C140 120 120 140 100 150 C80 140 60 120 60 100 L60 60 Z",
                                    fill: "white",
                                    stroke: "#7f1d1d",
                                    strokeWidth: 2,
                                    style: {
                                        animation: "pulse 3s ease-in-out infinite"
                                    }
                                }),
                            ]
                        }),

                        // Animated bubbles (red theme)
                        ...this._generateBubbles()
                    ]
                })
            ]
        });
    }

    _generateBubbles() {
        const bubbles = [];
        const colors = ["#b91c1c", "#7f1d1d", "#991b1b", "#dc2626"]; // Various red tones

        for (let i = 0; i < 8; i++) {
            const size = Math.random() * 8 + 3;
            const x = Math.random() * 180 + 10;
            const y = Math.random() * 180 + 10;
            const opacity = Math.random() * 0.4 + 0.1;
            const delay = Math.random() * 5;
            const duration = Math.random() * 8 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubbles.push(
                new SVG.Circle({
                    cx: x,
                    cy: y,
                    r: size,
                    fill: color,
                    opacity: opacity,
                    style: {
                        mixBlendMode: "multiply"
                    },
                    children: [
                        new SVG.Animate({
                            attributeName: "cy",
                            values: `${y};${y - 40};${y}`,
                            dur: `${duration}s`,
                            begin: `${delay}s`,
                            repeatCount: "indefinite"
                        }),
                        new SVG.Animate({
                            attributeName: "cx",
                            values: `${x};${x + (Math.random() * 20 - 10)};${x}`,
                            dur: `${duration + 2}s`,
                            begin: `${delay}s`,
                            repeatCount: "indefinite"
                        }),
                        new SVG.Animate({
                            attributeName: "opacity",
                            values: `${opacity};${opacity * 1.5};${opacity}`,
                            dur: `${duration - 2}s`,
                            begin: `${delay}s`,
                            repeatCount: "indefinite"
                        })
                    ]
                })
            );
        }
        return bubbles;
    }
}