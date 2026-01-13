import { BaseWidget } from "../../src/core/BaseWidget";
import { Icon } from "../../src/widgets/elements/Icon";
import { Text } from "../../src/widgets/elements/Text";
import { Card } from "../../src/widgets/layouts/Card";
import { Column } from "../../src/widgets/layouts/Column";
import { Container } from "../../src/widgets/layouts/Container";
import { Row } from "../../src/widgets/layouts/Row";
import { SharedUtils } from "../pages/SharedUtils";
import { UIHelper } from "../Utils/UIHelper";
import "../assets/styles/task-card.css";

export class TaskSharedComponents extends BaseWidget {
    createTaskCard(task, config = {}) {
        const {
            compactMode = false,
            showAssignee = true,
            showDueDate = true,
            showPriority = true,
            showStatus = true,
            onClick = () => {}
        } = config;

        const body = compactMode
            ? this.createCompactBody(task, config)
            : this.createDetailedBody(task, config);

        return new Card({
            className: ["task-card", task.overdue ? "task-overdue" : "", task.priority ? `priority-${task.priority.toLowerCase()}` : ""],
            bodyClassName: ["task-card-body"],
            events: { click: () => onClick(task) },
            body
        });
    }

    createCompactBody(task, config) {
        return new Column({
            className: ["task-card-body-compact"],
            gap: "10px",
            style: { padding: "12px" },
            children: [
                new Row({
                    className: ["task-compact-header"],
                    children: [
                        new Column({
                            flex: 1,
                            children: [
                                new Text({ text: task.title, className: ["task-compact-title"] }),
                                task.description && new Text({
                                    text: task.description,
                                    className: ["task-compact-description"],
                                    style: { fontSize: "0.8rem", color: "var(--vc-color-text-light)", marginTop: "4px" }
                                })
                            ]
                        }),
                        config.showStatus && UIHelper.createBadge(task.status, { size: "small" })
                    ]
                }),

                new Row({
                    className: ["task-compact-footer"],
                    children: [
                        new Row({
                            children: [
                                this._avatar(task.users || task.users),
                                new Text({
                                    text: task.users?.name || task.users?.name || "Não atribuído",
                                    className: ["task-compact-assignee"]
                                })
                            ],
                            gap: "8px",
                            style: { alignItems: "center" }
                        }),

                        new Row({
                            flex: 1,
                            justifyContent: "flex-end",
                            children: [
                                new Row({
                                    children: [
                                        new Icon({ icon: "fa-regular fa-clock", style: { fontSize: "0.8rem", color: task.overdue ? "var(--vc-color-danger)" : "inherit" } }),
                                        new Text({
                                            text: SharedUtils.formatDate(task.due_date),
                                            className: ["task-compact-due-date", task.overdue ? "overdue" : ""]
                                        })
                                    ],
                                    gap: "6px"
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createDetailedBody(task, config) {
        const sections = [];

        // Title + Description
        sections.push(
            new Column({
                gap: "8px",
                children: [
                    new Text({ text: task.title, className: ["task-detail-title"] }),
                    task.description && new Text({ text: task.description, className: ["task-detail-description"] })
                ]
            })
        );

        // Due Date + Reminder
        if (config.showDueDate) {
            sections.push(this.createDueDateSection(task));
        }

        // Assignee
        if (config.showAssignee) {
            sections.push(this.createAssigneeSection(task));
        }

        // Priority
        if (config.showPriority && task.priority) {
            sections.push(this.createPrioritySection(task));
        }

        // Notes
        if (task.notes) {
            sections.push(this.createNotesSection(task));
        }

        // Footer
        sections.push(this.createFooter(task));

        return new Column({
            className: ["task-card-body-normal"],
            gap: "16px",
            style: { padding: "16px" },
            children: sections
        });
    }

    createDueDateSection(task) {
        const isOverdue = task.overdue || (task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed");
        return new Container({
            className: ["task-due-section"],
            children: new Row({
                children: [
                    new Icon({ icon: "fa-regular fa-calendar", className: ["task-due-icon"] }),
                    new Column({
                        children: [
                            new Text({ text: "Prazo", className: ["task-section-label"] }),
                            new Text({
                                text: `${SharedUtils.formatDate(task.due_date)} ${task.due_time || ""}`.trim(),
                                className: ["task-due-text", isOverdue ? "overdue" : ""]
                            }),
                            task.reminder && new Text({
                                text: `Lembrete: ${this.formatReminder(task.reminder)}`,
                                className: ["task-reminder-text"]
                            })
                        ]
                    })
                ],
                gap: "12px",
                style: { alignItems: "center" }
            })
        });
    }

    createAssigneeSection(task) {
        return new Row({
            className: ["task-assignee-section"],
            children: [
                this._avatar(task.users),
                new Column({
                    children: [
                        new Text({ text: "Responsável", className: ["task-section-label"] }),
                        new Text({
                            text: task.users?.name || "Não atribuído",
                            className: ["task-assignee-name"]
                        })
                    ]
                })
            ],
            gap: "12px",
            style: { alignItems: "center" }
        });
    }

    createPrioritySection(task) {
        const p = (task.priority || "normal").toLowerCase();
        const labels = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };
        const icons = { low: "fa-arrow-down", medium: "fa-minus", high: "fa-exclamation", urgent: "fa-bolt" };

        return new Row({
            children: [
                new Icon({ icon: `fa-solid ${icons[p] || "fa-minus"}`, className: ["task-priority-icon", `priority-${p}`] }),
                new Text({ text: labels[p] || "Normal", className: ["task-priority-text", `priority-${p}`] })
            ],
            gap: "8px",
            style: { alignItems: "center" }
        });
    }

    createNotesSection(task) {
        return new Column({
            gap: "8px",
            children: [
                new Text({ text: "Observações", className: ["task-section-label"] }),
                new Container({
                    className: ["task-notes-box"],
                    children: new Text({ text: task.notes, style: { whiteSpace: "pre-line" } })
                })
            ]
        });
    }

    createFooter(task) {
        return new Row({
            className: ["task-footer"],
            justifyContent: "space-between",
            children: [
                new Text({ text: `Criado em ${SharedUtils.formatDate(task.created_at)}`, className: ["task-meta"] }),
                new Row({
                    children: [
                        new Icon({ icon: "fa-solid fa-arrow-right", className: ["task-details-icon"] }),
                        new Text({ text: "Ver detalhes", className: ["task-details-link"] })
                    ],
                    gap: "6px"
                })
            ]
        });
    }

    formatReminder(reminder) {
        const map = {
            "30_min": "30 minutos antes",
            "1_hour": "1 hora antes",
            "1_day": "1 dia antes",
            "2_days": "2 dias antes"
        };
        return map[reminder] || reminder;
    }

    _avatar(user) {
        const name = user?.name || "?";
        return SharedUtils.createAvatarBadge(name, {
            size: "medium",
            emptyName: "?",
            emptyBackgroundColor: "#e9ecef"
        });
    }
}