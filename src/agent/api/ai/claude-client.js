import Anthropic from '@anthropic-ai/sdk';
import logger from '../../../utils/logger.js';
import lang from '../../../services/language-service.js';

import { MAX_TOKENS, DEFAULT_CLAUDE_MODEL } from '../../../config/constants.js';

class ClaudeClient {
  static instance;
  #anthropic;
  #model;

  constructor() {
    if (ClaudeClient.instance) {
      return ClaudeClient.instance;
    }
    ClaudeClient.instance = this;
  }

  static getInstance() {
    if (!ClaudeClient.instance) {
      ClaudeClient.instance = new ClaudeClient();
    }
    return ClaudeClient.instance;
  }

  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error('Credenciais do Anthropic (apiKey) são necessárias.');
    }
    this.#anthropic = new Anthropic({ apiKey: credentials.apiKey });
    
    this.#model = credentials.model || DEFAULT_CLAUDE_MODEL; 
    
    
    logger.info(lang.get('client.init.claude', this.#model)); 
  }

  normalizeClaudeResponse(response) {
    const message = {
      role: 'assistant',
      content: null,
    };

    if (response.stop_reason === 'tool_use') {
      message.tool_calls = [];
      
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          
          message.tool_calls.push({
            id: block.id,
            type: 'function',
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input), 
            },
          });
        }
      }
    } else {
      const textBlocks = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text);
        
      message.content = textBlocks.join('\n');
    }
    
    return message;
  }

  async sendMessage(history, tools) {
    if (!this.#anthropic) {
      throw new Error('Cliente Anthropic não inicializado. Chame o método initialize() primeiro.');
    }

    let systemMessage = '';
    const messages = [];

    for (const msg of history) {
      if (msg.role === 'system') {
        systemMessage += (systemMessage ? '\n\n' : '') + msg.content;
      } else {
        messages.push(msg);
      }
    }

    const requestParams = {
      model: this.#model,
      messages: messages,
      max_tokens: MAX_TOKENS, 
      tools: tools, 
    };

    if (systemMessage) {
      requestParams.system = systemMessage;
    }

    const response = await this.#anthropic.messages.create(requestParams);
    
    return this.normalizeClaudeResponse(response);
  }
}

export default ClaudeClient.getInstance();