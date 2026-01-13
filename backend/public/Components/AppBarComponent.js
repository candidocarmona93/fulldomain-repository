import { BaseWidget } from "../../src/core/BaseWidget";
import { Icon } from "../../src/widgets/elements/Icon";
import { Image } from "../../src/widgets/elements/Image";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { HeaderSubtitleComponent } from "./HeaderSubtitleComponent";
import { HeaderTitleComponent } from "./HeaderTitleComponent";


export class AppBarComponent extends BaseWidget {
    constructor({
        title = "",
        subtitle = "",
        photoSrc = null,
        showBrand = false,
        showBackIcon = false,
        onPopPage = null
    } = {}) {
        super();

        this.title = title;
        this.subtitle = subtitle;
        this.photoSrc = photoSrc;
        this.showBrand = showBrand;
        this.showBackIcon = showBackIcon;
        this.onPopPage = onPopPage;
    }

    render() {
        this.children = [
            new Column({
                style: {
                    width: "100dvw",
                    padding: ".5rem 1.5rem 2rem",
                    background: "var(--primary)",
                    color: "white",
                    minHeight: "30dvh",
                    borderRadius: "0 0 24px 24px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    marginBottom: "1.5rem",
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    overflow: "hidden"
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
                            background: "rgba(255,255,255,0.4)"
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
                            background: "rgba(255,255,255,0.3)"
                        }
                    }),
                    this.showBackIcon ? new Container({
                        style: {
                            display: "flex",
                            justifySelf: "flex-start",
                            alignSelf: "flex-start",
                        },
                        children: [
                            new Icon({
                                icon: "fa-solid fa-angle-left",
                                style: {
                                    fontSize: "1.2rem",
                                    padding: "1rem",
                                    cursor: "pointer"
                                },
                                events: {
                                    click: (e) => this.onPopPage ? this.onPopPage(e) : App.instance.back()
                                }
                            }),
                        ]
                    }) : null,
                    new Column({
                        style: {
                            alignSelf: "center",
                            justifySelf: "center",
                            marginTop: "auto",
                            alignItems: "center",
                        },
                        children: [
                            this.showBrand ? new Image({
                                src: this.photoSrc,
                                fallbackSrc: new URL("../../assets/images/logo.png", import.meta.url),
                                rounded: true,
                                shadow: false,
                                style: { width: "4rem", height: "4rem", objectFit: "cover" }
                            }) : null,
                            new HeaderTitleComponent({
                                style: { textAlign: "center", color: "#fff" },
                                text: this.title
                            }),
                            new HeaderSubtitleComponent({
                                style: { textAlign: "center", padding: "0 2rem", color: "#fff" },
                                text: this.subtitle
                            }),
                        ]
                    })
                ],
            })
        ];
        return super.render();
    }
}