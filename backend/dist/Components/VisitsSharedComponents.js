import { BaseWidget } from "../../src/core/BaseWidget";
import { Icon } from "../../src/widgets/elements/Icon";
import { Text } from "../../src/widgets/elements/Text";
import { Card } from "../../src/widgets/layouts/Card";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import { Expand } from "../../src/widgets/layouts/Expand";
import { SharedUtils } from "../pages/SharedUtils";
import { UIHelper } from "../Utils/UIHelper";
import { TextAreaInput } from "../../src/widgets/forms/TextAreaInput";
import { Button } from "../../src/widgets/buttons/Button";
import { FutureBuilder } from "../../src/widgets/builders/FutureBuilder";
import { HttpClient } from "../Services/HttpClient";
import { FutureBuilderController } from "../../src/widgets/builders/FutureBuilderController";
import { Form } from "../../src/widgets/forms/Form";
import { FormController } from "../../src/widgets/forms/FormController";
import { Center } from "../../src/widgets/layouts/Center";
import "../assets/styles/visit-card.css";

export class VisitsSharedComponents extends BaseWidget {
    constructor({ onAddNote = null, onTypingNote = null } = {}) {
        super();

        this.history = [];
        this.note = null;
        this.onAddNote = onAddNote;
        this.onTypingNote = onTypingNote;
        this.currentNote = "";
        this.controller = new FutureBuilderController();
    }

    /**
     * Sets the history/timeline data for the visit
     * @param {Array} history - Array of history/timeline items
     */
    setHistory(history = []) {
        this.history = history;
    }


    /**
     * Sets the history/timeline data for the visit
     * @param {Array} history - Array of history/timeline items
     */
    setNote(note = null) {
        this.note = note;
    }

    /**
     * Creates a detailed visit profile view for OffCanvas or modal display
     * @param {Object} visit - Visit data
     * @param {Object} options - Configuration options
     * @returns {Column} Column component with the visit details
     */
    createVisitProfileView(visit, options = {}) {
        const {
            showProperty = true,
            showClient = true,
            showSchedule = true,
            showAssignee = true,
            showPriority = true,
            showMeetingPoint = true,
            showContactPhone = true,
            showNotes = true,
            showHeader = true,
            showHistory = true,
            showAddNote = true,
            compact = false,
            className = []
        } = options;

        // Create the main content sections (Left Column Content)
        const mainSections = [];

        if (showProperty && visit.properties) {
            mainSections.push(this.createPropertySection(visit));
        }

        if (showPriority && visit.priority) {
            mainSections.push(this.createPrioritySection(visit));
        }

        if (showClient && visit.clients) {
            mainSections.push(this.createClientSection(visit));
        }

        if (showSchedule) {
            mainSections.push(this.createScheduleSection(visit));
        }

        if (showMeetingPoint && visit.meeting_point) {
            mainSections.push(this.createMeetingPointSection(visit));
        }

        if (showAssignee && visit.agents) {
            mainSections.push(this.createAssigneeSection(visit));
        }

        if (showContactPhone && visit.contact_phone) {
            mainSections.push(this.createContactPhoneSection(visit));
        }

        if (showNotes && visit.notes) {
            mainSections.push(this.createNotesSection(visit));
        }

        // Create the secondary content sections (Right Column Content)
        const secondarySections = [];
        secondarySections.push(this.createHistoryTitle())

        if (showHistory) {
            secondarySections.push(this.createHistoryTimeline(visit));
        }

        if (showAddNote) {
            secondarySections.push(this.createAddNoteSection());
        }

        return new Column({
            gap: "20px",
            className: ["visit-profile-view", ...className],
            children: [
                new Row({
                    children: [
                        // Main Details Column
                        new Expand({
                            breakpoints: { lg: 6 },
                            children: [
                                new Column({
                                    gap: "25px",
                                    className: ["visit-profile-primary-col"],
                                    style: { padding: "1rem" },
                                    children: mainSections
                                })
                            ]
                        }),
                        // History and Add Note Column
                        secondarySections.length > 0
                            ? new Expand({
                                breakpoints: { lg: 6 },
                                children: [
                                    new Column({
                                        className: ["visit-profile-secondary-col"],
                                        style: {
                                            padding: "1rem",
                                        },
                                        children: secondarySections
                                    })
                                ]
                            })
                            : new Container({ children: [] })
                    ]
                })
            ]
        });
    }

