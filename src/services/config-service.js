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

    const { economyMode } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'economyMode',
            message: lang.get('config.economyPrompt'),
            default: config.economyMode || false,
        },
    ]);
    session.setEconomyMode(economyMode);
    if (economyMode) {
        logger.success(lang.get('config.economyOn'));
    }

    logger.info(lang.get('config.iaSetup'));
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
        logger.success(lang.get('config.providerSuccess', configuracaoIA.provider));
    }
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
                { name: lang.get('config.adjustOptions.economy'), value: 'economy' },
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
        case 'economy':
            const { economyMode } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'economyMode',
                    message: lang.get('config.economyPrompt'),
                    default: config.economyMode || false,
                },
            ]);
            newConfig.economyMode = economyMode;
            session.setEconomyMode(economyMode);
            if (economyMode) {
                logger.success(lang.get('config.economyOn'));
            } else {
                logger.info(lang.get('config.economyOff'));
            }
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

            const { economyModeAll } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'economyModeAll',
                    message: lang.get('config.economyPrompt'),
                    default: config.economyMode || false,
                },
            ]);
            newConfig.economyMode = economyModeAll;
            session.setEconomyMode(economyModeAll);

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
    logger.success(lang.get('config.updateSuccess'));
}

export default {
    loopConfiguracao,
    ajustarConfiguracoes,
    readConfig,
    writeConfig
};