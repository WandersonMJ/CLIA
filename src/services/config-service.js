import inquirer from 'inquirer';
import fs from 'fs';
import session from './api-session.js';
import logger from '../utils/logger.js';
import lang from './language-service.js';

import geminiClient from '../agent/api/ai/gemini-client.js';
import openAiClient from '../agent/api/ai/open-ai-client.js';
import claudeClient from '../agent/api/ai/claude-client.js';

import {
    CONFIG_FILE,
    CLAUDE_MODELS,
    GEMINI_MODELS,
    OPENAI_MODELS,
    DEFAULT_CLAUDE_MODEL,
    DEFAULT_GEMINI_MODEL,
    DEFAULT_OPENAI_MODEL
} from '../config/constants.js';

function readConfig() {
    try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            logger.error(lang.get('config.readError'), error);
        }
        return null;
    }
}

function writeConfig(config) {
    try {
        const content = JSON.stringify(config, null, 2);
        fs.writeFileSync(CONFIG_FILE, content, 'utf-8');
        logger.success(lang.get('config.saveSuccess'));
    } catch (error) {
        logger.error(lang.get('config.writeError'), error);
    }
}

/**
 * Pergunta, define e salva o idioma.
 * @param {object} config - O objeto de configuração atual.
 * @returns {string} - O idioma selecionado (ex: 'en-US').
 */
async function configurarIdioma(config) {

    const { language } = await inquirer.prompt([
        {
            type: 'list',
            name: 'language',
            message: 'Select your language / Selecione seu idioma:',
            choices: [
                { name: 'English (US)', value: 'en-US' },
                { name: 'Português (BR)', value: 'pt-BR' },
            ],
            default: config.language || 'en-US',
        },
    ]);

    session.setLanguage(language);
    lang.setLanguage(language);

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
            type: 'list',
            name: 'provider',
            message: lang.get('config.providerPrompt'),
            choices: [
                { name: lang.get('config.provider.gemini'), value: 'gemini' },
                { name: lang.get('config.provider.openai'), value: 'openai' },
                { name: lang.get('config.provider.claude'), value: 'claude' },
            ],
            default: config.provider || 'openai',
        },
    ]);
    if (!config.credentials) {
        config.credentials = {};
    }
    const savedCredentials = config.credentials[provider];
    let useExistingKey = false;
    if (reuseKeys && savedCredentials && savedCredentials.apiKey) {
        const { changeKey } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'changeKey',
                message: lang.get('config.keyExists', provider),
                default: false,
            },
        ]);
        useExistingKey = !changeKey;
    }
    let answers;
    if (provider === 'gemini') {
        const defaultModel = (savedCredentials && savedCredentials.model) || DEFAULT_MODELS.gemini;
        if (useExistingKey) {
            answers = { ...savedCredentials };
            const { model } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.gemini'),
                    default: defaultModel,
                    choices: GEMINI_MODELS
                },
            ]);
            answers.model = model;
            logger.success(lang.get('config.keySuccess', lang.get('config.provider.gemini')));
        } else {
            answers = await inquirer.prompt([
                { type: 'password', name: 'apiKey', message: lang.get('config.keyPrompt.gemini') },
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.gemini'),
                    default: defaultModel,
                    choices: GEMINI_MODELS
                },
            ]);
            if (!answers.apiKey) {
                logger.error(lang.get('config.invalidKey'));
                return null;
            }
        }
        geminiClient.initialize(answers);
        session.configure('gemini', answers);

    } else if (provider === 'openai') {
        const defaultModel = (savedCredentials && savedCredentials.model) || DEFAULT_MODELS.openai;
        if (useExistingKey) {
            answers = { ...savedCredentials };
            const { model } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.openai'),
                    default: defaultModel,
                    choices: OPENAI_MODELS
                },
            ]);
            answers.model = model;
            logger.success(lang.get('config.keySuccess', lang.get('config.provider.openai')));
        } else {
            answers = await inquirer.prompt([
                { type: 'password', name: 'apiKey', message: lang.get('config.keyPrompt.openai') },
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.openai'),
                    default: defaultModel,
                    choices: OPENAI_MODELS
                },
            ]);
            if (!answers.apiKey) {
                logger.error(lang.get('config.invalidKey'));
                return null;
            }
        }
        openAiClient.initialize(answers);
        session.configure('openai', answers);
    } else if (provider === 'claude') {
        const defaultModel = (savedCredentials && savedCredentials.model) || DEFAULT_MODELS.claude;
        if (useExistingKey) {
            answers = { ...savedCredentials };
            const { model } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.claude'),
                    default: defaultModel,
                    choices: CLAUDE_MODELS
                },
            ]);
            answers.model = model;
            logger.success(lang.get('config.keySuccess', lang.get('config.provider.claude')));
        } else {
            answers = await inquirer.prompt([
                { type: 'password', name: 'apiKey', message: lang.get('config.keyPrompt.claude') },
                {
                    type: 'list',
                    name: 'model',
                    message: lang.get('config.modelPrompt.claude'),
                    default: defaultModel,
                    choices: CLAUDE_MODELS
                },
            ]);
            if (!answers.apiKey) {
                logger.error(lang.get('config.invalidKey'));
                return null;
            }
        }
        claudeClient.initialize(answers);
        session.configure('claude', answers);
    }

    logger.info(lang.get('config.iaSettings', provider, answers.model));

    config.credentials[provider] = answers;
    return {
        provider,
        apiKey: answers.apiKey,
        model: answers.model,
        credentials: config.credentials
    };
}