    /**
     * Creates a visit card component
     * @param {Object} visit - Visit data
     * @param {Object} config - Configuration
     * @returns {Card} Card component
     */
    createVisitCard(visit, config = {}) {
        const {
            compactMode = false,
            showProperty = true,
            showClient = true,
            showSchedule = true,
            showAssignee = true,
            showPriority = false,
            showTags = false,
            onClick = () => { },
            className = []
        } = config;

        const body = compactMode
            ? this.createCompactCardBody(visit, config)
            : this.createDetailedCardBody(visit, config);

        return new Card({
            className: ["visit-card", ...className],
            bodyClassName: ["visit-card-body"],
            events: {
                click: () => onClick(visit)
            },
            body
        });
    }

    /**
     * Creates history title section
     * @returns {Text} History title component
     */
    createHistoryTitle() {
        return new Container({
            className: ["visit-history-header"],
            children: [
                new Text({
                    text: "HISTÓRICO DA VISITA",
                    className: ["visit-history-label"]
                })
            ]
        });
    }

    /**
     * Creates history timeline section
     * @returns {Column} History timeline component
     */
    createHistoryTimeline(visit) {
        return new FutureBuilder({
            className: ["visit-timeline-container"],
            future: () => HttpClient.instance.get(`/visits/${visit.id}/notes`),
            controller: this.controller,
            builder: ({ result }) => {
                const items = result.notesHistory;
                if (items.length === 0) return new Center({ className: ["visit-timeline-empty"], children: ["Ainda não tem Observações para esta visita"] });

                return items.map(item => this.createTimelineItem(item));
            },
            onLoading: () => UIHelper.createLoadingSpinner()
        });
    }

    /**
     * Creates a single timeline item
     * @param {Object} item - History item
     * @param {number} index - Item index
     * @returns {Row} Timeline item component
     */
    createTimelineItem(item) {
        return new Column({
            className: ["visit-timeline-content"],
            children: [
                new Row({
                    className: ["visit-timeline-header"],
                    children: [
                        new Row({
                            className: ["visit-timeline-user"],
                            children: [
                                this._renderAvatarBadgeCell({ name: item.users?.name }, true),
                                new Column({
                                    children: [
                                        new Text({
                                            text: item.users?.name,
                                            className: ["visit-timeline-user-name"]
                                        }),
                                        new Text({
                                            text: item.updated_at || "",
                                            className: ["visit-timeline-time"]
                                        })
                                    ]
                                })
                            ]
                        }),
                    ]
                }),
                new Text({
                    text: item.description,
                    className: ["visit-timeline-description"]
                }),
            ]
        });
    }

    /**
     * Creates add note section with TextAreaInput
     * @returns {Column} Add note component
     */
    createAddNoteSection() {
        const formController = new FormController();

        return new Form({
            controller: formController,
                    className: ["visit-add-note-section"],
            style: {
                width: "100%",
            },
            children: [
                new TextAreaInput({
                    style: {
                        width: "100%",
                    },
                    placeholder: "Digite suas observações aqui...",
                    name: "note",
                    onChange: (value) => {
                        if (value) {
                            this.onTypingNote?.(value);
                            this.buttonWidget.disabled = false;
                        } else {
                            this.buttonWidget.disabled = true;
                        }
                    },
                }),
                new Row({
                    className: ["visit-add-note-actions"],
                    children: [
                        new Button({
                            label: "Salvar Observação",
                            disabled: true,
                            onPressed: async () => {
                               await this.onAddNote?.();
                               formController.reset();
                               this.controller.reload();
                               this.buttonWidget.disabled = true;
                            },
                            onAttached: (el, _, widget) => {
                                this.buttonWidget = widget;
                            }
                        })
                    ]
                })
            ]
        });
    }

