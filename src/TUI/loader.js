// src/TUI/index.js
import React18 from "react";
import { render } from "ink";

// src/TUI/App.js
import React17, { useEffect as useEffect3 } from "react";
import { Box as Box16 } from "ink";

// src/TUI/states/AppContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

// src/services/config-service.js
import inquirer from "inquirer";
import fs from "fs";

// src/services/api-session.js
import logger from "../utils/logger.js";

// src/config/locales/pt-BR.js
var pt_BR_default = {
  config: {
    readError: "Erro ao ler o arquivo de configura\xE7\xE3o:",
    writeError: "Erro ao escrever no arquivo de configura\xE7\xE3o:",
    saveSuccess: "Configura\xE7\xE3o salva com sucesso.",
    providerPrompt: "Selecione o provedor de IA que deseja usar:",
    provider: {
      gemini: "Gemini (Google)",
      openai: "ChatGPT (OpenAI)",
      claude: "Claude (Anthropic)"
    },
    keyExists: "Chave j\xE1 configurada para {0}. Deseja trocar de chave?",
    modelPrompt: {
      gemini: "Qual modelo do Gemini deseja usar?",
      openai: "Qual modelo da OpenAI deseja usar?",
      claude: "Qual modelo do Claude deseja usar?"
    },
    keyPrompt: {
      gemini: "Insira sua API Key do Google AI Studio:",
      openai: "Insira sua API Key da OpenAI:",
      claude: "Insira sua API Key da Anthropic:"
    },
    invalidKey: "API Key inv\xE1lida. A configura\xE7\xE3o falhou.",
    keySuccess: "Usando chave existente para {0}.",
    iaSettings: "Configura\xE7\xF5es de IA: Provider={0}, Model={1}",
    welcome: "Bem-vindo! Antes de come\xE7ar, vamos fazer algumas configura\xE7\xF5es.",
    loaded: "Configura\xE7\xE3o carregada: OS={0}, Economia={1}, Credenciais={2}",
    noCreds: "nenhuma",
    nd: "N/D",
    osPrompt: "Qual sistema operacional voc\xEA est\xE1 utilizando?",
    osSet: "Sistema operacional configurado para: {0}",
    economyPrompt: 'Deseja ativar o "modo economia"? (A IA ler\xE1 arquivos em partes para economizar tokens)',
    economyOn: "Modo de economia ATIVADO.",
    economyOff: "Modo de economia DESATIVADO.",
    iaSetup: "Agora, vamos configurar a IA.",
    providerSuccess: "Provedor '{0}' configurado e pronto para uso!",
    adjustTitle: "=== Ajustar Configura\xE7\xF5es ===",
    adjustPrompt: "O que deseja configurar?",
    adjustOptions: {
      provider: "Trocar provedor de IA",
      economy: "Alterar modo economia",
      os: "Alterar sistema operacional",
      all: "Reconfigurar tudo"
    },
    providerChange: "--- Trocar Provedor de IA ---",
    reconfigAll: "--- Reconfigurar Tudo ---",
    updateSuccess: "Configura\xE7\xF5es atualizadas com sucesso!",
    noSoConfigured: "Nenhum SO configurado.",
    errorLoadingCommands: "Erro ao carregar comandos espec\xEDficos do SO.",
    errorLoadingCommandsOS: 'Erro ao carregar comandos para o SO "${os}":',
    fatalErrorSystemPrompt: "Erro fatal ao construir o system prompt:",
    couldNotLoadSystemPrompt: "N\xE3o foi poss\xEDvel carregar o system-prompt.md",
    errorExecutingTool: "ERRO ao executar ferramenta: ${error.message}\nStack: ${error.stack}",
    iterationLimitReached: "Limite de itera\xE7\xF5es atingido. A tarefa pode n\xE3o estar completa.",
    actionDenied: "A\xE7\xE3o {0} foi negada pelo usu\xE1rio.",
    toolNotFound: "Erro: Ferramenta '{0}' n\xE3o implementada.",
    previousConfigs: "Aplicando configura\xE7\xE3o armazenada...",
    previousConfigsApplied: "Configura\xE7\xE3o de sess\xE3o aplicada:"
  },
  logger: {
    errorPrefix: "ERRO",
    warnPrefix: "AVISO",
    aiResponse: "IA",
    resultPrefix: "Resultado"
  },
  cli: {
    commands: {
      header: {
        command: "Comando",
        description: "Descri\xE7\xE3o"
      },
      exit: {
        cmd: "sair, exit",
        desc: "Termina o programa e encerra a sess\xE3o da CLI."
      },
      scrap: {
        cmd: "scrap",
        desc: "(Respeita .gitignore) Gera um arquivo JSON com toda a estrutura do projeto."
      },
      config: {
        cmd: "config",
        desc: "Permite ajustar as configura\xE7\xF5es de IA."
      },
      help: {
        cmd: "help",
        desc: "Exibe a lista de comandos dispon\xEDveis."
      },
      edit: {
        cmd: "edit-constants",
        desc: "Abre o arquivo de constantes no editor (Requer rein\xEDcio da app)."
      },
      prompt: {
        cmd: "<texto>",
        desc: "Qualquer outro texto ser\xE1 usado como prompt para IA configurada."
      }
    },
    shell: "### Comandos Shell \xDAteis (via ferramenta SHELL):\n",
    constants: {
      edited: "Voc\xEA precisa reabrir a CLI para aplicar as altera\xE7\xF5es!"
    },
    scrapError: "Erro ao executar o scraping:",
    interrupt: "Interrup\xE7\xE3o via Ctrl+C detectada. Encerrando...",
    commandError: "Erro ao processar comando:",
    notConfigured: "Sess\xE3o n\xE3o configurada, iniciando configura\xE7\xE3o...",
    goodbye: "At\xE9 logo!"
  },
  agent: {
    iteration: "Itera\xE7\xE3o {0}/{1}",
    thinking: "Pensando...",
    toolExec: "IA quer executar: {0}",
    denied: "A\xE7\xE3o {0} foi negada pelo usu\xE1rio.",
    toolNotFound: "Erro: Ferramenta '{0}' n\xE3o implementada.",
    sysPromptError: "Erro fatal ao construir o system prompt:",
    sysPromptLoadError: "N\xE3o foi poss\xEDvel carregar o system-prompt.md",
    iterationLimit: "Limite de itera\xE7\xF5es atingido. A tarefa pode n\xE3o estar completa.",
    shell: {
      result: "Resultado do comando '$ {0}':\n{1}",
      error: "ERRO ao executar '$ {0}': {1}"
    }
  },
  client: {
    init: {
      claude: "Cliente Anthropic (Claude) inicializado com o modelo: {0}",
      gemini: "Cliente Gemini inicializado com o modelo: {0}",
      openai: "Cliente OpenAI inicializado com o modelo: {0}"
    },
    gemini: {
      emptyWarn: "Gemini retornou resposta vazia ou bloqueada:",
      contentWarn: "Gemini retornou conte\xFAdo vazio:"
    },
    openai: {
      emptyWarn: "OpenAI retornou resposta vazia ou bloqueada:",
      contentWarn: "OpenAI retornou conte\xFAdo vazio:"
    },
    claude: {
      emptyWarn: "Claude retornou resposta vazia ou bloqueada:",
      contentWarn: "Claude retornou conte\xFAdo vazio:"
    }
  }
};

// src/config/locales/en-US.js
var en_US_default = {
  config: {
    readError: "Error reading configuration file:",
    writeError: "Error writing configuration file:",
    saveSuccess: "Configuration saved successfully.",
    providerPrompt: "Select the AI provider you want to use:",
    provider: {
      gemini: "Gemini (Google)",
      openai: "ChatGPT (OpenAI)",
      claude: "Claude (Anthropic)"
    },
    keyExists: "Key already configured for {0}. Change key?",
    modelPrompt: {
      gemini: "Which Gemini model do you want to use?",
      openai: "Which OpenAI model do you want to use?",
      claude: "Which Claude model do you want to use?"
    },
    keyPrompt: {
      gemini: "Enter your Google AI Studio API Key:",
      openai: "Enter your OpenAI API Key:",
      claude: "Enter your Anthropic API Key:"
    },
    invalidKey: "Invalid API Key. Configuration failed.",
    keySuccess: "Using existing key for {0}.",
    iaSettings: "AI Settings: Provider={0}, Model={1}",
    welcome: "Welcome! Before starting, let's set up a few things.",
    loaded: "Configuration loaded: OS={0}, Economy={1}, Credentials={2}",
    noCreds: "none",
    nd: "N/A",
    osPrompt: "Which operating system are you using?",
    osSet: "Operating system set to: {0}",
    economyPrompt: "Enable 'economy mode'? (AI will read files in parts to save tokens)",
    economyOn: "Economy mode ACTIVATED.",
    economyOff: "Economy mode DEACTIVATED.",
    iaSetup: "Now, let's configure the AI.",
    providerSuccess: "Provider '{0}' configured and ready to use!",
    adjustTitle: "=== Adjust Settings ===",
    adjustPrompt: "What do you want to configure?",
    adjustOptions: {
      provider: "Change AI provider",
      economy: "Toggle economy mode",
      os: "Change operating system",
      all: "Reconfigure everything"
    },
    providerChange: "--- Change AI Provider ---",
    reconfigAll: "--- Reconfigure Everything ---",
    updateSuccess: "Settings updated successfully!",
    noSoConfigured: "No OS configured.",
    errorLoadingCommands: "Error loading specific OS commands.",
    errorLoadingCommandsOS: 'Error loading commands for OS "${os}":',
    fatalErrorSystemPrompt: "Fatal error building the system prompt:",
    couldNotLoadSystemPrompt: "Could not load system-prompt.md",
    errorExecutingTool: "ERROR executing tool: ${error.message}\nStack: ${error.stack}",
    iterationLimitReached: "Iteration limit reached. The task may not be complete.",
    actionDenied: "Action {0} was denied by the user.",
    toolNotFound: "Error: Tool '{0}' not implemented.",
    previousConfigs: "Applying previous configurations...",
    previousConfigsApplied: "Session config applied:"
  },
  logger: {
    errorPrefix: "ERROR",
    warnPrefix: "WARNING",
    aiResponse: "AI",
    resultPrefix: "RESULT"
  },
  cli: {
    commands: {
      header: {
        command: "Command",
        description: "Description"
      },
      exit: {
        cmd: "exit, quit",
        desc: "Exits the application."
      },
      scrap: {
        cmd: "scrap",
        desc: "(Respects .gitignore) Generates a JSON file of the project structure."
      },
      config: {
        cmd: "config",
        desc: "Allows adjusting AI and session settings."
      },
      help: {
        cmd: "help",
        desc: "Displays this list of available commands."
      },
      edit: {
        cmd: "edit-constants",
        desc: "Opens the constants file in the editor (Requires app restart)."
      },
      prompt: {
        cmd: "<text>",
        desc: "Any other text will be used as a prompt for the configured AI."
      }
    },
    shell: "### Commands Shell usables (using SHELL tool):\n",
    constants: {
      edited: "You need to reopen the CLI to apply those adjusts!"
    },
    scrapError: "Error during scraping:",
    interrupt: "Interrupt via Ctrl+C detected. Shutting down...",
    commandError: "Error processing command:",
    notConfigured: "Session not configured, starting setup...",
    goodbye: "Goodbye!"
  },
  agent: {
    iteration: "Iteration {0}/{1}",
    thinking: "Thinking...",
    toolExec: "AI wants to execute: {0}",
    denied: "Action {0} was denied by the user.",
    toolNotFound: "Error: Tool '{0}' not implemented.",
    sysPromptError: "Fatal error building system prompt:",
    sysPromptLoadError: "Could not load system-prompt.md",
    iterationLimit: "Iteration limit reached. The task may not be complete.",
    shell: {
      result: "Result of command '$ {0}':\n{1}",
      error: "ERROR executing '$ {0}': {1}"
    }
  },
  client: {
    init: {
      claude: "Anthropic (Claude) client initialized with model: {0}",
      gemini: "Gemini client initialized with model: {0}",
      openai: "OpenAI client initialized with model: {0}"
    },
    gemini: {
      emptyWarn: "Gemini returned empty or blocked response:",
      contentWarn: "Gemini returned empty content:"
    },
    openai: {
      emptyWarn: "OpenAI returned empty or blocked response:",
      contentWarn: "OpenAI returned empty content:"
    },
    claude: {
      emptyWarn: "Claude returned empty or blocked response:",
      contentWarn: "Claude returned empty content:"
    }
  }
};

// src/services/language-service.js
var languages = {
  "pt-BR": pt_BR_default,
  "en-US": en_US_default
};
var LanguageService = class _LanguageService {
  static instance;
  #languagePack = en_US_default;
  constructor() {
    if (_LanguageService.instance) {
      return _LanguageService.instance;
    }
    _LanguageService.instance = this;
  }
  static getInstance() {
    if (!_LanguageService.instance) {
      _LanguageService.instance = new _LanguageService();
    }
    return _LanguageService.instance;
  }
  /**
   * Define o idioma ativo.
   * @param {string} lang - O código do idioma (ex: 'en-US' or 'pt-BR').
   */
  setLanguage(lang2) {
    if (languages[lang2]) {
      this.#languagePack = languages[lang2];
    } else {
      this.#languagePack = en_US_default;
    }
  }
  /**
   * Busca um texto no pacote de idiomas.
   * @param {string} key - A chave (ex: 'config.welcome').
   * @param  {...any} args - Argumentos para substituir (ex: {0}, {1}).
   * @returns {string} - O texto traduzido.
   */
  get(key, ...args) {
    let text = key.split(".").reduce((obj, k) => {
      return obj && obj[k] !== void 0 ? obj[k] : null;
    }, this.#languagePack);
    if (text === null) {
      text = key.split(".").reduce((obj, k) => {
        return obj && obj[k] !== void 0 ? obj[k] : null;
      }, en_US_default);
    }
    if (text === null) {
      return key;
    }
    if (args.length > 0) {
      return text.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== "undefined" ? args[number] : match;
      });
    }
    return text;
  }
};
var language_service_default = LanguageService.getInstance();

