import { BaseWidget } from "../../src/core/BaseWidget";
import { Builder } from "../../src/widgets/builders/Builder";
import { Image } from "../../src/widgets/elements/Image";
import { Text } from "../../src/widgets/elements/Text";
import { Container } from "../../src/widgets/layouts/Container";
import { RowBuilder } from "../../src/widgets/layouts/RowBuilder";
import { Expand } from "../../src/widgets/layouts/Expand";
import { Row } from "../../src/widgets/layouts/Row";
import { Column } from "../../src/widgets/layouts/Column";
import { APIEndpoints } from "../Services/APIEndpoints"
import "../assets/styles/uploader-component.css";
import { UIHelper } from "../Utils/UIHelper";

export class UploaderComponent extends BaseWidget {
    constructor({
        showMainImage = true
    } = {}) {
        super();

        // Endpoint de upload PHP
        this.uploadEndpoint = "properties/images/upload"; // Ajustar o caminho conforme necessário
        this.showMainImage = showMainImage;

        // Inicializar estado
        this.initState({
            mainImage: null,
            images: [],
            uploadProgress: {},
        });
    }

    render() {
        this.children = [
            new Column({
                className: ["gallery-container"],
                gap: "10px",
                children: [
                    new Container({
                        className: ["gallery-header"],
                        children: [
                            new Text({
                                className: ["gallery-subtitle"],
                                text: "Selecione uma imagem principal e adicione imagens à galeria (máx. 50MB cada, PNG, JPG, JPEG, GIF)"
                            })
                        ]
                    }),
                    new Container({
                        className: ["gallery-content"],
                        children: [this.createGalleryContainer()]
                    }),
                    this.createGalleryView(),
                ]
            })
        ];
        return super.render();
    }

    // --- 1. Métodos de UI / Render ---

    /**
     * Cria o container principal da galeria que contém a área de upload e a pré-visualização da imagem principal.
     */
    createGalleryContainer = () => {
        return new Row({
            children: [
                this.createUploadDropzone(),
                this.showMainImage ? this.createMainImageViewer() : null
            ].filter(Boolean)
        });
    }

    /**
     * Cria o input de ficheiro e a área de arrastar e largar para upload.
     */
    createUploadDropzone = () => {
        return new Expand({
            breakpoints: { lg: 8 },
            children: [
                new BaseWidget({
                    tagName: "input",
                    props: {
                        type: "file",
                        hidden: true,
                        multiple: true,
                        accept: "image/png,image/jpeg,image/jpg,image/gif"
                    },
                    events: {
                        change: (e) => this.handleFiles(this._inputFileUploaderElement.files)
                    },
                    onAttached: (el) => {
                        this._inputFileUploaderElement = el;
                    }
                }),
                new Container({
                    className: ["gallery-upload-area"],
                    children: [
                        new Image({
                            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='16' fill='url(%23gradient)'/%3E%3Cpath d='M32 20V44M20 32H44' stroke='white' stroke-width='3' stroke-linecap='round'/%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0' y1='0' x2='64' y2='64'%3E%3Cstop offset='0%25' stop-color='%235c6ac4'/%3E%3Cstop offset='100%25' stop-color='%23a855f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E",
                            style: { width: "64px", height: "64px", margin: "0 auto 16px" }
                        }),
                        new Text({ text: "Arraste e Largue Imagens Aqui" }),
                        new Text({
                            text: "ou procure imagens no seu dispositivo",
                            style: { fontSize: "14px", color: "#6b7280" }
                        }),
                        new Builder({
                            watch: () => {
                                const progressKeys = Object.keys(this.state.uploadProgress);
                                return new Column({
                                    className: ["progress-list"],
                                    gap: "8px",
                                    children: progressKeys.map(key =>
                                        this.createProgressBar(key, this.state.uploadProgress[key].name)
                                    )
                                });
                            }
                        })
                    ],
                    events: {
                        click: () => this._inputFileUploaderElement.click(),
                        dragenter: this.handleDragEvents,
                        dragover: this.handleDragEvents,
                        dragleave: this.handleDragEvents,
                        drop: this.handleDrop
                    },
                    onAttached: (el) => {
                        this.galleryUploadAreaElement = el;
                    }
                })
            ]
        });
    }

    /**
     * Cria a área de pré-visualização para a "Imagem Principal" selecionada.
     */
    createMainImageViewer = () => {
        return new Expand({
            breakpoints: { lg: 4 },
            children: [
                new Container({
                    className: ["main-image-container", this.state.mainImage ? "has-image" : ""],
                    children: [
                        new Builder({
                            style: { height: "100%" },
                            watch: () => this.createMainImageDisplay()
                        }),
                        new Container({
                            className: ["main-image-label"],
                            children: [new Text({ text: "Imagem Principal" })],
                            style: {
                                display: this.state.mainImage ? "block" : "none"
                            }
                        })
                    ]
                })
            ]
        });
    }