    createCompactCardBody(visit, config = {}) {
        const {
            showProperty = true,
            showClient = true,
            showSchedule = true,
            showAssignee = true
        } = config;

        const children = [];

        if (showProperty || showClient) {
            children.push(
                new Row({
                    className: ["visit-card-compact-header-row"],
                    children: [
                        new Column({
                            className: ["visit-card-column", "visit-card-compact-header-col"],
                            children: [
                                showProperty && new Text({
                                    text: visit.properties?.title || "Sem imóvel definido",
                                    className: ["visit-card-compact-property-title"]
                                }),
                                showClient && new Text({
                                    text: visit.clients?.name || "Cliente não definido",
                                    className: ["visit-card-compact-client-name"]
                                })
                            ]
                        }),
                        UIHelper.createBadge(visit.status, {
                            size: "small",
                            style: { fontSize: "0.7rem" }
                        })
                    ]
                })
            );
        }

        if (showSchedule) {
            children.push(
                new Container({
                    className: ["visit-card-compact-schedule-info"],
                    children: [
                        new Row({
                            className: ["visit-card-compact-schedule-row"],
                            children: [
                                new Row({
                                    className: ["visit-card-compact-schedule-icon-text"],
                                    children: [
                                        new Icon({
                                            icon: "fa-regular fa-calendar",
                                            className: ["visit-card-compact-schedule-icon"]
                                        }),
                                        new Text({
                                            text: visit.scheduled_date || "--/--/----",
                                            className: ["visit-card-compact-schedule-date"]
                                        })
                                    ]
                                }),
                                new Text({
                                    text: visit.scheduled_time || "--:--",
                                    className: ["visit-card-compact-schedule-time"]
                                })
                            ]
                        })
                    ]
                })
            );
        }

        if (showAssignee) {
            children.push(
                new Row({
                    className: ["visit-card-compact-assignee-row"],
                    children: [
                        new Row({
                            className: ["visit-card-compact-assignee-details"],
                            children: [
                                this._renderAvatarBadgeCell(visit.users || visit.agents, true),
                                new Column({
                                    gap: 0,
                                    children: [
                                        new Text({
                                            text: (visit.users?.name || visit.agents?.name) || "Não atribuído",
                                            className: ["visit-card-compact-assignee-name"]
                                        })
                                    ]
                                })
                            ]
                        }),
                        visit.duration && new Container({
                            className: ["visit-card-compact-duration"],
                            children: [
                                new Text({
                                    text: `${visit.duration}`,
                                    className: ["visit-card-compact-duration-text"]
                                })
                            ]
                        })
                    ]
                })
            );
        }

        return new Column({
            className: ["visit-card-column", "visit-card-body-compact"],
            children: children.filter(Boolean)
        });
    }

    createDetailedCardBody(visit, config = {}) {
        const {
            showProperty = true,
            showClient = true,
            showSchedule = true,
            showAssignee = true,
            showPriority = false,
            showTags = false
        } = config;

        const children = [];

        if (showProperty) {
            children.push(this.createPropertySection(visit));
        }

        if (showPriority && visit.priority) {
            children.push(this.createPriorityIndicator(visit));
        }

        const sections = [];

        if (showClient) {
            sections.push(this.createClientSection(visit));
        }

        if (showSchedule) {
            sections.push(this.createScheduleSection(visit));
        }

        if (showAssignee) {
            sections.push(this.createAssigneeSection(visit));
        }

        sections.forEach((section, index) => {
            if (index > 0) {
                children.push(this.createDivider());
            }
            children.push(section);
        });

        children.push(this.createFooterSection(visit));

        return new Column({
            className: ["visit-card-column", "visit-card-body-normal"],
            children
        });
    }

