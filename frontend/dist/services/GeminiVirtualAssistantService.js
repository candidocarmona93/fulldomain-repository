import { GoogleGenAI, Type } from "@google/genai";

// -----------------------------------------------------------
// 1. CONFIGURAÇÃO DO MODELO GEMINI
// -----------------------------------------------------------
// O cliente irá procurar a chave API na variável de ambiente GEMINI_API_KEY
const ai = new GoogleGenAI({apiKey: "AIzaSyAOapxEBFvTxO9anSKTyW9qizS32N4-zBs"});
const MODEL_NAME = "gemini-2.5-flash"; // Modelo rápido e capaz de Function Calling

// -----------------------------------------------------------
// 2. MOCK DE BASE DE DADOS E FUNÇÃO DE PESQUISA
//    (Em produção, esta função faria uma chamada a uma API/Base de Dados real)
// -----------------------------------------------------------

// Base de Dados Mock para demonstração de filtragem
const mockDatabase = [
    // Maputo (Apartamentos)
    { id: 1, location: "Maputo", type: "Apartamento", bedrooms: 3, price: 150000, description: "Apartamento T3 moderno na Sommerschield, Maputo, com vista para o mar. Preço: 150.000 USD." },
    { id: 2, location: "Maputo", type: "Apartamento", bedrooms: 2, price: 95000, description: "Apartamento T2 no centro da cidade, ideal para investimento. Preço: 95.000 USD." },
    // Matola (Casas)
    { id: 3, location: "Matola", type: "Casa", bedrooms: 4, price: 200000, description: "Casa luxuosa T4 com piscina e jardim na Matola. Preço: 200.000 USD." },
    { id: 4, location: "Matola", type: "Casa", bedrooms: 2, price: 60000, description: "Casa T2 acessível, perto de transportes públicos. Preço: 60.000 USD." },
    // Nampula (Terrenos)
    { id: 5, location: "Nampula", type: "Terreno", bedrooms: 0, price: 30000, description: "Terreno de 1000m² para construção, excelente localização. Preço: 30.000 USD." }
];

/**
 * Função Mock para pesquisar propriedades.
 * Em um cenário real, faria uma chamada a um backend.
 */
const searchProperties = ({ location, type, minPrice, maxPrice, bedrooms }) => {
    // Nota: O mock usa USD. Se a declaração da função usa MZN, a conversão é feita pelo modelo.
    let results = mockDatabase.filter(p => {
        let match = true;
        
        // As localizações e tipos devem ser consistentes com o que o modelo extrai
        if (location && p.location.toLowerCase() !== location.toLowerCase()) match = false;
        if (type && p.type.toLowerCase() !== type.toLowerCase()) match = false;
        if (minPrice && p.price < minPrice) match = false;
        if (maxPrice && p.price > maxPrice) match = false;
        // O campo bedrooms só deve ser considerado se for um número > 0 para tipos de casa/apartamento
        if (bedrooms !== undefined && bedrooms !== null && bedrooms > 0 && p.bedrooms !== bedrooms) match = false;
        
        return match;
    }).slice(0, 3); // Limita os resultados para uma resposta concisa

    if (results.length > 0) {
        return {
            status: "success",
            count: results.length,
            properties: results.map(p => ({
                id: p.id,
                location: p.location,
                type: p.type,
                bedrooms: p.bedrooms > 0 ? `${p.bedrooms} quartos` : 'N/A',
                price: `${p.price} USD`,
                summary: p.description
            })),
            disclaimer: "Os resultados apresentados são apenas um resumo dos 3 melhores. Contacte-nos para a lista completa e valores atuais em MZN."
        };
    } else {
        return {
            status: "not_found",
            message: `Não encontramos imóveis que correspondam aos seus critérios.`,
            suggestions: "Tente alargar a sua pesquisa (ex: menos quartos, faixa de preço diferente) ou entre em contacto direto connosco."
        };
    }
};

// Declaração da função (Schema que o Gemini usa para saber como chamar a Tool)
const searchPropertiesDeclaration = {
    name: 'searchProperties',
    description: 'Procura e filtra imóveis no inventário da casacoimbramaputo com base em localização, tipo (Casa, Apartamento, Terreno), número de quartos e faixa de preço em Moçambique.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.STRING,
                description: 'A cidade ou área de Moçambique (ex: Maputo, Matola, Nampula).'
            },
            type: {
                type: Type.STRING,
                description: 'O tipo de propriedade, como "Apartamento", "Casa" ou "Terreno".'
            },
            minPrice: {
                type: Type.NUMBER,
                description: 'O preço mínimo em USD (Dólar Americano). O utilizador pode fornecer MZN, mas deve ser convertido para USD antes de usar esta função para manter a consistência com a base de dados mock.'
            },
            maxPrice: {
                type: Type.NUMBER,
                description: 'O preço máximo em USD (Dólar Americano).'
            },
            bedrooms: {
                type: Type.INTEGER,
                description: 'O número de quartos (T1, T2, T3, etc.). Deve ser o número inteiro.'
            },
        },
    },
};

