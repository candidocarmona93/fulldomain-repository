import { BaseWidget } from "../../../../../src/core/BaseWidget";
import { Themes } from "../../../../../src/themes/Themes";
import { Button } from "../../../../../src/widgets/buttons/Button";
import { ListTile } from "../../../../../src/widgets/data-display/ListTile";
import { DateInput } from "../../../../../src/widgets/forms/DateInput";
import { Form } from "../../../../../src/widgets/forms/Form";
import { FormController } from "../../../../../src/widgets/forms/FormController";
import { SelectInput } from "../../../../../src/widgets/forms/SelectInput";
import { TextAreaInput } from "../../../../../src/widgets/forms/TextAreaInput";
import { TextInput } from "../../../../../src/widgets/forms/TextInput";
import { Column } from "../../../../../src/widgets/layouts/Column";
import { Expand } from "../../../../../src/widgets/layouts/Expand";
import { Row } from "../../../../../src/widgets/layouts/Row";
import { ContentHeaderComponent } from "../../../../Components/ContentHeaderComponent";
import { SearchComponent } from "../../../../Components/SearchComponent";
import { SharedUtils } from "../../../SharedUtils";

export class ScheduleVisitForm extends BaseWidget {
    constructor({ property, initialValues = {}, onScheduleVisit, onClose = null, } = {}) {
        super({
            style: {
                width: "100%"
            }
        });

        const init = {
            ...initialValues,
            property_id: this.property?.id,
        };

        this.initialValues = init;
        this.formData = init;

        this.property = property;
        this.onScheduleVisit = onScheduleVisit;
        this.onClose = onClose;

        this.controller = new FormController();
    }

    create() {
        return new Column({
            style: {
                overflowY: "auto",
                height: "100%",
                padding: "1rem"
            },
            children: [
                new ContentHeaderComponent({
                    title: "Marcar visita",
                    subtitle: "Agende uma visita para este imóvel"
                }),
                this._createForm(),
            ]
        });
    }

