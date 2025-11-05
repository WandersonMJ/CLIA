import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

/**
 * Lê todos os arquivos de log disponíveis
 * @returns {Array<string>} Array com os caminhos dos arquivos de log
 */
function getLogFiles() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      return [];
    }
    return fs.readdirSync(LOG_DIR)
      .filter(file => file.endsWith('.jsonl'))
      .map(file => path.join(LOG_DIR, file))
      .sort()
      .reverse(); // Mais recentes primeiro
  } catch (error) {
    console.error('Erro ao listar arquivos de log:', error);
    return [];
  }
}

/**
 * Lê logs de um arquivo específico
 * @param {string} logFile - Caminho do arquivo de log
 * @returns {Array<Object>} Array de objetos de log
 */
function readLogsFromFile(logFile) {
  try {
    if (!fs.existsSync(logFile)) {
      return [];
    }
    const content = fs.readFileSync(logFile, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Erro ao ler logs do arquivo:', logFile, error);
    return [];
  }
}

/**
 * Lê todos os logs de conversação de todos os arquivos
 * @param {string} sessionFile - Opcional: arquivo de sessão específico para ler
 * @returns {Array<Object>} Array de objetos de log
 */
export function readAllLogs(sessionFile = null) {
  try {
    if (sessionFile) {
      // Se um arquivo específico foi fornecido
      const logPath = path.isAbsolute(sessionFile)
        ? sessionFile
        : path.join(LOG_DIR, sessionFile);
      return readLogsFromFile(logPath);
    }

    // Lê todos os arquivos de log
    const logFiles = getLogFiles();
    const allLogs = [];

    for (const logFile of logFiles) {
      allLogs.push(...readLogsFromFile(logFile));
    }

    // Ordena por timestamp
    return allLogs.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  } catch (error) {
    console.error('Erro ao ler logs:', error);
    return [];
  }
}

/**
 * Obtém logs filtrados por tipo
 * @param {string} type - Tipo de log (system, user, assistant, tool_call, tool_result, event, request, response)
 * @returns {Array<Object>}
 */
export function getLogsByType(type) {
  return readAllLogs().filter(log => log.type === type);
}

/**
 * Obtém logs de uma sessão específica (baseado em timestamp)
 * @param {Date} startTime - Início da sessão
 * @param {Date} endTime - Fim da sessão
 * @returns {Array<Object>}
 */
export function getLogsInTimeRange(startTime, endTime) {
  return readAllLogs().filter(log => {
    const logTime = new Date(log.ts);
    return logTime >= startTime && logTime <= endTime;
  });
}

/**
 * Obtém logs por modo
 * @param {string} mode - Modo (normal, architect, etc.)
 * @returns {Array<Object>}
 */
export function getLogsByMode(mode) {
  return readAllLogs().filter(log => log.mode === mode);
}

/**
 * Obtém logs por fase (para modo architect)
 * @param {string} phase - Fase (context-gathering, planning, execution, single)
 * @returns {Array<Object>}
 */
export function getLogsByPhase(phase) {
  return readAllLogs().filter(log => log.phase === phase);
}

/**
 * Reconstrói uma conversa completa a partir dos logs
 * @param {string} mode - Modo da conversa
 * @param {Date} startTime - Início aproximado da conversa
 * @returns {Object} Objeto com a conversa reconstruída
 */
export function reconstructConversation(mode, startTime) {
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hora
  const logs = getLogsInTimeRange(startTime, endTime).filter(log => log.mode === mode);

  return {
    mode,
    startTime,
    logs: logs.sort((a, b) => new Date(a.ts) - new Date(b.ts)),
    phases: [...new Set(logs.map(l => l.phase))],
    toolsUsed: logs
      .filter(l => l.type === 'tool_call')
      .map(l => l.toolName),
  };
}

/**
 * Obtém estatísticas dos logs
 * @returns {Object} Estatísticas
 */
export function getStats() {
  const logs = readAllLogs();

  const byType = {};
  const byMode = {};
  const byPhase = {};
  const byProvider = {};
  const toolUsage = {};

  logs.forEach(log => {
    // Por tipo
    byType[log.type] = (byType[log.type] || 0) + 1;

    // Por modo
    if (log.mode) {
      byMode[log.mode] = (byMode[log.mode] || 0) + 1;
    }

    // Por fase
    if (log.phase) {
      byPhase[log.phase] = (byPhase[log.phase] || 0) + 1;
    }

    // Por provedor
    if (log.provider) {
      byProvider[log.provider] = (byProvider[log.provider] || 0) + 1;
    }

    // Uso de ferramentas
    if (log.type === 'tool_call' && log.toolName) {
      toolUsage[log.toolName] = (toolUsage[log.toolName] || 0) + 1;
    }
  });

  return {
    total: logs.length,
    byType,
    byMode,
    byPhase,
    byProvider,
    toolUsage,
    firstLog: logs[0]?.ts,
    lastLog: logs[logs.length - 1]?.ts,
  };
}

/**
 * Lista todas as sessões de log disponíveis
 * @returns {Array<Object>} Array com informações sobre cada sessão
 */
export function listSessions() {
  try {
    const logFiles = getLogFiles();
    return logFiles.map(file => {
      const fileName = path.basename(file);
      const stats = fs.statSync(file);
      const logs = readLogsFromFile(file);

      return {
        fileName,
        filePath: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        logCount: logs.length,
        firstLog: logs[0]?.ts,
        lastLog: logs[logs.length - 1]?.ts,
      };
    });
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return [];
  }
}

/**
 * Limpa logs antigos (remove arquivos mais antigos que N dias)
 * @param {number} days - Número de dias para manter
 */
export function cleanOldLogs(days = 7) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      return { removed: 0, kept: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logFiles = getLogFiles();
    let removedCount = 0;
    let keptCount = 0;

    for (const logFile of logFiles) {
      const stats = fs.statSync(logFile);
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(logFile);
        removedCount++;
      } else {
        keptCount++;
      }
    }

    return {
      removed: removedCount,
      kept: keptCount,
    };
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    return { removed: 0, kept: 0 };
  }
}

