export class VirtualAssistantService {
    static async chat({ message, conversationHistory = [] }) {
        try {
            const updatedHistory = [
                ...conversationHistory,
                { role: "user", content: message }
            ];

            const systemMessage = {
                role: "system",
                content: `Você é assistente da casacoimbramaputo - empresa MOÇAMBICANA de imóveis.

                    REGRAS ABSOLUTAS:
                    1. A casacoimbramaputo é empresa MOÇAMBICANA, sem relação com Portugal
                    2. "Coimbra" em nosso nome refere-se à COIMBRA DE MOÇAMBIQUE, não à cidade portuguesa
                    3. Escopo: exclusivamente mercado imobiliário MOÇAMBICANO
                    
                    RESPONDER:
                    - Foco em Maputo e todo Moçambique
                    - Máximo 150 palavras, respostas diretas
                    - Não discutir Portugal ou Coimbra-PT
                    - Se off-topic: "Só posso ajudar com imóveis em Moçambique"
                    
                    EMPRESA:
                    - Moçambicana, sede Maputo
                    - Compra/venda/aluguer em todo Moçambique
                    - Especialidade: Imoveis em Maputo
                    - Contacto: casacoimbramaputo@gmail.com, +258 84 549 8519 | +258 84 208 3827`
            };

            const messages = [
                systemMessage,
                ...updatedHistory.slice(-6)
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer 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`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7,
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.choices && data.choices[0] && data.choices[0].message) {
                const assistantMessage = data.choices[0].message.content;

                // Return both the response and updated conversation history
                return {
                    response: assistantMessage,
                    conversationHistory: [
                        ...updatedHistory,
                        { role: "assistant", content: assistantMessage }
                    ]
                };
            } else {
                throw new Error("Invalid response format from API");
            }

        } catch (error) {
            console.error("Error in VirtualAssistantService:", error);

            // Fallback response in case of API failure
            return {
                response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, entre em contacto diretamente pelo email info@casacoimbramaputo.com ou pelo telefone +351 XXX XXX XXX para obter informações sobre os nossos imóveis.",
                conversationHistory: conversationHistory,
                error: true
            };
        }
    }

    // Helper method for common property inquiries
    static async getPropertyInfo(propertyType, location) {
        const prompt = `Forneça informações gerais sobre ${propertyType} em ${location}. 
        Inclua características típicas, mercado local e vantagens da região. 
        Seja específico sobre ${location}.`;

        return await this.chat({ message: prompt });
    }

    static getContactInfo() {
        return {
            email: "casacoimbramaputo@gmail.com",
            phoneMozambique: "+258 84 549 8519 | +258 84 208 3827",
            addressMaputo: "Rua da Massala, 312 Inova Space, Maputo, Moçambique",
            hours: "Segunda a Sexta: 9h-17h, Sábado: 10h-13h"
        };
    }
}