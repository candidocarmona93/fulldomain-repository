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
import { TaskService } from "../../../Services/TaskService";
import { AuthService } from "../../../Services/AuthService";
import { CheckBoxInput } from "../../../../src/widgets/forms/CheckBoxInput";
import { Container } from "../../../../src/widgets/layouts/Container";
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { TaskSharedComponents } from "../../../Components/TaskSharedComponents";
import { MenuContext } from "../../../Components/MenuContext";
import { VISIT_MENU } from "../../../Constants/Menu";
import { CircularProgressIndicator } from "../../../../src/widgets/feedback/CircularProgressIndicator";
import { ScheduleTaskForm } from "./Components/ScheduleTaskForm";
import { TaskKanbanBoard } from "./Components/TaskKanbanBoard";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Tarefas",
            endpoint: "/tasks",
            dataMapper: ({ tasks }) => tasks,
            handleAddOrUpdatePageType: ADD_OR_UPDATE_PAGE_TYPES.NEW_PAGE,
            onBack: () => App.instance.back(),
            onFilter: () => {
                this.createOnFilterInputs()
            },
            displayType: "grid",
            downloadEndpoint: "/tasks/download",
            downloadLabel: "tarefas"
        });

        this.formElements = new FormElements();
        this.calendarRef = null;
        this.selectedTaskId = null;
        this.notes = "";

        this.tasksComponents = new TaskSharedComponents({
            onTypingNote: (val) => {
                this.notes = val;
            },
            onAddNote: async () => {
                await this._addTaskNotes();
            }
        });
    }

    async toNewPage() {
        const loading = new CircularProgressIndicator();
        try {
            loading?.show();

            const { result, status } = await TaskService.createTask();
            if (status !== 200 || result.status === "error") {
                return UIHelper.showErrorNotification({ message: "Ocorreu um erro ao criar uma nova tarefa", });
            }

            await this._scheduleTask({ initialValues: result.data[0] });
        } catch (error) {
            console.log(error);
            UIHelper.showErrorNotification({ message: "Ocorreu um erro ao criar uma nova tarefa", });
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
                label: "Mostrar por estado",
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

    createGridItem(tasks) {
        return this.state.calendarMode
            ? new TaskKanbanBoard({
                tasks,
                compactMode: false,
                showAssignee: true,
                showDueDate: true,
                showPriority: true,
                showStatus: true,
            }).create()
            : this.tasksComponents.createTaskCard(tasks, {
                compactMode: false,
                showAssignee: true,
                showDueDate: true,
                showPriority: true,
                showStatus: true,
                onClick: (task) => {
                    this.openMenuContext(task);
                }
            });
    }

    openMenuContext(task) {
        this.menuContext = new MenuContext({
            items: VISIT_MENU({
                view: {
                    onTap: () => {
                        this.openTaskProfile(task);
                        this.menuContext?.close();
                    }
                },
                edit: {
                    onTap: async () => {
                        await this._scheduleTask({
                            initialValues: task
                        });
                        this.menuContext?.close();
                    }
                },
                remove: {
                    onTap: () => {

                    }
                }
            })
        });
        this.menuContext.show();
    }

    openTaskProfile(task) {
        this.selectedTaskId = task.id;

        this.taskProfileOffCanvas = new OffCanvas({
            style: {
                width: "100vw",
                alignItems: "start"
            },
            content: [

            ]
        });
        this.taskProfileOffCanvas?.show();
    }

    mapTasksToEvents(tasks = []) {
        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.map(task => {
            return {
                id: task.id,
                title: `${task.properties?.title || 'Sem titulo definido'}`,
                start: task.scheduled_date,
                end: task.scheduled_date,
                allDay: false,
                extendedProps: {
                    taskData: task
                },
                backgroundColor: this.getEventColor(task.status),
                borderColor: this.getEventColor(task.status),
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

    createCalendar(tasks) {
        return new Container({
            style: {
                minHeight: "500px",
                position: "relative",
            },
            onAttached: (el) => {
                if (this.calendarRef) {
                    this.calendarRef.destroy();
                }

                const events = this.mapTasksToEvents(tasks);

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
                        const taskData = info.event.extendedProps.taskData;
                        if (taskData && taskData.id) {
                            this.openMenuContext(taskData);
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

    async _scheduleTask({ initialValues }) {
        const scheduleTaskForm = new ScheduleTaskForm({
            initialValues,
            onScheduleTask: async (taskData) => {
                try {
                    const creator = AuthService.getCurrentUser();
                    await TaskService.saveTask({ ...taskData, created_by: creator.id });

                    this.refreshData();
                } catch (error) {
                    UIHelper.showErrorNotification({
                        message: "Ocorreu um erro ao salvar Tarefa",
                    });
                } finally {
                    this.scheduleTaskOffcanvas?.close();
                }
            },
            onClose: () => {
                this.scheduleTaskOffcanvas?.close();
            }
        });

        this.scheduleTaskOffcanvas = new OffCanvas({
            content: [scheduleTaskForm.create()]
        });

        this.scheduleTaskOffcanvas?.show();
    }

    async _addTaskNotes() {
        try {
            const creator = AuthService.getCurrentUser();
            await TaskService.addNotes({
                task_id: this.selectedTaskId,
                action: "Adicionou uma nova nota",
                description: this.notes,
                created_by: creator.id
            });
        } catch (error) {
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao salvar notas",
            });
        } finally {
            this.scheduleTaskOffcanvas?.close();
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