import { Themes } from "../../themes/Themes";
import { Table } from "./Table";

/**
 * @class TableBuilder
 * @extends Table
 * @description
 * A specialized `Table` component designed to fetch and display data asynchronously.
 * It takes a `future` (a Promise or a function returning a Promise) to load data,
 * handles loading, success, error, and empty states, and provides mechanisms
 * to set parameters and refresh the data.
 */
export class TableBuilder extends Table {
  constructor({
    theme = Themes.table.type.primary,
    future,
    params = {},
    columns = [],
    display = {},
    controller = null,
    onLoading = null,
    onSuccess = null,
    onError = null,
    onComplete = null,
    proxyData = null,
    selectable = false,
    className = [],
    props = {},
    style = {},
    rowGroups = null,
    showPaginator = false,
    onSelected = null,
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    if (!future) {
      throw new Error("TableBuilder expects future to be provided");
    }

    super({
      theme,
      columns,
      display,
      props,
      style,
      data: [],
      selectable,
      className,
      showPaginator,
      rowGroups,
      onSelected,
      onBeforeCreated,
      onCreated,
      onBeforeAttached,
      onAttached: (el, refs, widget) => {  
        this.subscribeToFuture();      
        onAttached?.(el, refs, widget);
      },
      onMounted: (el, refs, widget) => {
        onMounted?.(el, refs, widget);
      }
    });

    this.future = future;
    this.params = params;
    this.onLoading = onLoading?.bind(this);
    this.onSuccess = onSuccess?.bind(this);
    this.onError = onError?.bind(this);
    this.onComplete = onComplete?.bind(this);
    this.proxyData = proxyData?.bind(this);
    this.originalData = [];
    this._isMounted = false;

    if (controller) {
      controller.setTableBuilder(this);
    }
  }

  subscribeToFuture() {
    if (!this.future) return;

    this.onLoading?.();
    this.setCurrentState({
      status: "loading",
      data: [],
      error: null
    });

    try {
      const futurePromise = typeof this.future === 'function'
        ? this.future(this.params)
        : this.future;

      futurePromise
        .then((data) => {
          let results = data;
          if (this.proxyData) {
            results = this.proxyData(data);
          }

          const isEmpty = Array.isArray(results) && results.length === 0;
          this.originalData = [...results];
          this.data = [...results];

          this.setCurrentState({
            status: isEmpty ? "empty" : "success",
            data: results,
            error: null
          });

          this.onSuccess?.(results);
        })
        .catch((error) => {
          if (!this._isMounted) return;

          console.error("TableBuilder data fetch error:", error);
          this.setCurrentState({
            status: "error",
            data: [],
            error
          });
          this.onError?.(error);
        })
        .finally(() => {
          this.onComplete?.();
        });
    } catch (error) {
      console.error("TableBuilder error in subscribeToFuture:", error);
      this.setCurrentState({
        status: "error",
        data: [],
        error
      });
      this.onError?.(error);
    }
  }

  setParams(params) {
    this.params = { ...this.params, ...params };
    this.refresh();
  }

  refresh() {
    // Clear existing data
    this.originalData = [];
    this.data = [];
    this.filters = {};
    this.sortColumn = null;
    this.sortDirection = "asc";

    // Force a loading state update
    this.setCurrentState({
      status: "loading",
      data: [],
      error: null
    });

    // Use requestAnimationFrame to ensure UI updates before fetch
    requestAnimationFrame(() => {
      this.subscribeToFuture();
    });
  }

  getParams() {
    return this.params;
  }

  setCurrentState(newState) {
    // Update reactive state properties
    this.currentState.status = newState.status;
    this.currentState.error = newState.error;
    this.currentState.data = newState.data || [];

    // Force re-render with latest data
    this.createBody();
  }

  // Cleanup method to prevent updates after unmount
  unmounted() {

  }
}

export class TableBuilderController {
  constructor() {
    this.tableBuilder = null;
  }

  setTableBuilder(tableBuilder) {
    this.tableBuilder = tableBuilder;
  }

  setParams(params) {
    if (this.tableBuilder) {
      this.tableBuilder.setParams(params);
    } else {
      console.warn("TableBuilderController: No tableBuilder set");
    }
  }

  getParams() {
    return this.tableBuilder?.getParams();
  }

  refresh() {
    try {
      if (this.tableBuilder) {
        this.tableBuilder.refresh();
        return true;
      }
      console.warn("TableBuilderController: No tableBuilder set");
      return false;
    } catch (error) {
      console.error("TableBuilderController refresh failed:", error);
      return false;
    }
  }
}