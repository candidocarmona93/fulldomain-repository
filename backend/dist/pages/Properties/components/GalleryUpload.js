import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Card } from "../../../../src/widgets/layouts/Card";
import { Image } from "../../../../src/widgets/elements/Image";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { Text } from "../../../../src/widgets/elements/Text";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { RowBuilder } from "../../../../src/widgets/layouts/RowBuilder";
import { UIHelper } from "../../../Utils/UIHelper";
import { Align } from "../../../../src/widgets/utilities/Align";
import { Stack } from "../../../../src/widgets/layouts/Stack";
import { HttpClient } from "../../../Services/HttpClient";
import { Spinner } from "../../../../src/widgets/feedback/Spinner";
import { CircularProgressIndicator } from "../../../../src/widgets/feedback/CircularProgressIndicator";
import { Position } from "../../../../src/themes/Position";
import { NoImageComponent } from "../../../Components/NoImageComponent";
import { Badge } from "../../../../src/widgets/feedback/Badge";
import { GalleryImageViewer } from "../../../Components/GalleryImageViewer";
import { Themes } from "../../../../src/themes/Themes";

import "../../../assets/styles/gallery-upload.css";

// Constants
const CONSTANTS = {
    MAX_FILE_SIZE: 20 * 1024 * 1024,
    SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],
    ASPECT_RATIO: { CARD: "4/3", MODAL: "16/9" },
    TEMP_ID_PREFIX: "temp_",
};

export class GalleryUpload extends BaseWidget {
    constructor({
        endpoint = null,
        images = [],
        collection = "galleries",
        onImagesChange = null,
        onImageSetAsMain = null,
        onRemoveImage = null,
        hasMainFeature = false,
        additionalData = {},
    } = {}) {
        super();

        if (!endpoint) {
            console.warn("GalleryUpload: endpoint is required for upload functionality");
        }

        this.onImagesChange = onImagesChange;
        this.endpoint = endpoint;
        this.onImageSetAsMain = onImageSetAsMain;
        this.onRemoveImage = onRemoveImage;
        this.hasMainFeature = hasMainFeature;
        this.collection = collection;
        this.additionalData = additionalData;
        this.fileInput = null;
        this.currentLoadingIndicator = null;
        this.imageViewer = null;

        const normalizedImages = this.normalizeImages(images);
        const sortedImages = GalleryUpload.sortWithMainFirst(normalizedImages);

        this.initState({
            images: sortedImages,
            uploadingCount: 0,
            currentImageIndex: 0, // Used to track image in the open viewer
        });
    }

    normalizeImages(images) {
        return images.map(img => ({
            id: img.id,
            url: img.url,
            isMain: Boolean(img.isMain),
            isUploading: false,
            progress: 100,
            error: null,
            fileName: img.fileName || null,
            ...img
        }));
    }

    static sortWithMainFirst(images) {
        return [...images].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    }

    isTempImage(img) {
        return typeof img.id === "string" && img.id.startsWith(CONSTANTS.TEMP_ID_PREFIX);
    }

    generateTempId() {
        return `${CONSTANTS.TEMP_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validateFile(file) {
        if (!file.type.startsWith("image/")) {
            throw new Error("Apenas imagens são permitidas");
        }

        if (!CONSTANTS.SUPPORTED_FORMATS.includes(file.type)) {
            throw new Error(`Formato não suportado: ${file.type}. Use JPEG, PNG ou WebP.`);
        }

        if (file.size > CONSTANTS.MAX_FILE_SIZE) {
            throw new Error(`${file.name} excede o limite de ${CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }

        return true;
    }

    openFilePicker() {
        this.fileInput?.click();
    }