async function selecionarModo(config) {
    logger.info('🎯 Selecionar Modo de Operação');

    const { mode } = await inquirer.prompt([
        {
            type: 'list',
            name: 'mode',
            message: 'Escolha o modo de operação:',
            choices: [
                {
                    name: '🔵 Normal - Usa o modelo configurado sem otimizações',
                    value: 'normal'
                },
                {
                    name: '💰 Econômico - Reduz custos limitando ferramentas disponíveis',
                    value: 'economy'
                },
                {
                    name: '🏗️  Arquiteto - Multi-agente (Planejador + Executor) para tarefas complexas',
                    value: 'architect'
                },
            ],
            default: config.mode || 'normal',
        },
    ]);

    session.setMode(mode);

    if (mode === 'normal') {
        logger.success('✅ Modo Normal ativado');
        return { mode: 'normal' };
    }

    if (mode === 'economy') {
        logger.success('✅ Modo Econômico ativado');
        logger.info('💡 Ferramentas limitadas serão usadas para reduzir custos');
        return { mode: 'economy' };
    }

    // Se for modo arquiteto, configurar
    if (mode === 'architect') {
        return await configurarModoArquiteto(config);
    }
}

async function configurarModoArquiteto(config) {
    logger.info('🏗️  Configurando Modo Arquiteto (Multi-Agent)');

    logger.info('\n🏛️  Configurando o ARQUITETO (IA de Planejamento - Modelo Caro e Inteligente)');

    // Escolher provider do Arquiteto
    const { architectProvider } = await inquirer.prompt([
        {
            type: 'list',
            name: 'architectProvider',
            message: 'Escolha o provedor para o Arquiteto:',
            choices: [
                { name: 'OpenAI (GPT-4o)', value: 'openai' },
                { name: 'Claude (Opus)', value: 'claude' },
                { name: 'Gemini', value: 'gemini' },
            ],
            default: config.architectProvider || 'openai',
        },
    ]);

    // Escolher modelo do Arquiteto
    let architectModelChoices;
    let architectDefaultModel;
    if (architectProvider === 'openai') {
        architectModelChoices = OPENAI_MODELS;
        architectDefaultModel = config.architectModel || 'gpt-4o';
    } else if (architectProvider === 'claude') {
        architectModelChoices = CLAUDE_MODELS;
        architectDefaultModel = config.architectModel || 'claude-opus-4-20250514';
    } else {
        architectModelChoices = GEMINI_MODELS;
        architectDefaultModel = config.architectModel || 'gemini-2.0-flash-exp';
    }

    const { architectModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'architectModel',
            message: 'Escolha o modelo para o Arquiteto:',
            choices: architectModelChoices,
            default: architectDefaultModel,
        },
    ]);

    // API Key do Arquiteto
    const { architectApiKey } = await inquirer.prompt([
        {
            type: 'password',
            name: 'architectApiKey',
            message: `API Key do ${architectProvider} para o Arquiteto:`,
            default: config.architectApiKey || '',
        },
    ]);

    logger.info('\n👷 Configurando o EXECUTOR (IA de Execução - Modelo Barato e Rápido)');

    // Escolher provider do Executor
    const { executorProvider } = await inquirer.prompt([
        {
            type: 'list',
            name: 'executorProvider',
            message: 'Escolha o provedor para o Executor:',
            choices: [
                { name: 'Claude (Haiku)', value: 'claude' },
                { name: 'Gemini (Flash)', value: 'gemini' },
                { name: 'OpenAI (GPT-4o-mini)', value: 'openai' },
            ],
            default: config.executorProvider || 'claude',
        },
    ]);

    // Escolher modelo do Executor
    let executorModelChoices;
    let executorDefaultModel;
    if (executorProvider === 'claude') {
        executorModelChoices = CLAUDE_MODELS;
        executorDefaultModel = config.executorModel || 'claude-haiku-3-5-20250120';
    } else if (executorProvider === 'gemini') {
        executorModelChoices = GEMINI_MODELS;
        executorDefaultModel = config.executorModel || 'gemini-2.0-flash-exp';
    } else {
        executorModelChoices = OPENAI_MODELS;
        executorDefaultModel = config.executorModel || 'gpt-4o-mini';
    }

    const { executorModel } = await inquirer.prompt([
        {
            type: 'list',
            name: 'executorModel',
            message: 'Escolha o modelo para o Executor:',
            choices: executorModelChoices,
            default: executorDefaultModel,
        },
    ]);

    // API Key do Executor
    const { executorApiKey } = await inquirer.prompt([
        {
            type: 'password',
            name: 'executorApiKey',
            message: `API Key do ${executorProvider} para o Executor:`,
            default: config.executorApiKey || '',
        },
    ]);

    // Configurar session
    session.setMode('architect');
    session.configureArchitect(architectProvider, architectModel, architectApiKey);
    session.configureExecutor(executorProvider, executorModel, executorApiKey);

    logger.success('✅ Modo Arquiteto configurado com sucesso!');
    logger.info(`🏛️  Arquiteto: ${architectProvider} (${architectModel})`);
    logger.info(`👷 Executor: ${executorProvider} (${executorModel})`);

    return {
        mode: 'architect',
        architectProvider,
        architectModel,
        architectApiKey,
        executorProvider,
        executorModel,
        executorApiKey
    };
}

