#!/usr/bin/env node

import session from './services/api-session.js';
import configService from './services/config-service.js';
import logger from './utils/logger.js';
import lang from './services/language-service.js';

import geminiClient from './agent/api/ai/gemini-client.js';
import openAiClient from './agent/api/ai/open-ai-client.js';
import claudeClient from './agent/api/ai/claude-client.js';

import cliUi from './utils/cli-ui.js';
import loopPrincipal from './cli-loop.js';

/**
 * Inicializa a sessão, carregando a configuração salva (se existir)
 * e preparando os clientes de IA.
 */
function inicializarSessao() {
  const config = configService.readConfig() || {};

  if (config.language) {
    session.setLanguage(config.language);
    lang.setLanguage(config.language);
  }

  cliUi.mostrarArteInicial(); 
  
  if (config.provider && config.apiKey) {
    logger.info(lang.get('config.previousConfigs'));
    logger.info(`🤖 Modelo: ${config.provider.toUpperCase()} - ${config.model}`);
    session.configure(config.provider, { apiKey: config.apiKey, model: config.model });

    if (config.os) {
      session.setOS(config.os.toLowerCase());
    }

    // Carregar modo de operação
    const mode = config.mode || 'normal';
    session.setMode(mode);

    if (mode === 'architect') {
      logger.info('🏗️  Modo: Arquiteto (Multi-Agente)');

      if (config.architectProvider && config.architectModel && config.architectApiKey) {
        session.configureArchitect(
          config.architectProvider,
          config.architectModel,
          config.architectApiKey
        );
        logger.info(`🏛️  Arquiteto: ${config.architectProvider} (${config.architectModel})`);
      }

      if (config.executorProvider && config.executorModel && config.executorApiKey) {
        session.configureExecutor(
          config.executorProvider,
          config.executorModel,
          config.executorApiKey
        );
        logger.info(`👷 Executor: ${config.executorProvider} (${config.executorModel})`);
      }

      // Inicializar clientes do Arquiteto e Executor
      if (config.architectProvider === 'openai') {
        openAiClient.initialize({ apiKey: config.architectApiKey, model: config.architectModel });
      } else if (config.architectProvider === 'gemini') {
        geminiClient.initialize({ apiKey: config.architectApiKey, model: config.architectModel });
      } else if (config.architectProvider === 'claude') {
        claudeClient.initialize({ apiKey: config.architectApiKey, model: config.architectModel });
      }

      if (config.executorProvider === 'openai') {
        openAiClient.initialize({ apiKey: config.executorApiKey, model: config.executorModel });
      } else if (config.executorProvider === 'gemini') {
        geminiClient.initialize({ apiKey: config.executorApiKey, model: config.executorModel });
      } else if (config.executorProvider === 'claude') {
        claudeClient.initialize({ apiKey: config.executorApiKey, model: config.executorModel });
      }
    } else {
      // Modo Normal ou Econômico (single-agent)
      if (mode === 'normal') {
        logger.info('🔵 Modo: Normal');
      } else if (mode === 'economy') {
        logger.info('💰 Modo: Econômico (Ferramentas Limitadas)');
      }

      // Inicializar cliente da IA principal
      if (config.provider === 'openai') {
        openAiClient.initialize({ apiKey: config.apiKey, model: config.model });
      } else if (config.provider === 'gemini') {
        geminiClient.initialize({ apiKey: config.apiKey, model: config.model });
      } else if (config.provider === 'claude') {
        claudeClient.initialize({ apiKey: config.apiKey, model: config.model });
      }
    }
  }
}

/**
 * Ponto de entrada principal da aplicação.
 */
async function iniciarAplicacao() {
  process.on('SIGINT', () => {
    
    const msg = lang.get('cli.interrupt') || 'Interrupt via Ctrl+C detected. Shutting down...';
    logger.warn(msg); 
    process.exit(0);
  });

  inicializarSessao();

  while (true) {
    let resultadoLoop;
    
    if (!session.isConfigured()) {
      
      const msg = lang.get('cli.notConfigured') || 'Session not configured, starting setup...';
      logger.info(msg); 
      await configService.loopConfiguracao();
    }
    else {
      resultadoLoop = await loopPrincipal();
    }
    
    if (resultadoLoop === 'sair') {
      const msg = lang.get('cli.goodbye') || 'Goodbye!';
      logger.info(msg); 
      break;
    }
  }
}

iniciarAplicacao();