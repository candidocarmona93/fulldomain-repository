import { CircularProgressIndicator } from "../../src/widgets/feedback/CircularProgressIndicator";
import { UIHelper } from "../Utils/UIHelper";
import { HttpClient } from "./HttpClient";

export class AIDescriptionGenerator {
    static async generateDescription({ formData }) {
        const loading = new CircularProgressIndicator({
            message: "Por favor aguarde..."
        });

        try {
            loading?.show();

            const { title, price, room, bathroom, area, category_id, finality_id, currency_id } = formData;

            // Fetch metadata
            const categoryResponse = await HttpClient.instance.get(`/categories/${category_id}`);
            const finalityResponse = await HttpClient.instance.get(`/finalities/${finality_id}`);
            const currencyResponse = await HttpClient.instance.get(`/currencies/${currency_id}`);

            const categoryName = categoryResponse?.result?.data?.name || "Categoria Desconhecida";
            const finalityName = finalityResponse?.result?.data?.name || "Finalidade Desconhecida";
            const currencySymbol = currencyResponse?.result?.data?.symbol || "MZN";

            // Determine audience and action
            const isRent = finalityName.toLowerCase().includes("Arrendar");
            const audience = isRent ? "arrendatários" : "compradores";
            const action = isRent ? "arrendar" : "comprar";

            // Prepare prompt
            const prompt = `
                Gera uma descrição concisa e profissional para um imóvel entre 100-150 palavras.

                **DETALHES DO IMÓVEL:**
                - Título: ${title || "Imóvel Moderno"}
                - Preço: ${price || "Contacte para preço"} ${currencySymbol}
                - Quartos: ${room || "N/A"}
                - Casas de Banho: ${bathroom || "N/A"}
                - Área: ${area || "N/A"} m²
                - Categoria: ${categoryName}
                - Finalidade: ${finalityName}
                - Público-Alvo: ${audience}
                - Ação Desejada: ${action}

                **INSTRUÇÕES:**
                1. Escreva uma descrição envolvente e orientada ao mercado
                2. Destaque as características principais
                3. Inclua uma chamada para ação clara no final
                4. Formate em HTML simples com tags: <p>, <strong>, <ul>, <li>
                5. **IMPORTANTE:** Comece diretamente com a formatação HTML sem nenhuma introdução ou texto prévio
                6. **IMPORTANTE:** Garanta que a descrição esteja COMPLETA e bem finalizada

                **FORMATO EXIGIDO:**
                <p><strong>[Título]</strong></p>
                <p>[Introdução envolvente]</p>
                <ul>
                <li>[Característica 1]</li>
                <li>[Característica 2]</li>
                </ul>
                <p>[Texto descritivo adicional]</p>
                <p><strong>[Chamada para ação]</strong></p>
            `;

            // Call Groq API
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer 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`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "És um assistente especializado em descrições imobiliárias profissionais e atrativas em português de Portugal."
                        },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            const groqResponse = await response.json();
            const generatedDescription = groqResponse?.choices[0]?.message?.content?.trim() || "Falha ao gerar descrição.";

            UIHelper.showSuccessNotification({
                message: "Descrição gerada com sucesso!",
            });

            return generatedDescription;
        } catch (error) {
            console.error("Error generating description:", error);
            UIHelper.showErrorNotification({
                message: "Erro ao gerar descrição com IA.",
            });
            throw error;
        } finally {
            loading?.close();
        }
    }
}