// src/init-client.js
// Função para inicializar clientes de IA - sem dependências circulares

import geminiClient from './agent/api/ai/gemini-client.js';
import openAiClient from './agent/api/ai/open-ai-client.js';
import claudeClient from './agent/api/ai/claude-client.js';

// Detectar se está em modo TUI (Ink controla o stdout)
const isTUIMode = () => process.env.CLIA_TUI_MODE === 'true';

/**
 * Inicializa o cliente de IA com base no provider configurado
 */
export function initializeAIClient(provider, credentials) {
  if (!provider || !credentials || !credentials.apiKey) {
    if (!isTUIMode()) {
      // console.warn('Não é possível inicializar cliente de IA: credenciais incompletas');
    }
    return false;
  }

  try {
    if (provider === 'openai') {
      openAiClient.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode()) {
        // console.log('✓ Cliente OpenAI inicializado com sucesso');
      }
    } else if (provider === 'gemini') {
      geminiClient.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode()) {
        // console.log('✓ Cliente Gemini inicializado com sucesso');
      }
    } else if (provider === 'claude') {
      claudeClient.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode()) {
        // console.log('✓ Cliente Claude inicializado com sucesso');
      }
    }
    return true;
  } catch (error) {
    if (!isTUIMode()) {
      // console.error('✗ Erro ao inicializar cliente de IA:', error.message);
    }
    return false;
  }
}

export default { initializeAIClient };