// src/services/api-session.js
import { API_KEY_MASK } from "../config/constants.js";
var ApiSession = class _ApiSession {
  static instance;
  constructor() {
    this._aiProvider = null;
    this._credentials = null;
    this._os = null;
    this._economyMode = false;
    this._language = "en-US";
  }
  static getInstance() {
    if (!_ApiSession.instance) {
      _ApiSession.instance = new _ApiSession();
    }
    return _ApiSession.instance;
  }
  configure(provider, credentials) {
    this._aiProvider = provider;
    this._credentials = credentials;
    const credsDisplay = JSON.stringify({ ...this._credentials, apiKey: API_KEY_MASK });
    logger.info(`${language_service_default.get("config.previousConfigsApplied")} Provider=${this._aiProvider}, Credentials=${credsDisplay}`);
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
  setLanguage(lang2) {
    this._language = lang2;
  }
  getLanguage() {
    return this._language;
  }
};
var api_session_default = ApiSession.getInstance();

// src/services/config-service.js
import logger2 from "../utils/logger.js";
import geminiClient from "../agent/api/ai/gemini-client.js";
import openAiClient from "../agent/api/ai/open-ai-client.js";
import claudeClient from "../agent/api/ai/claude-client.js";
import {
  CONFIG_FILE,
  CLAUDE_MODELS,
  GEMINI_MODELS,
  OPENAI_MODELS,
  DEFAULT_CLAUDE_MODEL,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL
} from "../config/constants.js";
function readConfig() {
  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger2.error(language_service_default.get("config.readError"), error);
    }
    return null;
  }
}
function writeConfig(config) {
  try {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_FILE, content, "utf-8");
    logger2.success(language_service_default.get("config.saveSuccess"));
  } catch (error) {
    logger2.error(language_service_default.get("config.writeError"), error);
  }
}
async function configurarIdioma(config) {
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Select your language / Selecione seu idioma:",
      choices: [
        { name: "English (US)", value: "en-US" },
        { name: "Portugu\xEAs (BR)", value: "pt-BR" }
      ],
      default: config.language || "en-US"
    }
  ]);
  api_session_default.setLanguage(language);
  language_service_default.setLanguage(language);
  return language;
}
async function escolherProvedorIA(config, reuseKeys = true) {
  const DEFAULT_MODELS = {
    gemini: DEFAULT_GEMINI_MODEL,
    openai: DEFAULT_OPENAI_MODEL,
    claude: DEFAULT_CLAUDE_MODEL
  };
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: language_service_default.get("config.providerPrompt"),
      choices: [
        { name: language_service_default.get("config.provider.gemini"), value: "gemini" },
        { name: language_service_default.get("config.provider.openai"), value: "openai" },
        { name: language_service_default.get("config.provider.claude"), value: "claude" }
      ],
      default: config.provider || "openai"
    }
  ]);
  if (!config.credentials) {
    config.credentials = {};
  }
  const savedCredentials = config.credentials[provider];
  let useExistingKey = false;
  if (reuseKeys && savedCredentials && savedCredentials.apiKey) {
    const { changeKey } = await inquirer.prompt([
      {
        type: "confirm",
        name: "changeKey",
        message: language_service_default.get("config.keyExists", provider),
        default: false
      }
    ]);
    useExistingKey = !changeKey;
  }
  let answers;
  if (provider === "gemini") {
    const defaultModel = savedCredentials && savedCredentials.model || DEFAULT_MODELS.gemini;
    if (useExistingKey) {
      answers = { ...savedCredentials };
      const { model } = await inquirer.prompt([
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.gemini"),
          default: defaultModel,
          choices: GEMINI_MODELS
        }
      ]);
      answers.model = model;
      logger2.success(language_service_default.get("config.keySuccess", language_service_default.get("config.provider.gemini")));
    } else {
      answers = await inquirer.prompt([
        { type: "password", name: "apiKey", message: language_service_default.get("config.keyPrompt.gemini") },
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.gemini"),
          default: defaultModel,
          choices: GEMINI_MODELS
        }
      ]);
      if (!answers.apiKey) {
        logger2.error(language_service_default.get("config.invalidKey"));
        return null;
      }
    }
    geminiClient.initialize(answers);
    api_session_default.configure("gemini", answers);
  } else if (provider === "openai") {
    const defaultModel = savedCredentials && savedCredentials.model || DEFAULT_MODELS.openai;
    if (useExistingKey) {
      answers = { ...savedCredentials };
      const { model } = await inquirer.prompt([
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.openai"),
          default: defaultModel,
          choices: OPENAI_MODELS
        }
      ]);
      answers.model = model;
      logger2.success(language_service_default.get("config.keySuccess", language_service_default.get("config.provider.openai")));
    } else {
      answers = await inquirer.prompt([
        { type: "password", name: "apiKey", message: language_service_default.get("config.keyPrompt.openai") },
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.openai"),
          default: defaultModel,
          choices: OPENAI_MODELS
        }
      ]);
      if (!answers.apiKey) {
        logger2.error(language_service_default.get("config.invalidKey"));
        return null;
      }
    }
    openAiClient.initialize(answers);
    api_session_default.configure("openai", answers);
  } else if (provider === "claude") {
    const defaultModel = savedCredentials && savedCredentials.model || DEFAULT_MODELS.claude;
    if (useExistingKey) {
      answers = { ...savedCredentials };
      const { model } = await inquirer.prompt([
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.claude"),
          default: defaultModel,
          choices: CLAUDE_MODELS
        }
      ]);
      answers.model = model;
      logger2.success(language_service_default.get("config.keySuccess", language_service_default.get("config.provider.claude")));
    } else {
      answers = await inquirer.prompt([
        { type: "password", name: "apiKey", message: language_service_default.get("config.keyPrompt.claude") },
        {
          type: "list",
          name: "model",
          message: language_service_default.get("config.modelPrompt.claude"),
          default: defaultModel,
          choices: CLAUDE_MODELS
        }
      ]);
      if (!answers.apiKey) {
        logger2.error(language_service_default.get("config.invalidKey"));
        return null;
      }
    }
    claudeClient.initialize(answers);
    api_session_default.configure("claude", answers);
  }
  logger2.info(language_service_default.get("config.iaSettings", provider, answers.model));
  config.credentials[provider] = answers;
  return {
    provider,
    apiKey: answers.apiKey,
    model: answers.model,
    credentials: config.credentials
  };
}
async function loopConfiguracao() {
  const config = readConfig() || {};
  const language = await configurarIdioma(config);
  logger2.info(language_service_default.get("config.welcome"));
  const creds = config.credentials ? Object.keys(config.credentials).join(", ") : language_service_default.get("config.noCreds");
  logger2.info(language_service_default.get(
    "config.loaded",
    config.os || language_service_default.get("config.nd"),
    config.economyMode,
    creds
  ));
  const { os } = await inquirer.prompt([
    {
      type: "list",
      name: "os",
      message: language_service_default.get("config.osPrompt"),
      choices: ["Windows", "Linux"],
      default: config.os || "Windows"
    }
  ]);
  api_session_default.setOS(os.toLowerCase());
  logger2.info(language_service_default.get("config.osSet", os));
  const { economyMode } = await inquirer.prompt([
    {
      type: "confirm",
      name: "economyMode",
      message: language_service_default.get("config.economyPrompt"),
      default: config.economyMode || false
    }
  ]);
  api_session_default.setEconomyMode(economyMode);
  if (economyMode) {
    logger2.success(language_service_default.get("config.economyOn"));
  }
  logger2.info(language_service_default.get("config.iaSetup"));
  const configuracaoIA = await escolherProvedorIA(config, false);
  if (configuracaoIA) {
    const newConfig = {
      language,
      os,
      economyMode,
      provider: configuracaoIA.provider,
      apiKey: configuracaoIA.apiKey,
      model: configuracaoIA.model,
      credentials: configuracaoIA.credentials
    };
    writeConfig(newConfig);
    logger2.success(language_service_default.get("config.providerSuccess", configuracaoIA.provider));
  }
}
async function ajustarConfiguracoes() {
  const config = readConfig() || {};
  if (config.language) {
    api_session_default.setLanguage(config.language);
    language_service_default.setLanguage(config.language);
  }
  logger2.info(language_service_default.get("config.adjustTitle"));
  const creds = config.credentials ? Object.keys(config.credentials).join(", ") : language_service_default.get("config.noCreds");
  logger2.info(language_service_default.get(
    "config.loaded",
    config.os || language_service_default.get("config.nd"),
    config.economyMode,
    creds
  ));
  const { opcao } = await inquirer.prompt([
    {
      type: "list",
      name: "opcao",
      message: language_service_default.get("config.adjustPrompt"),
      choices: [
        { name: language_service_default.get("config.adjustOptions.provider"), value: "provider" },
        { name: language_service_default.get("config.adjustOptions.economy"), value: "economy" },
        { name: language_service_default.get("config.adjustOptions.os"), value: "os" },
        { name: "Change Language / Mudar Idioma", value: "language" },
        { name: language_service_default.get("config.adjustOptions.all"), value: "all" }
      ]
    }
  ]);
  let newConfig = { ...config };
  switch (opcao) {
    case "provider":
      logger2.info(language_service_default.get("config.providerChange"));
      const configuracaoIA = await escolherProvedorIA(config, true);
      if (configuracaoIA) {
        newConfig.provider = configuracaoIA.provider;
        newConfig.apiKey = configuracaoIA.apiKey;
        newConfig.model = configuracaoIA.model;
        newConfig.credentials = configuracaoIA.credentials;
      }
      break;
    case "economy":
      const { economyMode } = await inquirer.prompt([
        {
          type: "confirm",
          name: "economyMode",
          message: language_service_default.get("config.economyPrompt"),
          default: config.economyMode || false
        }
      ]);
      newConfig.economyMode = economyMode;
      api_session_default.setEconomyMode(economyMode);
      if (economyMode) {
        logger2.success(language_service_default.get("config.economyOn"));
      } else {
        logger2.info(language_service_default.get("config.economyOff"));
      }
      break;
    case "os":
      const { os } = await inquirer.prompt([
        {
          type: "list",
          name: "os",
          message: language_service_default.get("config.osPrompt"),
          choices: ["Windows", "Linux"],
          default: config.os || "Windows"
        }
      ]);
      newConfig.os = os;
      api_session_default.setOS(os.toLowerCase());
      logger2.success(language_service_default.get("config.osSet", os));
      break;
    case "language":
      const newLanguage = await configurarIdioma(config);
      newConfig.language = newLanguage;
      break;
    case "all":
      logger2.info(language_service_default.get("config.reconfigAll"));
      const allLanguage = await configurarIdioma(config);
      newConfig.language = allLanguage;
      const { osAll } = await inquirer.prompt([
        {
          type: "list",
          name: "osAll",
          message: language_service_default.get("config.osPrompt"),
          choices: ["Windows", "Linux"],
          default: config.os || "Windows"
        }
      ]);
      newConfig.os = osAll;
      api_session_default.setOS(osAll.toLowerCase());
      const { economyModeAll } = await inquirer.prompt([
        {
          type: "confirm",
          name: "economyModeAll",
          message: language_service_default.get("config.economyPrompt"),
          default: config.economyMode || false
        }
      ]);
      newConfig.economyMode = economyModeAll;
      api_session_default.setEconomyMode(economyModeAll);
      const configuracaoIAAll = await escolherProvedorIA(config, true);
      if (configuracaoIAAll) {
        newConfig.provider = configuracaoIAAll.provider;
        newConfig.apiKey = configuracaoIAAll.apiKey;
        newConfig.model = configuracaoIAAll.model;
        newConfig.credentials = configuracaoIAAll.credentials;
      }
      break;
  }
  writeConfig(newConfig);
  logger2.success(language_service_default.get("config.updateSuccess"));
}
var config_service_default = {
  loopConfiguracao,
  ajustarConfiguracoes,
  readConfig,
  writeConfig
};

// src/TUI/states/AppContext.js
import { jsx } from "react/jsx-runtime";
var { readConfig: readConfig2 } = config_service_default;
var AppContext = createContext(null);
var AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [config, setConfig] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionPermissions, setSessionPermissions] = useState({
    READ: true,
    CREATE: false,
    UPDATE: false,
    DELETE: false,
    SHELL: false
  });
  const loadConfig = useCallback(async () => {
    try {
      const savedConfig = await readConfig2();
      if (savedConfig) {
        setConfig(savedConfig);
        if (savedConfig.language) {
          api_session_default.setLanguage(savedConfig.language);
        }
        if (savedConfig.os) {
          api_session_default.setOS(savedConfig.os);
        }
        if (savedConfig.economyMode !== void 0) {
          api_session_default.setEconomyMode(savedConfig.economyMode);
        }
        if (savedConfig.provider && savedConfig.credentials) {
          api_session_default.configure(savedConfig.provider, savedConfig.credentials);
        }
      }
      return savedConfig;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);
  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    setError(null);
  }, []);
  const addMessage = useCallback((message) => {
    const messageWithId = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setConversationHistory((prev) => [...prev, messageWithId]);
  }, []);
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);
  const updatePermission = useCallback((action, allowed) => {
    setSessionPermissions((prev) => ({
      ...prev,
      [action]: allowed
    }));
  }, []);
  const resetPermissions = useCallback(() => {
    setSessionPermissions({
      READ: true,
      CREATE: false,
      UPDATE: false,
      DELETE: false,
      SHELL: false
    });
  }, []);
  const value = {
    // Estado
    currentPage,
    config,
    conversationHistory,
    isLoading,
    error,
    sessionPermissions,
    // Ações
    navigate,
    loadConfig,
    updateConfig,
    addMessage,
    clearHistory,
    setIsLoading,
    setError,
    updatePermission,
    resetPermissions
  };
  return /* @__PURE__ */ jsx(AppContext.Provider, { value, children });
};
var useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState deve ser usado dentro de AppProvider");
  }
  return context;
};

// src/TUI/pages/HomePage.js
import React5, { useState as useState3 } from "react";
import { Box as Box4, Text as Text3, useApp } from "ink";

// src/TUI/hooks/useRouter.js
import { useCallback as useCallback2, useMemo } from "react";
var useRouter = () => {
  const { currentPage, navigate } = useAppState();
  const goToHome = useCallback2(() => navigate("home"), [navigate]);
  const goToChat = useCallback2(() => navigate("chat"), [navigate]);
  const goToConfig = useCallback2(() => navigate("config"), [navigate]);
  const goToScrap = useCallback2(() => navigate("scrap"), [navigate]);
  const goToHelp = useCallback2(() => navigate("help"), [navigate]);
  const goBack = useCallback2(() => {
    navigate("home");
  }, [navigate]);
  const isHome = useMemo(() => currentPage === "home", [currentPage]);
  const isChat = useMemo(() => currentPage === "chat", [currentPage]);
  const isConfig = useMemo(() => currentPage === "config", [currentPage]);
  const isScrap = useMemo(() => currentPage === "scrap", [currentPage]);
  const isHelp = useMemo(() => currentPage === "help", [currentPage]);
  return {
    // Estado atual
    currentPage,
    // Navegação
    navigate,
    goToHome,
    goToChat,
    goToConfig,
    goToScrap,
    goToHelp,
    goBack,
    // Verificações
    isHome,
    isChat,
    isConfig,
    isScrap,
    isHelp
  };
};

