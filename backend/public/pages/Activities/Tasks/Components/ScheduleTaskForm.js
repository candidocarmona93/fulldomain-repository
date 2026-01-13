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

export class ScheduleTaskForm extends BaseWidget {
    constructor({ onCreateTask, onClose, onScheduleTask = null, initialValues = {} }) {
        super();
        this.onCreateTask = onCreateTask;
        this.onClose = onClose;
        const init = {
            ...initialValues,
        };

        console.log(init)

        this.initialValues = init;
        this.formData = init;
        this.onScheduleTask = onScheduleTask;
        this.controller = new FormController();
    }

    create() {
        return new Column({
            style: { padding: "1rem", height: "100%", overflowY: "auto" },
            children: [
                new ContentHeaderComponent({ title: "Nova Tarefa", subtitle: "Crie e organize suas atividades" }),
                this._form()
            ]
        });
    }

    _form() {
        return new Form({
            controller: this.controller,
            initialValues: this.initialValues,
            children: [
                new Row({
                    children: [
                        // Title
                        new Expand({
                            breakpoints: { lg: 12 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new TextInput({
                                    style: { height: "4rem" },
                                    label: "Título da Tarefa",
                                    name: "title",
                                    required: true,
                                    onChange: v => this.formData.title = v
                                })
                            ]
                        }),

                        // Description
                        new Expand({
                            breakpoints: { lg: 12 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new TextAreaInput({
                                    label: "Descrição",
                                    name: "description",
                                    placeholder: "Detalhes sobre o que precisa ser feito...",
                                    onChange: v => this.formData.description = v
                                })
                            ]
                        }),

                        // Assignee
                        new Expand({
                            breakpoints: { lg: 12 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new SearchComponent({
                                    title: "Responsável",
                                    placeholder: "Buscar utilizadores...",
                                    endpoint: "/users",
                                    dataMapper: r => r?.users || [],
                                    itemBuilder: a => new ListTile({
                                        leadingStyle: {
                                            background: "none"
                                        },
                                        title: a.name,
                                        subtitle: a.roles?.role,
                                        leading: SharedUtils.createAvatarBadge(a.name)
                                    }),
                                    onItemSelected: item => this.formData.agent_id = item.id,
                                    onInit: () => this.formData.users,
                                })
                            ]
                        }),

                        // Due Date
                        new Expand({
                            breakpoints: { lg: 6 },
                            style: { marginBottom: "1rem" },
                            children: [
                                new DateInput({
                                    style: { height: "4rem" },
                                    label: "Prazo",
                                    name: "due_date",
                                    required: true,
                                    props: { minDate: new Date().toISOString().split('T')[0] },
                                    onChange: v => this.formData.due_date = v
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

                        // Reminder
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

                        // Notes
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
                            label: "Agendar Tarefa",
                            theme: Themes.button.type.primary,
                            onPressed: async () => {
                                const isValid = await this.controller.isValid();
                                if (isValid) {

                                    if (this.formData.hasOwnProperty("users")) {
                                        delete this.formData.users;
                                    }

                                    if (this.formData.hasOwnProperty("taskTypes")) {
                                        delete this.formData.taskTypes;
                                    }

                                    await this.onScheduleTask?.(this.formData);
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
}