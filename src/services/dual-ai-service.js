import geminiClient from '../agent/api/ai/gemini-client.js';
import openAiClient from '../agent/api/ai/open-ai-client.js';
import claudeClient from '../agent/api/ai/claude-client.js';

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
 * @returns {Promise<Object>} Resposta da IA
 */
async function sendPromptWithConfig(provider, model, apiKey, history, tools) {
  // Cria uma instância temporária do cliente com as credenciais específicas
  const config = { apiKey, model };

  switch (provider) {
    case 'gemini': {
      // Salva o estado atual
      const originalState = geminiClient._client;

      // Inicializa temporariamente com a nova config
      geminiClient.initialize(config);

      try {
        const response = await geminiClient.sendMessage(history, tools);
        return response;
      } finally {
        // Restaura o estado original
        geminiClient._client = originalState;
      }
    }

    case 'openai': {
      const originalState = openAiClient._client;

      openAiClient.initialize(config);

      try {
        const response = await openAiClient.sendMessage(history, tools);
        return response;
      } finally {
        openAiClient._client = originalState;
      }
    }

    case 'claude': {
      const originalState = claudeClient._client;

      claudeClient.initialize(config);

      try {
        const response = await claudeClient.sendMessage(history, tools);
        return response;
      } finally {
        claudeClient._client = originalState;
      }
    }

    default:
      throw new Error(`Provedor desconhecido: ${provider}`);
  }
}

/**
 * Envia um prompt para o Arquiteto (IA de planejamento).
 * @param {Object} architectConfig - { provider, model, apiKey }
 * @param {Array<Object>} history - Histórico da conversa
 * @param {Array<Object>} tools - Ferramentas disponíveis (geralmente vazio para o arquiteto)
 * @returns {Promise<Object>} Resposta do Arquiteto
 */
async function sendToArchitect(architectConfig, history, tools = []) {
  const { provider, model, apiKey } = architectConfig;
  return sendPromptWithConfig(provider, model, apiKey, history, tools);
}

/**
 * Envia um prompt para o Executor (IA de execução).
 * @param {Object} executorConfig - { provider, model, apiKey }
 * @param {Array<Object>} history - Histórico da conversa
 * @param {Array<Object>} tools - Ferramentas disponíveis para execução
 * @returns {Promise<Object>} Resposta do Executor
 */
async function sendToExecutor(executorConfig, history, tools) {
  const { provider, model, apiKey } = executorConfig;
  return sendPromptWithConfig(provider, model, apiKey, history, tools);
}

export default {
  sendToArchitect,
  sendToExecutor,
  sendPromptWithConfig
};