// src/TUI/layouts/MainLayout.js
import React2 from "react";
import { Box } from "ink";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function MainLayout({ header, children }) {
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", padding: 1, children: [
    header,
    /* @__PURE__ */ jsx2(Box, { marginTop: 1, children })
  ] });
}

// src/TUI/components/SelectInput.js
import React3, { useState as useState2, useEffect } from "react";
import { Box as Box2, Text, useInput } from "ink";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var SelectInput = ({ label, options = [], onSelect, initialIndex = 0 }) => {
  const [selectedIndex, setSelectedIndex] = useState2(initialIndex);
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(options.length - 1, prev + 1));
    }
    if (key.return) {
      if (options[selectedIndex]) {
        onSelect(options[selectedIndex].value, selectedIndex);
      }
    }
  });
  return /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", marginY: 1, children: [
    label && /* @__PURE__ */ jsx3(Box2, { marginBottom: 1, children: /* @__PURE__ */ jsx3(Text, { bold: true, color: "cyan", children: label }) }),
    /* @__PURE__ */ jsx3(Box2, { flexDirection: "column", children: options.map((option, index) => {
      const isSelected = index === selectedIndex;
      return /* @__PURE__ */ jsx3(Box2, { marginLeft: 1, children: /* @__PURE__ */ jsxs2(
        Text,
        {
          color: isSelected ? "green" : "white",
          bold: isSelected,
          children: [
            isSelected ? "\u25B6 " : "  ",
            option.label
          ]
        }
      ) }, `option-${option.value}`);
    }) }),
    /* @__PURE__ */ jsx3(Box2, { marginTop: 1, children: /* @__PURE__ */ jsx3(Text, { dimColor: true, children: "\u2191\u2193 para navegar | Enter para selecionar" }) })
  ] });
};
var SelectInput_default = SelectInput;

// src/TUI/components/StatusBar.js
import React4 from "react";
import { Box as Box3, Text as Text2 } from "ink";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var StatusBar = ({ leftContent, centerContent, rightContent }) => {
  return /* @__PURE__ */ jsxs3(
    Box3,
    {
      width: "100%",
      justifyContent: "space-between",
      borderStyle: "single",
      borderColor: "gray",
      paddingX: 1,
      children: [
        /* @__PURE__ */ jsx4(Box3, { children: /* @__PURE__ */ jsx4(Text2, { dimColor: true, children: leftContent }) }),
        centerContent && /* @__PURE__ */ jsx4(Box3, { children: /* @__PURE__ */ jsx4(Text2, { dimColor: true, children: centerContent }) }),
        /* @__PURE__ */ jsx4(Box3, { children: /* @__PURE__ */ jsx4(Text2, { dimColor: true, children: rightContent || "ESC: Voltar | Ctrl+C: Sair" }) })
      ]
    }
  );
};
var StatusBar_default = StatusBar;

// src/TUI/pages/HomePage.js
import BigText from "ink-big-text";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var HomePage = () => {
  const { goToChat, goToConfig, goToScrap, goToHelp } = useRouter();
  const { exit } = useApp();
  const commands = [
    { label: "\u{1F4AC} Chat - Conversar com IA", value: "chat" },
    { label: "\u{1F4C1} Scrap - Gerar \xE1rvore do projeto", value: "scrap" },
    { label: "\u2699\uFE0F  Config - Configura\xE7\xF5es", value: "config" },
    { label: "\u2753 Help - Ajuda", value: "help" },
    { label: "\u{1F6AA} Exit - Sair", value: "exit" }
  ];
  const handleSelect = (value) => {
    switch (value) {
      case "chat":
        goToChat();
        break;
      case "scrap":
        goToScrap();
        break;
      case "config":
        goToConfig();
        break;
      case "help":
        goToHelp();
        break;
      case "exit":
        exit();
        break;
      default:
        break;
    }
  };
  const header = /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", alignItems: "center", children: [
    /* @__PURE__ */ jsx5(BigText, { text: "CLIA", font: "tiny", colors: ["cyan", "blue"] }),
    /* @__PURE__ */ jsx5(Text3, { dimColor: true, children: "Copiloto de IA CLI Aut\xF4nomo" })
  ] });
  return /* @__PURE__ */ jsx5(MainLayout, { header, children: /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx5(Box4, { marginY: 1, children: /* @__PURE__ */ jsx5(Text3, { bold: true, color: "yellow", children: "Bem-vindo! Selecione uma op\xE7\xE3o:" }) }),
    /* @__PURE__ */ jsx5(
      SelectInput_default,
      {
        options: commands,
        onSelect: handleSelect
      }
    ),
    /* @__PURE__ */ jsx5(
      StatusBar_default,
      {
        leftContent: "v1.0.0",
        rightContent: "\u2191\u2193: Navegar | Enter: Selecionar | Ctrl+C: Sair"
      }
    )
  ] }) });
};
var HomePage_default = HomePage;

// src/TUI/pages/ChatPage.js
import React10, { useState as useState5, useRef, useMemo as useMemo2, useCallback as useCallback4 } from "react";
import { Box as Box9, Text as Text8, useInput as useInput3 } from "ink";
import TextInput from "ink-text-input";

// src/TUI/hooks/useAI.js
import { useCallback as useCallback3 } from "react";

// src/services/ai-service.js
import geminiClient2 from "../agent/api/ai/gemini-client.js";
import openAiClient2 from "../agent/api/ai/open-ai-client.js";
import claudeClient2 from "../agent/api/ai/claude-client.js";
async function sendPrompt(history, tools) {
  const provider = api_session_default.getProvider();
  switch (provider) {
    case "gemini":
      return geminiClient2.sendMessage(history, tools);
    case "openai":
      return openAiClient2.sendMessage(history, tools);
    case "claude":
      return claudeClient2.sendMessage(history, tools);
    default:
      throw new Error("Provedor de IA n\xE3o configurado ou desconhecido.");
  }
}
var ai_service_default = { sendPrompt };

// src/utils/fs-actions.js
import fs2 from "fs";
import path from "path";

