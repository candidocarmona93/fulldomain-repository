import { App } from "../../../../src/core/App";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { Text } from "../../../../src/widgets/elements/Text";
import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Container } from "../../../../src/widgets/layouts/Container";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { Row } from "../../../../src/widgets/layouts/Row";
import { ContentHeaderComponent } from "../../../Components/ContentHeaderComponent";
import { HttpClient } from "../../../Services/HttpClient";
import { STATUS, UIHelper } from "../../../Utils/UIHelper";
import { Themes } from "../../../../src/themes/Themes";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { IconButton } from "../../../../src/widgets/buttons/IconButton";
import { TextAreaInputBuilder } from "../../../../src/widgets/forms/TextAreaInputBuilder";

export class Show extends BaseWidget {
    constructor({ args }) {
        super();
        this.taskId = args?.taskId;

        this.initState({
            isLoading: true,
            taskData: {},
            logs: []
        });
    }

    async mounted() {
        try {
            if (this.taskId) {
                const { result } = await HttpClient.instance.get(`/tasks/${this.taskId}`);
                this.state.taskData = result.data[0];
            } else {
                UIHelper.showErrorNotification({ message: "ID da tarefa não fornecido" });
                App.instance.back();
            }
        } catch (err) {
            UIHelper.showErrorNotification({ message: "Erro ao carregar detalhes da tarefa" });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    /**
     * Helper to render a label and value pair vertically
     */
    _renderInfoItem(label, value, icon = null) {
        return new Column({
            style: { gap: "0.25rem", marginBottom: "1rem" },
            children: [
                new Text({
                    text: label,
                    style: { fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }
                }),
                new Row({
                    style: { alignItems: "center", gap: "0.5rem" },
                    children: [
                        icon ? new Icon({ icon: icon, style: { fontSize: "0.9rem", color: "#495057" } }) : null,
                        new Text({
                            text: `${value}` || "-",
                            style: { fontSize: "1rem", color: "#212529" }
                        })
                    ].filter(Boolean)
                })
            ]
        });
    }

    _renderActivityLogs() {
        return new Card({
            style: { marginTop: "1.5rem", padding: "1.5rem", borderRadius: "8px", border: "none!important" },
            body: new Column({
                children: [
                    new Text({ text: "Histórico de Actividade", tag: "h3", style: { fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" } }),
                    new Column({
                        style: { gap: "15px", borderLeft: "2px solid #e9ecef", paddingLeft: "20px", marginLeft: "10px" },
                        children: this.state.logs.length > 0
                            ? this.state.logs.map(log => this._renderLogItem(log))
                            : [new Text({ text: "Nenhuma actividade registada.", style: { color: "#999", fontStyle: "italic" } })]
                    })
                ]
            })
        });
    }

    _renderLogItem(log) {
        return new Container({
            style: { position: "relative" },
            children: [
                // Timeline dot
                new Container({
                    style: {
                        position: "absolute", left: "-26px", top: "5px",
                        width: "10px", height: "10px", borderRadius: "50%",
                        backgroundColor: "#adb5bd"
                    }
                }),
                new Column({
                    children: [
                        new Text({
                            text: log.description || "Atualização do sistema",
                            style: { fontSize: "0.95rem", color: "#333" }
                        }),
                        new Text({
                            text: `${log.created_at} • ${log.user_name || "Sistema"}`,
                            style: { fontSize: "0.8rem", color: "#888", marginTop: "4px" }
                        })
                    ]
                })
            ]
        });
    }

    /**
     * Helper for badges (Priority/Status)
     */
    _renderBadge(label, value) {
        const badgeColors = {
            urgent: "#dc3545", // red
            high: "#fd7e14",   // orange
            normal: "#0d6efd", // blue
            low: "#6c757d",    // gray
            completed: "#198754", // green
            pending: "#ffc107",   // yellow
            cancelled: "#dc3545", // red
            in_progress: "#0dcaf0" // cyan
        };

        const color = badgeColors[value] || "#6c757d";
        const textColor = value === 'pending' ? '#000' : '#fff'; // Fix contrast for yellow

        return new Column({
            style: { gap: "0.25rem", marginBottom: "1rem" },
            children: [
                new Row({
                    children: [
                        new Text({
                            text: label,
                            style: { fontSize: "0.85rem", color: "#6c757d", fontWeight: "600" }
                        }),
                        new Container({
                            style: {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "5px",
                                cursor: "pointer",
                                color: "#342993"
                            },
                            children: [
                                new Icon({
                                    icon: "fa fa-edit"
                                }),
                                new Text({
                                    text: "Alrerar",
                                    style: { fontSize: "0.65rem", color: "#6c757d", fontWeight: "600" }
                                }),
                            ]
                        })
                    ]
                }),
                new Container({
                    style: {
                        backgroundColor: color,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        display: "inline-block",
                        width: "fit-content"
                    },
                    children: [
                        new Text({
                            text: STATUS[value]?.label,
                            style: { color: `${textColor}!important`, fontSize: "0.85rem", fontWeight: "bold" }
                        })
                    ]
                })
            ]
        });
    }

    render() {
        this.children = [
            new Builder({
                watch: () => {
                    const taskData = this.state.taskData;

                    return new Column({
                        gap: "20px",
                        children: [
                            new ContentHeaderComponent({
                                title: `Tarefa #${this.taskId}`,
                                subtitle: "Detalhes e informações da atividade",
                                onBack: () => App.instance.back(),
                                actions: [
                                    new Button({
                                        label: "Editar",
                                        prefixIcon: new Icon({ icon: "fa-solid fa-pen" }),
                                        onPressed: () => App.instance.to(`/activities/tasks/save/${this.taskId}`)
                                    })
                                ]
                            }),

                            new Card({
                                style: { borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: "2rem" },
                                body: new Column({
                                    style: { gap: "2rem" },
                                    children: [
                                        // Section 1: Header Info (Title & Type)
                                        new Row({
                                            style: { borderBottom: "1px solid #dee2e6", paddingBottom: "1rem" },
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 6 },
                                                    children: [
                                                        new Text({
                                                            text: taskData.title,
                                                            tag: "h2",
                                                            style: { fontSize: "1.5rem", fontWeight: "bold", margin: 0 }
                                                        }),
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 6 },
                                                    children: [
                                                        new Row({
                                                            gap: "10px",
                                                            children: [
                                                                new Icon({ icon: "fa-solid fa-tag", style: { color: "#6c757d" } }),
                                                                new Text({
                                                                    text: taskData.taskTypes?.name || "Sem Tipo",
                                                                    style: { color: "#6c757d" }
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Section 2: Key Details Grid
                                        new Row({
                                            children: [
                                                new Expand({ breakpoints: { lg: 3 }, children: [this._renderBadge("Prioridade", taskData.priority)] }),
                                                new Expand({ breakpoints: { lg: 3 }, children: [this._renderBadge("Estado", taskData.status)] }),
                                                new Expand({ breakpoints: { lg: 3 }, children: [this._renderInfoItem("Data de Vencimento", taskData.due_date, "fa-regular fa-calendar")] }),
                                                new Expand({ breakpoints: { lg: 3 }, children: [this._renderInfoItem("Responsável", taskData.users?.name || "Não atribuído", "fa-regular fa-user")] }),
                                            ]
                                        }),

                                        // Section 3: Relations & Description
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 8 },
                                                    children: [
                                                        new Column({
                                                            children: [
                                                                new Text({ text: "Descrição", style: { fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" } }),
                                                                new Container({
                                                                    style: { backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "4px", minHeight: "100px" },
                                                                    children: [
                                                                        new Text({ text: taskData.description || "Sem descrição fornecida.", style: { whiteSpace: "pre-wrap" } })
                                                                    ]
                                                                }),
                                                                new TextAreaInputBuilder({
                                                                    label: "Notas adicionais"
                                                                }),
                                                                new Button({
                                                                    label: "Salvar"
                                                                }),
                                                                this._renderActivityLogs()
                                                            ]
                                                        }),
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 4 },
                                                    children: [
                                                        new Card({
                                                            style: { backgroundColor: "#fff", border: "1px solid #dee2e6", padding: "1rem" },
                                                            body: new Column({
                                                                children: [
                                                                    new Text({ text: "Detalhes Relacionados", style: { fontWeight: "bold", marginBottom: "1rem" } }),
                                                                    this._renderInfoItem("Relacionado com", taskData.related_type),
                                                                    this._renderInfoItem("ID Relacionado", taskData.related_id),
                                                                    this._renderInfoItem("Lembrete Ativo", taskData.reminder_enabled ? "Sim" : "Não", taskData.reminder_enabled ? "fa-solid fa-bell" : "fa-regular fa-bell-slash"),
                                                                    taskData.reminder_enabled ? this._renderInfoItem("Tempo Lembrete", taskData.reminder_time) : null
                                                                ].filter(Boolean)
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            })
                        ]
                    });
                }
            })
        ];

        return super.render();
    }
}