import { App } from "../../../../src/core/App";
import { Themes } from "../../../../src/themes/Themes";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { Text } from "../../../../src/widgets/elements/Text";
import { Column } from "../../../../src/widgets/layouts/Column";
import { OffCanvas } from "../../../../src/widgets/overlays/OffCanvas";
import { ActiveFiltersDisplay } from "../../../Components/ActiveFiltersDisplay";
import { FormElements } from "../../../Components/FormElements";
import { HeaderTitleComponent } from "../../../Components/HeaderTitleComponent";
import { ROLE_FILTER_FIELDS } from "../../../Constants/Filters";
import { UIHelper } from "../../../Utils/UIHelper";
import { BaseEntityHomePage } from "../../BaseEntityHomePage";
import { SharedUtils } from "../../SharedUtils";

const ROLES = [
    {
        type: "Imovel",
        roles: [
            {
                label: "Informação geral",
                value: "general_info"
            },

            {
                label: "Endereço e geolocalização",
                value: "address_geolocation"
            },

            {
                label: "Imagens do Imóvel",
                value: "property_images"
            },

            {
                label: "Fleyers",
                value: "assets"
            },
        ]

    },
    {
        type: "Actividades",
        roles: [
            {
                label: "Gerir tarefas",
                value: "manage_tasks"
            },

            {
                label: "Gerir visitas",
                value: "manage_visits"
            },
        ]

    },
    {
        type: "Configurações",
        roles: [
            {
                label: "Gerir utilizadores",
                value: "manage_users"
            },
            {
                label: "Gerir agentes",
                value: "manage_agents"
            },
            {
                label: "Gerir proprietários",
                value: "manage_owners"
            },
            {
                label: "Gerir clientes",
                value: "manage_clients"
            },
            {
                label: "Gerir categorias",
                value: "manage_categories"
            },
            {
                label: "Gerir comodidades",
                value: "manage_features"
            },
            {
                label: "Gerir finalidades",
                value: "manage_finalities"
            },
            {
                label: "Gerir bairros",
                value: "manage_neighborhoods"
            },
            {
                label: "Gerir parâmetros do sistema",
                value: "manage_system_parameters"
            },
            {
                label: "Gerir API's e integrações",
                value: "manage_apis_and_integrations"
            },
        ]

    },
]

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Privilégios e Permissões",
            endpoint: "/roles",
            primaryKey: "id",
            dataMapper: "roles",
            onBack: () => {
                App.instance.back();
            },
            onFilter: () => {
                this.createOnFilterInputs()
            },
        });

        this.permissions = {};
        this.formElements = new FormElements();
    }

    createOnFilterInputs() {
        this.filtersOffCanvas = new OffCanvas({
            content: new Column({
                style: {
                    overflowY: "auto",
                    height: "100%"
                },
                children: [
                    new HeaderTitleComponent({
                        text: "Filtros"
                    }),
                    ...SharedUtils.createFilterInputs(
                        this.formElements,
                        this.controller,
                        ROLE_FILTER_FIELDS,
                        () => this._applyFilters(),
                        () => this._clearFilters(),
                        this.formData
                    )
                ]
            })
        });

        this.filtersOffCanvas.show();
    }

    createFilterInputs() {
        return [
            new Builder({
                watch: () => {
                    const tags = this.state.tags;

                    return new ActiveFiltersDisplay({
                        tags,
                        onRemoveTag: (label, key) => {
                            this.formData = this.formElements.getFormData();
                            delete this.formData[key];
                            this.formElements.removeFormDataKey?.[key];

                            this.setState(prev => ({
                                tags: Object.fromEntries(Object.entries(prev.tags || {}).filter(([k]) => k !== label))
                            }));

                            this.refreshData();
                        },
                        onClearAll: () => {
                            this._clearFilters();
                            this.setState({ tags: {} });
                        },
                        emptyMessage: "Nenhum filtro aplicado"
                    }).create()
                }
            })
        ]
    }

    createTableColumns() {
        return [
            UIHelper.createTextColumn({ label: "Privilégio", key: "role" }),
            UIHelper.createStatusColumn({ label: "Status", key: "status" }),
            UIHelper.createActionsColumn({
                width: "200px",
                actions: [
                    {
                        label: "Editar",
                        onAction: (_, row) => {
                            try {
                                this.permissions = JSON.parse(row.permissions);
                            } catch (error) {

                            }
                            this.formData = { ...row, status: Boolean(row.status) };
                            this.showUpdateForm();

                            if (this.permissions) {
                                Object.entries(this.permissions).forEach(([key, value]) => {
                                    this.controller.setFieldValue(key, value);
                                });
                            }
                        }
                    },
                    {
                        label: "Remover",
                        theme: Themes.button.type.danger,
                        onAction: (_, row) => {
                            this.formData = row;
                            const removeBottomSheet = UIHelper.showConfirmationDialog({
                                title: "Deseja realmente remover esse registo?",
                                subtitle: "Esta ação é irreversível. Toda informação relacionado com este registo vai ser removido do sistema permanentemente, confirme antes de continuar.",
                                confirmLabel: "Sim, remover",
                                cancelLabel: "Fechar",
                                onConfirm: async () => {
                                    removeBottomSheet?.close();
                                    await this.handleRemoveRecord();
                                },
                                onCancel: () => {
                                    removeBottomSheet?.close();
                                }
                            })
                        }
                    }
                ]
            })
        ];
    }

    createFormInputs() {
        return [
            this.formElements.createTextInput({
                label: "Nome do Privilégio",
                name: "role",
                placeholder: "Ex: Gestor de Imóveis, Administrador",
                required: true,
                value: this.formData?.role || "",
                onChange: (val) => {
                    this.updateFormData("role", val);
                }
            }),
            this.formElements.createCheckBoxInput({
                label: "Status",
                name: "status",
                onChange: (val) => {
                    this.updateFormData('status', Boolean(val) ? 1 : 0);
                }
            }),
            ...ROLES.map(group => {
                return new Column({
                    children: [
                        new Text({
                            text: group?.type
                        }),
                        ...group?.roles.map(role => {
                            return this.formElements.createCheckBoxInput({
                                label: role?.label,
                                name: role?.value,
                                onChange: (val) => {
                                    if (Boolean(val) === true) {
                                        this.permissions = { ...this.permissions, [role?.value]: true }
                                    } else {
                                        delete this.permissions[role?.value]
                                    }
                                    this.updateFormData('permissions', JSON.stringify(this.permissions));
                                }
                            })
                        })
                    ]
                })
            }),
        ];
    }

    _applyFilters() {
        this.formData = this.formElements.getFormData();
        this.refreshData();
        this.filtersOffCanvas?.close();

        this.setState(prev => {
            const newTags = { ...this.formElements.getSearchTagData() }
            return {
                tags: newTags,
            }
        })
    }

    _clearFilters() {
        this.formData = {};
        this.refreshData();
        this.formElements.resetFormData();
        this.formElements.resetSearchTagData();
        this.filtersOffCanvas?.close();
    }
}