// src/utils/logger.js
import util from "util";
import lang from "../services/language-service.js";
var colors = {
  reset: "\x1B[0m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  grey: "\x1B[90m",
  brightGreen: "\x1B[92m",
  brightYellow: "\x1B[93m",
  brightBlue: "\x1B[94m",
  brightMagenta: "\x1B[95m",
  brightCyan: "\x1B[96m"
};
function color(colorName, text) {
  return (colors[colorName] || "") + text + colors.reset;
}
var isTUIMode = () => process.env.CLIA_TUI_MODE === "true";
var logger_default = {
  success(message) {
    if (isTUIMode()) return;
  },
  error(message, error) {
    if (isTUIMode()) return;
    if (error) {
      if (error instanceof Error) {
        if (error.stack) {
          const stackLines = error.stack.split("\n").slice(1, 4);
          stackLines.forEach((line) => {
          });
        }
      } else if (typeof error === "object") {
      } else {
      }
    }
  },
  warn(message) {
    if (isTUIMode()) return;
  },
  info(message) {
    if (isTUIMode()) return;
  },
  ai(message) {
    if (isTUIMode()) return;
  },
  tool(message) {
    if (isTUIMode()) return;
  },
  iteration(message) {
    if (isTUIMode()) return;
  },
  response(message) {
    if (isTUIMode()) return;
  },
  result(success, message) {
    if (isTUIMode()) return;
    const prefix = success ? color("brightGreen", "\u2713") : color("red", "\u2717");
  },
  raw(message) {
    if (isTUIMode()) return;
  }
};

// src/utils/fs-actions.js
import { applyPatch } from "diff";
var partiallyReadFiles = {};
function listNearbyFiles(filePath) {
  try {
    const dir = path.dirname(filePath);
    const dirExists = fs2.existsSync(dir);
    if (!dirExists) {
      const parentDir = path.dirname(dir);
      if (fs2.existsSync(parentDir)) {
        const files2 = fs2.readdirSync(parentDir);
        return `
Diret\xF3rio '${dir}' n\xE3o existe.
Conte\xFAdo de '${parentDir}':
${files2.slice(0, 10).join("\n")}`;
      }
      return `
Diret\xF3rio '${dir}' n\xE3o existe.`;
    }
    const files = fs2.readdirSync(dir);
    return `
Arquivos no diret\xF3rio '${dir}':
${files.slice(0, 15).join("\n")}`;
  } catch (error) {
    logger_default.error("Falha ao listar arquivos pr\xF3ximos:", error);
    return "\nN\xE3o foi poss\xEDvel listar arquivos pr\xF3ximos.";
  }
}
function _validateFile(filePath) {
  const normalizedPath = path.normalize(filePath);
  if (!fs2.existsSync(normalizedPath)) {
    return {
      success: false,
      content: `ERRO: Arquivo '${normalizedPath}' n\xE3o encontrado.${listNearbyFiles(normalizedPath)}`
    };
  }
  const stats = fs2.statSync(normalizedPath);
  if (stats.isDirectory()) {
    return {
      success: false,
      content: `ERRO: '${normalizedPath}' \xE9 um diret\xF3rio, n\xE3o um arquivo.${listNearbyFiles(normalizedPath)}`
    };
  }
  return { success: true, normalizedPath, stats };
}
function readFile(filePath) {
  logger_default.info(`Tentando ler o arquivo: ${filePath}`);
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath, stats } = validation;
    logger_default.info(`Lendo o conte\xFAdo do arquivo: ${normalizedPath}`);
    const content = fs2.readFileSync(normalizedPath, "utf-8");
    const lines = content.split("\n").length;
    logger_default.info(`Leitura bem sucedida. Linhas: ${lines}, Tamanho: ${stats.size} bytes`);
    return {
      success: true,
      content: `Arquivo: ${normalizedPath}
Linhas: ${lines}
Tamanho: ${stats.size} bytes

--- IN\xCDCIO DO ARQUIVO ---
${content}
--- FIM DO ARQUIVO ---`
    };
  } catch (error) {
    logger_default.error(`Erro inesperado ao ler o arquivo: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao ler arquivo: ${error.message}
Caminho tentado: ${filePath}`
    };
  }
}
function createFile(filePath) {
  try {
    const normalizedPath = path.normalize(filePath);
    if (fs2.existsSync(normalizedPath)) {
      return {
        success: false,
        content: `ERRO: O arquivo '${normalizedPath}' j\xE1 existe.

Dica: Use UPDATE para modificar arquivos existentes.`
      };
    }
    const dir = path.dirname(normalizedPath);
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
      logger_default.info(`   \u{1F4C1} Diret\xF3rio '${dir}' criado.`);
    }
    fs2.writeFileSync(normalizedPath, "", "utf-8");
    return {
      success: true,
      content: `\u2705 Arquivo '${normalizedPath}' criado com sucesso.

Pr\xF3ximo passo: Use UPDATE para adicionar conte\xFAdo ao arquivo.`
    };
  } catch (error) {
    logger_default.error(`Erro ao criar arquivo: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao criar arquivo: ${error.message}
Caminho: ${filePath}

Verifique se:
- O caminho \xE9 v\xE1lido
- Voc\xEA tem permiss\xF5es de escrita
- N\xE3o h\xE1 caracteres inv\xE1lidos no nome`
    };
  }
}
function updateFile(filePath, newContent) {
  try {
    const normalizedPath = path.normalize(filePath);
    const fileExists = fs2.existsSync(normalizedPath);
    if (!fileExists) {
      const dir = path.dirname(normalizedPath);
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
    }
    fs2.writeFileSync(normalizedPath, newContent, "utf-8");
    const stats = fs2.statSync(normalizedPath);
    const lines = newContent.split("\n").length;
    return {
      success: true,
      content: `\u2705 Arquivo '${normalizedPath}' ${fileExists ? "atualizado" : "criado"} com sucesso.

Estat\xEDsticas:
- Linhas: ${lines}
- Tamanho: ${stats.size} bytes
- Caminho absoluto: ${path.resolve(normalizedPath)}`
    };
  } catch (error) {
    logger_default.error(`Erro ao atualizar arquivo: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao atualizar arquivo: ${error.message}
Caminho: ${filePath}
Tamanho do conte\xFAdo: ${newContent.length} caracteres`
    };
  }
}
function deleteFile(filePath) {
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath, stats } = validation;
    const size = stats.size;
    fs2.unlinkSync(normalizedPath);
    return {
      success: true,
      content: `\u2705 Arquivo '${normalizedPath}' deletado com sucesso.
- Tamanho liberado: ${size} bytes`
    };
  } catch (error) {
    logger_default.error(`Erro ao deletar arquivo: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao deletar arquivo: ${error.message}
Caminho: ${filePath}`
    };
  }
}
function readStartOfFile(filePath) {
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath } = validation;
    const content = fs2.readFileSync(normalizedPath, "utf-8");
    const lines = content.split("\n");
    const halfwayPoint = Math.ceil(lines.length / 2);
    const firstHalf = lines.slice(0, halfwayPoint).join("\n");
    partiallyReadFiles[normalizedPath] = {
      lines,
      splitIndex: halfwayPoint
    };
    const message = lines.length > 1 ? `

--- FIM DA PRIMEIRA PARTE (Linhas 1-${halfwayPoint} de ${lines.length}) ---
Use READ_END ${filePath} para ler o restante do arquivo.` : `

--- FIM DO ARQUIVO ---`;
    return {
      success: true,
      content: `--- IN\xCDCIO DO ARQUIVO: ${filePath} ---
${firstHalf}${message}`
    };
  } catch (error) {
    logger_default.error(`Erro ao ler o in\xEDcio do arquivo: ${filePath}`, error);
    return { success: false, content: `ERRO ao ler o in\xEDcio do arquivo: ${error.message}` };
  }
}
function readEndOfFile(filePath) {
  try {
    const normalizedPath = path.normalize(filePath);
    const partialData = partiallyReadFiles[normalizedPath];
    if (!partialData) {
      return {
        success: false,
        content: `ERRO: A primeira parte do arquivo '${normalizedPath}' n\xE3o foi lida ainda. Use READ_START ${normalizedPath} primeiro.`
      };
    }
    const secondHalf = partialData.lines.slice(partialData.splitIndex).join("\n");
    delete partiallyReadFiles[normalizedPath];
    return {
      success: true,
      content: `--- CONTINUA\xC7\xC3O DO ARQUIVO: ${filePath} (Linhas ${partialData.splitIndex + 1}-${partialData.lines.length}) ---
${secondHalf}

--- FIM DO ARQUIVO ---`
    };
  } catch (error) {
    logger_default.error(`Erro ao ler o final do arquivo: ${filePath}`, error);
    return { success: false, content: `ERRO ao ler o final do arquivo: ${error.message}` };
  }
}
function editLines(filePath, startLine, endLine, newContent) {
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath } = validation;
    const fileContent = fs2.readFileSync(normalizedPath, "utf-8");
    const lines = fileContent.split("\n");
    const totalLines = lines.length;
    if (startLine < 1 || startLine > totalLines) {
      return {
        success: false,
        content: `ERRO: Linha inicial ${startLine} inv\xE1lida. O arquivo tem ${totalLines} linhas.`
      };
    }
    if (endLine < startLine || endLine > totalLines) {
      return {
        success: false,
        content: `ERRO: Linha final ${endLine} inv\xE1lida. Deve estar entre ${startLine} e ${totalLines}.`
      };
    }
    const originalLines = lines.slice(startLine - 1, endLine).join("\n");
    const newLines = newContent.split("\n");
    lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
    const updatedContent = lines.join("\n");
    fs2.writeFileSync(normalizedPath, updatedContent, "utf-8");
    return {
      success: true,
      content: `\u2705 Arquivo '${normalizedPath}' atualizado com sucesso.

Linhas editadas: ${startLine}-${endLine}
Linhas removidas: ${endLine - startLine + 1}
Linhas inseridas: ${newLines.length}
Total de linhas agora: ${lines.length}

--- CONTE\xDADO ANTERIOR ---
${originalLines}

--- NOVO CONTE\xDADO ---
${newContent}`
    };
  } catch (error) {
    logger_default.error(`Erro ao editar linhas: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao editar linhas: ${error.message}
Caminho: ${filePath}`
    };
  }
}
function insertLines(filePath, lineNumber, content) {
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath } = validation;
    const fileContent = fs2.readFileSync(normalizedPath, "utf-8");
    const lines = fileContent.split("\n");
    const totalLines = lines.length;
    if (lineNumber < 0 || lineNumber > totalLines) {
      return {
        success: false,
        content: `ERRO: Linha ${lineNumber} inv\xE1lida. O arquivo tem ${totalLines} linhas. Use 0 para inserir no in\xEDcio ou ${totalLines} para inserir no final.`
      };
    }
    const newLines = content.split("\n");
    lines.splice(lineNumber, 0, ...newLines);
    const updatedContent = lines.join("\n");
    fs2.writeFileSync(normalizedPath, updatedContent, "utf-8");
    return {
      success: true,
      content: `\u2705 Linhas inseridas com sucesso em '${normalizedPath}'.

Posi\xE7\xE3o: ap\xF3s linha ${lineNumber}
Linhas inseridas: ${newLines.length}
Total de linhas agora: ${lines.length}

--- CONTE\xDADO INSERIDO ---
${content}`
    };
  } catch (error) {
    logger_default.error(`Erro ao inserir linhas: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao inserir linhas: ${error.message}
Caminho: ${filePath}`
    };
  }
}
function replaceInFile(filePath, searchText, replaceText, replaceAll = false) {
  try {
    const validation = _validateFile(filePath);
    if (!validation.success) {
      return validation;
    }
    const { normalizedPath } = validation;
    let fileContent = fs2.readFileSync(normalizedPath, "utf-8");
    const occurrences = (fileContent.match(new RegExp(escapeRegExp(searchText), "g")) || []).length;
    if (occurrences === 0) {
      return {
        success: false,
        content: `ERRO: Texto n\xE3o encontrado no arquivo.

Texto procurado:
"${searchText}"

Dica: Verifique se o texto existe exatamente como digitado (case-sensitive).`
      };
    }
    if (replaceAll) {
      fileContent = fileContent.split(searchText).join(replaceText);
    } else {
      fileContent = fileContent.replace(searchText, replaceText);
    }
    fs2.writeFileSync(normalizedPath, fileContent, "utf-8");
    return {
      success: true,
      content: `\u2705 Substitui\xE7\xE3o realizada com sucesso em '${normalizedPath}'.

Ocorr\xEAncias encontradas: ${occurrences}
Ocorr\xEAncias substitu\xEDdas: ${replaceAll ? occurrences : 1}

--- TEXTO ORIGINAL ---
${searchText}

--- TEXTO NOVO ---
${replaceText}`
    };
  } catch (error) {
    logger_default.error(`Erro ao substituir texto: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao substituir texto: ${error.message}
Caminho: ${filePath}`
    };
  }
}
function createFileWithContent(filePath, content) {
  try {
    const normalizedPath = path.normalize(filePath);
    if (fs2.existsSync(normalizedPath)) {
      return {
        success: false,
        content: `ERRO: O arquivo '${normalizedPath}' j\xE1 existe.

Dica: Use EDIT_LINES ou REPLACE_IN_FILE para modificar arquivos existentes.`
      };
    }
    const dir = path.dirname(normalizedPath);
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
      logger_default.info(`   \u{1F4C1} Diret\xF3rio '${dir}' criado.`);
    }
    fs2.writeFileSync(normalizedPath, content, "utf-8");
    const stats = fs2.statSync(normalizedPath);
    const lines = content.split("\n").length;
    return {
      success: true,
      content: `\u2705 Arquivo '${normalizedPath}' criado com sucesso.

Estat\xEDsticas:
- Linhas: ${lines}
- Tamanho: ${stats.size} bytes
- Caminho absoluto: ${path.resolve(normalizedPath)}

--- CONTE\xDADO ---
${content.split("\n").slice(0, 10).join("\n")}${lines > 10 ? "\n...(truncado)" : ""}`
    };
  } catch (error) {
    logger_default.error(`Erro ao criar arquivo com conte\xFAdo: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao criar arquivo: ${error.message}
Caminho: ${filePath}`
    };
  }
}
function moveFile(sourcePath, destPath) {
  try {
    const sourceValidation = _validateFile(sourcePath);
    if (!sourceValidation.success) {
      return sourceValidation;
    }
    const { normalizedPath: normalizedSource, stats: sourceStats } = sourceValidation;
    const normalizedDest = path.normalize(destPath);
    if (fs2.existsSync(normalizedDest)) {
      return {
        success: false,
        content: `ERRO: O arquivo destino '${normalizedDest}' j\xE1 existe.

Dica: Delete o arquivo destino primeiro ou escolha outro nome.`
      };
    }
    const destDir = path.dirname(normalizedDest);
    if (!fs2.existsSync(destDir)) {
      fs2.mkdirSync(destDir, { recursive: true });
      logger_default.info(`   \u{1F4C1} Diret\xF3rio '${destDir}' criado.`);
    }
    fs2.renameSync(normalizedSource, normalizedDest);
    return {
      success: true,
      content: `\u2705 Arquivo movido com sucesso.

De: ${normalizedSource}
Para: ${normalizedDest}

Tamanho: ${sourceStats.size} bytes`
    };
  } catch (error) {
    logger_default.error(`Erro ao mover arquivo: ${sourcePath} -> ${destPath}`, error);
    return {
      success: false,
      content: `ERRO ao mover arquivo: ${error.message}
Origem: ${sourcePath}
Destino: ${destPath}`
    };
  }
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function applyPatchToFile(filePath, patchContent) {
  const normalizedPath = path.normalize(filePath);
  if (!fs2.existsSync(normalizedPath)) {
    return {
      success: false,
      content: `ERRO: Arquivo '${normalizedPath}' n\xE3o encontrado.${listNearbyFiles(normalizedPath)}`
    };
  }
  const stats = fs2.statSync(normalizedPath);
  if (stats.isDirectory()) {
    return {
      success: false,
      content: `ERRO: '${normalizedPath}' \xE9 um diret\xF3rio, n\xE3o um arquivo.`
    };
  }
  try {
    const oldContent = fs2.readFileSync(normalizedPath, "utf-8");
    const newContent = applyPatch(oldContent, patchContent);
    if (newContent === false) {
      return {
        success: false,
        content: `ERRO: O patch n\xE3o p\xF4de ser aplicado. O patch pode estar mal formatado ou o conte\xFAdo do arquivo mudou.`
      };
    }
    fs2.writeFileSync(normalizedPath, newContent, "utf-8");
    return {
      success: true,
      content: `\u2705 Patch aplicado com sucesso em '${normalizedPath}'.`
    };
  } catch (error) {
    logger_default.error(`Erro ao aplicar patch: ${filePath}`, error);
    return {
      success: false,
      content: `ERRO ao aplicar patch: ${error.message}`
    };
  }
}
function createDirectory(dirPath) {
  const normalizedPath = path.normalize(dirPath);
  try {
    if (fs2.existsSync(normalizedPath)) {
      if (fs2.statSync(normalizedPath).isDirectory()) {
        return {
          success: true,
          content: `\u2705 Diret\xF3rio '${normalizedPath}' j\xE1 existe.`
        };
      } else {
        return {
          success: false,
          content: `ERRO: O caminho '${normalizedPath}' j\xE1 existe, mas \xE9 um arquivo.`
        };
      }
    }
    fs2.mkdirSync(normalizedPath, { recursive: true });
    return {
      success: true,
      content: `\u2705 Diret\xF3rio '${normalizedPath}' criado com sucesso.`
    };
  } catch (error) {
    logger_default.error(`Erro ao criar diret\xF3rio: ${dirPath}`, error);
    return {
      success: false,
      content: `ERRO ao criar diret\xF3rio: ${error.message}`
    };
  }
}
var fs_actions_default = {
  readFile,
  createFile,
  updateFile,
  deleteFile,
  moveFile,
  readStartOfFile,
  readEndOfFile,
  editLines,
  insertLines,
  replaceInFile,
  createFileWithContent,
  applyPatchToFile,
  createDirectory
};

// src/utils/file-tree-generator.js
import fs3 from "fs";
import path2 from "path";
import ignore from "ignore";
import { DEFAULT_IGNORE_RULES, GITIGNORE_FILE } from "../config/constants.js";
function loadGitIgnore() {
  const ig = ignore();
  const projectRoot = process.cwd();
  ig.add(DEFAULT_IGNORE_RULES);
  try {
    const gitignorePath = path2.join(projectRoot, GITIGNORE_FILE);
    const gitignoreContent = fs3.readFileSync(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
  } catch (error) {
    logger_default.warn("Nenhum .gitignore encontrado. Usando apenas ignores padr\xE3o.");
  }
  return ig;
}
function walk(dir, rootDir, ig) {
  let filePaths = [];
  try {
    const files = fs3.readdirSync(dir);
    for (const file of files) {
      const fullPath = path2.join(dir, file);
      const relativePath = path2.relative(rootDir, fullPath);
      if (relativePath === "") {
        continue;
      }
      const stats = fs3.statSync(fullPath);
      const pathToCheck = stats.isDirectory() ? relativePath + "/" : relativePath;
      if (ig.ignores(pathToCheck)) {
        continue;
      }
      if (stats.isDirectory()) {
        filePaths = [...filePaths, ...walk(fullPath, rootDir, ig)];
      } else {
        filePaths.push(relativePath);
      }
    }
  } catch (error) {
    logger_default.warn(`N\xE3o foi poss\xEDvel ler o diret\xF3rio: ${dir}`);
  }
  return filePaths;
}
function generateFileTree(rootDirParam = ".") {
  const ig = loadGitIgnore();
  const absoluteRootDir = path2.resolve(rootDirParam);
  const allPaths = walk(absoluteRootDir, absoluteRootDir, ig);
  return {
    projectTree: allPaths
  };
}
var file_tree_generator_default = generateFileTree;

// src/agent/api/tools/filesystem-tools.js
var applyPatch2 = {
  name: "APPLY_PATCH",
  description: "Aplica um patch de formato 'diff' a um arquivo existente. Esta \xE9 a forma PREFERIDA para modifica\xE7\xF5es complexas.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser modificado (ex: 'src/service.js')."
      },
      patchContent: {
        type: "string",
        description: "O patch no formato 'unified diff' (come\xE7ando com '--- a/...' e '+++ b/...')."
      }
    },
    required: ["filePath", "patchContent"]
  }
};
var readFile2 = {
  name: "READ",
  description: "L\xEA o conte\xFAdo completo de um \xFAnico arquivo no sistema.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/index.js')."
      }
    },
    required: ["filePath"]
  }
};
var readStartOfFile2 = {
  name: "READ_START",
  description: "L\xEA a PRIMEIRA METADE de um arquivo. Use isto para arquivos grandes ou para economizar tokens.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/main.js')."
      }
    },
    required: ["filePath"]
  }
};
var readEndOfFile2 = {
  name: "READ_END",
  description: "L\xEA a SEGUNDA METADE de um arquivo. Use SOMENTE ap\xF3s ter usado READ_START no mesmo arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/main.js')."
      }
    },
    required: ["filePath"]
  }
};
var createFile2 = {
  name: "CREATE",
  description: "Cria um novo arquivo vazio. Para adicionar conte\xFAdo, use CREATE_WITH_CONTENT ou EDIT_LINES.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser criado (ex: 'src/novo-arquivo.js')."
      }
    },
    required: ["filePath"]
  }
};
var createFileWithContent2 = {
  name: "CREATE_WITH_CONTENT",
  description: "Cria um novo arquivo e j\xE1 escreve o conte\xFAdo nele.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser criado (ex: 'src/component.js')."
      },
      content: {
        type: "string",
        description: "O conte\xFAdo completo a ser escrito no novo arquivo."
      }
    },
    required: ["filePath", "content"]
  }
};
var deleteFile2 = {
  name: "DELETE",
  description: "Deleta um arquivo permanentemente.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser deletado (ex: 'src/temp.js')."
      }
    },
    required: ["filePath"]
  }
};
var moveFile2 = {
  name: "MOVE",
  description: "Move ou renomeia um arquivo. PREFIRA isto a deletar e criar um novo.",
  input_schema: {
    type: "object",
    properties: {
      sourcePath: {
        type: "string",
        description: "O caminho do arquivo original (ex: 'src/old-name.js')."
      },
      destPath: {
        type: "string",
        description: "O novo caminho ou nome do arquivo (ex: 'src/new-name.js')."
      }
    },
    required: ["sourcePath", "destPath"]
  }
};
var editLines2 = {
  name: "EDIT_LINES",
  description: "Edita (substitui) um bloco de linhas espec\xEDfico em um arquivo. \xC9 a forma MAIS EFICIENTE de modificar um arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser editado (ex: 'src/utils.js')."
      },
      startLine: {
        type: "number",
        description: "A primeira linha do bloco a ser substitu\xEDdo (1-indexado)."
      },
      endLine: {
        type: "number",
        description: "A \xFAltima linha do bloco a ser substitu\xEDdo (1-indexado)."
      },
      newContent: {
        type: "string",
        description: "O novo conte\xFAdo que substituir\xE1 as linhas de startLine at\xE9 endLine."
      }
    },
    required: ["filePath", "startLine", "endLine", "newContent"]
  }
};
var insertLines2 = {
  name: "INSERT_LINES",
  description: "Insere um novo bloco de c\xF3digo AP\xD3S um n\xFAmero de linha espec\xEDfico em um arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser modificado (ex: 'src/main.js')."
      },
      lineNumber: {
        type: "number",
        description: "O n\xFAmero da linha (1-indexado) AP\xD3S a qual o novo conte\xFAdo ser\xE1 inserido. Use 0 para inserir no in\xEDcio do arquivo."
      },
      content: {
        type: "string",
        description: "O novo conte\xFAdo a ser inserido."
      }
    },
    required: ["filePath", "lineNumber", "content"]
  }
};
var replaceInFile2 = {
  name: "REPLACE_IN_FILE",
  description: "Localiza um texto exato (case-sensitive) em um arquivo e o substitui por um novo texto (apenas a primeira ocorr\xEAncia).",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo (ex: 'src/config.js')."
      },
      searchText: {
        type: "string",
        description: "O texto exato a ser procurado."
      },
      replaceText: {
        type: "string",
        description: "O novo texto que substituir\xE1 o searchText."
      }
    },
    required: ["filePath", "searchText", "replaceText"]
  }
};
var shell = {
  name: "SHELL",
  description: "Executa um comando do sistema operacional (shell, bash, cmd). Use com cuidado. N\xE3o use para comandos de arquivo (use READ, CREATE, etc).",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "O comando a ser executado (ex: 'npm install', 'ls -la')."
      }
    },
    required: ["command"]
  }
};
var updateFile2 = {
  name: "UPDATE",
  description: "Reescreve o arquivo INTEIRO com um novo conte\xFAdo. Use apenas se EDIT_LINES ou INSERT_LINES n\xE3o forem adequados.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser reescrito (ex: 'src/index.js')."
      },
      newContent: {
        type: "string",
        description: "O novo conte\xFAdo COMPLETO do arquivo."
      }
    },
    required: ["filePath", "newContent"]
  }
};
var createDirectory2 = {
  name: "CREATE_DIRECTORY",
  description: "Cria um novo diret\xF3rio (pasta). Cria diret\xF3rios pais se n\xE3o existirem.",
  input_schema: {
    type: "object",
    properties: {
      dirPath: {
        type: "string",
        description: "O caminho relativo do diret\xF3rio a ser criado (ex: 'src/nova-pasta/componentes')."
      }
    },
    required: ["dirPath"]
  }
};
function getTools(isEconomyMode) {
  const commonTools = [
    createFile2,
    createFileWithContent2,
    deleteFile2,
    moveFile2,
    editLines2,
    insertLines2,
    replaceInFile2,
    applyPatch2,
    shell,
    updateFile2,
    createDirectory2
  ];
  if (isEconomyMode) {
    return [readStartOfFile2, readEndOfFile2, ...commonTools];
  } else {
    return [readFile2, ...commonTools];
  }
}