async function loopConfiguracao() {
    const config = readConfig() || {};


    const language = await configurarIdioma(config);

    logger.info(lang.get('config.welcome'));

    const creds = config.credentials ? Object.keys(config.credentials).join(', ') : lang.get('config.noCreds');
    logger.info(lang.get('config.loaded',
        config.os || lang.get('config.nd'),
        config.economyMode,
        creds
    ));

    const { os } = await inquirer.prompt([
        {
            type: 'list',
            name: 'os',
            message: lang.get('config.osPrompt'),
            choices: ['Windows', 'Linux'],
            default: config.os || 'Windows',
        },
    ]);
    session.setOS(os.toLowerCase());
    logger.info(lang.get('config.osSet', os));

    logger.info(lang.get('config.iaSetup'));
    const configuracaoIA = await escolherProvedorIA(config, false);

    if (!configuracaoIA) {
        logger.error('Falha ao configurar provedor de IA');
        return;
    }

    // Selecionar modo de operação
    const modeConfig = await selecionarModo(config);

    const newConfig = {
        language,
        os,
        provider: configuracaoIA.provider,
        apiKey: configuracaoIA.apiKey,
        model: configuracaoIA.model,
        credentials: configuracaoIA.credentials,
        ...modeConfig
    };

    writeConfig(newConfig);
    logger.success(lang.get('config.providerSuccess', configuracaoIA.provider));
}

