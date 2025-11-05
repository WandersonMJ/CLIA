import geminiClient from '../agent/api/ai/gemini-client.js';
import openAiClient from '../agent/api/ai/open-ai-client.js';
import claudeClient from '../agent/api/ai/claude-client.js';
import convoLogger from '../utils/conversation-logger.js';

/**
 * Serviço para enviar prompts para uma configuração específica de IA.
 * Usado pelo Modo Arquiteto para gerenciar o Arquiteto e o Executor separadamente.
 */

/**
 * Envia um prompt para uma IA específica com credenciais customizadas.
 * @param {string} provider - O provedor ('openai', 'gemini', 'claude')
 * @param {string} model - O modelo específico
 * @param {string} apiKey - A chave da API
 * @param {Array<Object>} history - Histórico da conversa
 * @param {Array<Object>} tools - Ferramentas disponíveis
 * @param {Object} meta - Metadados (ex.: { phase: 'planning' | 'execution' | 'context-gathering' })
 * @returns {Promise<Object>} Resposta da IA
 */
async function sendPromptWithConfig(provider, model, apiKey, history, tools, meta = {}) {
  // Cria uma instância temporária do cliente com as credenciais específicas
  const config = { apiKey, model };

  // Log request
  try { convoLogger.logRequest({ provider, model, mode: 'architect', phase: meta.phase || 'unknown', history, tools, meta }); } catch (_) {}

  let response;
  switch (provider) {
    case 'gemini': {
      const originalState = geminiClient._client;
      geminiClient.initialize(config);
      try {
        response = await geminiClient.sendMessage(history, tools);
      } finally {
        geminiClient._client = originalState;
      }
      break;
    }
    case 'openai': {
      const originalState = openAiClient._client;
      openAiClient.initialize(config);
      try {
        response = await openAiClient.sendMessage(history, tools);
      } finally {
        openAiClient._client = originalState;
      }
      break;
    }
    case 'claude': {
      const originalState = claudeClient._client;
      claudeClient.initialize(config);
      try {
        response = await claudeClient.sendMessage(history, tools);
      } finally {
        claudeClient._client = originalState;
      }
      break;
    }
    default:
      throw new Error(`Provedor desconhecido: ${provider}`);
  }

  // Log response
  try { convoLogger.logResponse({ provider, model, mode: 'architect', phase: meta.phase || 'unknown', response, meta }); } catch (_) {}

  return response;
}

async function sendToArchitect(architectConfig, history, tools = [], meta = { phase: 'planning' }) {
  const { provider, model, apiKey } = architectConfig;
  return sendPromptWithConfig(provider, model, apiKey, history, tools, meta);
}

async function sendToExecutor(executorConfig, history, tools, meta = { phase: 'execution' }) {
  const { provider, model, apiKey } = executorConfig;
  return sendPromptWithConfig(provider, model, apiKey, history, tools, meta);
}

export default {
  sendToArchitect,
  sendToExecutor,
  sendPromptWithConfig
};
