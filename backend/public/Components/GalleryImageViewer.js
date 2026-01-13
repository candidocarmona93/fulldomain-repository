import { BottomSheet } from "../../src/widgets/overlays/BottomSheet";
import { Stack } from "../../src/widgets/layouts/Stack";
import { Container } from "../../src/widgets/layouts/Container";
import { Align } from "../../src/widgets/utilities/Align";
import { Position } from "../../src/themes/Position";
import { IconButton } from "../../src/widgets/buttons/IconButton";
import { Icon } from "../../src/widgets/elements/Icon";
import { Image } from "../../src/widgets/elements/Image";
import { Badge } from "../../src/widgets/feedback/Badge";
import { Text } from "../../src/widgets/elements/Text";
import { Builder } from "../../src/widgets/builders/Builder";
import { Column } from "../../src/widgets/layouts/Column";
import { Row } from "../../src/widgets/layouts/Row";
import { Button } from "../../src/widgets/buttons/Button";

import "../assets/styles/gallery-image-viewer.css"
import { BaseWidget } from "../../src/core/BaseWidget";

const CONSTANTS = {
    SWIPE_THRESHOLD: 50,
    DOUBLE_TAP_THRESHOLD: 300,
    ZOOM_LEVEL: 2,
};

export class GalleryImageViewer extends BaseWidget {
    constructor({
        images = [],
        initialIndex = 0,
        showMainBadge = true,
        actions = [],
        onClose = null,
        onNavigate = null,
    } = {}) {
        super()

        this.images = [...images];
        this.showMainBadge = showMainBadge;
        this.actions = actions;
        this.onClose = onClose;
        this.onNavigate = onNavigate;

        // Touch & zoom state (managed locally, not in BaseWidget state)
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.lastTap = 0;
        this.zoomLevel = 1;

        this.bottomSheet = null;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.toggleZoom = this.toggleZoom.bind(this);

        this.initState({
            currentIndex: initialIndex,
        })
    }

    navigate(direction) {
        if (this.images.length <= 1 || this.zoomLevel > 1) return; // Prevent swipe navigation while zoomed

        this.setState(prev => {
            const newIndex = (prev.currentIndex + direction + this.images.length) % this.images.length;
            this.onNavigate?.(newIndex, this.images[newIndex]);
            return { currentIndex: newIndex };
        });
    }

    handleKeyDown(e) {
        switch (e.key) {
            case "ArrowLeft":
                this.navigate(-1);
                break;
            case "ArrowRight":
                this.navigate(1);
                break;
            case "Escape":
                this.close();
                break;
        }
    }

    handleTouchStart(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const now = Date.now();
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isDragging = false;

        // Double-tap zoom
        if (this.lastTap && now - this.lastTap < CONSTANTS.DOUBLE_TAP_THRESHOLD) {
            e.preventDefault();
            this.toggleZoom();
        }
        this.lastTap = now;
    }

    handleTouchMove(e) {
        if (!this.touchStartX || e.touches.length !== 1) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Determine if it's a horizontal swipe or vertical scroll
        if (this.zoomLevel === 1 && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            this.isDragging = true;
            e.preventDefault(); // Prevent page scroll during horizontal drag
        }
        // Handle image drag/pan when zoomed
        else if (this.zoomLevel > 1) {
            // Add complex pan logic here if needed, but for now, we just prevent default for any movement when zoomed
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.touchStartX) return;

        const deltaX = e.changedTouches[0].clientX - this.touchStartX;

        // Only trigger navigation if not zoomed and sufficiently swiped
        if (this.zoomLevel === 1 && this.isDragging && Math.abs(deltaX) > CONSTANTS.SWIPE_THRESHOLD) {
            this.navigate(deltaX > 0 ? -1 : 1);
        }

        this.touchStartX = 0;
        this.isDragging = false;
    }