async function ajustarConfiguracoes() {
    const config = readConfig() || {};

    if (config.language) {
        session.setLanguage(config.language);
        lang.setLanguage(config.language);
    }

    logger.info(lang.get('config.adjustTitle'));

    const creds = config.credentials ? Object.keys(config.credentials).join(', ') : lang.get('config.noCreds');
    logger.info(lang.get('config.loaded',
        config.os || lang.get('config.nd'),
        config.economyMode,
        creds
    ));

    const { opcao } = await inquirer.prompt([
        {
            type: 'list',
            name: 'opcao',
            message: lang.get('config.adjustPrompt'),
            choices: [
                { name: lang.get('config.adjustOptions.provider'), value: 'provider' },
                { name: '🎯 Selecionar Modo (Normal/Econômico/Arquiteto)', value: 'mode' },
                { name: lang.get('config.adjustOptions.os'), value: 'os' },
                { name: 'Change Language / Mudar Idioma', value: 'language' },
                { name: lang.get('config.adjustOptions.all'), value: 'all' },
            ],
        },
    ]);

    let newConfig = { ...config };
    switch (opcao) {
        case 'provider':
            logger.info(lang.get('config.providerChange'));
            const configuracaoIA = await escolherProvedorIA(config, true);
            if (configuracaoIA) {
                newConfig.provider = configuracaoIA.provider;
                newConfig.apiKey = configuracaoIA.apiKey;
                newConfig.model = configuracaoIA.model;
                newConfig.credentials = configuracaoIA.credentials;
            }
            break;
        case 'mode':
            const modeConfig = await selecionarModo(config);
            newConfig = { ...newConfig, ...modeConfig };
            break;
        case 'os':
            const { os } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'os',
                    message: lang.get('config.osPrompt'),
                    choices: ['Windows', 'Linux'],
                    default: config.os || 'Windows',
                },
            ]);
            newConfig.os = os;
            session.setOS(os.toLowerCase());
            logger.success(lang.get('config.osSet', os));
            break;
        case 'language':
            const newLanguage = await configurarIdioma(config);
            newConfig.language = newLanguage;
            break;
        case 'all':
            logger.info(lang.get('config.reconfigAll'));

            const allLanguage = await configurarIdioma(config);
            newConfig.language = allLanguage;

            const { osAll } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'osAll',
                    message: lang.get('config.osPrompt'),
                    choices: ['Windows', 'Linux'],
                    default: config.os || 'Windows',
                },
            ]);
            newConfig.os = osAll;
            session.setOS(osAll.toLowerCase());

            const configuracaoIAAll = await escolherProvedorIA(config, true);
            if (configuracaoIAAll) {
                newConfig.provider = configuracaoIAAll.provider;
                newConfig.apiKey = configuracaoIAAll.apiKey;
                newConfig.model = configuracaoIAAll.model;
                newConfig.credentials = configuracaoIAAll.credentials;
            }

            // Selecionar modo de operação
            const modeConfigAll = await selecionarModo(config);
            newConfig = { ...newConfig, ...modeConfigAll };

            break;
    }
    writeConfig(newConfig);
    logger.success(lang.get('config.updateSuccess'));
}

export default {
    loopConfiguracao,
    ajustarConfiguracoes,
    readConfig,
    writeConfig
};