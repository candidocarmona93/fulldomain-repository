import { App } from "../../../../src/core/App";
import { Themes } from "../../../../src/themes/Themes";
import { Builder } from "../../../../src/widgets/builders/Builder";
import { FormController } from "../../../../src/widgets/forms/FormController";
import { Column } from "../../../../src/widgets/layouts/Column";
import { OffCanvas } from "../../../../src/widgets/overlays/OffCanvas";
import { ActiveFiltersDisplay } from "../../../Components/ActiveFiltersDisplay";
import { FormElements } from "../../../Components/FormElements";
import { HeaderTitleComponent } from "../../../Components/HeaderTitleComponent";
import { CATEGORY_FILTER_FIELDS } from "../../../Constants/Filters";
import { UIHelper } from "../../../Utils/UIHelper";
import { BaseEntityHomePage } from "../../BaseEntityHomePage";
import { SharedUtils } from "../../SharedUtils";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Bairros",
            endpoint: "/neighborhoods",
            primaryKey: "id",
            dataMapper: "neighborhoods",
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
                        CATEGORY_FILTER_FIELDS,
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
            UIHelper.createTextColumn({ label: "Nome", key: "name", width: "40%" }),
            UIHelper.createTextColumn({ label: "Cidade", key: ({ cities }) => cities?.name, }),
            UIHelper.createTextColumn({ label: "Provincia", key: ({ provinces }) => provinces?.name, }),
            UIHelper.createActionsColumn({
                width: "200px",
                actions: [
                    {
                        label: "Editar",
                        theme: Themes.button.type.primary,
                        onAction: (_, row) => {
                            this.formData = { ...row, country_id: 150 };
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
            this.formElements.createSelectBuilder({
                endpoint: "/provinces",
                label: "Provincia",
                name: "province_id",
                dataMapper: ({ result }) => result.provinces.map(p => ({ label: p.name, value: p.id })),
                onChange: (val) => {
                    this.updateFormData("province_id", val)
                }
            }),
            this.formElements.createSelectBuilder({
                endpoint: "/cities",
                label: "cidade",
                name: "city_id",
                dataMapper: ({ result }) => result.cities.map(c => ({ label: c.name, value: c.id })),
                onChange: (val) => {
                    this.updateFormData("city_id", val)
                }
            }),
            this.formElements.createTextInput({
                label: "Nome",
                name: "name",
                onChange: (val) => {
                    this.updateFormData("name", val)
                }
            }),
        ]
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