    /**
     * Retorna o widget apropriado para a exibição da imagem principal (placeholder ou imagem).
     */
    createMainImageDisplay = () => {
        const { mainImage } = this.state;

        if (!mainImage) {
            return new Container({
                className: ["gallery-main-image-placeholder"],
                children: [
                    new Text({ text: "Nenhuma imagem principal selecionada" }),
                    new Text({
                        text: "Selecione uma imagem da galeria",
                        style: { fontSize: "12px", color: "#6b7280" }
                    })
                ]
            });
        }

        return new Image({
            src: mainImage.url,
            style: {
                height: "100%",
                width: "100%",
                objectFit: "cover"
            },
            figureStyle: {
                height: "100%"
            }
        });
    }

    /**
     * Cria a vista em miniatura da galeria com todas as imagens carregadas.
     */
    createGalleryView = () => {
        return new Container({
            className: ["gallery-view-container"],
            children: [
                new Builder({
                    watch: () => {
                        const items = this.state.images;
                        return new RowBuilder({
                            tag: "section",
                            className: ["gallery-images"],
                            count: items.length,
                            stretch: true,
                            breakpoints: { lg: 2 },
                            builder: (index) => {
                                const imageData = items[index];
                                return new Container({
                                    className: ["gallery-image", imageData.id === this.state.mainImage?.id ? "selected" : ""],
                                    children: [
                                        new Image({
                                            src: imageData.url,
                                            style: { aspectRatio: "1/1", width: "100%", objectFit: "cover" }
                                        }),
                                        new Container({
                                            className: ["gallery-image-actions"],
                                            children: [
                                                new BaseWidget({
                                                    tagName: "button",
                                                    className: ["gallery-image-btn", "set-main-btn"],
                                                    children: [new Text({ text: "★" })],
                                                    events: {
                                                        click: (e) => {
                                                            e.stopPropagation();
                                                            this.setState({ mainImage: imageData });
                                                        }
                                                    }
                                                }),
                                                new BaseWidget({
                                                    tagName: "button",
                                                    className: ["gallery-image-btn", "remove-btn"],
                                                    children: [new Text({ text: "×" })],
                                                    events: {
                                                        click: (e) => {
                                                            e.stopPropagation();
                                                            this.removeImage(imageData.id);
                                                        }
                                                    }
                                                })
                                            ]
                                        })
                                    ],
                                    events: {
                                        click: () => this.setState({ mainImage: imageData })
                                    }
                                });
                            }
                        });
                    }
                })
            ]
        });
    }

    /**
     * Cria a barra de progresso para um upload de ficheiro individual.
     */
    createProgressBar = (fileId, fileName) => {
        return new Builder({
            watch: () => {
                const progress = this.state.uploadProgress[fileId]?.progress || 0;
                return new Container({
                    className: ["progress-container"],
                    children: [
                        new Text({
                            text: `A carregar ${fileName}`,
                            style: { fontSize: "14px", color: "#1a1d2e" }
                        }),
                        new Container({
                            className: ["progress-bar"],
                            style: {
                                width: "100%",
                                height: "8px",
                                background: "#e5e7eb",
                                borderRadius: "4px",
                                overflow: "hidden"
                            },
                            children: [
                                new Container({
                                    className: ["progress-bar-fill"],
                                    style: {
                                        width: `${progress}%`,
                                        height: "100%",
                                        background: "linear-gradient(45deg, #5c6ac4, #a855f7)",
                                        transition: "width 0.3s ease"
                                    }
                                })
                            ]
                        })
                    ]
                });
            }
        });
    }


    // --- 2. Métodos de Estado e Lógica ---

    /**
     * Adiciona uma nova imagem carregada ao estado da galeria.
     */
    addImageToGallery = (imageData) => {
        this.setState(prev => {
            const newImages = [...prev.images, imageData];
            // Define a primeira imagem carregada como principal, se nenhuma imagem principal estiver definida.
            const newMainImage = prev.mainImage || (newImages.length === 1 ? imageData : prev.mainImage);

            return {
                images: newImages,
                mainImage: newMainImage
            };
        });
    }

    /**
     * Remove uma imagem da galeria pelo seu ID.
     * Se a imagem removida era a imagem principal, seleciona uma nova imagem principal.
     */
    removeImage = (id) => {
        this.setState(prev => {
            const imageToRemove = prev.images.find(img => img.id === id);
            if (!imageToRemove) return prev; // Imagem já removida

            // Dispara eliminação no servidor (fire-and-forget)
            if (imageToRemove.serverPath) {
                this.deleteImageFromServer(imageToRemove.serverPath);
            }

            const newImages = prev.images.filter(img => img.id !== id);
            let newMainImage = prev.mainImage;

            // Se removemos a imagem principal, escolhemos uma nova
            if (prev.mainImage?.id === id) {
                newMainImage = newImages.length > 0 ? newImages[0] : null;
            }

            return {
                images: newImages,
                mainImage: newMainImage
            };
        });
    }