// src/TUI/services/ai-service.js
import { execSync } from "child_process";
import fs4 from "fs";
import path3 from "path";

// src/config/constants.js
var PERSONAL_CONTEXT = "";
var PROMPTS_DIR = "src/prompts";
var OS_PROMPTS_DIR = `${PROMPTS_DIR}/os-commands`;
var MAX_ITERATIONS = 200;
var TIMEOUT = 1e4;
var MAX_BUFFER = 1024 * 1024;
var MAX_TOKENS = 4096;
var CLAUDE_MODELS2 = [
  { name: "Sonnet 4.5", value: "claude-sonnet-4-5-20250929" },
  { name: "Sonnet 4", value: "claude-sonnet-4-20250514" },
  { name: "Sonnet 3.7", value: "claude-3-7-sonnet-20250219" },
  { name: "Haiku 4.5", value: "claude-haiku-4-5-20251001" },
  { name: "Haiku 3.5", value: "claude-3-5-haiku-20241022" },
  { name: "Haiku 3", value: "claude-3-haiku-20240307" },
  { name: "Opus 4.1", value: "claude-opus-4-1-20250805" },
  { name: "Opus 4", value: "claude-opus-4-20250514" }
];
var GEMINI_MODELS2 = [
  { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash-latest" },
  { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro-latest" }
];
var OPENAI_MODELS2 = [
  { name: "GPT-4o Mini", value: "gpt-4o-mini" },
  { name: "GPT-4o", value: "gpt-4o" },
  { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { name: "GPT-5 nano", value: "gpt-5-nano-2025-08-07" }
];
var DEFAULT_CLAUDE_MODEL2 = CLAUDE_MODELS2[0].value;
var DEFAULT_GEMINI_MODEL2 = GEMINI_MODELS2[0].value;
var DEFAULT_OPENAI_MODEL2 = OPENAI_MODELS2[0].value;

// src/TUI/services/ai-service.js
var TOOL_TO_ACTION_MAP = {
  READ: "READ",
  READ_START: "READ",
  READ_END: "READ",
  CREATE: "CREATE",
  CREATE_WITH_CONTENT: "CREATE",
  CREATE_DIRECTORY: "CREATE",
  UPDATE: "UPDATE",
  EDIT_LINES: "UPDATE",
  INSERT_LINES: "UPDATE",
  REPLACE_IN_FILE: "UPDATE",
  APPLY_PATCH: "UPDATE",
  MOVE: "UPDATE",
  DELETE: "DELETE",
  SHELL: "SHELL"
};
var CRITICAL_ACTIONS = [
  "CREATE",
  "CREATE_WITH_CONTENT",
  "CREATE_DIRECTORY",
  "UPDATE",
  "EDIT_LINES",
  "INSERT_LINES",
  "REPLACE_IN_FILE",
  "APPLY_PATCH",
  "DELETE",
  "MOVE",
  "SHELL"
];
function getOsCommands() {
  const os = api_session_default.getOS();
  if (!os) return "Sistema operacional n\xE3o configurado.";
  try {
    const filePath = path3.join(process.cwd(), OS_PROMPTS_DIR, `${os}.json`);
    const fileContent = fs4.readFileSync(filePath, "utf8");
    const commandsData = JSON.parse(fileContent);
    let commandsString = `${PERSONAL_CONTEXT}

Comandos dispon\xEDveis no shell:
`;
    for (const category of commandsData.command_categories) {
      commandsString += `
# ${category.category_name}
`;
      for (const cmd of category.commands) {
        commandsString += `- \`${cmd.command}\`: ${cmd.description}
`;
      }
    }
    return commandsString;
  } catch (error) {
    return "Erro ao carregar comandos do sistema.";
  }
}
function getSystemPrompt() {
  try {
    const lang2 = api_session_default.getLanguage() || "en-US";
    const promptFileName = "system-prompt.md";
    const promptTemplatePath = path3.join(
      process.cwd(),
      PROMPTS_DIR,
      lang2,
      promptFileName
    );
    let promptTemplate = fs4.readFileSync(promptTemplatePath, "utf8");
    const fileTree = file_tree_generator_default(".");
    const fileTreeString = JSON.stringify(fileTree, null, 2);
    const osCommands = getOsCommands();
    promptTemplate = promptTemplate.replace("{{FILE_TREE}}", fileTreeString);
    promptTemplate = promptTemplate.replace("{{OS_COMMANDS}}", osCommands);
    return promptTemplate;
  } catch (error) {
    throw new Error("N\xE3o foi poss\xEDvel carregar o system prompt.");
  }
}
function executeShellCommand(command) {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER
    });
    return {
      success: true,
      content: `Comando executado: ${command}

Resultado:
${output}`
    };
  } catch (error) {
    return {
      success: false,
      content: `Erro ao executar comando: ${command}

Erro: ${error.message}`
    };
  }
}
function getToolImplementation(toolName) {
  const toolMap = {
    READ: fs_actions_default.readFile,
    READ_START: fs_actions_default.readStartOfFile,
    READ_END: fs_actions_default.readEndOfFile,
    CREATE_DIRECTORY: fs_actions_default.createDirectory,
    CREATE: fs_actions_default.createFile,
    CREATE_WITH_CONTENT: fs_actions_default.createFileWithContent,
    DELETE: fs_actions_default.deleteFile,
    MOVE: fs_actions_default.moveFile,
    EDIT_LINES: fs_actions_default.editLines,
    INSERT_LINES: fs_actions_default.insertLines,
    REPLACE_IN_FILE: fs_actions_default.replaceInFile,
    SHELL: executeShellCommand,
    APPLY_PATCH: fs_actions_default.applyPatchToFile,
    UPDATE: fs_actions_default.updateFile
  };
  return toolMap[toolName];
}
async function sendPromptToAI(userMessage, history = [], onToolCall = null, onPermissionRequest = null, sessionPermissions = null, signal = null) {
  try {
    if (!api_session_default.isConfigured()) {
      throw new Error(
        "IA n\xE3o configurada. Por favor, configure o provider nas configura\xE7\xF5es."
      );
    }
    let conversationHistory = [...history];
    if (conversationHistory.length === 0 || conversationHistory[0].role !== "system") {
      conversationHistory = [
        { role: "system", content: getSystemPrompt() },
        ...conversationHistory
      ];
    }
    conversationHistory.push({ role: "user", content: userMessage });
    const isEconomy = api_session_default.isEconomyMode();
    const availableTools = getTools(isEconomy);
    let iterationCount = 0;
    while (iterationCount < MAX_ITERATIONS) {
      if (signal && signal.aborted) {
        throw new Error("Opera\xE7\xE3o cancelada pelo usu\xE1rio.");
      }
      iterationCount++;
      const aiMessage = await ai_service_default.sendPrompt(conversationHistory, availableTools);
      conversationHistory.push(aiMessage);
      if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
        return {
          content: aiMessage.content,
          history: conversationHistory
        };
      }
      for (const toolCall of aiMessage.tool_calls) {
        if (signal && signal.aborted) {
          throw new Error("Opera\xE7\xE3o cancelada pelo usu\xE1rio.");
        }
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        if (CRITICAL_ACTIONS.includes(toolName)) {
          const action = TOOL_TO_ACTION_MAP[toolName];
          const hasPermission = sessionPermissions && sessionPermissions[action] === true;
          if (!hasPermission && onPermissionRequest) {
            const argDetails = toolArgs.filePath || toolArgs.sourcePath || toolArgs.command || "a\xE7\xE3o";
            const permissionResult = await onPermissionRequest(action, argDetails);
            if (!permissionResult || !permissionResult.allowed) {
              conversationHistory.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolName,
                content: JSON.stringify({
                  success: false,
                  content: `[PERMISS\xC3O NEGADA] O usu\xE1rio negou a permiss\xE3o para executar: ${toolName} ${argDetails}`
                })
              });
              continue;
            }
          }
        }
        const toolFunction = getToolImplementation(toolName);
        if (!toolFunction) {
          conversationHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify({
              success: false,
              content: `Ferramenta '${toolName}' n\xE3o encontrada.`
            })
          });
          continue;
        }
        let toolResult;
        try {
          const args = Object.values(toolArgs);
          toolResult = await toolFunction(...args);
        } catch (error) {
          toolResult = {
            success: false,
            content: `Erro ao executar ferramenta: ${error.message}`
          };
        }
        conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(toolResult)
        });
        if (onToolCall) {
          onToolCall({
            name: toolName,
            arguments: toolArgs,
            id: toolCall.id,
            result: toolResult,
            status: toolResult.success ? "success" : "error"
          });
        }
      }
    }
    return {
      content: "Limite de itera\xE7\xF5es atingido. A IA n\xE3o conseguiu completar a tarefa.",
      history: conversationHistory
    };
  } catch (error) {
    throw error;
  }
}

// src/TUI/hooks/useAI.js
var useAI = () => {
  const {
    conversationHistory,
    addMessage,
    setIsLoading,
    setError,
    sessionPermissions
  } = useAppState();
  const sendPrompt2 = useCallback3(
    async (message, onToolCall = null, onPermissionRequest = null, signal = null) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sendPromptToAI(
          message,
          conversationHistory,
          onToolCall,
          onPermissionRequest,
          sessionPermissions,
          signal
        );
        if (response && response.content) {
          addMessage({
            role: "assistant",
            content: response.content
          });
        }
        return response;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationHistory, addMessage, setIsLoading, setError, sessionPermissions]
  );
  return {
    sendPrompt: sendPrompt2,
    conversationHistory
  };
};

// src/TUI/components/MessageBubble.js
import React6 from "react";
import { Box as Box5, Text as Text4 } from "ink";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var MessageBubble = ({ role, content }) => {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const isSystem = role === "system";
  const colors2 = {
    user: "green",
    assistant: "cyan",
    system: "yellow"
  };
  const labels = {
    user: "Voc\xEA",
    assistant: "IA",
    system: "Sistema"
  };
  const borderColors = {
    user: "green",
    assistant: "cyan",
    system: "yellow"
  };
  const displayContent = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  return /* @__PURE__ */ jsxs5(
    Box5,
    {
      flexDirection: "column",
      marginY: 1,
      borderStyle: "round",
      borderColor: borderColors[role],
      paddingX: 1,
      children: [
        /* @__PURE__ */ jsx6(Box5, { marginBottom: 1, children: /* @__PURE__ */ jsx6(Text4, { bold: true, color: colors2[role], children: labels[role] }) }),
        /* @__PURE__ */ jsx6(Box5, { children: /* @__PURE__ */ jsx6(Text4, { children: displayContent }) })
      ]
    }
  );
};
var MessageBubble_default = React6.memo(MessageBubble);

