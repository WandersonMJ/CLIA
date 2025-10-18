export const PERSONAL_CONTEXT = "";

// --- Arquivos ---
export const CONFIG_FILE = 'config.json';
export const SCRAP_FILE = 'application-tree.json';
export const GITIGNORE_FILE = '.gitignore';

// --- Caminhos ---
export const PROMPTS_DIR = 'src/prompts';
export const OS_PROMPTS_DIR = `${PROMPTS_DIR}/os-commands`;

// --- Agente ---
export const MAX_ITERATIONS = 15;
export const LOG_PREVIEW_LENGTH = 300;
export const CRITICAL_ACTIONS = [
    'CREATE', 
    'UPDATE', 
    'DELETE', 
    'SHELL', 
    'EDIT_LINES', 
    'INSERT_LINES', 
    'REPLACE_IN_FILE', 
    'CREATE_WITH_CONTENT', 
    'MOVE'
];

// --- Configuração ---
export const API_KEY_MASK = '***';
export const DEFAULT_IGNORE_RULES = [
    'node_modules',
    '.git',
    SCRAP_FILE,
    CONFIG_FILE
];
export const DEFAULT_SESSION_PERMISSIONS = {
    READ: true,
    CREATE: false,
    UPDATE: false,
    DELETE: false,
};

// --- Shell ---
export const TIMEOUT = 10000;
export const MAX_BUFFER = 1024 * 1024;

// --- Modelos de IA ---
export const MAX_TOKENS = 4096;

export const CLAUDE_MODELS = [
    { name: 'Sonnet 4.5', value: 'claude-sonnet-4-5-20250929' },
    { name: 'Sonnet 4', value: 'claude-sonnet-4-20250514' },
    { name: 'Sonnet 3.7', value: 'claude-3-7-sonnet-20250219' },
    { name: 'Haiku 4.5', value: 'claude-haiku-4-5-20251001' },
    { name: 'Haiku 3.5', value: 'claude-3-5-haiku-20241022' },
    { name: 'Haiku 3', value: 'claude-3-haiku-20240307' },
    { name: 'Opus 4.1', value: 'claude-opus-4-1-20250805' },
    { name: 'Opus 4', value: 'claude-opus-4-20250514' }
];

export const GEMINI_MODELS = [
    { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash-latest' },
    { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro-latest' },
];

export const OPENAI_MODELS = [
    { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { name: 'GPT-4o', value: 'gpt-4o' },
    { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
];

// --- Valores Padrão dos Modelos ---
export const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS[0].value;
export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS[0].value;
export const DEFAULT_OPENAI_MODEL = OPENAI_MODELS[0].value;