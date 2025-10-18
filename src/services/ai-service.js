import session from './api-session.js';
import geminiClient from '../agent/api/ai/gemini-client.js';
import openAiClient from '../agent/api/ai/open-ai-client.js';
import claudeClient from '../agent/api/ai/claude-client.js';

/**
 * Envia o prompt para o provedor de IA configurado.
 * Agora, todos os clientes recebem (history, tools) e retornam
 * uma resposta no formato unificado (OpenAI message object).
 * * @param {Array<Object>} history O histórico da conversa.
 * @param {Array<Object>} tools As ferramentas (schemas) disponíveis.
 * @returns {Promise<Object>} A resposta da IA (OpenAI message format).
 */
async function sendPrompt(history, tools) {
  const provider = session.getProvider();

  switch (provider) {
    case 'gemini':
      return geminiClient.sendMessage(history, tools);
    case 'openai':
      return openAiClient.sendMessage(history, tools);
    case 'claude':
      return claudeClient.sendMessage(history, tools);
    default:
      throw new Error('Provedor de IA não configurado ou desconhecido.');
  }
}

export default { sendPrompt };