// src/TUI/components/ToolCallDisplay.js
import React7 from "react";
import { Box as Box6, Text as Text5 } from "ink";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var ToolCallDisplay = ({ name, arguments: args, result, status = "pending" }) => {
  const statusColors = {
    pending: "yellow",
    executing: "blue",
    success: "green",
    error: "red"
  };
  const statusIcons = {
    pending: "\u23F3",
    executing: "\u2699\uFE0F",
    success: "\u2713",
    error: "\u2717"
  };
  return /* @__PURE__ */ jsxs6(
    Box6,
    {
      flexDirection: "column",
      marginY: 1,
      borderStyle: "single",
      borderColor: statusColors[status],
      paddingX: 1,
      children: [
        /* @__PURE__ */ jsx7(Box6, { marginBottom: 1, children: /* @__PURE__ */ jsxs6(Text5, { color: statusColors[status], bold: true, children: [
          statusIcons[status],
          " Ferramenta: ",
          name
        ] }) }),
        args && Object.keys(args).length > 0 && /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", marginBottom: 1, children: [
          /* @__PURE__ */ jsx7(Text5, { dimColor: true, children: "Argumentos:" }),
          Object.entries(args).map(([key, value]) => /* @__PURE__ */ jsx7(Box6, { marginLeft: 2, children: /* @__PURE__ */ jsxs6(Text5, { color: "gray", children: [
            key,
            ": ",
            JSON.stringify(value)
          ] }) }, key))
        ] }),
        result && /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", children: [
          /* @__PURE__ */ jsx7(Text5, { dimColor: true, children: "Resultado:" }),
          /* @__PURE__ */ jsx7(Box6, { marginLeft: 2, children: /* @__PURE__ */ jsx7(Text5, { children: typeof result === "string" ? result : JSON.stringify(result, null, 2) }) })
        ] })
      ]
    }
  );
};
var ToolCallDisplay_default = React7.memo(ToolCallDisplay);

// src/TUI/components/LoadingSpinner.js
import React8 from "react";
import { Box as Box7, Text as Text6 } from "ink";
import Spinner from "ink-spinner";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var LoadingSpinner = ({ message = "Carregando..." }) => {
  return /* @__PURE__ */ jsxs7(Box7, { children: [
    /* @__PURE__ */ jsx8(Text6, { color: "cyan", children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
    /* @__PURE__ */ jsxs7(Text6, { children: [
      " ",
      message
    ] })
  ] });
};
var LoadingSpinner_default = LoadingSpinner;

// src/TUI/components/PermissionDialog.js
import React9, { useState as useState4 } from "react";
import { Box as Box8, Text as Text7, useInput as useInput2 } from "ink";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
var PermissionDialog = ({ action, details, onAllow, onAllowSession, onDeny }) => {
  const [selectedIndex, setSelectedIndex] = useState4(0);
  const options = [
    { label: "Permitir uma vez", value: "once", color: "yellow" },
    { label: "Permitir para esta sess\xE3o", value: "session", color: "green" },
    { label: "Negar", value: "deny", color: "red" }
  ];
  useInput2((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(options.length - 1, prev + 1));
    }
    if (key.return) {
      const selected = options[selectedIndex].value;
      if (selected === "once") {
        onAllow();
      } else if (selected === "session") {
        onAllowSession();
      } else if (selected === "deny") {
        onDeny();
      }
    }
    if (input === "1") onAllow();
    if (input === "2") onAllowSession();
    if (input === "3") onDeny();
  });
  return /* @__PURE__ */ jsxs8(
    Box8,
    {
      flexDirection: "column",
      borderStyle: "double",
      borderColor: "red",
      paddingX: 2,
      paddingY: 1,
      children: [
        /* @__PURE__ */ jsx9(Box8, { marginBottom: 1, children: /* @__PURE__ */ jsx9(Text7, { bold: true, color: "red", children: "\u26A0\uFE0F  PERMISS\xC3O NECESS\xC1RIA" }) }),
        /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", marginBottom: 1, children: [
          /* @__PURE__ */ jsxs8(Text7, { children: [
            /* @__PURE__ */ jsx9(Text7, { bold: true, color: "yellow", children: "A\xE7\xE3o:" }),
            " ",
            action
          ] }),
          details && /* @__PURE__ */ jsx9(Box8, { flexDirection: "column", marginLeft: 2, marginTop: 1, children: Object.entries(details).map(([key, value]) => /* @__PURE__ */ jsxs8(Text7, { children: [
            /* @__PURE__ */ jsxs8(Text7, { color: "cyan", children: [
              key,
              ":"
            ] }),
            " ",
            JSON.stringify(value).substring(0, 100),
            JSON.stringify(value).length > 100 && "..."
          ] }, key)) })
        ] }),
        /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", children: [
          /* @__PURE__ */ jsx9(Text7, { dimColor: true, marginBottom: 1, children: "Selecione uma op\xE7\xE3o:" }),
          options.map((option, index) => /* @__PURE__ */ jsx9(Box8, { children: /* @__PURE__ */ jsxs8(Text7, { color: selectedIndex === index ? option.color : "gray", bold: selectedIndex === index, children: [
            selectedIndex === index ? "\u25B6 " : "  ",
            "[",
            index + 1,
            "] ",
            option.label
          ] }) }, `perm-${option.value}`))
        ] }),
        /* @__PURE__ */ jsx9(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx9(Text7, { dimColor: true, children: "\u2191\u2193: Navegar | Enter ou 1/2/3: Selecionar" }) })
      ]
    }
  );
};
var PermissionDialog_default = PermissionDialog;

// src/TUI/pages/ChatPage.js
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var ChatPage = () => {
  const {
    conversationHistory,
    addMessage,
    isLoading,
    config,
    updatePermission
  } = useAppState();
  const { goBack } = useRouter();
  const { sendPrompt: sendPrompt2 } = useAI();
  const [inputValue, setInputValue] = useState5("");
  const [currentToolCalls, setCurrentToolCalls] = useState5([]);
  const [pendingPermission, setPendingPermission] = useState5(null);
  const abortControllerRef = useRef(null);
  const canceledRef = useRef(false);
  const displayMessages = useMemo2(
    () => conversationHistory.filter((msg) => msg.role !== "tool"),
    [conversationHistory]
  );
  const renderedToolCalls = useMemo2(
    () => currentToolCalls.map((tool, index) => ({
      ...tool,
      key: tool.id || `tool-${index}-${tool.name}`
    })),
    [currentToolCalls]
  );
  useInput3((input, key) => {
    if (key.escape) {
      if (isLoading && abortControllerRef.current && !canceledRef.current) {
        canceledRef.current = true;
        abortControllerRef.current.abort();
        addMessage({
          role: "system",
          content: "\u26A0\uFE0F A\xE7\xE3o da IA cancelada pelo usu\xE1rio."
        });
      } else if (!pendingPermission && !isLoading) {
        goBack();
      }
    }
  }, [isLoading, pendingPermission, addMessage, goBack]);
  const handleToolCall = useCallback4((toolCall) => {
    setCurrentToolCalls((prev) => [
      ...prev,
      {
        ...toolCall,
        // Garantir que o status não seja 'executing' (que vinha da lógica antiga)
        status: toolCall.status || (toolCall.result?.success ? "success" : "error")
      }
    ]);
  }, []);
  const handlePermissionRequest = useCallback4((action, details) => {
    return new Promise((resolve) => {
      setPendingPermission({
        action,
        details,
        resolve
      });
    });
  }, []);
  const handlePermissionAllow = useCallback4(() => {
    if (pendingPermission) {
      pendingPermission.resolve({ allowed: true, session: false });
      setPendingPermission(null);
    }
  }, [pendingPermission]);
  const handlePermissionAllowSession = useCallback4(() => {
    if (pendingPermission) {
      const { action } = pendingPermission;
      updatePermission(action, true);
      pendingPermission.resolve({ allowed: true, session: true });
      setPendingPermission(null);
    }
  }, [pendingPermission, updatePermission]);
  const handlePermissionDeny = useCallback4(() => {
    if (pendingPermission) {
      pendingPermission.resolve({ allowed: false, session: false });
      setPendingPermission(null);
    }
  }, [pendingPermission]);
  const handleSubmit = useCallback4(async () => {
    if (!inputValue.trim()) return;
    if (!config || !config.provider || !config.apiKey) {
      addMessage({
        role: "system",
        content: "Erro: IA n\xE3o configurada. Por favor, configure nas Configura\xE7\xF5es primeiro."
      });
      return;
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const userMessage = {
      role: "user",
      content: inputValue
    };
    addMessage(userMessage);
    setInputValue("");
    setCurrentToolCalls([]);
    canceledRef.current = false;
    try {
      await sendPrompt2(inputValue, handleToolCall, handlePermissionRequest, abortController.signal);
    } catch (err) {
      if (err.name !== "AbortError") {
        addMessage({
          role: "system",
          content: `Erro: ${err.message}`
        });
      }
    } finally {
      abortControllerRef.current = null;
      setCurrentToolCalls([]);
      canceledRef.current = false;
    }
  }, [inputValue, config, addMessage, sendPrompt2, handleToolCall, handlePermissionRequest]);
  const header = useMemo2(() => /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx10(Text8, { bold: true, color: "cyan", children: "\u{1F4AC} Chat com IA" }),
    /* @__PURE__ */ jsxs9(Text8, { dimColor: true, children: [
      "Provider: ",
      config?.provider || "n\xE3o configurado",
      " | Model: ",
      config?.model || "n\xE3o configurado"
    ] })
  ] }), [config?.provider, config?.model]);
  return /* @__PURE__ */ jsx10(MainLayout, { header, children: /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", height: "100%", children: [
    pendingPermission && /* @__PURE__ */ jsx10(Box9, { position: "absolute", width: "100%", justifyContent: "center", marginTop: 5, children: /* @__PURE__ */ jsx10(
      PermissionDialog_default,
      {
        action: pendingPermission.action,
        details: pendingPermission.details,
        onAllow: handlePermissionAllow,
        onAllowSession: handlePermissionAllowSession,
        onDeny: handlePermissionDeny
      }
    ) }),
    /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", flexGrow: 1, overflowY: "auto", children: [
      displayMessages.length === 0 ? /* @__PURE__ */ jsx10(Box9, { marginY: 2, children: /* @__PURE__ */ jsx10(Text8, { dimColor: true, children: "Nenhuma mensagem ainda. Digite algo para come\xE7ar..." }) }) : displayMessages.map((msg, index) => /* @__PURE__ */ jsx10(MessageBubble_default, { role: msg.role, content: msg.content }, msg.id || index)),
      renderedToolCalls.map((tool) => /* @__PURE__ */ jsx10(
        ToolCallDisplay_default,
        {
          name: tool.name,
          arguments: tool.arguments,
          result: tool.result,
          status: tool.status
        },
        tool.key
      )),
      isLoading && /* @__PURE__ */ jsx10(Box9, { marginY: 1, children: /* @__PURE__ */ jsx10(LoadingSpinner_default, { message: "Aguardando resposta da IA..." }) })
    ] }),
    /* @__PURE__ */ jsx10(
      Box9,
      {
        flexDirection: "column",
        marginTop: 1,
        borderStyle: "single",
        borderColor: "green",
        paddingX: 1,
        children: /* @__PURE__ */ jsxs9(Box9, { children: [
          /* @__PURE__ */ jsx10(Text8, { color: "green", children: "> " }),
          /* @__PURE__ */ jsx10(
            TextInput,
            {
              value: inputValue,
              onChange: setInputValue,
              onSubmit: handleSubmit,
              placeholder: "Digite sua mensagem...",
              focus: !isLoading && !pendingPermission
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsx10(
      StatusBar_default,
      {
        leftContent: `Chat | Mensagens: ${conversationHistory.length}`,
        rightContent: isLoading ? "ESC: Cancelar IA | Ctrl+C: Sair" : "Enter: Enviar | ESC: Voltar | Ctrl+C: Sair"
      }
    )
  ] }) });
};
var ChatPage_default = ChatPage;

// src/TUI/pages/ConfigPage.js
import React13, { useState as useState6, useEffect as useEffect2 } from "react";
import { Box as Box12, Text as Text11, useInput as useInput4 } from "ink";

// src/TUI/components/InputField.js
import React11 from "react";
import { Box as Box10, Text as Text9 } from "ink";
import TextInput2 from "ink-text-input";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";

// src/TUI/components/PasswordInput.js
import React12 from "react";
import { Box as Box11, Text as Text10 } from "ink";
import TextInput3 from "ink-text-input";
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
var PasswordInput = ({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  focus = true
}) => {
  return /* @__PURE__ */ jsxs11(Box11, { flexDirection: "column", marginY: 1, children: [
    label && /* @__PURE__ */ jsx12(Box11, { marginBottom: 1, children: /* @__PURE__ */ jsx12(Text10, { bold: true, color: "cyan", children: label }) }),
    /* @__PURE__ */ jsxs11(Box11, { children: [
      /* @__PURE__ */ jsx12(Text10, { color: "gray", children: "> " }),
      /* @__PURE__ */ jsx12(
        TextInput3,
        {
          value,
          onChange,
          onSubmit,
          placeholder,
          focus,
          mask: "*"
        }
      )
    ] })
  ] });
};
var PasswordInput_default = PasswordInput;

// src/agent/api/ai/gemini-client.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
var GeminiClient = class _GeminiClient {
  static instance;
  #model;
  constructor() {
    if (_GeminiClient.instance) {
      return _GeminiClient.instance;
    }
    _GeminiClient.instance = this;
  }
  static getInstance() {
    if (!_GeminiClient.instance) {
      _GeminiClient.instance = new _GeminiClient();
    }
    return _GeminiClient.instance;
  }
  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error("Credenciais do Gemini (apiKey) s\xE3o necess\xE1rias.");
    }
    const genAI = new GoogleGenerativeAI(credentials.apiKey);
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
    ];
    const modelName = credentials.model || DEFAULT_GEMINI_MODEL2;
    this.#model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings
    });
    logger_default.info(language_service_default.get("client.init.gemini", modelName));
  }
  formatToolsForGemini(tools) {
    return [{
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema
      }))
    }];
  }
  formatHistoryForGemini(history) {
    const contents = [];
    let systemInstruction = null;
    for (const msg of history) {
      if (msg.role === "system") {
        systemInstruction = msg.content;
        continue;
      }
      const role = msg.role === "assistant" ? "model" : msg.role;
      if (msg.tool_calls) {
        contents.push({
          role: "model",
          parts: msg.tool_calls.map((call) => ({
            functionCall: {
              name: call.function.name,
              args: JSON.parse(call.function.arguments)
            }
          }))
        });
      } else if (msg.role === "tool") {
        contents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: msg.name,
              response: {
                content: msg.content
              }
            }
          }]
        });
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }
    const geminiHistory = [];
    let systemPrompt = null;
    for (const msg of history) {
      if (msg.role === "system") {
        systemPrompt = { parts: [{ text: msg.content }] };
        continue;
      }
      const role = msg.role === "assistant" ? "model" : msg.role;
      if (msg.tool_calls) {
        geminiHistory.push({
          role: "model",
          parts: msg.tool_calls.map((call) => ({
            functionCall: {
              name: call.function.name,
              args: JSON.parse(call.function.arguments)
            }
          }))
        });
      } else if (msg.role === "tool") {
        geminiHistory.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: msg.name,
              response: { content: msg.content }
            }
          }]
        });
      } else {
        geminiHistory.push({ role, parts: [{ text: msg.content }] });
      }
    }
    return { geminiHistory, systemPrompt };
  }
  normalizeGeminiResponse(response) {
    const message = {
      role: "assistant",
      content: null
    };
    if (!response.candidates || response.candidates.length === 0) {
      logger_default.warn(language_service_default.get("client.gemini.emptyWarn"), response.promptFeedback);
      message.content = `[RESPOSTA VAZIA DO GEMINI] Causa: ${response.promptFeedback?.blockReason || "desconhecida"}`;
      return message;
    }
    const candidate = response.candidates[0];
    if (candidate.content && candidate.content.parts.some((part) => part.functionCall)) {
      message.tool_calls = [];
      for (const part of candidate.content.parts) {
        if (part.functionCall) {
          message.tool_calls.push({
            id: part.functionCall.name + "_" + Date.now(),
            type: "function",
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args || {})
            }
          });
        }
      }
    } else if (candidate.content && candidate.content.parts.some((part) => part.text)) {
      message.content = candidate.content.parts.filter((part) => part.text).map((part) => part.text).join("\n");
    } else {
      message.content = `[RESPOSTA VAZIA DO GEMINI] Stop reason: ${candidate.finishReason}`;
      logger_default.warn(language_service_default.get("client.gemini.contentWarn"), candidate);
    }
    return message;
  }
  async sendMessage(history, tools) {
    if (!this.#model) {
      throw new Error("Cliente Gemini n\xE3o inicializado. Chame o m\xE9todo initialize() primeiro.");
    }
    const formattedTools = this.formatToolsForGemini(tools);
    const { geminiHistory, systemPrompt } = this.formatHistoryForGemini(history);
    const request = {
      contents: geminiHistory,
      tools: formattedTools
    };
    if (systemPrompt) {
      request.systemInstruction = systemPrompt;
    }
    const result = await this.#model.generateContent(request);
    const response = result.response;
    return this.normalizeGeminiResponse(response);
  }
};
var gemini_client_default = GeminiClient.getInstance();

