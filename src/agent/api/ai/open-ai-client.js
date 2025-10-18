import OpenAI from 'openai';
import lang from '../../../services/language-service.js';
import logger from '../../../utils/logger.js';

import { DEFAULT_OPENAI_MODEL } from '../../../config/constants.js';

class OpenAiClient {
  static instance;
  #openai;
  #model;

  constructor() {
    if (OpenAiClient.instance) {
      return OpenAiClient.instance;
    }
    OpenAiClient.instance = this;
  }

  static getInstance() {
    if (!OpenAiClient.instance) {
      OpenAiClient.instance = new OpenAiClient();
    }
    return OpenAiClient.instance;
  }
  
  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error('Credenciais do OpenAI (apiKey) são necessárias.');
    }
    this.#openai = new OpenAI({ apiKey: credentials.apiKey });
    
    this.#model = credentials.model || DEFAULT_OPENAI_MODEL; 
    
    logger.info(lang.get('client.init.openai', this.#model)); 
  }

  async sendMessage(history, tools) {
    if (!this.#openai) {
      throw new Error('Cliente OpenAI não inicializado. Chame o método initialize() primeiro.');
    }

    const formattedTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema, 
      }
    }));

    const params = {
      messages: history,
      model: this.#model,
      tools: formattedTools,
      tool_choice: "auto",
    };

    const completion = await this.#openai.chat.completions.create(params);
    
    return completion.choices[0].message;
  }
}

export default OpenAiClient.getInstance();