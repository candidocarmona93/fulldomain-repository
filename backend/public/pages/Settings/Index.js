import { App } from "../../../src/core/App";
import { BaseWidget } from "../../../src/core/BaseWidget";
import { ListTile } from "../../../src/widgets/data-display/ListTile";
import { Icon } from "../../../src/widgets/elements/Icon";
import { Text } from "../../../src/widgets/elements/Text";
import { Card } from "../../../src/widgets/layouts/Card";
import { Column } from "../../../src/widgets/layouts/Column";
import { Row } from "../../../src/widgets/layouts/Row";
import { ContentHeaderComponent } from "../../Components/ContentHeaderComponent";
import { AuthService } from "../../Services/AuthService";

export class Index extends BaseWidget {
    constructor() {
        super();
    }

    async mounted() { }

    createContent() {
        return new Column({
            style: {
                padding: '1rem',
                gap: '1.5rem' // Adds spacing between cards
            },
            children: [
                new ContentHeaderComponent({
                    title: 'Configurações',
                    subtitle: 'Gerencie e personalize as configurações do sistema imobiliário',
                    style: { marginBottom: '1rem' }
                }),

                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-users-gear' }),
                            new Text({
                                text: "Gerenciamento de Usuários e Stakeholders"
                            })
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
                                title: 'Privilégios e Permissões',
                                subtitle: 'Controle níveis de acesso e permissões de usuários',
                                leading: new Icon({ icon: 'fa-solid fa-user-shield', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/roles')
                            }),
                            new ListTile({
                                title: 'Utilizadores',
                                subtitle: 'Gerencie criação e edição de contas de utilizadores',
                                leading: new Icon({ icon: 'fa-solid fa-users', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/users')
                            }),
                            new ListTile({
                                title: 'Proprietários',
                                subtitle: 'Administre registros de proprietários de imóveis',
                                leading: new Icon({ icon: 'fa-solid fa-user-tie', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/owners')
                            }),
                            new ListTile({
                                title: 'Agentes',
                                subtitle: 'Configure perfis de agentes imobiliários',
                                leading: new Icon({ icon: 'fa-solid fa-user-secret', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/agents')
                            }),
                            new ListTile({
                                title: 'Clientes',
                                subtitle: 'Gerencie perfis de clientes imobiliários',
                                leading: new Icon({ icon: 'fa-solid fa-user-group', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem' },
                                onTap: () => App.instance.to('/configurations/clients')
                            })
                        ]
                    })
                }),

                // Section 2: Property Settings
                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-house' }),
                            new Text({
                                text: "Configurações de Imóveis"
                            })
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
                                title: 'Categorias',
                                subtitle: 'Configure categorias para classificação de imóveis',
                                leading: new Icon({ icon: 'fa-solid fa-sliders', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/categories')
                            }),
                            new ListTile({
                                title: 'Comodidades',
                                subtitle: 'Personalize comodidades disponíveis para imóveis',
                                leading: new Icon({ icon: 'fa-solid fa-tags', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/property-features') // Fixed typo
                            }),
                            new ListTile({
                                title: 'Finalidades',
                                subtitle: 'Defina finalidades para uso de imóveis',
                                leading: new Icon({ icon: 'fa-solid fa-bullseye', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/finalities')
                            }),
                            new ListTile({
                                title: 'Bairros',
                                subtitle: 'Gerencie informações de bairros e localizações',
                                leading: new Icon({ icon: 'fa-solid fa-map-location-dot', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', },
                                onTap: () => App.instance.to('/configurations/neighborhoods')
                            })
                        ]
                    })
                }),

                // Section 3: System Settings
                new Card({
                    header: new Row({
                        children: [
                            new Icon({ icon: 'fa-solid fa-gears' }),
                            new Text({
                                text: "Configurações do Sistema"
                            })
                        ]
                    }),
                    style: {
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    },
                    body: new Column({
                        style: { padding: '1rem' },
                        children: [
                            /*new ListTile({
                                title: 'Parâmetros do Sistema',
                                subtitle: 'Ajuste configurações globais do sistema',
                                leading: new Icon({ icon: 'fa-solid fa-sliders', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/system-parameters')
                            }),
                            new ListTile({
                                title: 'APIs e Integrações',
                                subtitle: 'Configure integrações com serviços externos',
                                leading: new Icon({ icon: 'fa-solid fa-plug', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem' },
                                onTap: () => App.instance.to('/configurations/api-integrations')
                            }),*/
                            new ListTile({
                                title: 'Sair da Aplicação',
                                subtitle: 'Encerre a sessão atual com segurança',
                                leading: new Icon({ icon: 'fa-solid fa-right-from-bracket', }),
                                trailing: new Icon({ icon: 'fa-solid fa-chevron-right' }),
                                style: { padding: '0.75rem', borderRadius: '6px' },
                                onTap: async () => { 
                                    await AuthService.logout()
                                    App.instance.to("/auth");
                                }
                            })
                        ]
                    })
                })
            ]
        });
    }

    render() {
        this.children = [this.createContent()];
        return super.render();
    }
}