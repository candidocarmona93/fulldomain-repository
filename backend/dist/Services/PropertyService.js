import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";
import { HttpClient } from "../Services/HttpClient";
import { UIHelper } from "../Utils/UIHelper";

export class PropertyService {
    static async getProperty(propertyId) {
        try {
            return await HttpClient.instance.get(`/property/${propertyId}`);
        } catch (error) {
            console.error("Error fetching property:", error);
            throw error;
        }
    }

    static async createProperty() {
        try {
            return await HttpClient.instance.post(`/property/create`);
        } catch (error) {
            console.error("Error creating property:", error);
            throw error;
        }
    }

    static async saveProperty(formData) {
        const loading = new CircularProgressIndicator();
        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.put(
                `/property/${formData.id}`,
                formData
            );
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Imóvel salvo com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error saving property:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao salvar Imóvel",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async removeProperty(propertyId) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde...",
            dismissable: false,
        });

        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.delete(`/property/${propertyId}`);
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Imóvel removido com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error removing property:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao remover o Imóvel",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async getPropertyFeatures() {
        try {
            return await HttpClient.instance.get(`/property-features`);
        } catch (error) {
            console.error("Error fetching property feature:", error);
            throw error;
        }
    }

    static async removePropertyPhoto(image) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde...",
            dismissable: false,
        });

        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.delete(`/property/delete-image/${image.id}`, { filePath: image.url });
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Foto do imóvel removido com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error removing property image:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao remover o Imóvel",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async removeAsset(asset) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde...",
            dismissable: false,
        });

        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.delete(`/property/delete-asset/${asset.id}`, { filePath: asset.url });
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Fleyer removido com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error removing property asset:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao remover o Fleyer",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async setAsMainImage(image) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde...",
            dismissable: false,
        });

        try {
            loading?.show();

            const { result, status } = await HttpClient.instance.put(`/property/galleries/set-image-as-main/${image.id}`);
            if (status === 200 && result.status === "success") {
                UIHelper.showSuccessNotification({
                    message: "Foto do imóvel definida com principal com sucesso",
                });
            }
            return { result, status };
        } catch (error) {
            console.error("Error setting as main image:", error);
            UIHelper.showErrorNotification({
                message: "Ocorreu um erro ao definir foto o Imóvel como principal",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }

    static async sharePostToWhatsapp({ image, description, link }) {
        const PHONE_NUMBER_ID = '911179208735868';
        const ACCESS_TOKEN = 'EAALVOEF0hEMBP8KHL2WejvxI3La9dSunbJAZB8Jit25Da0EsiumK5UnphRqPOxDHIZCHAprvAoMAPUCcIplvj5ZA5cnqiIdr7RDCVvk8iuhyVfFPbL8UhRGXLXKgebOVrBavJiCrnmezr5dW95fVdMrBtoMhVqJI9Suq1LoxmnCrO7wd42X9RnlZALFo7cJNLHQuW1oDFP2kLIrbbQ0YUpXZCp4A8iltLlJjOa3867ZBwVAmGHgcndYhj948E1wLwlQC3M8yJIMCk7wRNUXWsm';
        const RECIPIENT = '258840169593';

        try {
            // Strip HTML tags from description if present (WhatsApp doesn't support HTML)
            const cleanDescription = description.replace(/<[^>]+>/g, '').trim();

            // Truncate description to fit within WhatsApp's 1024-character body limit
            const maxBodyLength = 1024 - (link.length + 1); // Reserve space for link and newline
            const truncatedDescription = cleanDescription.length > maxBodyLength
                ? cleanDescription.substring(0, maxBodyLength - 3) + '...'
                : cleanDescription;

            // Combine description and link in the body
            const bodyText = `${truncatedDescription}\n${link}`;

            // Use a short footer text (max 60 characters)
            const footerText = "Visite nosso site para mais detalhes!";

            // Prepare the message payload
            const payload = {
                messaging_product: 'whatsapp',
                to: RECIPIENT,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    header: {
                        type: 'image',
                        image: {
                            link: image, // Publicly accessible image URL
                        },
                    },
                    body: {
                        text: bodyText,
                    },
                    action: {
                        buttons: [
                            {
                                type: 'reply',
                                reply: {
                                    id: 'view_property',
                                    title: 'Ver Imóvel',
                                },
                            },
                        ],
                    },
                    footer: {
                        text: footerText,
                    },
                },
            };

            const response = await fetch(
                `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(`WhatsApp API error: ${data.error?.message || response.statusText}`);
            }

            UIHelper.showSuccessNotification({
                message: "Postagem compartilhada com sucesso no WhatsApp!",
            });
            return data;
        } catch (error) {
            console.error("Error sharing post:", error);
            UIHelper.showErrorNotification({
                message: "Erro ao compartilhar postagem no WhatsApp.",
            });
            throw error;
        }
    }

    static async shareToGoogleSheets({ propertyId, image, description, link }) {
        const SPREADSHEET_ID = 'your-spreadsheet-id-here'; // Replace with your Google Spreadsheet ID
        const SHEET_NAME = 'Sheet1'; // Replace with your target sheet name
        const ACCESS_TOKEN = 'your-google-api-access-token-here'; // Replace with your OAuth 2.0 access token or use a service account

        try {
            // Strip HTML tags from description to ensure clean text for Google Sheets
            const cleanDescription = description.replace(/<[^>]+>/g, '').trim();

            // Prepare the data to be appended to the Google Sheet
            const values = [
                [
                    propertyId, // Column 1: Property ID
                    cleanDescription, // Column 2: Description
                    image, // Column 3: Image URL
                    link, // Column 4: Link
                    new Date().toISOString() // Column 5: Timestamp
                ]
            ];

            // Prepare the payload for Google Sheets API
            const payload = {
                values: values
            };

            // Make the API request to append data to Google Sheets
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:E1:append?valueInputOption=    `,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Google Sheets API error: ${data.error?.message || response.statusText}`);
            }

            UIHelper.showSuccessNotification({
                message: "Dados compartilhados com sucesso no Google Sheets!",
            });
            return data;
        } catch (error) {
            console.error("Error sharing to Google Sheets:", error);
            UIHelper.showErrorNotification({
                message: "Erro ao compartilhar dados no Google Sheets.",
            });
            throw error;
        }
    }
}