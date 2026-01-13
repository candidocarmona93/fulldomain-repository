import { Row } from "../../../src/widgets/layouts/Row";
import { Column } from "../../../src/widgets/layouts/Column";
import { BaseWidget } from "../../../src/core/BaseWidget";
import { FutureBuilder } from "../../../src/widgets/builders/FutureBuilder";
import { PropertyService } from "../../Services/PropertyService";
import { ContentHeaderComponent } from "../../Components/ContentHeaderComponent";
import { Expand } from "../../../src/widgets/layouts/Expand";
import { OffCanvas } from "../../../src/widgets/overlays/OffCanvas";
import { UIHelper } from "../../Utils/UIHelper";

// Services
import { VisitService } from "../../Services/VisitService";
import { PropertyUtils } from "../../Utils/PropertyUtils";

// Components
import { ScheduleVisitForm } from "../Activities/Visits/Components/ScheduleVisitForm";
import { PropertyOverviewCard } from "./Components/PropertyOverviewCard";
import { PropertyPriceCard } from "./Components/PropertyPriceCard";
import { PropertyOwnerCard } from "./Components/PropertyOwnerCard";
import { PropertyFeaturesCard } from "./Components/PropertyFeaturesCard";
import { PropertyLocationSection } from "./Components/PropertyLocationSection";
import { PropertyVisitCard } from "./components/PropertyVisitCard";
import { PropertyActionButtons } from "./Components/PropertyActionButtons";
import { Builder } from "../../../src/widgets/builders/Builder";
import { App } from "../../../src/core/App";
import { PropertyGallerySection } from "./components/PropertyGallerySection";
import { AuthService } from "../../Services/AuthService";
import { FutureBuilderController } from "../../../src/widgets/builders/FutureBuilderController";
import { MenuContext } from "../../Components/MenuContext";
import { VISIT_MENU } from "../../Constants/Menu";
import { CircularProgressIndicator } from "../../../src/widgets/feedback/CircularProgressIndicator";

export class Show extends BaseWidget {
    constructor({ args }) {
        super();
        this.propertyId = args.propertyId;
        this.property = null;
        this.futureBuilderController = new FutureBuilderController();

        this.initState({
            visits: [],
        });
    }

    _createPage() {
        return new Row({
            children: [
                new Expand({
                    breakpoints: { lg: 8 },
                    children: [
                        new Column({
                            style: { justifyContent: "start" },
                            children: [
                                new PropertyOverviewCard({ property: this.property }),
                                new PropertyLocationSection({ property: this.property })
                            ]
                        })
                    ]
                }),
                new Expand({
                    breakpoints: { lg: 4 },
                    children: [
                        new Column({
                            style: {
                                width: "100%"
                            },
                            children: [
                                new PropertyPriceCard({ property: this.property }),
                                new PropertyFeaturesCard({ property: this.property }),
                                new PropertyOwnerCard({ property: this.property }),
                                new PropertyVisitCard({ property: this.property, controller: this.futureBuilderController }),
                                new PropertyActionButtons({
                                    onScheduleVisit: async () => {
                                        await this._createVisit();
                                    },
                                    onShareProperty: () => this._shareProperty()
                                }),
                            ]
                        })
                    ]
                }),
            ]
        });
    }

    openVisitProfile(visit) {
        this.selectedVisitId = visit.id;

        this.visitProfileOffCanvas = new OffCanvas({
            style: {
                width: "100vw",
                alignItems: "start"
            },
            content: [
                this.visitsComponents.createVisitProfileView(visit, {
                    showHeader: true,
                    showHistory: true,
                    showAddNote: true,
                    showPriority: true,
                    showMeetingPoint: true,
                    showContactPhone: true,
                    showNotes: true
                })
            ]
        });
        this.visitProfileOffCanvas?.show();
    }


    _createHeader() {
        return new ContentHeaderComponent({
            title: "Detalhes do Imóvel",
            subtitle: "Informações completas sobre a propriedade",
            onBack: () => App.instance.back()
        });
    }

    async _createVisit() {
        const loading = new CircularProgressIndicator();

        try {
            loading?.show();

            const { result, status } = await VisitService.createVisit();
            if (status !== 200 || result.status === "error") {
                return UIHelper.showErrorNotification({ message: "Ocorreu um erro ao criar uma nova visita", });
            }

            await this._scheduleVisit({ initialValues: result.data[0] });
        } catch (error) {
            console.log(error);
            UIHelper.showErrorNotification({ message: "Ocorreu um erro ao criar uma nova visita", });
        } finally {
            loading?.close();
        }
    }

    async _scheduleVisit() {
        const scheduleVisitForm = new ScheduleVisitForm({
            property: this.property,
            onScheduleVisit: async (visitData) => {
                try {
                    const creator = AuthService.getCurrentUser();
                    await VisitService.saveVisit({ ...visitData, created_by: creator.id });
                    this.futureBuilderController.reload();
                } catch (error) {
                    UIHelper.showErrorNotification({
                        message: "Ocorreu um erro ao salvar Visita",
                    });
                } finally {
                    this.scheduleVisitOffcanvas?.close();
                }
            },
            onClose: () => {
                this.scheduleVisitOffcanvas?.close();
            }
        });

        this.scheduleVisitOffcanvas = new OffCanvas({
            content: [scheduleVisitForm.create()]
        });

        this.scheduleVisitOffcanvas?.show();
    }

    _shareProperty() {
        const message = PropertyUtils.shareProperty(this.property);
        if (message) {
            UIHelper.showInfoNotification({ message });
        }
    }

    render() {
        this.children = [
            new Column({
                style: { padding: "0 1rem" },
                children: [
                    this._createHeader(),
                    new FutureBuilder({
                        future: () => PropertyService.getProperty(this.propertyId),
                        builder: ({ result }) => {
                            this.property = result.data[0];
                            return this._createPage();
                        },
                        onLoading: () => UIHelper.createLoadingSpinner()
                    })
                ]
            })
        ];
        return super.render();
    }
}