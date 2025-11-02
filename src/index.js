#!/usr/bin/env node

import session from './services/api-session.js';
import configService from './services/config-service.js';
import logger from './utils/logger.js';
import lang from './services/language-service.js';

import { startTUI } from './TUI/loader.js';
import { initializeAIClient } from './init-client.js';

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

  if (config.provider && config.apiKey) {
    logger.info(lang.get('config.previousConfigs'));
    session.configure(config.provider, { apiKey: config.apiKey, model: config.model });

    if (config.os) {
      session.setOS(config.os.toLowerCase());
    }
    if (config.economyMode !== undefined) {
      session.setEconomyMode(config.economyMode);
    }

    // Inicializar cliente de IA
    initializeAIClient(config.provider, { apiKey: config.apiKey, model: config.model });
  }
}

/**
 * Ponto de entrada principal da aplicação.
 * Inicia direto o TUI como interface principal.
 */
async function iniciarAplicacao() {
  process.on('SIGINT', () => {
    const msg = lang.get('cli.interrupt') || 'Interrupt via Ctrl+C detected. Shutting down...';
    logger.warn(msg);
    process.exit(0);
  });

  inicializarSessao();

  // Se não estiver configurado, fazer a configuração via TUI
  if (!session.isConfigured()) {
    const msg = lang.get('cli.notConfigured') || 'Session not configured, starting setup...';
    logger.info(msg);
    await configService.loopConfiguracao();

    // Reinicializar a sessão após configuração
    inicializarSessao();
  }

  // Iniciar o TUI como interface principal
  try {
    console.clear();
    await startTUI();
  } catch (error) {
    logger.error('Erro ao iniciar TUI:', error.message);
    process.exit(1);
  }
}

iniciarAplicacao();