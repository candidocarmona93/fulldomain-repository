import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";
import { UIHelper } from "../Utils/UIHelper";
import { HttpClient } from "./HttpClient";

export class TaskService {
    static async getTasks() {
        try {
            return await HttpClient.instance.get(`/tasks/${taskId}`);
        } catch (error) {
            console.error("Error fetching Task:", error);
            throw error;
        }
    }

    static async createTask() {
        try {
            return await HttpClient.instance.post(`/tasks/create`);
        } catch (error) {
            console.error("Error creating Task:", error);
            throw error;
        }
    }

    static async saveTask(formData) {
        const loading = new CircularProgressIndicator();
        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.put(
                `/tasks/${formData.id}`,
                formData
            );
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Tarefa salvo com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error saving Tarefa:", error);
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
                `/tasks/${formData.visit_id}/notes/create`,
                formData
            );
            return { result, status };
        } catch (error) {
            console.error("Error saving Task:", error);
            throw error;
        } finally {
            loading?.close();
        }
    }
}