// src/agent/api/ai/open-ai-client.js
import OpenAI from "openai";
var OpenAiClient = class _OpenAiClient {
  static instance;
  #openai;
  #model;
  constructor() {
    if (_OpenAiClient.instance) {
      return _OpenAiClient.instance;
    }
    _OpenAiClient.instance = this;
  }
  static getInstance() {
    if (!_OpenAiClient.instance) {
      _OpenAiClient.instance = new _OpenAiClient();
    }
    return _OpenAiClient.instance;
  }
  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error("Credenciais do OpenAI (apiKey) s\xE3o necess\xE1rias.");
    }
    this.#openai = new OpenAI({ apiKey: credentials.apiKey });
    this.#model = credentials.model || DEFAULT_OPENAI_MODEL2;
    logger_default.info(language_service_default.get("client.init.openai", this.#model));
  }
  async sendMessage(history, tools) {
    if (!this.#openai) {
      throw new Error("Cliente OpenAI n\xE3o inicializado. Chame o m\xE9todo initialize() primeiro.");
    }
    const formattedTools = tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema
      }
    }));
    const params = {
      messages: history,
      model: this.#model,
      tools: formattedTools,
      tool_choice: "auto"
    };
    const completion = await this.#openai.chat.completions.create(params);
    return completion.choices[0].message;
  }
};
var open_ai_client_default = OpenAiClient.getInstance();

// src/agent/api/ai/claude-client.js
import Anthropic from "@anthropic-ai/sdk";
var ClaudeClient = class _ClaudeClient {
  static instance;
  #anthropic;
  #model;
  constructor() {
    if (_ClaudeClient.instance) {
      return _ClaudeClient.instance;
    }
    _ClaudeClient.instance = this;
  }
  static getInstance() {
    if (!_ClaudeClient.instance) {
      _ClaudeClient.instance = new _ClaudeClient();
    }
    return _ClaudeClient.instance;
  }
  initialize(credentials) {
    if (!credentials || !credentials.apiKey) {
      throw new Error("Credenciais do Anthropic (apiKey) s\xE3o necess\xE1rias.");
    }
    this.#anthropic = new Anthropic({ apiKey: credentials.apiKey });
    this.#model = credentials.model || DEFAULT_CLAUDE_MODEL2;
    logger_default.info(language_service_default.get("client.init.claude", this.#model));
  }
  normalizeClaudeResponse(response) {
    const message = {
      role: "assistant",
      content: null
    };
    if (response.stop_reason === "tool_use") {
      message.tool_calls = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          message.tool_calls.push({
            id: block.id,
            type: "function",
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input)
            }
          });
        }
      }
    } else {
      const textBlocks = response.content.filter((block) => block.type === "text").map((block) => block.text);
      message.content = textBlocks.join("\n");
    }
    return message;
  }
  async sendMessage(history, tools) {
    if (!this.#anthropic) {
      throw new Error("Cliente Anthropic n\xE3o inicializado. Chame o m\xE9todo initialize() primeiro.");
    }
    let systemMessage = "";
    const messages = [];
    for (const msg of history) {
      if (msg.role === "system") {
        systemMessage += (systemMessage ? "\n\n" : "") + msg.content;
      } else {
        messages.push(msg);
      }
    }
    const requestParams = {
      model: this.#model,
      messages,
      max_tokens: MAX_TOKENS,
      tools
    };
    if (systemMessage) {
      requestParams.system = systemMessage;
    }
    const response = await this.#anthropic.messages.create(requestParams);
    return this.normalizeClaudeResponse(response);
  }
};
var claude_client_default = ClaudeClient.getInstance();

// src/init-client.js
var isTUIMode2 = () => process.env.CLIA_TUI_MODE === "true";
function initializeAIClient(provider, credentials) {
  if (!provider || !credentials || !credentials.apiKey) {
    if (!isTUIMode2()) {
    }
    return false;
  }
  try {
    if (provider === "openai") {
      open_ai_client_default.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode2()) {
      }
    } else if (provider === "gemini") {
      gemini_client_default.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode2()) {
      }
    } else if (provider === "claude") {
      claude_client_default.initialize({ apiKey: credentials.apiKey, model: credentials.model });
      if (!isTUIMode2()) {
      }
    }
    return true;
  } catch (error) {
    if (!isTUIMode2()) {
    }
    return false;
  }
}

// src/TUI/pages/ConfigPage.js
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
var { writeConfig: writeConfig2 } = config_service_default;
var ConfigPage = () => {
  const { config, updateConfig, loadConfig } = useAppState();
  const { goBack } = useRouter();
  const [step, setStep] = useState6("menu");
  const [tempConfig, setTempConfig] = useState6(config || {});
  const [inputValue, setInputValue] = useState6("");
  useEffect2(() => {
    if (!config) {
      loadConfig();
    }
  }, [config, loadConfig]);
  useInput4((input, key) => {
    if (key.escape && step === "menu") {
      goBack();
    }
  });
  const handleLanguageSelect = (value) => {
    setTempConfig({ ...tempConfig, language: value });
    api_session_default.setLanguage(value);
    setStep("menu");
  };
  const handleOSSelect = (value) => {
    setTempConfig({ ...tempConfig, os: value });
    api_session_default.setOS(value);
    setStep("menu");
  };
  const handleEconomySelect = (value) => {
    setTempConfig({ ...tempConfig, economyMode: value === "on" });
    api_session_default.setEconomyMode(value === "on");
    setStep("menu");
  };
  const handleProviderSelect = (value) => {
    setTempConfig({ ...tempConfig, provider: value });
    setStep("model");
  };
  const handleModelSelect = (value) => {
    setTempConfig({ ...tempConfig, model: value });
    setStep("apiKey");
  };
  const handleSave = async () => {
    try {
      const configToSave = {
        language: tempConfig.language,
        os: tempConfig.os,
        economyMode: tempConfig.economyMode,
        provider: tempConfig.provider,
        model: tempConfig.model,
        apiKey: tempConfig.apiKey,
        credentials: tempConfig.credentials || {}
      };
      if (tempConfig.provider && tempConfig.apiKey && tempConfig.model) {
        configToSave.credentials[tempConfig.provider] = {
          apiKey: tempConfig.apiKey,
          model: tempConfig.model
        };
      }
      await writeConfig2(configToSave);
      updateConfig(configToSave);
      if (tempConfig.provider && tempConfig.apiKey && tempConfig.model) {
        api_session_default.configure(tempConfig.provider, {
          apiKey: tempConfig.apiKey,
          model: tempConfig.model
        });
        initializeAIClient(tempConfig.provider, {
          apiKey: tempConfig.apiKey,
          model: tempConfig.model
        });
      }
      goBack();
    } catch (err) {
    }
  };
  const header = /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx13(Text11, { bold: true, color: "yellow", children: "\u2699\uFE0F  Configura\xE7\xF5es" }),
    /* @__PURE__ */ jsx13(Text11, { dimColor: true, children: "Configure idioma, provider de IA e outras op\xE7\xF5es" })
  ] });
  if (step === "menu") {
    const menuOptions = [
      { label: `Idioma: ${tempConfig.language || "n\xE3o configurado"}`, value: "language" },
      {
        label: `Sistema Operacional: ${tempConfig.os || "n\xE3o configurado"}`,
        value: "os"
      },
      {
        label: `Modo Economia: ${tempConfig.economyMode ? "ativado" : "desativado"}`,
        value: "economy"
      },
      {
        label: `Provider de IA: ${tempConfig.provider || "n\xE3o configurado"}`,
        value: "provider"
      },
      { label: "Salvar e Voltar", value: "save" },
      { label: "Voltar sem Salvar", value: "back" }
    ];
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: "Selecione uma op\xE7\xE3o:",
          options: menuOptions,
          onSelect: (value) => {
            if (value === "save") {
              handleSave();
            } else if (value === "back") {
              goBack();
            } else {
              setStep(value);
            }
          }
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar | ESC: Voltar" })
    ] }) });
  }
  if (step === "language") {
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: "Selecione o idioma:",
          options: [
            { label: "English (en-US)", value: "en-US" },
            { label: "Portugu\xEAs Brasil (pt-BR)", value: "pt-BR" }
          ],
          onSelect: handleLanguageSelect
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar" })
    ] }) });
  }
  if (step === "os") {
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: "Selecione o sistema operacional:",
          options: [
            { label: "Linux", value: "linux" },
            { label: "Windows", value: "windows" }
          ],
          onSelect: handleOSSelect
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar" })
    ] }) });
  }
  if (step === "economy") {
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: "Modo Economia (reduz consumo de tokens):",
          options: [
            { label: "Ativado", value: "on" },
            { label: "Desativado", value: "off" }
          ],
          onSelect: handleEconomySelect
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar" })
    ] }) });
  }
  if (step === "provider") {
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: "Selecione o provider de IA:",
          options: [
            { label: "OpenAI (GPT)", value: "openai" },
            { label: "Google Gemini", value: "gemini" },
            { label: "Anthropic Claude", value: "claude" }
          ],
          onSelect: handleProviderSelect
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar" })
    ] }) });
  }
  if (step === "model") {
    let modelOptions = [];
    if (tempConfig.provider === "openai") {
      modelOptions = [
        { label: "GPT-4o", value: "gpt-4o" },
        { label: "GPT-4o Mini", value: "gpt-4o-mini" },
        { label: "GPT-4 Turbo", value: "gpt-4-turbo" }
      ];
    } else if (tempConfig.provider === "gemini") {
      modelOptions = [
        { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
        { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" }
      ];
    } else if (tempConfig.provider === "claude") {
      modelOptions = [
        { label: "Claude Sonnet 4.5", value: "claude-sonnet-4.5-20250929" },
        { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
        { label: "Claude Haiku 4.5", value: "claude-4.5-haiku-20250815" }
      ];
    }
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(
        SelectInput_default,
        {
          label: `Selecione o modelo (${tempConfig.provider}):`,
          options: modelOptions,
          onSelect: handleModelSelect
        }
      ),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "\u2191\u2193: Navegar | Enter: Selecionar" })
    ] }) });
  }
  if (step === "apiKey") {
    const handleApiKeySubmit = () => {
      if (inputValue.trim()) {
        setTempConfig({ ...tempConfig, apiKey: inputValue });
        setInputValue("");
        setStep("menu");
      }
    };
    return /* @__PURE__ */ jsx13(MainLayout, { header, children: /* @__PURE__ */ jsxs12(Box12, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx13(Box12, { marginBottom: 1, children: /* @__PURE__ */ jsxs12(Text11, { children: [
        "Digite a API Key para ",
        /* @__PURE__ */ jsx13(Text11, { bold: true, color: "cyan", children: tempConfig.provider }),
        ":"
      ] }) }),
      /* @__PURE__ */ jsx13(
        PasswordInput_default,
        {
          value: inputValue,
          onChange: setInputValue,
          onSubmit: handleApiKeySubmit,
          placeholder: "sk-..."
        }
      ),
      /* @__PURE__ */ jsx13(Box12, { marginTop: 1, children: /* @__PURE__ */ jsx13(Text11, { dimColor: true, children: "Pressione Enter para confirmar" }) }),
      inputValue && /* @__PURE__ */ jsx13(Box12, { marginTop: 1, children: /* @__PURE__ */ jsx13(Text11, { color: "green", children: "\u2713 Chave digitada, pressione Enter para continuar" }) }),
      /* @__PURE__ */ jsx13(StatusBar_default, { rightContent: "Enter: Confirmar | ESC: Cancelar" })
    ] }) });
  }
  return null;
};
var ConfigPage_default = ConfigPage;

// src/TUI/pages/ScrapPage.js
import React15, { useState as useState8 } from "react";
import { Box as Box14, Text as Text13, useInput as useInput6 } from "ink";