    /**
     * Processa eventos de arrastar e largar para fornecer feedback visual.
     */
    handleDragEvents = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            this.galleryUploadAreaElement.classList.add("dragover");
        } else if (e.type === "dragleave" || e.type === "drop") {
            this.galleryUploadAreaElement.classList.remove("dragover");
        }
    }

    /**
     * Processa o evento 'drop', passando os ficheiros para handleFiles.
     */
    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }

    /**
     * Valida e inicia o processo de upload para os ficheiros selecionados.
     */
    handleFiles = async (newFiles) => {
        const validFiles = [...newFiles].filter(file => {
            if (!file.type.startsWith('image/')) {
                UIHelper.showErrorNotification({ message: `Apenas são permitidos ficheiros de imagem (PNG, JPG, JPEG, GIF)` });
                return false;
            }
            if (file.size > 50 * 1024 * 1024) { // Limite de 50MB
                UIHelper.showErrorNotification({ message: `O ficheiro ${file.name} excede o limite de 50MB` });
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        UIHelper.showInfoNotification({ message: `A carregar ${validFiles.length} ficheiro(s)...` });

        // Carrega ficheiros em paralelo e espera que todos terminem
        const uploadPromises = validFiles.map(file =>
            this.uploadFile(file).catch(error => {
                // Os erros já são tratados em uploadFile, mas capturamos
                // aqui para que uma falha não pare o Promise.allSettled
                console.error(`Upload falhado para ${file.name}:`, error.message);
                return null;
            })
        );

        await Promise.allSettled(uploadPromises);

        // Nota: O feedback individual de sucesso/erro é mostrado dentro de uploadFile
    }

    // --- 4. Comunicação com o Servidor ---

    /**
     * Carrega um único ficheiro usando XMLHttpRequest para acompanhar o progresso.
     * Retorna uma Promise que resolve com os dados da imagem ou rejeita com um erro.
     */
    uploadFile = (file) => {
        const fileId = Date.now() + Math.random();

        // Inicializar progresso
        this.setState(prev => ({
            uploadProgress: {
                ...prev.uploadProgress,
                [fileId]: { progress: 0, name: file.name }
            }
        }));

        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('images[]', file);
            const xhr = new XMLHttpRequest();

            // Helper para remover a barra de progresso
            const finishProgress = () => {
                this.setState(prev => {
                    const { [fileId]: _, ...rest } = prev.uploadProgress;
                    return { uploadProgress: rest };
                });
            };

            // Acompanhar progresso do upload
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    this.setState(prev => ({
                        uploadProgress: {
                            ...prev.uploadProgress,
                            [fileId]: { ...prev.uploadProgress[fileId], progress }
                        }
                    }));
                }
            });

            // Processar resposta
            xhr.addEventListener('load', () => {
                finishProgress();
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            const uploadedImage = response.images[0];
                            this.addImageToGallery(uploadedImage);
                            UIHelper.showSuccessNotification({ message: `${file.name} carregado com sucesso` })
                            resolve(uploadedImage);
                        } else {
                            UIHelper.showErrorNotification({ message: `Falha no carregamento de ${file.name}: ${response.message}` })
                            reject(new Error(response.message));
                        }
                    } catch (e) {
                        UIHelper.showErrorNotification({ message: `Falha no carregamento de ${file.name}: Resposta do servidor inválida` })
                        reject(new Error('Resposta do servidor inválida'));
                    }
                } else {
                    UIHelper.showErrorNotification({ message: `Falha no carregamento de ${file.name}: Erro do servidor ${xhr.status}` })
                    reject(new Error(`Erro do servidor ${xhr.status}`));
                }
            });

            // Processar erros
            xhr.addEventListener('error', () => {
                finishProgress();
                UIHelper.showErrorNotification({ message: `Falha no carregamento de ${file.name}: Erro de rede` })
                reject(new Error('Erro de rede'));
            });

            xhr.open('POST', `${APIEndpoints.API_ENV}${this.uploadEndpoint}`);
            xhr.send(formData);
        });
    }

    /**
     * Envia um pedido ao servidor para eliminar um ficheiro de imagem específico.
     */
    deleteImageFromServer = async (serverPath) => {
        try {
            const response = await fetch('/delete-image.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filePath: serverPath })
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Falha ao eliminar imagem do servidor:', result.message);
                // Opcionalmente mostrar feedback, mas o console error é geralmente suficiente para uma tarefa em segundo plano
            }
        } catch (error) {
            console.error('Erro ao eliminar imagem do servidor:', error);
        }
    }
}