    _createForm() {
        return new Form({
            controller: this.controller,
            initialValues: this.initialValues,
            children: [
                new Row({
                    children: [
                        !this.property && new Expand({
                            breakpoints: { lg: 12 },
                            children: [
                                new SearchComponent({
                                    title: "Pesquisar Imovel",
                                    placeholder: "Pesquisar por nome, descrição ou endereço...",
                                    endpoint: "property",
                                    dataMapper: (response) => response?.properties || [],
                                    itemBuilder: (property) => new ListTile({
                                        leadingStyle: {
                                            background: "none!important"
                                        },
                                        title: property.title,
                                        subtitle: `${property.address || "Sem localização"}, ${property.price}`,
                                        leading: this._renderAvatarBadgeCell(property.title),
                                    }),
                                    onItemSelected: (item) => {
                                        this.formData = { ...this.formData, property_id: item.id }
                                    },
                                    onInit: () => this.formData.properties,
                                })
                            ]
                        }),

                        new Expand({
                            breakpoints: {
                                lg: 12
                            },
                            children: [
                                new SearchComponent({
                                    title: "Pesquisar Cliente",
                                    placeholder: "Pesquisar por nome, contacto ou e-mail...",
                                    endpoint: "clients",
                                    dataMapper: (response) => response?.clients || [],
                                    itemBuilder: (client) => new ListTile({
                                        leadingStyle: {
                                            background: "none"
                                        },
                                        title: client.name,
                                        subtitle: client.contact_1 || client.email || "Sem contato",
                                        leading: this._renderAvatarBadgeCell(client.name),
                                    }),
                                    onItemSelected: (item) => {
                                        this.formData = { ...this.formData, client_id: item.id }
                                    },
                                    onInit: () => this.formData.clients,
                                })
                            ]
                        }),

                        new Expand({
                            breakpoints: { lg: 12 },
                            children: [
                                new SearchComponent({
                                    title: "Pesquisar Agente",
                                    placeholder: "Pesquisar por nome, contacto ou e-mail...",
                                    endpoint: "/agents",
                                    dataMapper: (response) => response?.agents || [],
                                    itemBuilder: (agent) => new ListTile({
                                        leadingStyle: {
                                            background: "none"
                                        },
                                        title: agent.name,
                                        subtitle: agent.contact_1 || "Sem contato",
                                        leading: this._renderAvatarBadgeCell(agent.name),
                                    }),
                                    onItemSelected: (item) => {
                                        this.formData = { ...this.formData, agent_id: item.id }
                                    },
                                    onInit: () => this.formData.agents,
                                })
                            ]
                        }),

                        // Visit Date
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new DateInput({
                                    label: "Data",
                                    style: { height: "4rem" },
                                    props: {
                                        minDate: new Date().toISOString().split('T')[0],
                                    },
                                    name: "scheduled_date",
                                    required: true,
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, scheduled_date: val }
                                    }
                                })
                            ]
                        }),

                        // Visit Time
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new DateInput({
                                    label: "Hora",
                                    props: {
                                        type: "time",
                                        minTime: "08:00",
                                        maxTime: "20:00",
                                    },
                                    style: { height: "4rem" },
                                    name: "scheduled_time",
                                    required: true,
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, scheduled_time: val }
                                    }
                                })
                            ]
                        }),

                        // Visit Duration
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SelectInput({
                                    label: "Duração",
                                    name: "duration",
                                    style: { height: "4rem" },
                                    data: [
                                        { label: "30 minutos", value: "30" },
                                        { label: "1 hora", value: "60" },
                                        { label: "1 hora e 30 minutos", value: "90" },
                                        { label: "2 horas", value: "120" }
                                    ],
                                    value: "60",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, duration: val }
                                    }
                                })
                            ]
                        }),

                        // Visit Type
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SelectInput({
                                    label: "Tipo de visita",
                                    name: "visit_type",
                                    style: { height: "4rem" },
                                    data: [
                                        { label: "Primeira visita", value: "first_visit" },
                                        { label: "Visita de acompanhamento", value: "follow_up" },
                                        { label: "Visita técnica", value: "technical" },
                                        { label: "Vistoria", value: "inspection" },
                                        { label: "Assinatura", value: "signature" }
                                    ],
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, visit_type: val }
                                    }
                                })
                            ]
                        }),

                        // Priority
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SelectInput({
                                    label: "Prioridade",
                                    name: "priority",
                                    style: { height: "4rem" },
                                    data: [
                                        { label: "🟢 Baixa", value: "low" },
                                        { label: "🟡 Média", value: "medium" },
                                        { label: "🔴 Alta", value: "high" },
                                        { label: "⚡ Urgente", value: "urgent" }
                                    ],
                                    defaultValue: "medium",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, priority: val }
                                    }
                                })
                            ]
                        }),

                        // Status
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SelectInput({
                                    label: "Status",
                                    name: "status",
                                    style: { height: "4rem" },
                                    data: [
                                        { label: "🟢 Agendada", value: "scheduled" },
                                        { label: "🔵 Confirmada", value: "confirmed" },
                                        { label: "🟡 Pendente", value: "pending" },
                                        { label: "🟣 Em Andamento", value: "in_progress" },
                                        { label: "✅ Concluída", value: "completed" },
                                        { label: "❌ Cancelada", value: "cancelled" },
                                        { label: "🔄 Remarcada", value: "rescheduled" },
                                        { label: "⏰ Não Compareceu", value: "no_show" },
                                    ],
                                    value: "scheduled",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, status: val }
                                    }
                                })
                            ]
                        }),

                        // Meeting Point
                        new Expand({
                            breakpoints: { lg: 12 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new TextInput({
                                    label: "Ponto de encontro",
                                    name: "meeting_point",
                                    style: { height: "4rem" },
                                    placeholder: "Ex: Portaria, Recepção, Frente do prédio...",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, meeting_point: val }
                                    }
                                })
                            ]
                        }),

                        // Contact Phone
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new TextInput({
                                    label: "Telefone de contato",
                                    name: "contact_phone",
                                    style: { height: "4rem" },
                                    placeholder: "(00) 00000-0000",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, contact_phone: val }
                                    }
                                })
                            ]
                        }),

                        // Reminder Settings
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SelectInput({
                                    label: "Lembrete",
                                    name: "reminder",
                                    style: { height: "4rem" },
                                    data: [
                                        { label: "Sem lembrete", value: "none" },
                                        { label: "30 minutos antes", value: "30_min" },
                                        { label: "1 hora antes", value: "1_hour" },
                                        { label: "1 dia antes", value: "1_day" },
                                    ],
                                    value: "1_hour",
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, reminder: val }
                                    }
                                })
                            ]
                        }),

                        // Notes
                        new Expand({
                            breakpoints: { lg: 12 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new TextAreaInput({
                                    label: "Observações",
                                    name: "notes",
                                    placeholder: "Instruções de acesso, detalhes importantes, observações específicas...",
                                    maxLength: 500,
                                    showCharCount: true,
                                    onChange: (val) => {
                                        this.formData = { ...this.formData, notes: val }
                                    }
                                })
                            ]
                        }),

                        this._createActionButtons(),
                    ]
                })
            ]
        });
    }

    _createActionButtons() {
        return new Expand({
            breakpoints: { lg: 12 },
            children: [
                new Row({
                    children: [
                        new Button({
                            label: "Agendar Visita",
                            theme: Themes.button.type.primary,
                            onPressed: async () => {
                                const isValid = await this.controller.isValid();
                                if (isValid) {

                                    if (this.formData.hasOwnProperty("properties")) {
                                        delete this.formData.properties;
                                    }
                                    if (this.formData.hasOwnProperty("clients")) {
                                        delete this.formData.clients;
                                    }

                                    if (this.formData.hasOwnProperty("agents")) {
                                        delete this.formData.agents;
                                    }
                                    if (this.formData.hasOwnProperty("users")) {
                                        delete this.formData.users;
                                    }

                                    await this.onScheduleVisit?.(this.formData);
                                }
                            }
                        }),
                        new Button({
                            label: "Fechar",
                            theme: Themes.button.type.secondary,
                            onPressed: this.onClose
                        }),
                    ]
                })
            ]
        });
    }

    _renderAvatarBadgeCell(name) {
        const n = name || 'N/A';
        return SharedUtils.createAvatarBadge(n, {
            emptyName: 'N/A',
            emptyBackgroundColor: '#e9ecef',
            emptyTextColor: '#6c757d',
        });
    }

    render() {
        this.children = [this.create()];
        return super.render();
    }
}