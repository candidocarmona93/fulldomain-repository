import { App } from "../../../../src/core/App";
import { Column } from "../../../../src/widgets/layouts/Column";
import { FormElements } from "../../../Components/FormElements";
import { UIHelper } from "../../../Utils/UIHelper";
import { ADD_OR_UPDATE_PAGE_TYPES, BaseEntityHomePage } from "../../BaseEntityHomePage";
import { SharedUtils } from "../../SharedUtils";
import { ActiveFiltersDisplay } from "../../../Components/ActiveFiltersDisplay";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { VISIT_FILTER_FIELDS } from "../../../Constants/Filters";
import { OffCanvas } from "../../../../src/widgets/overlays/OffCanvas";
import { HeaderTitleComponent } from "../../../Components/HeaderTitleComponent";
import { ScheduleVisitForm } from "./Components/ScheduleVisitForm";
import { VisitService } from "../../../Services/VisitService";
import { AuthService } from "../../../Services/AuthService";
import { CheckBoxInput } from "../../../../src/widgets/forms/CheckBoxInput";
import { Container } from "../../../../src/widgets/layouts/Container";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { VisitsSharedComponents } from "../../../Components/VisitsSharedComponents";
import { MenuContext } from "../../../Components/MenuContext";
import { VISIT_MENU } from "../../../Constants/Menu";
import { CircularProgressIndicator } from "../../../../src/widgets/feedback/CircularProgressIndicator";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Visitas",
            endpoint: "/visits",
            dataMapper: ({ visits }) => visits,
            handleAddOrUpdatePageType: ADD_OR_UPDATE_PAGE_TYPES.NEW_PAGE,
            onBack: () => App.instance.back(),
            onFilter: () => {
                this.createOnFilterInputs()
            },
            displayType: "grid",
            downloadEndpoint: "/visits/download",
            downloadLabel: "visitas"
        });

        this.formElements = new FormElements();
        this.calendarRef = null;
        this.selectedVisitId = null;
        this.notes = "";

        this.visitsComponents = new VisitsSharedComponents({
            onTypingNote: (val) => {
                this.notes = val;
            },
            onAddNote: async () => {
                await this._addVisitNotes();
            }
        });
    }

    async toNewPage() {
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

    createOnFilterInputs() {
        this.filtersOffCanvas = new OffCanvas({
            content: new Column({
                style: {
                    overflowY: "auto",
                    height: "100%",
                    padding: "1rem"
                },
                children: [
                    new HeaderTitleComponent({
                        text: "Filtros"
                    }),
                    ...SharedUtils.createFilterInputs(
                        this.formElements,
                        this.controller,
                        VISIT_FILTER_FIELDS,
                        () => this._applyFilters(),
                        () => this._clearFilters(),
                        this.formData
                    )
                ]
            })
        });

        this.filtersOffCanvas.show();
    }

    createFilterInputs() {
        return [
            new Builder({
                watch: () => {
                    const tags = this.state.tags;

                    return new ActiveFiltersDisplay({
                        tags,
                        onRemoveTag: (label, key) => {
                            this.formData = this.formElements.getFormData();
                            delete this.formData[key];
                            this.formElements.removeFormDataKey?.[key];

                            this.setState(prev => ({
                                tags: Object.fromEntries(Object.entries(prev.tags || {}).filter(([k]) => k !== label))
                            }));

                            this.refreshData();
                        },
                        onClearAll: () => {
                            this._clearFilters();
                            this.setState({ tags: {} });
                        },
                        emptyMessage: "Nenhum filtro aplicado"
                    }).create()
                }
            }),
            new CheckBoxInput({
                label: "Mostrar no modo calendario",
                onChange: (val) => {
                    this.setState(() => {
                        return {
                            calendarMode: Boolean(val),
                        }
                    });

                    if (!Boolean(val) && this.calendarRef) {
                        this.calendarRef.destroy();
                        this.calendarRef = null;
                    }
                }
            })
        ]
    }

    _showTagRemovedFeedback(label) {
        UIHelper.showInfoNotification({ message: `Filtro "${label}" removido` });
    }

    createGridItem(visits) {
        return this.state.calendarMode
            ? this.createCalendar(visits)
            : this.visitsComponents.createVisitCard(visits, {
                compactMode: false,
                onClick: (visit) => {
                    this.openMenuContext(visit);
                }
            });
    }

    openMenuContext(visit) {
        this.menuContext = new MenuContext({
            items: VISIT_MENU({
                view: {
                    onTap: () => {
                        this.openVisitProfile(visit);
                        this.menuContext?.close();
                    }
                },
                edit: {
                    onTap: async () => {
                        await this._scheduleVisit({
                            initialValues: visit
                        });
                        this.menuContext?.close();
                    }
                },
                remove: {
                    onTap: () => {
                        const removeBottomSheet = UIHelper.showConfirmationDialog({
                            title: "Deseja realmente remover esse registo?",
                            subtitle: "Esta ação é irreversível. Toda informação relacionado com este registo vai ser removido do sistema permanentemente, confirme antes de continuar.",
                            confirmText: "Sim, remover",
                            cancelText: "Cancelar",
                            onConfirm: async () => {
                                await VisitService.removeVisit(visit.id);
                                this.refreshData();
                                removeBottomSheet?.close();
                                this.menuContext?.close();
                            },
                            onCancel: () => {
                                removeBottomSheet?.close();
                            }
                        });
                    }
                }
            })
        });
        this.menuContext.show();
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

    mapVisitsToEvents(visits = []) {
        if (!visits || !Array.isArray(visits)) return [];

        return visits.map(visit => {
            return {
                id: visit.id,
                title: `${visit.properties?.title || 'Sem imóvel definido'} - ${visit.clients?.name || 'N/A'}`,
                start: visit.scheduled_date,
                end: visit.scheduled_date,
                allDay: false,
                extendedProps: {
                    visitData: visit
                },
                backgroundColor: this.getEventColor(visit.status),
                borderColor: this.getEventColor(visit.status),
                textColor: '#ffffff'
            };
        });
    }

    getEventColor(status) {
        const colors = {
            'scheduled': '#3498db',
            'confirmed': '#2ecc71',
            'cancelled': '#e74c3c',
            'completed': '#9b59b6',
            'default': '#95a5a6'
        };
        return colors[status] || colors.default;
    }

    createCalendar(visits) {
        return new Container({
            style: {
                minHeight: "500px",
                position: "relative",
            },
            onAttached: (el) => {
                if (this.calendarRef) {
                    this.calendarRef.destroy();
                }

                const events = this.mapVisitsToEvents(visits);

                this.calendarRef = new Calendar(el, {
                    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                    initialView: 'dayGridMonth',
                    locale: ptBrLocale,
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    },
                    events: events,
                    eventClick: (info) => {
                        const visitData = info.event.extendedProps.visitData;
                        if (visitData && visitData.id) {
                            this.openMenuContext(visitData);
                        }
                    },
                    eventDisplay: 'block',
                    editable: false,
                    selectable: false,
                    height: 'auto',
                    contentHeight: 'auto'
                });

                requestAnimationFrame(() => {
                    this.calendarRef.render();
                })
            },
        });
    }

    async _scheduleVisit({ initialValues }) {
        const scheduleVisitForm = new ScheduleVisitForm({
            initialValues,
            onScheduleVisit: async (visitData) => {
                try {
                    const creator = AuthService.getCurrentUser();
                    await VisitService.saveVisit({ ...visitData, created_by: creator.id });

                    this.refreshData();
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

    async _addVisitNotes() {
        try {
            const creator = AuthService.getCurrentUser();
            await VisitService.addNotes({
                visit_id: this.selectedVisitId,
                action: "Adicionou uma nova nota",
                description: this.notes,
                created_by: creator.id
            });
        } catch (error) {
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao salvar notas",
            });
        } finally {
            this.scheduleVisitOffcanvas?.close();
        }
    }

    _renderAvatarBadgeCell(data, small = false) {
        const name = data?.name || 'NA';
        return SharedUtils.createAvatarBadge(name, {
            emptyName: 'NA',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
            size: small ? 'small' : 'medium',
            style: small ? {
                width: '24px',
                height: '24px',
                fontSize: '0.6rem'
            } : undefined
        });
    }

    _applyFilters() {
        this.formData = this.formElements.getFormData();
        this.refreshData();
        this.filtersOffCanvas?.close();

        this.setState(prev => {
            const newTags = { ...this.formElements.getSearchTagData() }

            return {
                tags: newTags,
            }
        })
    }

    _clearFilters() {
        this.formData = {};
        this.refreshData();
        this.formElements.resetFormData();
        this.formElements.resetSearchTagData();
        this.filtersOffCanvas?.close();
    }
}