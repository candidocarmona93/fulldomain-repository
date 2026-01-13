import { BaseWidget } from "../../src/core/BaseWidget";
import { TableBuilder, TableBuilderController } from "../../src/widgets/data-display/TableBuilder";
import { FutureBuilderController } from "../../src/widgets/builders/FutureBuilderController";
import { FormController } from "../../src/widgets/forms/FormController";
import { HttpClient } from "../Services/HttpClient";
import { UIHelper } from "../Utils/UIHelper";
import { Icon } from "../../src/widgets/elements/Icon";
import { ContentHeaderComponent } from "../Components/ContentHeaderComponent";
import { Builder } from "../../src/widgets/builders/Builder";
import { BottomSheet } from "../../src/widgets/overlays/BottomSheet";
import { Button } from "../../src/widgets/buttons/Button";
import { ListTile } from "../../src/widgets/data-display/ListTile";
import { Download } from "../Services/Download";
import { HeaderTitleComponent } from "../Components/HeaderTitleComponent";
import { Themes } from "../../src/themes/Themes";
import { Form } from "../../src/widgets/forms/Form";
import { Row } from "../../src/widgets/layouts/Row";
import { Column } from "../../src/widgets/layouts/Column";
import { FloatingButton } from "../../src/widgets/buttons/FloatingButton";
import { Paginator } from "../../src/widgets/data-display/Paginator";
import { Container } from "../../src/widgets/layouts/Container";
import { RowBuilder } from "../../src/widgets/layouts/RowBuilder";
import { FutureBuilder } from "../../src/widgets/builders/FutureBuilder";
import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";

// Default configurations
const DEFAULT_STYLES = {
  inputHeight: "70px",
  buttonHeight: "70px",
  gap: "15px",
  padding: "0 1rem",
};

export const ADD_OR_UPDATE_PAGE_TYPES = {
  NEW_PAGE: "NEW_PAGE",
  POP_UP: "POP_UP",
};

export class BaseEntityHomePage extends BaseWidget {
  constructor({
    endpoint = "",
    pageTitle = "Entity",
    primaryKey = "id",
    dataMapper = "data",
    onFilter = null,
    onBack = null,
    displayType = "table", // "grid" or "table"
    downloadEndpoint = "",
    downloadLabel = "",
    handleAddOrUpdatePageType = ADD_OR_UPDATE_PAGE_TYPES.POP_UP,
  } = {}) {
    super();
    if (!endpoint) {
      throw new Error("Endpoint is required");
    }

    this.endpoint = endpoint;
    this.pageTitle = pageTitle;
    this.primaryKey = primaryKey;
    this.dataMapper = dataMapper;
    this.onFilter = onFilter;
    this.onBack = onBack;
    this.displayType = displayType;
    this.handleAddOrUpdatePageType = handleAddOrUpdatePageType;
    this.downloadEndpoint = downloadEndpoint;
    this.downloadLabel = downloadLabel;
    this.isUpdate = false;
    this.formData = {};

    this.initState({
      offset: 0,
      limit: 12,
      currentPage: 1,
      isLoadingNewRecord: false,
      isLoadingDataTable: false,
      totalItems: 0,
      isPasswordVisible: false,
      tags: {},
      calendarMode: false
    });

    this.tableBuilderController = new TableBuilderController();
    this.futureBuilderController = new FutureBuilderController();
    this.controller = new FormController();
  }

  // ========== API Handlers ==========
  /**
   * Handles API calls with loading state and error handling
   * @param {Function} apiCall - API call function
   * @param {Function} successCallback - Success callback
   * @param {string} loadingKey - State key for loading
   */
  async handleApiCall(apiCall, successCallback, loadingKey = "isLoadingNewRecord") {
    const loading = new CircularProgressIndicator({
      message: "Por favor aguarde..."
    });
    try {
      loading.show();
      this.state[loadingKey] = true;
      const response = await apiCall();
      if (response) {
        successCallback(response);
      }
    } catch (error) {
      UIHelper.showErrorNotification({ message: `Error: ${error.message}` });
      throw error;
    } finally {
      this.state[loadingKey] = false;
      loading.close();
    }
  }

  async handleCreateNewRecord() {
    await this.handleApiCall(
      () => HttpClient.instance.post(`${this.endpoint}/create`),
      ({ result }) => {
        this.formData = result.data[0] || {};
        this.isUpdate = false;
      }
    );
  }

