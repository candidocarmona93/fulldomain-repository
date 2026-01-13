import { App } from "../../../../src/core/App";
import { Themes } from "../../../../src/themes/Themes";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { Button } from "../../../../src/widgets/buttons/Button";
import { Form } from "../../../../src/widgets/forms/Form";
import { FormController } from "../../../../src/widgets/forms/FormController";
import { Column } from "../../../../src/widgets/layouts/Column";
import { Row } from "../../../../src/widgets/layouts/Row";
import { OffCanvas } from "../../../../src/widgets/overlays/OffCanvas";
import { ActiveFiltersDisplay } from "../../../Components/ActiveFiltersDisplay";
import { ContentHeaderComponent } from "../../../Components/ContentHeaderComponent";
import { FormElements } from "../../../Components/FormElements";
import { HeaderTitleComponent } from "../../../Components/HeaderTitleComponent";
import { USER_FILTER_FIELDS } from "../../../Constants/Filters";
import { HttpClient } from "../../../Services/HttpClient";
import { UIHelper } from "../../../Utils/UIHelper";
import { BaseEntityHomePage } from "../../BaseEntityHomePage";
import { SharedUtils } from "../../SharedUtils";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Utilizadores",
            endpoint: "/users",
            primaryKey: "id",
            dataMapper: "users",
            onBack: () => {
                App.instance.back();
            },
            onFilter: () => {
                this.createOnFilterInputs()
            },
        });

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
                        USER_FILTER_FIELDS,
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

    showUpdatePasswordForm(row) {
        const controller = new FormController();
        this.updatePasswordForm = UIHelper.showBottomSheet({
            content: [
                new ContentHeaderComponent({ title: "Actualizar Senha", subtitle: "Coloque uma senha facil de lembrar e evite caracteres sequenciados" }),
                new Form({
                    controller,
                    onSubmit: this._handlePasswordUpdate,
                    payload: { id: row.id },
                    children: [
                        new Column({
                            children: [
                                this.formElements.createPasswordInput({
                                    label: "Senha",
                                    name: "password",
                                    required: true,
                                }),
                                this.formElements.createPasswordInput({
                                    label: "Confirmar Senha",
                                    required: true,
                                    validation: (val) => {
                                        const { password } = controller.getField("password");
                                        return password !== val ? "As senhas não conferem" : null;
                                    }
                                }),
                                new Row({
                                    children: [
                                        new Button({
                                            label: "Salvar",
                                            onPressed: async () => {
                                                const isValid = await controller.isValid();

                                                if (isValid) {
                                                    controller.submit();
                                                }
                                            }
                                        }),
                                        new Button({
                                            label: "Fechar",
                                            theme: Themes.button.type.danger,
                                            onPressed: () => {
                                                this.updatePasswordForm?.close()
                                            }
                                        }),
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
        this.updatePasswordForm?.show();
    }

    createTableColumns() {
        return [
            UIHelper.createTextColumn({ label: "Nome", key: "name" }),
            UIHelper.createTextColumn({ label: "Email", key: "email" }),
            UIHelper.createTextColumn({ label: "Utilizador", key: "username" }),
            UIHelper.createTextColumn({ label: "Privilégio", key: ({ roles }) => roles?.role }),
            UIHelper.createActionsColumn({
                width: "400px",
                actions: [
                    {
                        label: "Alterar senha",
                        onAction: (_, row) => {
                            this.showUpdatePasswordForm(row);
                        }
                    },
                    {
                        label: "Editar",
                        theme: Themes.button.type.primary,
                        onAction: (_, row) => {
                            this.formData = row;
                            this.showUpdateForm();
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
                label: "Utilizador",
                name: "username",
                onChange: (val) => {
                    this.updateFormData("username", val)
                }
            }),
            this.formElements.createTextInput({
                label: "Nome",
                name: "name",
                onChange: (val) => {
                    this.updateFormData("name", val)
                }
            }),
            this.formElements.createTextInput({
                label: "Email",
                name: "email",
                onChange: (val) => {
                    this.updateFormData("email", val)
                }
            }),

            this.formElements.createSelectBuilder({
                endpoint: "/roles",
                label: "Privilégio",
                name: "role_id",
                dataMapper: ({ result }) => {
                    return result.roles;
                },
                onChange: (val) => {
                    this.updateFormData("role_id", val)
                }
            }),
        ]
    }

    _handlePasswordUpdate = async ({ values, id }) => {
        console.log(values)
        try {
            const { result, status } = await HttpClient.instance.put(`users/update-password`, { password: values.password, id });
            if (result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Senha actualizada com sucesso"
                });
            }
        } catch (error) {
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao actualizar a senha"
            });
        } finally {
            this.updatePasswordForm?.close();
        }
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