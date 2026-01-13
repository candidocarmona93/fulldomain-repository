import { BaseWidget } from "../../../../../src/core/BaseWidget";
import { Column } from "../../../../../src/widgets/layouts/Column";
import { Row } from "../../../../../src/widgets/layouts/Row";
import { Container } from "../../../../../src/widgets/layouts/Container";
import { Text } from "../../../../../src/widgets/elements/Text";
import { Icon } from "../../../../../src/widgets/elements/Icon";
import { TaskCard } from "../../../../Components/TaskCard";

import "../../../../assets/styles/task-kanban.css";

export class TaskKanbanBoard extends BaseWidget {
    constructor({
        tasks = [],
        onTaskClick = () => { },
        onStatusChange = () => { },
        onAddTask = () => { },
        onTaskDelete = () => { },
        statuses = ["pending", "in_progress", "completed", "cancelled"],
    } = {}) {
        super();

        this.tasks = tasks;
        this.onTaskClick = onTaskClick;
        this.onStatusChange = onStatusChange;
        this.onAddTask = onAddTask;
        this.onTaskDelete = onTaskDelete;
        this.statuses = statuses;

        this.statusLabels = {
            pending: {
                label: "A Fazer",
                color: "#6c757d",
                icon: "fa fa-clock",
                gradient: "linear-gradient(135deg, #6c757d 0%, #495057 100%)"
            },
            in_progress: {
                label: "Em Andamento",
                color: "#ffc107",
                icon: "fa fa-activity",
                gradient: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)"
            },
            completed: {
                label: "Concluídas",
                color: "#28a745",
                icon: "fa fa-check-circle",
                gradient: "linear-gradient(135deg, #28a745 0%, #1e7e34 100%)"
            },
            cancelled: {
                label: "Canceladas",
                color: "#dc3545",
                icon: "fa fa-x-circle",
                gradient: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)"
            }
        };

        this.draggedTask = null;
        this.activeFilter = "all";
    }

    create() {
        return new Container({
            className: ["task-kanban-board"],
            children: [
                // Kanban columns
                new Row({
                    className: ["kanban-columns"],
                    containerPadding: true,
                    rowContainerStyle: {
                        padding: 0,
                    },
                    children: this.statuses.map(status => this.createColumn(status))
                }),

                // Empty state (when no tasks)
                this.tasks.length === 0 && new Container({
                    className: ["kanban-empty-board"],
                    children: [
                        new Icon({
                            icon: "fa fa-inbox",
                        }),
                        new Text({
                            text: "Nenhuma tarefa encontrada",
                            className: ["empty-board-title"],
                            style: { fontSize: "1.2rem", marginTop: "20px", color: "#495057" }
                        }),
                    ]
                })
            ]
        });
    }

    createColumn(status) {
        const config = this.statusLabels[status] || {
            label: status,
            color: "#6c757d",
            icon: "circle",
            gradient: "linear-gradient(135deg, #6c757d 0%, #495057 100%)"
        };

        const columnTasks = this.tasks.filter(t => t.status === status);

        return new Column({
            className: ["kanban-column", `column-${status}`],
            gap: "15px",
            children: [
                // Column Header
                new Container({
                    className: ["kanban-column-header"],
                    style: { background: config.gradient },
                    children: new Row({
                        children: [
                            new Row({
                                alignItems: "center",
                                gap: "10px",
                                children: [
                                    new Icon({
                                        name: config.icon,
                                        size: 18,
                                        color: "white"
                                    }),
                                    new Text({
                                        text: config.label.toUpperCase(),
                                        className: ["kanban-column-title"],
                                        style: { fontWeight: "600", letterSpacing: "0.5px" }
                                    })
                                ]
                            }),
                            new Container({
                                className: ["kanban-task-count"],
                                children: new Text({
                                    text: `${columnTasks.length}`,
                                    style: { fontWeight: "700" }
                                })
                            })
                        ],
                        style: {
                            padding: "15px 20px",
                            justifyContent: "space-between",
                        }
                    })
                }),

                // Task List
                new Container({
                    className: ["kanban-task-list"],
                    style: {
                        background: columnTasks.length === 0 ? "#f8f9fa" : "white",
                        minHeight: "150px",
                        padding: "20px"
                    },
                    children: columnTasks.length === 0
                        ? [this.createEmptyColumnState(status)]
                        : columnTasks.map(task => this.createTaskCard(task))
                }),
            ]
        });
    }

    createEmptyColumnState(status) {
        const config = this.statusLabels[status];
        return new Container({
            className: ["kanban-empty-state"],
            children: [
                new Icon({
                    icon: config.icon,
                }),
                new Text({
                    text: "Nenhuma tarefa",
                    style: {
                        color: "#adb5bd",
                        fontStyle: "italic",
                        marginTop: "10px",
                        fontSize: "0.9rem"
                    }
                })
            ]
        });
    }

    createTaskCard(task) {
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
        const isHighPriority = task.priority === "high";

        return new Container({
            className: ["kanban-task-wrapper", isOverdue ? "task-overdue" : "", isHighPriority ? "task-high-priority" : ""],
            style: {
                position: "relative"
            },
            children: [
                isHighPriority && new Container({
                    className: ["priority-indicator"],
                    style: {
                        position: "absolute",
                        left: "0",
                        top: "0",
                        bottom: "0",
                        width: "4px",
                        background: "linear-gradient(to bottom, #ff6b6b, #ff4757)",
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius: "8px"
                    }
                }),

                // Task card
                new TaskCard({
                    task,
                    compactMode: true,
                    showAssignee: true,
                    showDueDate: true,
                    showPriority: true,
                    showStatus: false,
                    showDelete: true,
                    onClick: () => this.onTaskClick(task),
                    onDelete: () => this.onTaskDelete(task),
                    className: []
                }).create(),
            ]
        });
    }
}