/**
 * Exporta logs para formato legível
 * @param {string} outputPath - Caminho do arquivo de saída
 * @param {Object} options - Opções de filtragem
 */
export function exportLogs(outputPath, options = {}) {
  let logs = readAllLogs();

  // Aplicar filtros
  if (options.mode) {
    logs = logs.filter(l => l.mode === options.mode);
  }
  if (options.phase) {
    logs = logs.filter(l => l.phase === options.phase);
  }
  if (options.type) {
    logs = logs.filter(l => l.type === options.type);
  }
  if (options.startTime) {
    logs = logs.filter(l => new Date(l.ts) >= options.startTime);
  }
  if (options.endTime) {
    logs = logs.filter(l => new Date(l.ts) <= options.endTime);
  }

  // Formatar para legibilidade
  const formatted = logs.map(log => {
    const timestamp = new Date(log.ts).toLocaleString();
    let line = `[${timestamp}] [${log.type}]`;

    if (log.mode) line += ` [${log.mode}]`;
    if (log.phase) line += ` [${log.phase}]`;

    switch (log.type) {
      case 'system':
        line += `\nSYSTEM: ${log.content?.substring(0, 200)}...`;
        break;
      case 'user':
        line += `\nUSER: ${log.content}`;
        break;
      case 'assistant':
        line += `\nASSISTANT: ${log.message?.content || ''}`;
        break;
      case 'tool_call':
        line += `\nTOOL CALL: ${log.toolName}(${JSON.stringify(log.args)})`;
        break;
      case 'tool_result':
        line += `\nTOOL RESULT: ${log.result?.success ? 'SUCCESS' : 'FAILURE'}`;
        break;
      case 'event':
        line += `\nEVENT: ${log.name}`;
        break;
      case 'request':
        line += `\nREQUEST: ${log.provider} (${log.model})`;
        break;
      case 'response':
        line += `\nRESPONSE: ${log.provider} (${log.model})`;
        break;
    }

    return line;
  }).join('\n\n' + '='.repeat(80) + '\n\n');

  fs.writeFileSync(outputPath, formatted, 'utf8');
  return logs.length;
}

export default {
  readAllLogs,
  getLogsByType,
  getLogsInTimeRange,
  getLogsByMode,
  getLogsByPhase,
  reconstructConversation,
  getStats,
  listSessions,
  cleanOldLogs,
  exportLogs,
};