  async handleRemoveRecord() {
    const key = this.getPrimaryKey();
    if (!this.formData[key]) {
      UIHelper.showErrorNotification({ message: "No record selected for deletion" });
      return;
    }
    await this.handleApiCall(
      () => HttpClient.instance.delete(`${this.endpoint}/${this.formData[key]}`),
      () => {
        UIHelper.showSuccessNotification({ message: "Deleted successfully" });
        this.formData = {};
        this.refreshData();
      }
    );
  }

  async handleUpdateRecord() {
    const key = this.getPrimaryKey();
    if (!this.formData[key] && this.isUpdate) {
      UIHelper.showErrorNotification({ message: "No record selected for update" });
      return;
    }
    await this.handleApiCall(
      () => HttpClient.instance.put(
        `${this.endpoint}/${this.formData[key]}`,
        this.formData
      ),
      () => {
        this.formData = {};
        UIHelper.showSuccessNotification({ message: "Saved successfully" });
        this.refreshData();
        this.bottomSheet?.close();
      },
      "isLoadingDataTable"
    );
  }

  async handleTableData(params) {
    return await HttpClient.instance.post(this.endpoint, params.query);
  }

  /**
   * Unified refresh method for both Table and Grid
   */
  refreshData() {
    this.state.currentPage = 1;
    this.state.offset = 0;

    if (this.displayType === "table") {
      this.tableBuilderController.setParams({
        query: {
          limit: this.state.limit,
          offset: 0,
          ...this.formData,
        },
      });
    } else {
      this.futureBuilderController.setParams({
        query: {
          limit: this.state.limit,
          offset: 0,
          ...this.formData,
        },
      });
    }
  }

  // Legacy support alias
  refreshTable() {
    this.refreshData();
  }

  getPrimaryKey() {
    return this.primaryKey;
  }

  updateFormData(key, value) {
    this.formData = { ...this.formData, [key]: value };
  }

  // ========== UI Components ==========
  showUpdateForm(title = "Formulário", subtitle = "Por favor preencha a informação solicitada") {
    this.bottomSheet = new BottomSheet({
      showCloseIcon: true,
      dismissable: false,
      content: [
        new ContentHeaderComponent({ title, subtitle }),
        new Builder({
          watch: () => {
            return this.state.isLoadingNewRecord
              ? UIHelper.createLoadingSpinner()
              : new Form({
                style: { display: "flex", flexDirection: "column", gap: DEFAULT_STYLES.gap },
                controller: this.controller,
                initialValues: this.formData,
                ariaLabel: `${title}`,
                children: [
                  ...this.createFormInputs(),
                  this.createFormActions(),
                ],
              });
          },
        }),
      ],
    });
    this.bottomSheet.show();
  }

  createFormActions({ onCancel = null, onConfirm = null } = {}) {
    return new Row({
      children: [
        new Button({
          theme: Themes.button.type.primary,
          label: "Salvar",
          onPressed: onConfirm || (async () => {
            if (this.controller.isValid()) {
              await this.handleUpdateRecord();
            }
          }),
          ariaLabel: "Save form",
        }),
        new Button({
          theme: Themes.button.type.danger,
          label: "Fechar",
          onPressed: onCancel || (() => this.bottomSheet?.close()),
          ariaLabel: "Close form",
        }),
      ],
    });
  }

  createTable() {
    return new TableBuilder({
      controller: this.tableBuilderController,
      future: (params) => this.handleTableData(params),
      params: {
        query: {
          limit: this.state.limit,
          offset: 0,
        },
      },
      proxyData: ({ result }) => {
        const response = typeof this.dataMapper == "function" ? this.dataMapper(result) : result[this.dataMapper] || {};
        this.state.totalItems = response.totalItems || 0;
        return response.data || [];
      },
      display: {
        empty: "No results found",
        error: "Error fetching results",
      },
      columns: this.createTableColumns(),
      onMounted: (_, refs) => {
        this.tableElement = refs.tableElement;
      },
    });
  }

