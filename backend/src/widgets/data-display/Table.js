import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { CheckBoxInput } from "../forms/CheckBoxInput";
import { TextInput } from "../forms/TextInput";
import { Spinner } from "../feedback/Spinner";
import { Center } from "../layouts/Center";
import { Style } from "../../core/Style";
import { Paginator } from "./Paginator";
import { Builder } from "../builders/Builder";
import "../../styles/data_display/table-widget.css";

export class Table extends BaseWidget {
    constructor({
        theme = Themes.table.type.default,
        columns = [],
        data = [],
        display = {
            loading: null,
            empty: null,
            error: null
        },
        selectable = false,
        className = [],
        props = {},
        showPaginator = false,
        visiblePages = 4,
        itemsPerPage = 12,
        rowGroups = null,
        onSelected = null,
        onBeforeCreated = null,
        onCreated = null,
        onBeforeAttached = null,
        onAttached = null,
        onMounted = null,
    } = {}) {
        super({
            tagName: "div",
            className: ["table-container-widget"],
            props: { "aria-label": "table" },
            onBeforeCreated: (widget) => {
                onBeforeCreated?.(widget);
            },
            onCreated: (el, widget) => {
                onCreated?.(el, widget);
            },
            onBeforeAttached: (el, widget) => {
                onBeforeAttached?.(el, widget);
            },
            onAttached: (el, widget) => {
                this.tableContainerElement = el;

                const tableElement = this.tableElement;
                const tableHeaderElement = this.tableHeaderElement;
                const tableHeaderSearchInputElement = this.tableHeaderSearchInputElement;
                const tableBodyElement = this.tableBodyElement;

                onAttached?.(el, { tableElement, tableHeaderElement, tableHeaderSearchInputElement, tableBodyElement }, widget);
            },
            onMounted: (el, widget) => {
                this.tableContainerElement = el;

                const tableElement = this.tableElement;
                const tableHeaderElement = this.tableHeaderElement;
                const tableHeaderSearchInputElement = this.tableHeaderSearchInputElement;
                const tableBodyElement = this.tableBodyElement;

                onMounted?.(el, { tableElement, tableHeaderElement, tableHeaderSearchInputElement, tableBodyElement }, widget);
            }
        });

        this.columns = columns.map(col => ({
            sortable: col.sortable !== undefined ? col.sortable : false,
            filterable: col.filterable !== undefined ? col.filterable : false,
            filterType: "input",
            ...col,
        }));

        this.data = [...data];
        this.originalData = [...data];
        this.selectable = selectable;
        this.theme = theme;
        this.display = display;
        this.sortColumn = null;
        this.sortDirection = "asc";
        this.filters = {};
        this.selectedRows = new Set();
        this.onSelected = onSelected;
        this.showPaginator = showPaginator;
        this.visiblePages = visiblePages;
        this.itemsPerPage = itemsPerPage;
        this.rowGroups = rowGroups;

        this.body = null;
        this.config = { className, props };

        this.currentState = {
            status: data.length ? "success" : "loading",
            data: data.length ? data : [],
            error: null
        };

        this.initState({ tableCurrentPage: 1, tableTotalItems: data.length });
    }

    mounted() { }

    resolveValue(row, key) {
        if (typeof key === "function") {
            return key(row);
        }

        if (typeof key === "string" && key.includes(".")) {
            return key.split(".").reduce((acc, part) => acc && acc[part], row);
        }

        return row[key];
    }

    toggleSelectAll(checked) {
        if (checked) {
            this.selectedRows = new Set(this.data);
        } else {
            this.selectedRows.clear();
        }
        this.onSelected?.([...this.selectedRows]);
        this.createBody();
    }

    toggleRowSelection(row, checked) {
        if (checked) {
            this.selectedRows.add(row);
        } else {
            this.selectedRows.delete(row);
        }
        this.onSelected?.([...this.selectedRows]);
    }

    applyFilters() {
        let filteredData = this.originalData.filter(row =>
            Object.entries(this.filters).every(([column, value]) =>
                String(this.resolveValue(row, column) ?? "").toLowerCase().includes(value)
            )
        );

        if (this.sortColumn) {
            const columnConfig = this.columns.find(col => col.key === this.sortColumn);
            if (columnConfig?.sortFn) {
                filteredData = columnConfig.sortFn(filteredData, this.sortDirection);
            } else {
                filteredData = [...filteredData].sort((a, b) => {
                    const aVal = this.resolveValue(a, this.sortColumn);
                    const bVal = this.resolveValue(b, this.sortColumn);
                    return this.defaultSortFn(aVal, bVal, this.sortDirection);
                });
            }
        }

        if (this.showPaginator) {
            this.state.tableTotalItems = filteredData.length;
            const itemsPerPage = this.itemsPerPage;
            const currentPage = this.state.tableCurrentPage;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            this.currentState.data = filteredData.slice(start, end);
        } else {
            this.currentState.data = filteredData;
        }
    }