// Mapeamento das funções para execução
const availableTools = {
    searchProperties: searchProperties,
};

// -----------------------------------------------------------
// 3. SERVICE E LÓGICA DE CHAT
// -----------------------------------------------------------

const mapToGeminiContent = (history) => {
    return history.map(turn => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
    }));
};

export class GeminiVirtualAssistantService {
    static async chat({ message, conversationHistory = [] }) {
        try {
            const newUserMessage = { role: "user", content: message };
            const updatedHistory = [
                ...conversationHistory,
                newUserMessage
            ];

            const systemInstruction = `Você é assistente da casacoimbramaputo - empresa MOÇAMBICANA de imóveis.

                    REGRAS ABSOLUTAS:
                    1. A casacoimbramaputo é empresa MOÇAMBICANA, sem relação com Portugal.
                    2. "Coimbra" em nosso nome refere-se a COIMBRA DE MOÇAMBIQUE, não à cidade portuguesa.
                    3. Escopo: exclusivamente mercado imobiliário MOÇAMBICANO.
                    4. Use a função 'searchProperties' quando o utilizador solicitar a listagem ou filtragem de imóveis.

                    RESPONDER:
                    - Foco em Maputo e todo Moçambique.
                    - Respostas diretas.
                    - Não discutir Portugal ou Coimbra-PT.
                    - Se off-topic: "Só posso ajudar com imóveis em Moçambique".
                    
                    EMPRESA:
                    - Moçambicana, sede Maputo.
                    - Compra/venda/aluguer em todo Moçambique.
                    - Especialidade: Imoveis em Maputo.
                    - Contacto: casacoimbramaputo@gmail.com, +258 84 549 8519 | +258 84 208 3827`;

            let contents = mapToGeminiContent(updatedHistory);
            
            // Passo 1: Enviar a mensagem com as declarações de função
            let response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                    tools: [{ functionDeclarations: [searchPropertiesDeclaration] }]
                },
            });

            let assistantMessage = "";
            let functionCallPart = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

            // Passo 2: Verificar se o modelo decidiu chamar uma função
            if (functionCallPart) {
                const functionName = functionCallPart.name;
                const functionArgs = functionCallPart.args;
                
                const func = availableTools[functionName];

                if (!func) {
                    throw new Error(`Função não encontrada: ${functionName}`);
                }

                // Executar a função mock local
                const functionResult = func(functionArgs);

                // Adicionar a chamada de função e a resposta da função ao histórico
                contents = [...contents, {
                    role: 'model',
                    parts: [{ functionCall: functionCallPart }],
                }];

                contents = [...contents, {
                    role: 'function',
                    parts: [{
                        functionResponse: {
                            name: functionName,
                            response: functionResult,
                        }
                    }],
                }];

                // Passo 3: Fazer a segunda chamada API com o resultado da função
                response = await ai.models.generateContent({
                    model: MODEL_NAME,
                    contents: contents,
                    config: {
                        systemInstruction: systemInstruction,
                        temperature: 0.7,
                        // Não precisamos de Tools na segunda chamada, pois estamos a gerar a resposta
                    },
                });

                assistantMessage = response.text;
                
            } else {
                // Se não houver chamada de função, usa a primeira resposta
                assistantMessage = response.text;
            }


            if (assistantMessage) {
                const finalHistory = [...updatedHistory, { role: "assistant", content: assistantMessage }];
                
                return {
                    response: assistantMessage,
                    conversationHistory: finalHistory
                };
            } else {
                throw new Error("Invalid response format from API");
            }

        } catch (error) {
            console.error("Error in VirtualAssistantService:", error);

            // Fallback response em caso de falha da API
            return {
                response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, entre em contacto diretamente pelo email casacoimbramaputo@gmail.com ou pelo telefone +258 84 549 8519 | +258 84 208 3827 para obter informações sobre os nossos imóveis.",
                conversationHistory: conversationHistory,
                error: true
            };
        }
    }

    // O método getPropertyInfo original agora pode usar o método chat para lidar com consultas complexas
    static async getPropertyInfo(propertyType, location) {
        const prompt = `Gostaria de saber informações sobre ${propertyType} em ${location}.`;

        // O método chat agora usará a função searchProperties internamente se for uma consulta de filtro.
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