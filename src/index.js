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
  
  cliUi.mostrarComandos(); 
  
  if (config.provider && config.apiKey) {
    logger.info(lang.get('config.previousConfigs')); 
    session.configure(config.provider, { apiKey: config.apiKey, model: config.model });
    
    if (config.os) {
      session.setOS(config.os.toLowerCase());
    }
    if (config.economyMode !== undefined) {
      session.setEconomyMode(config.economyMode);
    }
    
    if (config.provider === 'openai') {
      openAiClient.initialize({ apiKey: config.apiKey, model: config.model });
    } else if (config.provider === 'gemini') {
      geminiClient.initialize({ apiKey: config.apiKey, model: config.model }); 
    } else if (config.provider === 'claude') {
      claudeClient.initialize({ apiKey: config.apiKey, model: config.model });
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