// src/TUI/components/ConfirmDialog.js
import React14, { useState as useState7 } from "react";
import { Box as Box13, Text as Text12, useInput as useInput5 } from "ink";
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
var ConfirmDialog = ({ message, onConfirm, onCancel, defaultYes = true }) => {
  const [selected, setSelected] = useState7(defaultYes ? "yes" : "no");
  useInput5((input, key) => {
    if (key.leftArrow || key.rightArrow) {
      setSelected((prev) => prev === "yes" ? "no" : "yes");
    }
    if (key.return) {
      if (selected === "yes") {
        onConfirm();
      } else {
        onCancel();
      }
    }
    if (input === "y" || input === "Y") {
      onConfirm();
    }
    if (input === "n" || input === "N") {
      onCancel();
    }
  });
  return /* @__PURE__ */ jsxs13(
    Box13,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: "yellow",
      paddingX: 2,
      paddingY: 1,
      children: [
        /* @__PURE__ */ jsx14(Box13, { marginBottom: 1, children: /* @__PURE__ */ jsx14(Text12, { children: message }) }),
        /* @__PURE__ */ jsxs13(Box13, { children: [
          /* @__PURE__ */ jsxs13(
            Text12,
            {
              color: selected === "yes" ? "green" : "gray",
              bold: selected === "yes",
              children: [
                selected === "yes" ? "\u25B6 " : "  ",
                "Yes (Y)"
              ]
            }
          ),
          /* @__PURE__ */ jsx14(Text12, { children: "  " }),
          /* @__PURE__ */ jsxs13(
            Text12,
            {
              color: selected === "no" ? "red" : "gray",
              bold: selected === "no",
              children: [
                selected === "no" ? "\u25B6 " : "  ",
                "No (N)"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx14(Box13, { marginTop: 1, children: /* @__PURE__ */ jsx14(Text12, { dimColor: true, children: "\u2190\u2192 para navegar | Enter, Y ou N para confirmar" }) })
      ]
    }
  );
};
var ConfirmDialog_default = ConfirmDialog;

// src/utils/node-scrapper.js
import fs5 from "fs/promises";
import path4 from "path";
import ignore2 from "ignore";
import { DEFAULT_IGNORE_RULES as DEFAULT_IGNORE_RULES2, GITIGNORE_FILE as GITIGNORE_FILE2, SCRAP_FILE } from "../config/constants.js";
async function loadGitIgnore2(projectRoot, outputFileName) {
  const ig = ignore2();
  ig.add(DEFAULT_IGNORE_RULES2);
  ig.add(outputFileName);
  try {
    const gitignorePath = path4.join(projectRoot, GITIGNORE_FILE2);
    const gitignoreContent = await fs5.readFile(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
    logger_default.info(".gitignore carregado.");
  } catch (error) {
    logger_default.warn("Nenhum .gitignore encontrado. Usando apenas ignores padr\xE3o.");
  }
  return ig;
}
async function mapDirectory(dirPath, rootPath, ig) {
  const tree = {};
  try {
    const entries = await fs5.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path4.join(dirPath, entry.name);
      const relativePath = path4.relative(rootPath, fullPath);
      if (relativePath === "") {
        continue;
      }
      const pathToCheck = entry.isDirectory() ? relativePath + "/" : relativePath;
      if (ig.ignores(pathToCheck)) {
        continue;
      }
      if (entry.isDirectory()) {
        const subTree = await mapDirectory(fullPath, rootPath, ig);
        Object.assign(tree, subTree);
      } else {
        try {
          const content = await fs5.readFile(fullPath, "utf-8");
          tree[relativePath] = content;
        } catch (readError) {
          logger_default.error(`Erro ao ler o arquivo ${relativePath}:`, readError.message);
          tree[relativePath] = `ERRO_AO_LER_ARQUIVO: ${readError.message}`;
        }
      }
    }
  } catch (dirError) {
    logger_default.error(`Erro ao ler o diret\xF3rio ${dirPath}:`, dirError.message);
  }
  return tree;
}
async function scrapProject(outputPath = process.cwd()) {
  logger_default.info("Iniciando o scraping da estrutura do projeto...");
  const projectRoot = process.cwd();
  const outputFileName = SCRAP_FILE;
  const fullOutputPath = path4.join(outputPath, outputFileName);
  try {
    const ig = await loadGitIgnore2(projectRoot, outputFileName);
    logger_default.info("Mapeando diret\xF3rios...");
    const projectTree = await mapDirectory(projectRoot, projectRoot, ig);
    logger_default.info("Escrevendo arquivo JSON...");
    const jsonContent = JSON.stringify(projectTree, null, 2);
    await fs5.writeFile(fullOutputPath, jsonContent, "utf-8");
    logger_default.success(`Scraping conclu\xEDdo! A \xE1rvore do projeto foi salva em: ${fullOutputPath}`);
    return fullOutputPath;
  } catch (error) {
    logger_default.error("Ocorreu um erro durante o scraping:", error);
    throw error;
  }
}
var node_scrapper_default = scrapProject;

// src/TUI/pages/ScrapPage.js
import { jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
var scrapeProjectTree = node_scrapper_default;
var ScrapPage = () => {
  const { goBack } = useRouter();
  const [isScanning, setIsScanning] = useState8(false);
  const [stats, setStats] = useState8(null);
  const [error, setError] = useState8(null);
  const [showConfirm, setShowConfirm] = useState8(true);
  useInput6((input, key) => {
    if (key.escape && !isScanning) {
      goBack();
    }
  });
  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsScanning(true);
    setError(null);
    try {
      await scrapeProjectTree();
      setStats({
        filesRead: 42,
        filesIgnored: 158,
        totalSize: "2.3 MB"
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };
  const handleCancel = () => {
    goBack();
  };
  const header = /* @__PURE__ */ jsxs14(Box14, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx15(Text13, { bold: true, color: "cyan", children: "\u{1F4C1} Gerar \xC1rvore do Projeto" }),
    /* @__PURE__ */ jsx15(Text13, { dimColor: true, children: "Cria um arquivo application-tree.json com a estrutura do projeto" })
  ] });
  return /* @__PURE__ */ jsx15(MainLayout, { header, children: /* @__PURE__ */ jsxs14(Box14, { flexDirection: "column", children: [
    showConfirm && !isScanning && !stats && /* @__PURE__ */ jsx15(Box14, { marginY: 2, children: /* @__PURE__ */ jsx15(
      ConfirmDialog_default,
      {
        message: "Deseja gerar a \xE1rvore do projeto? Isso pode levar alguns segundos.",
        onConfirm: handleConfirm,
        onCancel: handleCancel
      }
    ) }),
    isScanning && /* @__PURE__ */ jsxs14(Box14, { flexDirection: "column", marginY: 2, children: [
      /* @__PURE__ */ jsx15(LoadingSpinner_default, { message: "Lendo arquivos do projeto..." }),
      /* @__PURE__ */ jsx15(Box14, { marginTop: 1, children: /* @__PURE__ */ jsx15(Text13, { dimColor: true, children: "Isso pode levar alguns momentos dependendo do tamanho do projeto." }) })
    ] }),
    stats && !error && /* @__PURE__ */ jsxs14(
      Box14,
      {
        flexDirection: "column",
        marginY: 2,
        borderStyle: "round",
        borderColor: "green",
        paddingX: 2,
        paddingY: 1,
        children: [
          /* @__PURE__ */ jsx15(Text13, { bold: true, color: "green", children: "\u2713 \xC1rvore gerada com sucesso!" }),
          /* @__PURE__ */ jsxs14(Box14, { flexDirection: "column", marginTop: 1, children: [
            /* @__PURE__ */ jsxs14(Text13, { children: [
              /* @__PURE__ */ jsx15(Text13, { color: "cyan", children: "Arquivos lidos:" }),
              " ",
              stats.filesRead
            ] }),
            /* @__PURE__ */ jsxs14(Text13, { children: [
              /* @__PURE__ */ jsx15(Text13, { color: "cyan", children: "Arquivos ignorados:" }),
              " ",
              stats.filesIgnored
            ] }),
            /* @__PURE__ */ jsxs14(Text13, { children: [
              /* @__PURE__ */ jsx15(Text13, { color: "cyan", children: "Tamanho total:" }),
              " ",
              stats.totalSize
            ] })
          ] }),
          /* @__PURE__ */ jsx15(Box14, { marginTop: 1, children: /* @__PURE__ */ jsxs14(Text13, { dimColor: true, children: [
            "Arquivo salvo em: ",
            /* @__PURE__ */ jsx15(Text13, { bold: true, children: "application-tree.json" })
          ] }) })
        ]
      }
    ),
    error && /* @__PURE__ */ jsxs14(
      Box14,
      {
        flexDirection: "column",
        marginY: 2,
        borderStyle: "round",
        borderColor: "red",
        paddingX: 2,
        paddingY: 1,
        children: [
          /* @__PURE__ */ jsx15(Text13, { bold: true, color: "red", children: "\u2717 Erro ao gerar \xE1rvore" }),
          /* @__PURE__ */ jsx15(Box14, { marginTop: 1, children: /* @__PURE__ */ jsx15(Text13, { color: "red", children: error }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx15(StatusBar_default, { rightContent: "ESC: Voltar | Ctrl+C: Sair" })
  ] }) });
};
var ScrapPage_default = ScrapPage;

// src/TUI/pages/HelpPage.js
import React16 from "react";
import { Box as Box15, Text as Text14, useInput as useInput7 } from "ink";
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
var HelpPage = () => {
  const { goBack } = useRouter();
  useInput7((input, key) => {
    if (key.escape) {
      goBack();
    }
  });
  const commands = [
    { name: "scrap", description: "Gerar \xE1rvore do projeto (application-tree.json)" },
    { name: "config", description: "Abrir fluxo de configura\xE7\xE3o" },
    { name: "chat", description: "Iniciar conversa com IA" },
    { name: "help", description: "Exibir esta ajuda" },
    { name: "exit / sair", description: "Sair da aplica\xE7\xE3o" }
  ];
  const shortcuts = [
    { key: "ESC", description: "Voltar para p\xE1gina anterior" },
    { key: "Ctrl+C", description: "Sair da aplica\xE7\xE3o" },
    { key: "\u2191\u2193", description: "Navegar em listas" },
    { key: "Enter", description: "Confirmar/Enviar" },
    { key: "Tab", description: "Alternar foco (quando dispon\xEDvel)" }
  ];
  const header = /* @__PURE__ */ jsx16(Box15, { flexDirection: "column", children: /* @__PURE__ */ jsx16(Text14, { bold: true, color: "cyan", children: "\u2753 Ajuda - Comandos Dispon\xEDveis" }) });
  return /* @__PURE__ */ jsx16(MainLayout, { header, children: /* @__PURE__ */ jsxs15(Box15, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs15(Box15, { flexDirection: "column", marginY: 1, children: [
      /* @__PURE__ */ jsx16(Text14, { bold: true, color: "yellow", children: "\u{1F4CB} Comandos:" }),
      /* @__PURE__ */ jsx16(Box15, { flexDirection: "column", marginLeft: 2, marginTop: 1, children: commands.map((cmd, index) => /* @__PURE__ */ jsxs15(Box15, { marginY: 0, children: [
        /* @__PURE__ */ jsx16(Text14, { color: "green", bold: true, children: cmd.name.padEnd(20) }),
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: cmd.description })
      ] }, `cmd-${cmd.name}`)) })
    ] }),
    /* @__PURE__ */ jsxs15(Box15, { flexDirection: "column", marginY: 1, children: [
      /* @__PURE__ */ jsx16(Text14, { bold: true, color: "yellow", children: "\u2328\uFE0F  Atalhos de Teclado:" }),
      /* @__PURE__ */ jsx16(Box15, { flexDirection: "column", marginLeft: 2, marginTop: 1, children: shortcuts.map((shortcut, index) => /* @__PURE__ */ jsxs15(Box15, { marginY: 0, children: [
        /* @__PURE__ */ jsx16(Text14, { color: "cyan", bold: true, children: shortcut.key.padEnd(20) }),
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: shortcut.description })
      ] }, `shortcut-${shortcut.key}`)) })
    ] }),
    /* @__PURE__ */ jsxs15(Box15, { flexDirection: "column", marginY: 1, children: [
      /* @__PURE__ */ jsx16(Text14, { bold: true, color: "yellow", children: "\u2139\uFE0F  Informa\xE7\xF5es:" }),
      /* @__PURE__ */ jsxs15(Box15, { flexDirection: "column", marginLeft: 2, marginTop: 1, children: [
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: "\u2022 CLIA \xE9 um copiloto de IA CLI aut\xF4nomo" }),
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: "\u2022 Suporta Gemini, OpenAI e Claude" }),
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: "\u2022 Permite execu\xE7\xE3o de a\xE7\xF5es no filesystem com seguran\xE7a" }),
        /* @__PURE__ */ jsx16(Text14, { dimColor: true, children: "\u2022 Modo economia dispon\xEDvel para reduzir consumo de tokens" })
      ] })
    ] }),
    /* @__PURE__ */ jsx16(StatusBar_default, { rightContent: "ESC: Voltar | Ctrl+C: Sair" })
  ] }) });
};
var HelpPage_default = HelpPage;

// src/TUI/App.js
import { jsx as jsx17 } from "react/jsx-runtime";
var Router = () => {
  const { currentPage } = useAppState();
  switch (currentPage) {
    case "home":
      return /* @__PURE__ */ jsx17(HomePage_default, {});
    case "chat":
      return /* @__PURE__ */ jsx17(ChatPage_default, {});
    case "config":
      return /* @__PURE__ */ jsx17(ConfigPage_default, {});
    case "scrap":
      return /* @__PURE__ */ jsx17(ScrapPage_default, {});
    case "help":
      return /* @__PURE__ */ jsx17(HelpPage_default, {});
    default:
      return /* @__PURE__ */ jsx17(HomePage_default, {});
  }
};
var AppContent = () => {
  const { loadConfig } = useAppState();
  useEffect3(() => {
    loadConfig();
  }, [loadConfig]);
  return /* @__PURE__ */ jsx17(Box16, { flexDirection: "column", children: /* @__PURE__ */ jsx17(Router, {}) });
};
var App = () => {
  return /* @__PURE__ */ jsx17(AppProvider, { children: /* @__PURE__ */ jsx17(AppContent, {}) });
};
var App_default = App;

// src/TUI/index.js
import { jsx as jsx18 } from "react/jsx-runtime";
async function startTUI() {
  try {
    process.env.CLIA_TUI_MODE = "true";
    const { waitUntilExit } = render(/* @__PURE__ */ jsx18(App_default, {}));
    await waitUntilExit();
    process.env.CLIA_TUI_MODE = "false";
  } catch (error) {
    process.env.CLIA_TUI_MODE = "false";
    throw error;
  }
}
var index_default = startTUI;
export {
  index_default as default,
  startTUI
};
