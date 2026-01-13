import { BaseWidget } from "../../src/core/BaseWidget";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { SVG } from "../../src/widgets/utilities/SVG";

import "../assets/styles/svg-animation-component.css";

export class NoImageComponent extends BaseWidget {    
    constructor() {
        super()
    }

    render() {
        this.children = [
            new Column({
                style: {
                    textAlign: "center",
                    padding: "2rem .5rem",
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh"
                },
                children: [
                    // Elementos decorativos de fundo (bolhas vermelhas suaves)
                    this._buildDecorativeElements(),

                    // SVG animado principal
                    this._buildAnimatedSVG(),
                ]
            })
        ];

        return super.render();
    }

    _buildDecorativeElements() {
        return new Container({
            style: {
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                overflow: "hidden",
                zIndex: 0,
                pointerEvents: "none"
            },
            children: [
                new Container({ style: { position: "absolute", top: "-60px", right: "-60px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(185, 28, 28, 0.1)", animation: "pulse 7s ease-in-out infinite" }}),
                new Container({ style: { position: "absolute", bottom: "-40px", left: "-40px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(185, 28, 28, 0.08)", animation: "pulse 9s ease-in-out infinite 3s" }}),
            ]
        });
    }

    _buildAnimatedSVG() {
        return new Container({
            style: { height: "260px", position: "relative" },
            children: [
                new SVG({
                    viewBox: "0 0 200 200",
                    style: {
                        width: "100%",
                        height: "100%",
                        maxWidth: "280px",
                        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.06))"
                    },
                    children: [
                        // Gradiente de fundo
                        new SVG.Defs({
                            children: [
                                new SVG.LinearGradient({
                                    id: "noImageGradient",
                                    x1: "0%", y1: "0%", x2: "100%", y2: "100%",
                                    children: [
                                        new SVG.Stop({ offset: "0%", stopColor: "#fee2e2" }),
                                        new SVG.Stop({ offset: "100%", stopColor: "#fecaca" })
                                    ]
                                })
                            ]
                        }),

                        // Círculo flutuante de fundo
                        new SVG.Circle({
                            cx: 100, cy: 100, r: 82,
                            fill: "url(#noImageGradient)",
                            style: { animation: "float 6s ease-in-out infinite", transformOrigin: "center" }
                        }),

                        // Moldura de foto (quadro grande)
                        new SVG.Rect({ x: 64, y: 64, width: 72, height: 72, rx: 6, fill: "none", stroke: "#7f1d1d", strokeWidth: 9 }),
                        new SVG.Rect({ x: 72, y: 72, width: 56, height: 42, fill: "#ffffff", opacity: 0.92 }),
                        new SVG.Circle({ cx: 100, cy: 69, r: 7, fill: "#7f1d1d" }), // suporte da moldura

                        // Sinal de PROIBIDO grande por cima
                        new SVG.Group({
                            style: { animation: "pulse 3s ease-in-out infinite", transformOrigin: "center" },
                            children: [
                                new SVG.Circle({ cx: 100, cy: 100, r: 56, fill: "none", stroke: "#b91c1c", strokeWidth: 12 }),
                                new SVG.Line({ x1: 62, y1: 62, x2: 138, y2: 138, stroke: "#b91c1c", strokeWidth: 14, strokeLinecap: "round" })
                            ]
                        }),

                        // Bolhas animadas flutuantes (mesmo estilo do NotAllowedComponent)
                        ...this._generateBubbles()
                    ]
                })
            ]
        });
    }

    _generateBubbles() {
        const bubbles = [];
        const colors = ["#b91c1c", "#7f1d1d", "#991b1b", "#dc2626", "#ef4444"];

        for (let i = 0; i < 9; i++) {
            const size = Math.random() * 9 + 4;
            const x = Math.random() * 170 + 15;
            const y = Math.random() * 170 + 15;
            const opacity = Math.random() * 0.35 + 0.1;
            const delay = Math.random() * 6;
            const duration = Math.random() * 10 + 7;
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubbles.push(
                new SVG.Circle({
                    cx: x, cy: y, r: size,
                    fill: color,
                    opacity: opacity,
                    style: { mixBlendMode: "multiply" },
                    children: [
                        new SVG.Animate({ attributeName: "cy", values: `${y};${y-45};${y}`, dur: `${duration}s`, begin: `${delay}s`, repeatCount: "indefinite" }),
                        new SVG.Animate({ attributeName: "cx", values: `${x};${x + (Math.random()*30-15)};${x}`, dur: `${duration+3}s`, begin: `${delay}s`, repeatCount: "indefinite" }),
                        new SVG.Animate({ attributeName: "opacity", values: `${opacity};${opacity*1.6};${opacity}`, dur: `${duration-1}s`, begin: `${delay}s`, repeatCount: "indefinite" })
                    ]
                })
            );
        }
        return bubbles;
    }
}