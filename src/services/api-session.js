import logger from '../utils/logger.js';
import lang from './language-service.js';
import { API_KEY_MASK } from '../config/constants.js';

class ApiSession {
  static instance;

  constructor() {
    this._aiProvider = null;
    this._credentials = null;
    this._os = null;
    this._language = 'en-US';

    // Modo de operação: 'normal', 'economy', 'architect'
    this._mode = 'normal';

    // Configurações do Modo Arquiteto
    this._architectProvider = null; // Ex: 'openai', 'claude'
    this._architectModel = null;    // Ex: 'gpt-4o', 'claude-opus-4'
    this._architectApiKey = null;
    this._executorProvider = null;  // Ex: 'claude', 'gemini'
    this._executorModel = null;     // Ex: 'claude-haiku-3-5', 'gemini-2.0-flash-exp'
    this._executorApiKey = null;
  }

  static getInstance() {
    if (!ApiSession.instance) {
      ApiSession.instance = new ApiSession();
    }
    return ApiSession.instance;
  }

  configure(provider, credentials) {
    this._aiProvider = provider;
    this._credentials = credentials;
    
    const credsDisplay = JSON.stringify({ ...this._credentials, apiKey: API_KEY_MASK }); 
    logger.info(`${lang.get('config.previousConfigsApplied')} Provider=${this._aiProvider}, Credentials=${credsDisplay}`);
  }

  setOS(os) {
    this._os = os;
  }
  getOS() {
    return this._os;
  }
  getProvider() {
    return this._aiProvider;
  }
  getCredentials() {
    return this._credentials;
  }
  isConfigured() {
    return this._aiProvider !== null && this._credentials !== null;
  }
  setLanguage(lang) {
    this._language = lang;
  }
  getLanguage() {
    return this._language;
  }

  // Métodos de Modo (mutuamente exclusivos: 'normal', 'economy', 'architect')
  setMode(mode) {
    if (!['normal', 'economy', 'architect'].includes(mode)) {
      throw new Error(`Modo inválido: ${mode}. Use 'normal', 'economy' ou 'architect'`);
    }
    this._mode = mode;
  }
  getMode() {
    return this._mode;
  }
  isNormalMode() {
    return this._mode === 'normal';
  }
  isEconomyMode() {
    return this._mode === 'economy';
  }
  isArchitectMode() {
    return this._mode === 'architect';
  }

  // Configuração do Modo Arquiteto
  configureArchitect(provider, model, apiKey) {
    this._architectProvider = provider;
    this._architectModel = model;
    this._architectApiKey = apiKey;
  }
  configureExecutor(provider, model, apiKey) {
    this._executorProvider = provider;
    this._executorModel = model;
    this._executorApiKey = apiKey;
  }
  getArchitectConfig() {
    return {
      provider: this._architectProvider,
      model: this._architectModel,
      apiKey: this._architectApiKey
    };
  }
  getExecutorConfig() {
    return {
      provider: this._executorProvider,
      model: this._executorModel,
      apiKey: this._executorApiKey
    };
  }
}

export default ApiSession.getInstance();