    defaultSortFn(a, b, direction) {
        if (typeof a === 'number' && typeof b === 'number') {
            return direction === "asc" ? a - b : b - a;
        } else if (a instanceof Date && b instanceof Date) {
            return direction === "asc" ? a - b : b - a;
        } else {
            a = String(a).toLowerCase();
            b = String(b).toLowerCase();
            if (a < b) return direction === "asc" ? -1 : 1;
            if (a > b) return direction === "asc" ? 1 : -1;
            return 0;
        }
    }

    handleFilter(column, value) {
        const val = value.toLowerCase();
        this.filters[column] = val || "";
        this.createBody();
    }

    handleSort(e, column) {
        const currentElement = e.currentTarget.querySelector(".sort-icon");

        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
            this.sortColumn = column;
            this.sortDirection = "asc";
        }

        currentElement.classList.remove("asc", "desc");
        currentElement.classList.add(this.sortDirection);

        this.createBody();
    }

    createTable() {
        return new BaseWidget({
            tagName: "table",
            className: ["table-widget", this.theme, ...this.config.className],
            children: [this.createHeader(), this.createBody(), this.createFooter()],
            props: { ...this.config.props },
            onAttached: (el) => (this.tableElement = el)
        });
    }

    createHeader() {
        const filterRow = this.createHeaderColumnFilter();
        const noFilter = filterRow.children.every(child => child.children.filter(Boolean).length === 0);

        return new BaseWidget({
            tagName: "thead",
            className: ["table-head-widget"],
            children: [
                this.createHeaderColumn(),
                !noFilter ? filterRow : null,
            ],
            props: { "role": "columnheader" },
            onAttached: (el) => (this.tableHeaderElement = el)
        });
    }

    createHeaderColumn() {
        return new BaseWidget({
            tagName: "tr",
            children: [
                this.selectable ? new BaseWidget({
                    tagName: "th",
                    children: [
                        new CheckBoxInput({
                            onChange: (checked) => this.toggleSelectAll(checked),
                        }),
                    ]
                }) : null,
                ...this.columns.map(col => new BaseWidget({
                    tagName: "th",
                    className: col.sortable ? ["table-head-sortable-widget"] : [],
                    children: [
                        col.label,
                        col.sortable ?
                            new BaseWidget({
                                tagName: "span",
                                className: ["sort-icon"],
                                onAttached: (el) => { }
                            }) : null
                    ].filter(Boolean),
                    events: {
                        click: (e) => col.sortable ? this.handleSort(e, col.key) : null
                    },
                }))
            ].filter(Boolean),
        });
    }

    createHeaderColumnFilter() {
        return new BaseWidget({
            tagName: "tr",
            className: ["table-filter-row-widget"],
            children: [
                this.selectable ? new BaseWidget({
                    tagName: "th",
                    props: {
                        colSpan: "1"
                    }
                }) : null,
                ...this.columns.map(col => new BaseWidget({
                    tagName: "th",
                    children: [
                        col.filterable ? new TextInput({
                            size: Themes.input.size.small,
                            placeholder: !col.placeholder ? `Search by ${col.key}` : col.placeholder,
                            name: `${col.key}`,
                            onChange: (value) => (col?.filterFn) ? col?.filterFn?.(col.key, value) : this.handleFilter(col.key, value),
                            onAttached: (el) => (this.tableHeaderSearchInputElement = el)
                        }) : null,
                    ]
                }))
            ].filter(Boolean),
        });
    }

    createBody() {
        try {
            this.applyFilters();
            const newBodyData = this.createBodyRowData();

            if (this.body) {
                this.body.children = [...newBodyData];
                this.body.update();
            } else {
                this.body = new BaseWidget({
                    tagName: "tbody",
                    className: ["table-body-widget"],
                    children: newBodyData,
                    onAttached: (el) => (this.tableBodyElement = el)
                });
            }
        } catch (error) {
            console.log(error)
        }

        return this.body;
    }

    createPlaceholder(message, placeholderClassName = "no-data", placeholderStyle) {
        return new BaseWidget({
            tagName: "tr",
            children: [
                new BaseWidget({
                    tagName: "td",
                    className: [placeholderClassName],
                    style: new Style({
                        color: "#ababab",
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        padding: "2.4rem",
                        ...placeholderStyle
                    }),
                    props: {
                        colSpan: this.columns.length + (this.selectable ? 1 : 0)
                    },
                    children: [
                        new Center({
                            children: [
                                typeof message === "string"
                                    ? new BaseWidget({
                                        tagName: "div",
                                        children: [
                                            message
                                        ]
                                    })
                                    : message
                            ]
                        })
                    ]
                })
            ]
        });
    }

    createBodyRowData() {
        const status = this.currentState.status;
        const data = this.currentState.data;
        const error = this.currentState.error;

        if (status === "loading") {
            return [this.createPlaceholder(this.display.loading || new Center({ children: [new Spinner()] }), "loading-data")];
        }

        if (status === "error") {
            return [this.createPlaceholder(this.display.error || `Failed to fetch data: ${error?.message}`, "error-data")];
        }

        if (status === "empty") {
            return [this.createPlaceholder(this.display.empty || "No data available", "empty-data")];
        }

        if (status === "success") {
            if (this.rowGroups) {
                return this.createGroupedRows(data);
            }
            return data.map(row => this.createStandardRow(row));
        }
    }

    createStandardRow(row) {
        return new BaseWidget({
            tagName: "tr",
            children: [
                this.selectable ? this.createSelectCell(row) : null,
                ...this.columns.map(col => this.createDataCell(row, col))
            ].filter(Boolean),
        });
    }

    createGroupedRows(data) {
        const groupedData = this.groupData(data);
        const rows = [];

        for (const group of groupedData) {
            group.rows.forEach((row, rowIndex) => {
                const isFirstRow = rowIndex === 0;
                const rowCells = [];

                if (this.selectable) {
                    rowCells.push(this.createSelectCell(row));
                }

                this.columns.forEach(col => {
                    if (this.rowGroups.groupColumns.includes(col.key) && !isFirstRow) {
                        return;
                    }

                    const cellProps = {};
                    if (this.rowGroups.groupColumns.includes(col.key)) {
                        cellProps.rowSpan = group.count;
                    }

                    rowCells.push(this.createDataCell(row, col, cellProps));
                });

                rows.push(new BaseWidget({
                    tagName: "tr",
                    children: rowCells
                }));
            });
        }

        return rows;
    }

    groupData(data) {
        const groups = [];
        let currentGroup = null;

        for (const row of data) {
            const groupKey = this.rowGroups.groupColumns
                .map(col => row[col])
                .join('|');

            if (!currentGroup || currentGroup.key !== groupKey) {
                currentGroup = {
                    key: groupKey,
                    rows: [],
                    count: 0
                };
                groups.push(currentGroup);
            }

            currentGroup.rows.push(row);
            currentGroup.count++;
        }

        return groups;
    }

    createDataCell(row, col, props = {}) {
        const cellValue = this.resolveValue(row, col.key);
        const className = [
            ...(col.className || []),
            typeof cellValue === "number" ? "type-number" : null
        ].filter(Boolean);

        return new BaseWidget({
            tagName: "td",
            className,
            style: col.style ? new Style({ ...col.style }) : {},
            props: {
                ...props,
                'data-column': col.key
            },
            children: [
                col.renderFn ? col.renderFn(cellValue, row) : cellValue
            ]
        });
    }

    createSelectCell(row) {
        return new BaseWidget({
            tagName: "td",
            children: [
                new CheckBoxInput({
                    value: this.selectedRows.has(row),
                    onChange: (checked) => this.toggleRowSelection(row, checked),
                }),
            ]
        });
    }

    createFooter() {
        return new BaseWidget({
            tagName: "tfoot",
            onAttached: (el) => (this.footerElement = el)
        });
    }

    createPaginator() {
        return new Builder({
            watch: () => {
                if (this.state.tableTotalItems > this.itemsPerPage)
                    return new Paginator({
                        visiblePages: this.visiblePages,
                        itemsPerPage: this.itemsPerPage,
                        currentPage: this.state.tableCurrentPage,
                        totalItems: this.state.tableTotalItems,
                        onPageChange: (params) => {
                            this.state.tableCurrentPage = params.page;
                            this.createBody();
                        }
                    });
            }
        });
    }

    onUpdate() {
        super.update();
    }

    render() {
        this.children = [this.createTable(), this.showPaginator ? this.createPaginator() : null].filter(Boolean);
        return super.render();
    }

    safeToString(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'symbol') return value.toString();
        return String(value);
    }
}