    createPropertySection(visit) {
        return new Column({

            children: [
                new Text({
                    style: {
                        textAlign: "left"
                    },
                    text: visit.properties?.title || "Sem imóvel definido",
                    className: ["visit-card-property-title"]
                }),
                visit.properties?.address && new Text({
                    style: {
                        textAlign: "left"
                    },
                    text: visit.properties.address,
                    className: ["visit-card-property-address"]
                }),
            ]
        });
    }

    createClientSection(visit) {
        return new Row({
            className: ["visit-card-client-section"],
            children: [
                new Container({
                    className: ["visit-card-client-avatar-container"],
                    children: [
                        this._renderAvatarBadgeCell(visit.clients?.name),
                    ]
                }),
                new Column({
                    className: ["visit-card-column", "visit-card-client-info-col"],
                    children: [
                        new Row({
                            className: ["visit-card-client-info-header"],
                            children: [
                                new Text({
                                    text: "CLIENTE",
                                    className: ["visit-card-client-label"]
                                }),
                            ]
                        }),
                        new Text({
                            text: visit.clients?.name || "Cliente não definido",
                            className: ["visit-card-client-name-text"]
                        }),
                        new Column({
                            gap: 0,
                            children: [
                                visit.clients?.contact_1 && new Row({
                                    className: ["visit-card-client-contact-row"],
                                    children: [
                                        new Icon({
                                            icon: "fa-solid fa-phone",
                                            className: ["visit-card-client-contact-icon"]
                                        }),
                                        new Text({
                                            text: visit.clients.contact_1,
                                            className: ["visit-card-client-contact-text"]
                                        })
                                    ]
                                }),
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createScheduleSection(visit) {
        return new Container({
            className: ["visit-card-schedule-container"],
            children: new Column({
                className: ["visit-card-column", "visit-card-schedule-content-col"],
                children: [
                    new Row({
                        className: ["visit-card-schedule-header-row"],
                        children: [
                            new Row({
                                className: ["visit-card-schedule-label-row"],
                                children: [
                                    new Icon({
                                        icon: "fa-regular fa-calendar-check",
                                        className: ["visit-card-schedule-icon"]
                                    }),
                                    new Text({
                                        text: "HORÁRIO AGENDADO",
                                        className: ["visit-card-schedule-label"]
                                    })
                                ]
                            }),
                            visit.confirmed && new Container({
                                className: ["visit-card-schedule-confirmed-badge"],
                                children: [
                                    new Icon({
                                        icon: "fa-solid fa-check-circle",
                                        className: ["visit-card-schedule-confirmed-icon"]
                                    }),
                                    new Text({
                                        text: "Confirmado",
                                        className: ["visit-card-schedule-confirmed-text"]
                                    })
                                ]
                            })
                        ]
                    }),
                    new Row({
                        className: ["visit-card-schedule-details-row"],
                        children: [
                            new Column({
                                className: ["visit-card-column", "visit-card-schedule-date-col"],
                                children: [
                                    new Row({
                                        rowStyle: {
                                            alignItems: "center",
                                            justifyContent: "start"
                                        },
                                        className: ["visit-card-schedule-date-row"],
                                        children: [
                                            new Icon({
                                                icon: "fa-regular fa-calendar",
                                                className: ["visit-card-schedule-date-icon"]
                                            }),
                                            new Text({
                                                text: visit.scheduled_date || "--/--/----",
                                                className: ["visit-card-schedule-date-text"]
                                            })
                                        ]
                                    }),
                                    new Row({
                                        rowStyle: {
                                            alignItems: "center",
                                            justifyContent: "start"
                                        },
                                        className: ["visit-card-schedule-duration-row"],
                                        children: [
                                            new Text({
                                                text: visit.duration ? `Duração: ${visit.duration}` : "Duração não definida",
                                                className: ["visit-card-schedule-duration-text"]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new Container({
                                className: ["visit-card-schedule-time-container"],
                                children: [
                                    new Row({
                                        rowStyle: {
                                            alignItems: "center",
                                            justifyContent: "start"
                                        },
                                        className: ["visit-card-column", "visit-card-schedule-time-col"],
                                        children: [
                                            new Icon({
                                                icon: "fa-regular fa-clock",
                                                className: ["visit-card-schedule-time-icon"]
                                            }),
                                            new Text({
                                                text: visit.scheduled_time || "--:--",
                                                className: ["visit-card-schedule-time-text"]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        });
    }

    createAssigneeSection(visit) {
        return new Column({
            className: ["visit-card-column", "visit-card-assignee-section"],
            children: [
                new Text({
                    text: "AGENTE RESPONSÁVEL",
                    className: ["visit-card-assignee-label"]
                }),
                new Row({
                    className: ["visit-card-assignee-row"],
                    children: [
                        this._renderAvatarBadgeCell(visit.agents),
                        new Column({
                            className: ["visit-card-column", "visit-card-assignee-info-col"],
                            children: [
                                new Row({
                                    className: ["visit-card-assignee-name-status"],
                                    children: [
                                        new Text({
                                            text: visit.agents?.name || "Agente não atribuído",
                                            className: ["visit-card-assignee-name"]
                                        }),
                                    ]
                                }),
                                new Column({
                                    gap: 0,
                                    children: [
                                        visit.agents?.contact_1 && new Row({
                                            className: ["visit-card-client-contact-row"],
                                            children: [
                                                new Icon({
                                                    icon: "fa-solid fa-phone",
                                                    className: ["visit-card-client-contact-icon"]
                                                }),
                                                new Text({
                                                    text: visit.agents.contact_1,
                                                    className: ["visit-card-client-contact-text"]
                                                })
                                            ]
                                        }),
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createPrioritySection(visit) {
        const priority = visit.priority?.toLowerCase() || 'normal';
        const priorityClass = `priority-${priority}`;
        const priorityLabels = {
            'high': 'Alta',
            'medium': 'Média',
            'low': 'Baixa',
            'normal': 'Normal'
        };

        return new Column({

            className: ["visit-card-column", "visit-priority-section"],
            children: [
                new Row({
                    className: ["visit-priority-header"],
                    children: [
                        new Text({
                            text: "PRIORIDADE",
                            className: ["visit-priority-label"]
                        })
                    ]
                }),
                new Row({
                    className: ["visit-priority-content"],
                    children: [
                        new Container({
                            className: ["visit-priority-indicator", priorityClass],
                            children: [
                                new Icon({
                                    icon: this.getPriorityIcon(priority),
                                    className: ["visit-priority-icon"]
                                })
                            ]
                        }),
                        new Column({
                            className: ["visit-priority-details"],
                            children: [
                                new Text({
                                    text: priorityLabels[priority] || "Normal",
                                    className: ["visit-priority-text", priorityClass]
                                }),
                                new Text({
                                    text: this.getPriorityDescription(priority),
                                    className: ["visit-priority-description"]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createMeetingPointSection(visit) {
        return new Column({

            className: ["visit-card-column", "visit-meeting-point-section"],
            children: [
                new Row({
                    className: ["visit-meeting-point-header"],
                    children: [
                        new Text({
                            text: "PONTO DE ENCONTRO",
                            className: ["visit-meeting-point-label"]
                        })
                    ]
                }),
                new Row({
                    className: ["visit-meeting-point-content"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-map-marker-alt",
                            className: ["visit-meeting-point-icon"]
                        }),
                        new Column({
                            className: ["visit-meeting-point-details"],
                            children: [
                                new Text({
                                    text: visit.meeting_point,
                                    className: ["visit-meeting-point-text"]
                                }),
                                visit.meeting_point_details && new Text({
                                    text: visit.meeting_point_details,
                                    className: ["visit-meeting-point-details-text"]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createContactPhoneSection(visit) {
        return new Column({

            className: ["visit-card-column", "visit-contact-phone-section"],
            children: [
                new Row({
                    className: ["visit-contact-phone-header"],
                    children: [
                        new Text({
                            text: "TELEFONE DE CONTATO",
                            className: ["visit-contact-phone-label"]
                        })
                    ]
                }),
                new Row({
                    className: ["visit-contact-phone-content"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-phone",
                            className: ["visit-contact-phone-icon"]
                        }),
                        new Column({
                            className: ["visit-contact-phone-details"],
                            children: [
                                new Text({
                                    text: visit.contact_phone,
                                    className: ["visit-contact-phone-text"]
                                }),
                                visit.contact_name && new Text({
                                    text: `Contato: ${visit.contact_name}`,
                                    className: ["visit-contact-name-text"]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createNotesSection(visit) {
        return new Column({

            className: ["visit-card-column", "visit-notes-section"],
            children: [
                new Row({
                    className: ["visit-notes-header"],
                    children: [
                        new Text({
                            text: "OBSERVAÇÕES",
                            className: ["visit-notes-label"]
                        })
                    ]
                }),
                new Container({
                    className: ["visit-notes-content"],
                    children: [
                        new Text({
                            text: visit.notes,
                            className: ["visit-notes-text"],
                            style: {
                                whiteSpace: "pre-line",
                                lineHeight: "1.5"
                            }
                        })
                    ]
                })
            ]
        });
    }

    createPriorityIndicator(visit) {
        const priority = visit.priority?.toLowerCase() || 'normal';
        const priorityClass = `priority-${priority}`;

        return new Text({
            text: `Prioridade: ${priority || "Normal"}`,
            className: ["visit-card-priority-text", priorityClass]
        });
    }

    createFooterSection(visit) {
        return new Row({
            className: ["visit-card-footer-row"],
            children: [
                new Row({
                    className: ["visit-card-created-at-row"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-calendar-plus",
                            className: ["visit-card-created-at-icon"]
                        }),
                        new Text({
                            text: `Criado: ${visit.created_at || "Data não disponível"}`,
                            className: ["visit-card-created-at-text"]
                        })
                    ]
                }),
                new Row({
                    className: ["visit-card-details-row"],
                    children: [
                        new Icon({
                            icon: "fa-solid fa-arrow-right",
                            className: ["visit-card-details-icon"]
                        }),
                        new Text({
                            text: "Ver detalhes",
                            className: ["visit-card-details-text"]
                        })
                    ]
                })
            ]
        });
    }

    createDivider() {
        return new Container({
            className: ["visit-card-divider"]
        });
    }

    // Helper methods for priority section
    getPriorityIcon(priority) {
        const icons = {
            'high': 'fa-solid fa-exclamation-triangle',
            'medium': 'fa-solid fa-exclamation-circle',
            'low': 'fa-solid fa-arrow-down',
            'normal': 'fa-solid fa-minus'
        };
        return icons[priority] || 'fa-solid fa-minus';
    }

    getPriorityDescription(priority) {
        const descriptions = {
            'high': 'Visita requer atenção imediata',
            'medium': 'Visita importante, agendar em breve',
            'low': 'Visita pode ser agendada com flexibilidade',
            'normal': 'Visita padrão'
        };
        return descriptions[priority] || 'Visita padrão';
    }

    _renderAvatarBadgeCell(data, small = false) {
        const name = data?.name || 'Sem cliente';
        return SharedUtils.createAvatarBadge(name, {
            emptyName: 'Sem cliente',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
            size: small ? 'small' : 'medium',
            style: small ? {
                size: '24px',
                fontSize: '0.6rem'
            } : undefined
        });
    }
}