import session from './api-session.js';
import geminiClient from '../agent/api/ai/gemini-client.js';
import openAiClient from '../agent/api/ai/open-ai-client.js';
import claudeClient from '../agent/api/ai/claude-client.js';
import { gzipSync } from 'zlib';
import convoLogger from '../utils/conversation-logger.js';

// Opção A: compressão de contexto antes de enviar aos provedores de IA
const CONTEXT_COMPRESSION_ENABLED = false;
const CONTEXT_COMPRESSION_SIZE_THRESHOLD = 4000; // caracteres
function compressContext(history) {
  const allText = (history || []).map((m) => m.content || '').join('\n');
  const gzip = gzipSync(Buffer.from(allText, 'utf8'));
  return gzip.toString('base64');
}

/**
 * Envia o prompt para o provedor de IA configurado.
 * Agora, todos os clientes recebem (history, tools) e retornam
 * uma resposta no formato unificado (OpenAI message object).
 * @param {Array<Object>} history O histórico da conversa.
 * @param {Array<Object>} tools As ferramentas (schemas) disponíveis.
 * @returns {Promise<Object>} A resposta da IA (OpenAI message format).
 */
async function sendPrompt(history, tools) {
  const provider = session.getProvider();
  const creds = session.getCredentials?.() || {};
  const model = creds.model;
  const mode = session.getMode?.() || 'normal';

  // Construir histórico efetivo com compressão se necessário
  let effectiveHistory = history;
  if (CONTEXT_COMPRESSION_ENABLED && Array.isArray(history)) {
    const merged = history.map((m) => m.content || '').join('\n');
    if (merged.length > CONTEXT_COMPRESSION_SIZE_THRESHOLD) {
      const compressedPayload = compressContext(history);
      effectiveHistory = [{
        role: 'user',
        content: 'BASE64_GZIP:' + compressedPayload + '. Por favor, decodifique (Base64) e descomprima (Gzip) este conteúdo para analisar o problema.'
      }];
    }
  }

  // Log de request
  try {
    convoLogger.logRequest({ provider, model, mode, phase: 'single', history: effectiveHistory, tools });
  } catch (_) { /* não falhar por causa de log */ }

  let response;
  switch (provider) {
    case 'gemini':
      response = await geminiClient.sendMessage(effectiveHistory, tools);
      break;
    case 'openai':
      response = await openAiClient.sendMessage(effectiveHistory, tools);
      break;
    case 'claude':
      response = await claudeClient.sendMessage(effectiveHistory, tools);
      break;
    default:
      throw new Error('Provedor de IA não configurado ou desconhecido.');
  }

  // Log de response
  try {
    convoLogger.logResponse({ provider, model, mode, phase: 'single', response });
  } catch (_) { /* não falhar por causa de log */ }

  return response;
}

export default { sendPrompt };
