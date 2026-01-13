import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";
import { UIHelper } from "../Utils/UIHelper";
import { HttpClient } from "./HttpClient";

export class VisitService {
    static async getVisit(visitId) {
        try {
            return await HttpClient.instance.get(`/visits/${visitId}`);
        } catch (error) {
            console.error("Error fetching Visit:", error);
            throw error;
        }
    }

    static async createVisit() {
        try {
            return await HttpClient.instance.post(`/visits/create`);
        } catch (error) {
            console.error("Error creating Visit:", error);
            throw error;
        }
    }

    static async saveVisit(formData) {
        const loading = new CircularProgressIndicator();
        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.put(
                `/visits/${formData.id}`,
                formData
            );
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Visita salvo com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error saving Visit:", error);
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async removeVisit(visitId) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde...",
            dismissable: false,
        });

        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.delete(`/visits/${visitId}`);
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Visita removido com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error removing visit:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao remover o Visita",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async addNotes(formData) {
        const loading = new CircularProgressIndicator();
        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.post(
                `/visits/${formData.visit_id}/notes/create`,
                formData
            );
            return { result, status };
        } catch (error) {
            console.error("Error saving Visit:", error);
            throw error;
        } finally {
            loading?.close();
        }
    }
}