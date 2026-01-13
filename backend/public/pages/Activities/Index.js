import { App } from "../../../src/core/App";
import { BaseWidget } from "../../../src/core/BaseWidget";
import { ListTile } from "../../../src/widgets/data-display/ListTile";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Text } from "../../../src/widgets/elements/Text";
import { Card } from "../../../src/widgets/layouts/Card";
import { Column } from "../../../src/widgets/layouts/Column";
import { Row } from "../../../src/widgets/layouts/Row";
import { ContentHeaderComponent } from "../../Components/ContentHeaderComponent";

export class Index extends BaseWidget {
    constructor() {
        super();
    }

    async mounted() { }

    createContent() {
        return new Column({
            style: {
                padding: '1rem',
                gap: '1.5rem'
            },
            children: [
                new ContentHeaderComponent({
                    title: 'Actividades',
                    subtitle: 'Gerencie todas as actividades operacionais do dia a dia',
                    style: { marginBottom: '1rem' }
                }),

                // Tarefas & Agendamentos
                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-clipboard-list' }),
                            new Text({ text: "Tarefas, Visitas e Feedbacks" })
                        ]
                    }),
                    style: {
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '1rem'
                    },
                    body: new Column({
                        style: { padding: '1rem' },
                        children: [
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Tarefas',
                                subtitle: 'Criar, atribuir e acompanhar tarefas da equipa',
                                leading: new Icon({ icon: 'fa-solid fa-clipboard-check' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/tasks')
                            }),
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Visitas',
                                subtitle: 'Gerir visitas a imóveis e horários',
                                leading: new Icon({ icon: 'fa-solid fa-calendar-check' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/visits')
                            }),
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Feedbacks de Clientes',
                                subtitle: 'Recolher e analisar opiniões após visitas',
                                leading: new Icon({ icon: 'fa-solid fa-comment-dots' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/feedback')
                            }),
                        ]
                    })
                }),

                // Follow-up & Comunicação
                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-headset' }),
                            new Text({ text: "Follow-up e Comunicação" })
                        ]
                    }),
                    style: {
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '1rem'
                    },
                    body: new Column({
                        style: { padding: '1rem' },
                        children: [
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Contactos Pendentes',
                                subtitle: 'Leads e clientes aguardando retorno',
                                leading: new Icon({ icon: 'fa-solid fa-phone-volume' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/followups')
                            }),
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Notificações',
                                subtitle: 'Alertas de aniversários, contratos, etc.',
                                leading: new Icon({ icon: 'fa-solid fa-bell' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/notifications')
                            }),
                        ]
                    })
                }),

                // Relatórios
                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-chart-line' }),
                            new Text({ text: "Relatórios de Actividade" })
                        ]
                    }),
                    style: {
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '1rem'
                    },
                    body: new Column({
                        style: { padding: '1rem' },
                        children: [
                            new ListTile({
                                className: ['settings-item-component'],
                                title: 'Dashboard Diário',
                                subtitle: 'Resumo das actividades do dia e semana',
                                leading: new Icon({ icon: 'fa-solid fa-gauge-high' }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/activities/dashboard')
                            }),
                        ]
                    })
                }),
            ]
        });
    }

    render() {
        this.children = [this.createContent()];
        return super.render();
    }
}