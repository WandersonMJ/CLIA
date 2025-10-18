import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import logger from '../../../utils/logger.js';
import lang from '../../../services/language-service.js';

import { DEFAULT_GEMINI_MODEL } from '../../../config/constants.js';

class GeminiClient {
  static instance;
  #model;

  constructor() {
    if (GeminiClient.instance) {
      return GeminiClient.instance;
    }
    GeminiClient.instance = this;
  }

  static getInstance() {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error('Credenciais do Gemini (apiKey) são necessárias.');
    }
    const genAI = new GoogleGenerativeAI(credentials.apiKey);
    
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
    
    const modelName = credentials.model || DEFAULT_GEMINI_MODEL; 
    
    this.#model = genAI.getGenerativeModel({ 
      model: modelName,
      safetySettings: safetySettings
    });
    
    logger.info(lang.get('client.init.gemini', modelName));
  }

  formatToolsForGemini(tools) {
    return [{
      functionDeclarations: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema, 
      }))
    }];
  }

  formatHistoryForGemini(history) {
    const contents = [];
    let systemInstruction = null;

    for (const msg of history) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
        continue;
      }
      
      const role = msg.role === 'assistant' ? 'model' : msg.role;
      
      if (msg.tool_calls) {
        contents.push({
          role: 'model',
          parts: msg.tool_calls.map(call => ({
            functionCall: {
              name: call.function.name,
              args: JSON.parse(call.function.arguments),
            }
          }))
        });
      } else if (msg.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.name,
              response: {
                content: msg.content,
              }
            }
          }]
        });
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }
    
    const geminiHistory = [];
    let systemPrompt = null;
    
    for (const msg of history) {
        if (msg.role === 'system') {
            systemPrompt = { parts: [{ text: msg.content }] };
            continue;
        }

        const role = msg.role === 'assistant' ? 'model' : msg.role;

        if (msg.tool_calls) {
            geminiHistory.push({
                role: 'model',
                parts: msg.tool_calls.map(call => ({
                    functionCall: {
                        name: call.function.name,
                        args: JSON.parse(call.function.arguments),
                    }
                }))
            });
        } else if (msg.role === 'tool') {
            geminiHistory.push({
                role: 'user',
                parts: [{
                    functionResponse: {
                        name: msg.name,
                        response: { content: msg.content }
                    }
                }]
            });
        } else {
            geminiHistory.push({ role, parts: [{ text: msg.content }] });
        }
    }

    return { geminiHistory, systemPrompt };
  }

  normalizeGeminiResponse(response) {
    const message = {
      role: 'assistant',
      content: null,
    };
    
    if (!response.candidates || response.candidates.length === 0) {
        
        logger.warn(lang.get('client.gemini.emptyWarn'), response.promptFeedback);
        
        message.content = `[RESPOSTA VAZIA DO GEMINI] Causa: ${response.promptFeedback?.blockReason || 'desconhecida'}`;
        return message;
    }

    const candidate = response.candidates[0];
    
    if (candidate.content && candidate.content.parts.some(part => part.functionCall)) {
      message.tool_calls = [];
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          message.tool_calls.push({
            id: part.functionCall.name + '_' + Date.now(), 
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args || {}),
            },
          });
        }
      }
    } else if (candidate.content && candidate.content.parts.some(part => part.text)) {
      message.content = candidate.content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('\n');
    } else {
      message.content = `[RESPOSTA VAZIA DO GEMINI] Stop reason: ${candidate.finishReason}`;
      
      logger.warn(lang.get('client.gemini.contentWarn'), candidate);
    }
    
    return message;
  }

  async sendMessage(history, tools) {
    if (!this.#model) {
      throw new Error('Cliente Gemini não inicializado. Chame o método initialize() primeiro.');
    }
    
    const formattedTools = this.formatToolsForGemini(tools);
    const { geminiHistory, systemPrompt } = this.formatHistoryForGemini(history);
    
    const request = {
      contents: geminiHistory,
      tools: formattedTools,
    };

    if (systemPrompt) {
        request.systemInstruction = systemPrompt;
    }
    
    const result = await this.#model.generateContent(request);

    const response = result.response;
    return this.normalizeGeminiResponse(response);
  }
}

export default GeminiClient.getInstance();