  createGrid() {
    return new FutureBuilder({
      future: (params) => this.handleTableData(params),
      controller: this.futureBuilderController,
      params: {
        query: {
          limit: this.state.limit,
          offset: 0,
        },
      },
      builder: ({ result }) => {
        const response = typeof this.dataMapper == "function" ? this.dataMapper(result) : result[this.dataMapper] || {};

        this.setState(prev => {
          return {
            totalItems: response?.totalItems
          }
        });

        return new Builder({
          watch: () => {
            const cMode = this.state.calendarMode;

            return cMode ? this.createGridItem(response.data) : new RowBuilder({
              count: response?.data.length,
              gap: "20px",
              breakpoints: { xs: 12, md: 6, lg: 4, xl: 3 },
              builder: (index) => {
                const item = response?.data[index];
                return this.createGridItem(item);
              }
            });
          }
        })
      },
      onLoading: () => UIHelper.createLoadingSpinner(),
    });
  }

  createPaginator() {
    return new Builder({
      watch: () => {
        const { totalItems, limit, currentPage } = this.state;
        if (totalItems <= limit) return new Container();
        return new Paginator({
          currentPage,
          totalItems,
          itemsPerPage: limit,
          visiblePages: 5,
          onPageChange: (params) => {
            this.state.currentPage = params.page;
            this.state.offset = params.skip;

            if (this.displayType === "table") {
              this.tableBuilderController.setParams({
                query: { limit: params.limit, offset: params.skip, ...this.formData },
              });
            } else {
              this.futureBuilderController.setParams({
                query: { limit: params.limit, offset: params.skip, ...this.formData },
              });
            }
          },
        });
      },
    });
  }

  createExportTile(type, icon, theme) {
    return new ListTile({
      theme,
      leading: new Icon({ icon: `${icon} fa-3x`, ariaHidden: true }),
      title: `Export as ${type}`,
      subtitle: `Total of ${this.state.totalItems} results`,
      trailing: new Icon({ icon: "fa-solid fa-download", ariaHidden: true }),
      onTap: async () => {
        try {
          await Download.fromEndpoint({
            endpoint: this.downloadEndpoint,
            filters: this.formData,
          })[type.toLowerCase()](`${this.downloadLabel}_${type.toLowerCase()}`);
          this.exportSheet?.close();
        } catch (error) {
          UIHelper.showErrorNotification({ message: `Export failed: ${error.message}` });
        }
      },
      props: {
        ariaLabel: `Export as ${type}`,
      }
    });
  }

  showExportOptions() {
    this.exportSheet = new BottomSheet({
      showCloseIcon: true,
      dismissable: true,
      content: [
        new HeaderTitleComponent({ text: "Exportar Resultados" }),
        this.createExportTile("Excel", "fa-solid fa-file-excel", Themes.tile.type.primary),
      ],
      ariaLabel: "Export options",
    });
    this.exportSheet.show();
  }

  // ========== Main Components ==========
  createContent() {
    return new Column({
      style: { padding: DEFAULT_STYLES.padding },
      children: [
        new Builder({
          watch: () => {
            return new ContentHeaderComponent({
              title: this.pageTitle,
              subtitle: `Retornou um total de ${this.state.totalItems} resultados`,
              onExport: () => this.showExportOptions(),
              onFilter: this.onFilter,
              onBack: this.onBack,
            });
          },
        }),
        ...this.createFilterInputs(),
        this.displayType == "table" ? this.createTable() : this.createGrid(),
        this.createPaginator(),
      ].filter(Boolean),
    });
  }

  render() {
    this.children = [
      new FloatingButton({
        icon: new Icon({ icon: "fa fa-plus", ariaHidden: true }),
        onPressed: async () => {
          await this.handleCreateNewRecord();
          if (this.handleAddOrUpdatePageType === ADD_OR_UPDATE_PAGE_TYPES.POP_UP) {
            this.isUpdate = false;
            this.showUpdateForm(
              `${this.pageTitle}`,
              `Please fill in the details for ${this.pageTitle.toLowerCase()}`
            );
          } else {
            this.toNewPage(this.formData);
          }
        },
        ariaLabel: "Add new record",
      }),
      this.createContent(),
    ];
    return super.render();
  }

  // ========== Abstract Methods ==========
  createFormInputs() {
    throw new Error("createFormInputs must be implemented by child class");
  }

  createFilterInputs() {
    throw new Error("createFilterInputs must be implemented by child class");
  }

  createTableColumns() {
    throw new Error("createTableColumns must be implemented by child class");
  }

  /**
   * Must be implemented if displayType is 'grid'
   * @param {Object} item The data item for this grid cell
   */
  createGridItem(item) {
    throw new Error("createGridItem must be implemented by child class when displayType is 'grid'");
  }

  toNewPage(params) {
    throw new Error("to new page must be implemented by child class");
  }
}