import { BaseWidget } from "../../../src/core/BaseWidget";
import { Column } from "../../../src/widgets/layouts/Column";
import { Row } from "../../../src/widgets/layouts/Row";
import { Expand } from "../../../src/widgets/layouts/Expand";
import { Card } from "../../../src/widgets/layouts/Card";
import { Builder } from "../../../src/widgets/builders/Builder";
import { Form } from "../../../src/widgets/forms/Form";
import { ContentHeaderComponent } from "../../Components/ContentHeaderComponent";
import { PropertyService } from "../../Services/PropertyService";
import { UIHelper } from "../../Utils/UIHelper";
import { STEPS } from "../../Constants/PropertyRegistrationStepper";
import { GalleryUpload } from "./components/GalleryUpload";
import { AIDescriptionGenerator } from "../../Services/AIDescriptionGenerator";
import { PropertyDetailsForm } from "./components/PropertyDetailsForm";
import { AddressForm } from "./components/AddressForm";
import { FeaturesSelector } from "./components/FeaturesSelector";
import { PublishOptions } from "./components/PublishOptions";
import { StepperSidebar } from "./components/StepperSidebar";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Container } from "../../../src/widgets/layouts/Container";
import { Text } from "../../../src/widgets/elements/Text";
import { App } from "../../../src/core/App";
import { FormController } from "../../../src/widgets/forms/FormController";
import { PropertyStatus } from "./components/PropertyStatus";

export class Save extends BaseWidget {
    constructor({ args }) {
        super();
        this.propertyId = args?.propertyId;
        this.formData = {};
        this.uploadedImages = [];
        this.uploadedAssets = [];
        this.controller = new FormController();

        this.initState({
            currentActiveStep: 0,
            isLoading: true,
            activeStepLabel: STEPS[0]
        });
    }

    async mounted() {
        try {
            if (this.propertyId) {
                const { result } = await PropertyService.getProperty(this.propertyId);

                const response = result.data[0];
                const features = response.features.map(f => f.feature_id)

                this.formData = { ...result.data[0], features };

                this.uploadedImages = (this.formData.galleries || []).map(img => ({
                    id: img.id, url: img.url, isMain: img.isMain, fileName: img.original_name || "Imagem"
                }));

                this.uploadedAssets = (this.formData.assets || []).map(img => ({
                    id: img.id, url: img.url, isMain: img.isMain, fileName: img.original_name || "Imagem"
                }));
            }
        } catch (err) {
            UIHelper.showErrorNotification({
                message: "Erro ao carregar imóvel"
            });

            console.log(err)
        } finally {
            this.setState({ isLoading: false });
        }
    }

    getCurrentComponent() {
        const step = this.state.currentActiveStep;
        const props = {
            formData: this.formData, onChange: (key, val) => {
                this.formData[key] = val;
            }
        };

        switch (step) {
            case 0: return new PropertyDetailsForm({
                ...props,
                onAIGenerate: async () => {
                    const response = await AIDescriptionGenerator.generateDescription({
                        formData: this.formData
                    });

                    if (response) {
                        this.controller.setFieldValue("description", response)
                    }
                }
            }).createInputs();
            case 1: return new AddressForm(props).createInputs();
            case 2: return new FeaturesSelector({ selected: this.formData.features || [], onChange: f => this.formData.features = f }).createInputs();
            case 3:
                return new GalleryUpload({
                    endpoint: `property/images/upload`,
                    additionalData: { property_id: this.propertyId },
                    images: this.uploadedImages,
                    onImagesChange: (imgs) => {
                        this.uploadedImages = imgs;
                    },
                    onImageSetAsMain: async (image) => {
                        try {
                            await PropertyService.setAsMainImage(image);
                        } catch (err) {
                            throw new Error(err);
                        }
                    },
                    onRemoveImage: async (image) => {
                        try {
                            await PropertyService.removePropertyPhoto(image);
                            this.uploadedImages = this.uploadedImages.filter(img => img.id !== image.id);
                        } catch (err) {
                            UIHelper.showErrorNotification({ message: "Erro ao remover imagem" });
                        }
                    },
                    hasMainFeature: true,
                });

            case 4:
                return new GalleryUpload({
                    endpoint: `property/assets/upload`,
                    additionalData: { property_id: this.propertyId },
                    images: this.uploadedAssets,
                    collection: "assets",
                    onImagesChange: (assets) => {
                        this.uploadedAssets = assets;
                    },
                    onRemoveImage: async (image) => {
                        try {
                            await PropertyService.removeAsset(image);
                            this.uploadedImages = this.uploadedImages.filter(img => img.id !== image.id);
                        } catch (err) {
                            UIHelper.showErrorNotification({ message: "Erro ao remover imagem" });
                        }
                    },
                });
            case 5: return new PropertyStatus({ ...props });
            case 6: return new PublishOptions({ formData: this.formData });
            default: return new Container();
        }
    }
    //Arrende-se Luxuoso Lounge T10 na Sommerschield 2 |  
    render() {
        this.children = [
            new Column({
                children: [
                    new ContentHeaderComponent({
                        title: "Actualizar Imóvel",
                        subtitle: "Altere e mantenha as informações do imóvel actualizadas",
                        onBack: () => App.instance.back()
                    }),

                    new Row({
                        children: [
                            new Expand({
                                breakpoints: { lg: 3 }, children: [
                                    new Builder({
                                        watch: () => {
                                            return new StepperSidebar({
                                                activeStep: this.state.currentActiveStep,
                                                onStepChange: step => this.setState({
                                                    currentActiveStep: step,
                                                    activeStepLabel: STEPS[step]
                                                })
                                            })
                                        }
                                    })
                                ]
                            }),

                            new Expand({
                                breakpoints: { lg: 9 }, children: [
                                    new Card({
                                        style: {
                                            border: "none",
                                        },
                                        bodyStyle: {
                                            padding: "0"
                                        },
                                        header: new Builder({
                                            watch: () => {
                                                const step = this.state.activeStepLabel;
                                                return new Row({
                                                    children: [
                                                        new Icon({ icon: step.leading }),
                                                        new Text({ text: step.title })
                                                    ]
                                                })
                                            }
                                        }),
                                        body: new Builder({
                                            watch: () => this.state.isLoading
                                                ? UIHelper.createLoadingSpinner()
                                                : new Form({
                                                    style: {
                                                        padding: "1rem"
                                                    },
                                                    controller: this.controller,
                                                    children: [
                                                        this.getCurrentComponent()
                                                    ]
                                                })
                                        }),
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
        return super.render();
    }
}