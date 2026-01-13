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
        this.visitId = args?.visitId; // Changed from taskId
        this.formData = {
            status: 'scheduled', // Default status
            reminder_enabled: true,
            reminder_time: '1h'
        };
        this.controller = new FormController();
        this.initState({
            isLoading: true
        });
    }

    async mounted() {
        try {
            if (this.visitId) {
                const { result } = await HttpClient.instance.get(`/visits/${this.visitId}`);
                this.formData = { ...this.formData, ...result.data[0] };

                this.controller.setInitialValues(this.formData);
            }
        } catch (err) {
            UIHelper.showErrorNotification({ message: "Erro ao carregar visita" });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    async saveVisit() {
        try {
            const payload = { ...this.formData };
            
            // Validation logic could go here
            if (!payload.property_id || !payload.client_id || !payload.visit_date) {
                UIHelper.showErrorNotification({ message: "Por favor preencha os campos obrigatórios." });
                return;
            }

            if (this.visitId) {
                await HttpClient.instance.put(`/visits/${this.visitId}`, payload);
                UIHelper.showSuccessMessage("Visita atualizada com sucesso!");
            } else {
                await HttpClient.instance.post("/visits", payload);
                UIHelper.showSuccessMessage("Visita agendada com sucesso!");
            }
            App.instance.back();
        } catch (err) {
            UIHelper.showErrorNotification({ message: "Erro ao guardar visita" });
        }
    }

    render() {
        this.children = [
            new Column({
                children: [
                    new ContentHeaderComponent({
                        title: this.visitId ? "Editar Visita" : "Agendar Visita",
                        subtitle: "Gerencie os agendamentos de visitas aos imóveis",
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
                                        // Linha 1: Imóvel + Cliente
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 6 }, 
                                                    children: [
                                                        new SelectBuilder({
                                                            future: () => HttpClient.instance.get("/properties"),
                                                            label: "Imóvel",
                                                            placeholder: "Selecione o imóvel",
                                                            name: "property_id",
                                                            value: this.formData.property_id,
                                                            // Assuming property object has id and title/ref
                                                            proxyData: d => (d.result?.properties || []).map(p => ({ label: `${p.reference} - ${p.title}`, value: p.id })),
                                                            onChange: v => this.formData.property_id = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 6 }, 
                                                    children: [
                                                        new SelectBuilder({
                                                            future: () => HttpClient.instance.get("/clients"), // or /leads
                                                            label: "Cliente / Lead",
                                                            placeholder: "Selecione o cliente",
                                                            name: "client_id",
                                                            value: this.formData.client_id,
                                                            proxyData: d => (d.result?.clients || []).map(c => ({ label: c.name, value: c.id })),
                                                            onChange: v => this.formData.client_id = v
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Linha 2: Data + Horas + Corretor + Status
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 3 }, 
                                                    children: [
                                                        new DateInput({
                                                            label: "Data da Visita",
                                                            placeholder: "Data",
                                                            name: "visit_date",
                                                            value: this.formData.visit_date,
                                                            onChange: v => this.formData.visit_date = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 2 }, 
                                                    children: [
                                                        new DateInput({
                                                            label: "Início",
                                                            placeholder: "Hora",
                                                            props: { type: "time" },
                                                            name: "start_time",
                                                            value: this.formData.start_time,
                                                            onChange: v => this.formData.start_time = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 2 }, 
                                                    children: [
                                                        new DateInput({
                                                            label: "Fim",
                                                            placeholder: "Hora",
                                                            props: { type: "time" },
                                                            name: "end_time",
                                                            value: this.formData.end_time,
                                                            onChange: v => this.formData.end_time = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 3 }, 
                                                    children: [
                                                        new SelectBuilder({
                                                            future: () => HttpClient.instance.get("/users?role=agent"),
                                                            label: "Corretor Responsável",
                                                            placeholder: "Selecione",
                                                            name: "agent_id",
                                                            value: this.formData.agent_id,
                                                            proxyData: d => (d.result?.users || []).map(u => ({ label: u.name, value: u.id })),
                                                            onChange: v => this.formData.agent_id = v
                                                        })
                                                    ]
                                                }),
                                                new Expand({
                                                    breakpoints: { lg: 2 }, 
                                                    children: [
                                                        new SelectInput({
                                                            label: "Estado",
                                                            name: "status",
                                                            value: this.formData.status,
                                                            data: [
                                                                { label: "Agendada", value: "scheduled" },
                                                                { label: "Realizada", value: "completed" },
                                                                { label: "Cancelada", value: "cancelled" },
                                                                { label: "No Show", value: "no_show" }
                                                            ],
                                                            onChange: v => this.formData.status = v
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Descrição / Feedback
                                        new TextAreaInputBuilder({
                                            label: "Notas Internas / Feedback da Visita",
                                            placeholder: "Detalhes de acesso, chaves, ou feedback do cliente após a visita...",
                                            name: "notes",
                                            value: this.formData.notes,
                                            style: { height: "120px" },
                                            onChange: v => this.formData.notes = v
                                        }),

                                        // Lembretes
                                        new Row({
                                            children: [
                                                new Expand({
                                                    breakpoints: { lg: 6 }, 
                                                    children: [
                                                        new CheckBoxInput({
                                                            label: "Enviar lembrete ao cliente/corretor",
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
                                                            label: "Notificar com antecedência de",
                                                            value: this.formData.reminder_time,
                                                            name: "reminder_time",
                                                            data: [
                                                                { label: "1 hora", value: "1h" },
                                                                { label: "2 horas", value: "2h" },
                                                                { label: "1 dia", value: "1d" }
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
                                                    label: "Salvar Agendamento",
                                                    prefixIcon: new Icon({ icon: "fa-solid fa-calendar-check" }),
                                                    onPressed: () => this.saveVisit()
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