    async handleFiles(files) {
        if (!files.length || !this.endpoint) return;

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            try {
                this.validateFile(file);
                validFiles.push(file);
            } catch (error) {
                errors.push(error.message);
            }
        });

        if (errors.length > 0) {
            UIHelper.showErrorNotification({
                message: `Erros de validação: ${errors.join("; ")}`
            });
        }

        if (validFiles.length === 0) return;

        const tempEntries = validFiles.map(file => ({
            id: this.generateTempId(),
            url: URL.createObjectURL(file),
            file,
            fileName: file.name,
            progress: 0,
            isUploading: true,
            error: null,
            isMain: false
        }));

        this.updateImages(prev => [...prev, ...tempEntries]);
        this.setState(prev => ({ uploadingCount: prev.uploadingCount + validFiles.length }));

        this.showLoadingIndicator(validFiles.length);

        try {
            await this.uploadFilesSequentially(tempEntries);
        } catch (error) {
            console.error("Upload process failed:", error);
        } finally {
            this.hideLoadingIndicator();
            this.setState(prev => ({
                uploadingCount: Math.max(0, prev.uploadingCount - validFiles.length),
            }));
        }
    }

    async uploadFilesSequentially(tempEntries) {
        for (const entry of tempEntries) {
            try {
                const { result } = await HttpClient.instance.upload(
                    this.endpoint,
                    entry.file,
                    {
                        additionalData: this.additionalData,
                        fieldName: "images[]",
                        onProgress: ({ loaded, total }) => {
                            const percent = total ? Math.round((loaded / total) * 100) : 0;
                            this.updateImage(entry.id, { progress: percent });
                        },
                    }
                );

                const uploaded = result[this.collection].images;
                this.replaceTempImage(entry.id, {
                    id: uploaded.id,
                    url: uploaded.url,
                    isUploading: false,
                    progress: 100,
                    error: null,
                    isMain: Boolean(uploaded.isMain),
                });

            } catch (err) {
                const message = err?.response?.message || err.message || "Falha no upload";
                this.updateImage(entry.id, { isUploading: false, error: message });
            } finally {
                if (entry.url) {
                    URL.revokeObjectURL(entry.url);
                }
            }
        }
    }

    showLoadingIndicator(fileCount) {
        this.currentLoadingIndicator = new CircularProgressIndicator({
            message: `Por favor aguarde, carregando ${fileCount} imagem(ns)`,
            dismissable: false,
        });
        this.currentLoadingIndicator.show();
    }

    hideLoadingIndicator() {
        if (this.currentLoadingIndicator) {
            this.currentLoadingIndicator.close();
            this.currentLoadingIndicator = null;
        }
    }

    updateImage(id, updates) {
        this.updateImages(prev =>
            prev.map(img => (img.id === id ? { ...img, ...updates } : img))
        );
    }

    replaceTempImage(tempId, newData) {
        this.updateImages(prev => {
            const index = prev.findIndex(img => img.id === tempId);
            if (index === -1) return prev;

            const updated = [...prev];
            const oldImg = updated[index];

            if (this.isTempImage(oldImg)) {
                URL.revokeObjectURL(oldImg.url);
            }

            updated[index] = {
                ...oldImg,
                ...newData,
                file: undefined
            };

            return GalleryUpload.sortWithMainFirst(updated);
        });
    }

    updateImages(updater) {
        this.setState(prev => {
            const newImages = GalleryUpload.sortWithMainFirst(updater(prev.images));
            this.onImagesChange?.(newImages);
            return { images: newImages };
        });
    }

    async setMainImage(image) {
        if (!image || image.isUploading || !this.onImageSetAsMain) return;

        try {
            await this.onImageSetAsMain(image);
            this.updateImages(prev =>
                prev.map(img => ({
                    ...img,
                    isMain: img.id === image.id,
                }))
            );
        } catch (error) {
            console.error("Failed to set main image:", error);
            UIHelper.showErrorNotification({ message: "Erro ao definir imagem principal" });
        } finally {
            this.imageViewer?.close();
        }
    }

    async removeImage(image) {
        if (!image || image.isUploading || !this.onRemoveImage) return;

        const confirmDialog = UIHelper.showConfirmationDialog({
            title: "Deseja realmente remover a imagem?",
            subtitle: "Esta imagem vai ser removida permanentemente. Por favor confirme antes de remover. Esta ação não pode ser revertida.",
            onConfirm: async () => {
                try {
                    await this.onRemoveImage(image);
                    this.updateImages(prev => prev.filter(img => img.id !== image.id));
                    this.imageViewer?.close();
                } catch (error) {
                    console.error("Failed to remove image:", error);
                    UIHelper.showErrorNotification({ message: "Erro ao remover imagem" });
                } finally {
                    confirmDialog.close();
                }
            },
            onCancel: () => {
                confirmDialog.close();
            }
        });
    }

    renderImageCard(img) {
        const isMainImage = Number(this.hasMainFeature && img.isMain);

        return new Card({
            className: ['gallery-image-card', isMainImage ? 'main-image' : ''],
            bodyStyle: { padding: "0" },
            events: {
                click: () => this.openImageSheet(this.state.images.findIndex(i => i.id === img.id)),
            },
            body: new Stack({
                children: [
                    // Main Badge
                    isMainImage ? new Align({
                        position: Position.absolute.topRight,
                        className: ["gallery-main-badge"],
                        children: [new Badge({ label: "Foto Principal" })]
                    }) : null,

                    // Image
                    new Align({
                        children: [
                            new Image({
                                src: img.url,
                                className: ["gallery-image"],
                                figureStyle: {
                                    height: "100%",
                                    width: "100%"
                                },
                            })
                        ]
                    }),

                    // Overlays
                    img.isUploading && this.renderUploadOverlay(img),
                    img.error && this.renderErrorOverlay(img.error),
                ].filter(Boolean),
            }),
        });
    }

    renderUploadOverlay(img) {
        return new Align({
            position: Position.absolute.topLeft,
            className: ["gallery-overlay", "gallery-upload-overlay"],
            children: [
                new Column({
                    style: { alignItems: "center", justifyContent: "center" },
                    children: [
                        new Spinner({ size: 60 }),
                        new Text({ text: `${img.progress}%`, style: { fontSize: '18px', fontWeight: 'bold' } }),
                    ],
                })
            ]
        });
    }

    renderErrorOverlay(error) {
        return new Align({
            position: Position.absolute.topLeft,
            className: ["gallery-overlay", "gallery-error-overlay"],
            children: [
                new Column({
                    style: { alignItems: "center", justifyContent: "center" },
                    children: [new Text({ text: error, style: { fontWeight: '500' } })],
                })
            ]
        });
    }

    openImageSheet(initialIndex) {
        this.setState({ currentImageIndex: initialIndex });

        this.imageViewer = new GalleryImageViewer({
            images: this.state.images,
            initialIndex,
            showMainBadge: this.hasMainFeature,
            onNavigate: index => {
                this.setState({ currentImageIndex: index });
            },
            actions: [
                this.hasMainFeature && {
                    label: "Definir como Principal",
                    icon: "fa fa-star",
                    onPress: (image) => this.setMainImage(image),
                    isVisible: (image) => !Number(image.isMain),
                },
                {
                    label: "Remover",
                    theme: Themes.button.type.danger,
                    icon: "fa fa-trash",
                    isDestructive: true,
                    onPress: (image) => this.removeImage(image),
                }
            ].filter(Boolean),
            onClose: () => {
                this.imageViewer = null;
            }
        });

        this.imageViewer.open();
    }

    renderFileInput() {
        return new BaseWidget({
            tagName: "input",
            props: {
                type: "file",
                multiple: true,
                accept: "image/*",
                hidden: true
            },
            events: {
                change: e => {
                    if (e.target.files?.length) {
                        this.handleFiles(e.target.files);
                        e.target.value = "";
                    }
                },
            },
            onAttached: el => (this.fileInput = el),
        });
    }

    renderUploadButton() {
        return new Builder({
            watch: () => {
                const { uploadingCount } = this.state;
                const maxMB = CONSTANTS.MAX_FILE_SIZE / 1024 / 1024;
                const label = uploadingCount ? `Carregando ${uploadingCount}...` : "Adicionar Fotos";
                const icon = uploadingCount ? "fa fa-spinner fa-spin" : "fa fa-plus";

                return new Column({
                    style: { width: "100%", alignItems: "center", gap: "12px" },
                    children: [
                        new Button({
                            label: label,
                            prefixIcon: new Icon({ icon: icon }),
                            disabled: !!uploadingCount || !this.endpoint,
                            style: { width: "100%" },
                            onPressed: () => this.openFilePicker(),
                        }),
                        new Text({
                            text: `Formatos: JPEG, PNG, WebP • Máximo: ${maxMB}MB`,
                            style: {
                                fontSize: "13px",
                                color: "#6c757d",
                                textAlign: "center",
                                lineHeight: "1.4"
                            }
                        })
                    ]
                });
            }
        });
    }

    renderGalleryGrid() {
        return new Builder({
            className: ["gallery-upload-container"],
            watch: () => {
                const { images } = this.state;

                if (!images.length) {
                    return new NoImageComponent();
                }

                return new RowBuilder({
                    count: images.length,
                    breakpoints: { lg: 3, md: 4, sm: 6 },
                    gap: "8px",
                    builder: i => this.renderImageCard(images[i]),
                });
            },
        });
    }

    render() {
        this.children = [
            new Column({
                className: ["gallery-upload-wrapper"],
                children: [
                    this.renderFileInput(),
                    new Row({
                        children: [
                            new Expand({
                                breakpoints: { lg: 8 },
                                style: { margin: "auto" },
                                children: [this.renderUploadButton()],
                            }),
                        ],
                    }),
                    this.renderGalleryGrid(),
                ],
            })
        ]
        return super.render();
    }

    detach() {
        // Revoke URLs for any remaining temporary images
        this.state.images.forEach(img => {
            if (this.isTempImage(img)) {
                URL.revokeObjectURL(img.url);
            }
        });

        this.imageViewer?.close();
        this.hideLoadingIndicator();

        super.detach();
    }
}