import fs from 'fs';
import path from 'path';

// Captura a data de início da sessão quando o módulo é carregado
const SESSION_START = new Date();
const SESSION_DATE = SESSION_START.toISOString()
  .replace(/:/g, '-')
  .replace(/\..+/, '')
  .replace('T', '_');

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `ai-conversations-${SESSION_DATE}.jsonl`);

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (_) {
    // Se não conseguir criar, ignorar silenciosamente para não quebrar o fluxo
  }
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({ __error: 'CyclicOrNonSerializable', message: String(e) });
  }
}

function append(entry) {
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, safeStringify(entry) + '\n', 'utf8');
  } catch (_) {
    // Não interromper o fluxo em caso de erro de log
  }
}

function summarizeTools(tools) {
  if (!Array.isArray(tools)) return { count: 0 };
  return {
    count: tools.length,
    names: tools.map(t => t?.name).filter(Boolean),
  };
}

// Logs de baixo nível (requisição/resposta do provedor)
export function logRequest({ provider, model, mode, phase, history, tools, meta }) {
  append({
    ts: new Date().toISOString(),
    type: 'request',
    provider,
    model,
    mode,
    phase,
    meta: meta || {},
    tools: summarizeTools(tools),
    history,
  });
}

export function logResponse({ provider, model, mode, phase, response, meta }) {
  append({
    ts: new Date().toISOString(),
    type: 'response',
    provider,
    model,
    mode,
    phase,
    meta: meta || {},
    response,
  });
}

// Logs de alto nível (conversação completa)
export function logSystem({ mode, phase = 'single', content, meta }) {
  append({ ts: new Date().toISOString(), type: 'system', mode, phase, meta: meta || {}, content });
}

export function logUser({ mode, phase = 'single', content, meta }) {
  append({ ts: new Date().toISOString(), type: 'user', mode, phase, meta: meta || {}, content });
}

export function logAssistant({ mode, phase = 'single', message, meta }) {
  append({ ts: new Date().toISOString(), type: 'assistant', mode, phase, meta: meta || {}, message });
}

export function logToolCall({ mode, phase = 'single', toolName, args, tool_call_id, meta }) {
  append({ ts: new Date().toISOString(), type: 'tool_call', mode, phase, tool_call_id, toolName, args, meta: meta || {} });
}

export function logToolResult({ mode, phase = 'single', toolName, result, tool_call_id, meta }) {
  append({ ts: new Date().toISOString(), type: 'tool_result', mode, phase, tool_call_id, toolName, result, meta: meta || {} });
}

export function logEvent({ name, mode, phase = 'single', meta }) {
  append({ ts: new Date().toISOString(), type: 'event', name, mode, phase, meta: meta || {} });
}

export default {
  logRequest,
  logResponse,
  logSystem,
  logUser,
  logAssistant,
  logToolCall,
  logToolResult,
  logEvent,
};