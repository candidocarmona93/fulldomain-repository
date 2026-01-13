import { Themes } from "../../../src/themes/Themes";
import { FormElements } from "../../Components/FormElements";
import { PROPERTY_FILTER_FIELDS, TASK_FILTER_FIELDS } from "../../Constants/Filters";
import { ADD_OR_UPDATE_PAGE_TYPES, BaseEntityHomePage } from "../../BaseEntityHomePage";

export class Index extends BaseEntityHomePage {
    constructor() {
        super({
            pageTitle: "Tarefas",
            endpoint: "/tasks",
            dataMapper: "taks",
            handleAddOrUpdatePageType: ADD_OR_UPDATE_PAGE_TYPES.NEW_PAGE,
        });

        this.formElements = new FormElements();
    }

    createFilterInputs() {
        return [
            this.formElements.createForm({
                fields: TASK_FILTER_FIELDS,
                controller: this.controller,
                actions: [
                    {
                        label: "Pesquisar",
                        icon: "fa fa-search",
                        onPressed: () => {
                            this.formData = this.formElements.getFormData();
                            this.refreshTable();
                        }
                    },
                    {
                        label: "Limpar filtros",
                        icon: "fa fa-times",
                        theme: Themes.button.type.danger,
                        onPressed: () => {
                            this.formElements.resetFormData();
                            this.formData = this.formElements.getFormData();
                            this.refreshTable();
                        }
                    }
                ]
            })
        ];
    }

    createTableColumns() {
        return [];
    }

    render() {
        return super.render();
    }
}