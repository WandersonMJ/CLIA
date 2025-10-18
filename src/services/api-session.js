import logger from '../utils/logger.js';
import lang from './language-service.js';
import { API_KEY_MASK } from '../config/constants.js';

class ApiSession {
  static instance;

  constructor() {
    this._aiProvider = null;
    this._credentials = null;
    this._os = null;
    this._economyMode = false;
    this._language = 'en-US'; 
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
  setEconomyMode(enabled) {
    this._economyMode = enabled;
  }
  isEconomyMode() {
    return this._economyMode;
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
}

export default ApiSession.getInstance();