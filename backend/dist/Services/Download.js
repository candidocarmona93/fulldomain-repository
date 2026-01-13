import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";
import { Toast } from "../../src/widgets/feedback/Toast";
import { Themes } from "../../src/themes/Themes";
import { UIHelper } from "../Utils/UIHelper";
import { HttpClient } from "./HttpClient";

export class Download {
    static method = {
        post: "POST",
        get: "GET"
    };

    static sourceType = {
        endpoint: "endpoint",
        table: "table",
        data: "data"
    }

    constructor({ endpoint = null, filters = {}, method = Download.method.post, sourceType = Download.sourceType.endpoint, tableId = null, data = [] } = {}) {
        this.endpoint = endpoint;
        this.filters = filters;
        this.method = method;
        this.sourceType = sourceType;
        this.tableId = tableId;
        this.data = data;
    }

    static fromEndpoint({ endpoint = null, filters = {}, method = Download.method.post } = {}) {
        return new Download({ endpoint, filters, method, sourceType: Download.sourceType.endpoint });
    }

    static fromTable({ id = null } = {}) {
        return new Download({ sourceType: Download.sourceType.table, tableId: id });
    }

    static fromData({ data = null } = {}) {
        return new Download({ sourceType: Download.sourceType.data, data });
    }

    async fetchData() {
        if (this.sourceType !== Download.sourceType.endpoint) return null;

        try {
            let response;

            if (this.method === Download.method.post) {
                const { result } = await HttpClient.instance.post(this.endpoint, this.filters);
                response = result;
            } else {
                const { result } = await HttpClient.instance.get(this.endpoint, this.filters);
                response = result;
            }

            if (response.status !== "success" && response.status != 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = response["data"];

            if (!Array.isArray(data)) {
                UIHelper.showErrorNotification({
                    message: "Unexpected data format received from server."
                });
                return null;
            }

            if (data.length === 0) {

                UIHelper.showInfoNotification({
                    message: "Nenhum dado retornado"
                });
                return null;
            }

            return data;
        } catch (error) {
            console.error("Download fetch error:", error);
            UIHelper.showErrorNotification({
                message: "Erro ao buscar dados para download"
            });
            return null;
        }
    }

    async getTableData() {
        const table = document.getElementById(this.tableId);
        if (!table) {
            new Toast({
                theme: Themes.toast.error,
                message: `Table with ID "${this.tableId}" not found.`
            }).show();
            return null;
        }

        const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.trim());
        const rows = Array.from(table.querySelectorAll("tbody tr")).map(tr => {
            const cells = Array.from(tr.querySelectorAll("td"));
            const rowData = {};
            cells.forEach((cell, index) => {
                rowData[headers[index]] = cell.innerText.trim();
            });
            return rowData;
        });

        return rows;
    }

    getData() {
        return this.data;
    }

    async excel(filename = null) {
        const loading = new CircularProgressIndicator({ message: "Por favor aguarde" });

        try {
            loading.show();
            let source = null;

            switch (this.sourceType) {
                case Download.sourceType.table:
                    source = await this.getTableData();
                    break;
                case Download.sourceType.endpoint:
                    source = await this.fetchData();
                    break;
                case Download.sourceType.data:
                    source = this.getData();
                    break;
                default:
                    source = null;
            }

            if (!source) return;

            const worksheet = XLSX.utils.json_to_sheet(source);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            XLSX.writeFile(workbook, `${filename ?? "export-" + generateUUID()}.xlsx`);
            return true;
        } catch (error) {
            console.error("Error downloading Excel:", error);
            new Toast({
                theme: Themes.toast.error,
                message: "Failed to download Excel. Please try again."
            }).show();
            return false;
        } finally {
            loading.close();
        }
    }

    async pdf(filename = "report.pdf", title = "Data Report") {
        const loading = new CircularProgressIndicator({ message: "Por favor aguarde" });

        try {
            loading.show();

            const data = this.sourceType === Download.sourceType.table ? await this.getTableData() : await this.fetchData();
            if (!data) return;

            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text(title, 14, 15);

            const headers = Object.keys(data[0]);
            const tableData = data.map(item => headers.map(key => item[key]));

            autoTable(doc, {
                startY: 20,
                head: [headers],
                body: tableData,
                theme: "grid",
                styles: { fontSize: 10 }
            });

            doc.save(filename);
            return true;
        } catch (error) {
            console.error("Error downloading PDF:", error);
            new Toast({
                theme: Themes.toast.error,
                message: "Failed to download PDF. Please try again."
            }).show();
            return false;
        } finally {
            loading.close();
        }
    }
}
