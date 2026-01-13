import { App } from "../../../../src/core/App";
import { BaseWidget } from "../../../../src/core/BaseWidget";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Icon } from "../../../../src/widgets/elements/Icon";
import { CheckBoxInput } from "../../../../src/widgets/forms/CheckBoxInput";
import { DateInput } from "../../../../src/widgets/forms/DateInput";
import { Form } from "../../../../src/widgets/forms/Form";
import { FormController } from "../../../../src/widgets/forms/FormController";
import { SelectBuilder } from "../../../../src/widgets/forms/SelectBuilder";
import { SelectInput } from "../../../../src/widgets/forms/SelectInput";
import { TextAreaInputBuilder } from "../../../../src/widgets/forms/TextAreaInputBuilder";
import { TextInput } from "../../../../src/widgets/forms/TextInput";
import { Card } from "../../../../src/widgets/layouts/Card";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Expand } from "../../../../src/widgets/layouts/Expand";
import { Row } from "../../../../src/widgets/layouts/Row";
import { ContentHeaderComponent } from "../../../Components/ContentHeaderComponent";
import { HttpClient } from "../../../Services/HttpClient";
import { UIHelper } from "../../../Utils/UIHelper";


export class Save extends BaseWidget {
    constructor({ args }) {
        super();
        this.taskId = args?.taskId;
        this.formData = {};
        this.controller = new FormController();
        this.initState({
            isLoading: true
        });
    }

    async mounted() {
        try {
            if (this.taskId) {
                const { result } = await HttpClient.instance.get(`/tasks/${this.taskId}`);
                this.formData = { ...this.formData, ...result.data[0] };

                this.controller.setInitialValues(this.formData);
            }
        } catch (err) {
            UIHelper.showErrorNotification({ message: "Erro ao carregar tarefa" });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    async saveTask() {
        try {
            const payload = { ...this.formData };
            
            await HttpClient.instance.post("/tasks", payload);
            UIHelper.showSuccessMessage("Tarefa criada com sucesso!");
        } catch (err) {
            UIHelper.showErrorNotification({ message: "Erro ao guardar tarefa" });
        }
    }

    render() {
        this.children = [
            new Column({
                children: [
                    new ContentHeaderComponent({
                        title: "Actualizar Tarafa",
                        subtitle: "Organize e acompanhe todas as atividades da equipa",
                        onBack: () => App.instance.back()
                    }),

                    new Card({
                        style: { borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                        body: new Form({
                            controller: this.controller,
                            children: [
                                new Column({
                                    style: { padding: "1.5rem", gap: "1.5rem" },
                                    children: [
                                        // Linha 1: Título + Tipo
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 8 },
                                                    children: [
                                                        new TextInput({
                                                            label: "Título da Tarefa",
                                                            placeholder: "Ex: Ligar para Sr. João – Interesse no T3 Campo Grande",
                                                            name: "title",
                                                            value: this.formData.title,
                                                            onChange: v => this.formData.title = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 4 },
                                                    children: [
                                                        new SelectBuilder({
                                                            future: () => HttpClient.instance.get("/task-types"),
                                                            label: "Tipo de Tarefa",
                                                            placeholder: "Selecione o tipo",
                                                            name: "type",
                                                            value: this.formData.type,
                                                            proxyData: d => (d.result?.task_types || []).map(t => ({ label: t.name, value: t.id })).sort((a, b) => b.sort_order - a.sort_order),
                                                            onChange: v => this.formData.type = v
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Linha 2: Prioridade + Estado + Vencimento
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 4 },
                                                    children: [
                                                        new SelectInput({
                                                            label: "Prioridade",
                                                            name: "priority",
                                                            value: this.formData.priority,
                                                            data: [
                                                                { label: "Baixa", value: "low" },
                                                                { label: "Normal", value: "normal" },
                                                                { label: "Alta", value: "high" },
                                                                { label: "Urgente", value: "urgent" }
                                                            ],
                                                            onChange: v => this.formData.priority = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 4 },
                                                    children: [
                                                        new SelectInput({
                                                            label: "Estado",
                                                            name: "status",
                                                            value: this.formData.status,
                                                            data: [
                                                                { label: "Pendente", value: "pending" },
                                                                { label: "Em Progresso", value: "in_progress" },
                                                                { label: "Concluída", value: "completed" },
                                                                { label: "Cancelada", value: "cancelled" }
                                                            ],
                                                            onChange: v => this.formData.status = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 2 },
                                                    children: [
                                                        new DateInput({
                                                            placeholder: "Data",
                                                            name: "due_date",
                                                            value: this.formData.due_date,
                                                            onChange: v => this.formData.due_date = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 2 },
                                                    children: [
                                                        new DateInput({
                                                            placeholder: "Hora",
                                                            props: {
                                                                type: "time"
                                                            },
                                                            name: "due_date",
                                                            value: this.formData.due_date,
                                                            onChange: v => this.formData.due_date = v
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Linha 3: Atribuído a + Relacionado com
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 6 },
                                                    children: [
                                                        new SelectBuilder({
                                                            future: () => HttpClient.instance.get("/users"),
                                                            label: "Atribuído a",
                                                            placeholder: "Selecione o responsável",
                                                            name: "assigned_to",
                                                            value: this.formData.assigned_to,
                                                            proxyData: d => (d.result?.users || []).map(u => ({ label: u.name, value: u.id })),
                                                            onChange: v => this.formData.assigned_to = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 3 },
                                                    children: [
                                                        new SelectInput({
                                                            label: "Relacionado com",
                                                            name: "related_type",
                                                            value: this.formData.related_type,
                                                            data: [
                                                                { label: "Lead", value: "lead" },
                                                                { label: "Cliente", value: "client" },
                                                                { label: "Imóvel", value: "property" },
                                                                { label: "Proprietário", value: "owner" },
                                                                { label: "Negócio", value: "deal" }
                                                            ],
                                                            onChange: v => this.formData.related_type = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 3 },
                                                    children: [
                                                        new TextInput({
                                                            label: "ID Relacionado",
                                                            name: "related_id",
                                                            placeholder: "Ex: 1234",
                                                            value: this.formData.related_id,
                                                            onChange: v => this.formData.related_id = v
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Descrição
                                        new TextAreaInputBuilder({
                                            label: "Descrição / Notas",
                                            placeholder: "Detalhes sobre o que precisa ser feito...",
                                            name: "description",
                                            value: this.formData.description,
                                            style: { height: "120px" },
                                            onChange: v => this.formData.description = v
                                        }),

                                        // Lembrete
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 6 },
                                                    children: [
                                                        new CheckBoxInput({
                                                            label: "Ativar lembrete",
                                                            name: "reminder_enabled",
                                                            checked: this.formData.reminder_enabled,
                                                            onChange: v => this.formData.reminder_enabled = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 6 },
                                                    children: [
                                                        this.formData.reminder_enabled ? new SelectInput({
                                                            label: "Notificar antes",
                                                            value: this.formData.reminder_time,
                                                            name: "reminder_time",
                                                            data: [
                                                                { label: "15 minutos", value: "15m" },
                                                                { label: "1 hora", value: "1h" },
                                                                { label: "1 dia", value: "1d" },
                                                                { label: "2 dias", value: "2d" }
                                                            ],
                                                            onChange: v => this.formData.reminder_time = v
                                                        }) : new Column()
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Botão Guardar
                                        new Row({
                                            children: [
                                                new Button({
                                                    label: "Salvar",
                                                    prefixIcon: new Icon({ icon: "fa-solid fa-check" }),
                                                    onPressed: () => this.saveTask()
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                ]
            })
        ];

        return super.render();
    }
}