    toggleZoom() {
        const imageElement = this.bottomSheet?.element.querySelector('.gallery-viewer-image');
        if (!imageElement) return;

        this.zoomLevel = this.zoomLevel === 1 ? CONSTANTS.ZOOM_LEVEL : 1;
        imageElement.style.transform = `scale(${this.zoomLevel})`;
        imageElement.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

        // Reset pan position on zoom out
        if (this.zoomLevel === 1) {
            imageElement.style.transformOrigin = 'center center';
        } else {
            // Optional: set origin to center of tap or simply maintain 'center'
            imageElement.style.transformOrigin = 'center center';
        }
    }

    renderSlide() {
        return new Builder({
            watch: () => {
                const img = this.images[this.state.currentIndex];

                if (!img) return new Container();

                const isMain = Number(this.showMainBadge && img.isMain);

                return new Container({
                    className: ["gallery-slide-container"],
                    style: { height: "100%" },
                    children: [
                        // Main badge
                        isMain && new Align({
                            position: Position.absolute.topRight,
                            className: ["gallery-main-badge"],
                            children: new Badge({ label: "Foto Principal" })
                        }),

                        // Drag hint
                        new Container({
                            className: ["gallery-drag-hint"],
                            children: new Text({
                                text: this.zoomLevel > 1
                                    ? "Arraste para mover • Toque duas vezes para reverter"
                                    : "Deslize para navegar • Toque duas vezes para ampliar"
                            })
                        }),

                        // Main image
                        new Align({
                            children: new Image({
                                src: img.url,
                                className: ["gallery-slide-image", "gallery-viewer-image"],
                            })
                        }),
                    ].filter(Boolean)
                });
            }
        });
    }

    renderActionButtons() {
        return new Builder({
            watch: () => {
                const image = this.images[this.state.currentIndex];

                if (!image) return new Container();

                const buttons = this.actions
                    .filter(action => !action.isVisible || action.isVisible(image))
                    .map(action => new Button({
                        label: action.label,
                        prefixIcon: new Icon({ icon: action.icon }),
                        theme: action?.theme,
                        isDestructive: action.isDestructive,
                        disabled: image.isUploading || image.error,
                        onPressed: () => action.onPress(image),
                    }));

                return new Row({
                    rowStyle: { width: '100%', padding: '1rem', justifyContent: "center", alignItems: "center" },
                    children: buttons
                });
            }
        })
    }

    renderContent() {
        return new Column({
            style: { gap: "20px" },
            children: [
                new Stack({
                    children: [
                        // Navigation arrows
                        new Align({
                            position: Position.absolute.center,
                            style: { width: "100%" },
                            children: new Container({
                                className: ["gallery-navigation-controls"],
                                children: [
                                    new IconButton({
                                        icon: new Icon({ icon: "fa fa-chevron-left" }),
                                        className: ["gallery-nav-button"],
                                        onPressed: () => this.navigate(-1),
                                    }),
                                    new IconButton({
                                        icon: new Icon({ icon: "fa fa-chevron-right" }),
                                        className: ["gallery-nav-button"],
                                        onPressed: () => this.navigate(1),
                                    })
                                ]
                            })
                        }),

                        new Align({
                            position: Position.absolute.bottom,
                            style: {
                                width: "100%"
                            },
                            children: [
                                this.actions.length > 0 && this.renderActionButtons()
                            ]
                        }),

                        // Touch area + slide
                        new Container({
                            events: {
                                touchstart: this.handleTouchStart,
                                touchmove: this.handleTouchMove,
                                touchend: this.handleTouchEnd,
                            },
                            children: [this.renderSlide()]
                        }),
                    ]
                }),
            ]
        })
    }

    open() {
        this.bottomSheet = new BottomSheet({
            className: ["gallery-bottom-sheet"],
            content: this.renderContent(),
            onClose: () => {
                this.onClose?.();
                this.cleanup();
            }
        });

        document.addEventListener("keydown", this.handleKeyDown);
        this.bottomSheet.show();
    }

    close() {
        this.bottomSheet?.close();
        this.cleanup();
    }

    cleanup() {
        document.removeEventListener("keydown", this.handleKeyDown);
        this.zoomLevel = 1;
        this.bottomSheet = null;
    }
}