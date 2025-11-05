#!/usr/bin/env node

import logViewer from '../src/utils/log-viewer.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mudar para o diretório raiz do projeto
process.chdir(path.join(__dirname, '..'));

const args = process.argv.slice(2);
const command = args[0] || 'stats';

function printHelp() {
  console.log(`
📊 CLIA - Visualizador de Logs de Conversação

Uso: node scripts/view-logs.js [comando] [opções]

Comandos:

  sessions               Lista todas as sessões de log disponíveis
  stats                  Mostra estatísticas gerais dos logs
  list <tipo>            Lista logs por tipo (system, user, assistant, tool_call, etc.)
  mode <modo>            Lista logs de um modo específico (normal, architect)
  phase <fase>           Lista logs de uma fase específica (context-gathering, planning, execution)
  export <arquivo>       Exporta logs para arquivo legível
  clean <dias>           Remove logs mais antigos que X dias (padrão: 7)
  help                   Mostra esta ajuda

Exemplos:

  node scripts/view-logs.js sessions
  node scripts/view-logs.js stats
  node scripts/view-logs.js list tool_call
  node scripts/view-logs.js mode architect
  node scripts/view-logs.js export logs-export.txt
  node scripts/view-logs.js clean 7
`);
}

function formatLog(log, index) {
  const timestamp = new Date(log.ts).toLocaleString();
  console.log(`\n[$${index + 1}] [${timestamp}] [${log.type}] [${log.mode || '-'}] [${log.phase || '-'}]`);

  switch (log.type) {
    case 'system':
      console.log(`  SYSTEM PROMPT (${log.content?.length || 0} chars)`);
      console.log(`  ${log.content?.substring(0, 150)}...`);
      break;
    case 'user':
      console.log(`  USER: ${log.content}`);
      break;
    case 'assistant':
      console.log(`  ASSISTANT: ${log.message?.content || ''}`);
      if (log.message?.tool_calls) {
        console.log(`  Tool Calls: ${log.message.tool_calls.length}`);
      }
      break;
    case 'tool_call':
      console.log(`  TOOL: ${log.toolName}`);
      console.log(`  Args: ${JSON.stringify(log.args, null, 2)}`);
      break;
    case 'tool_result':
      const status = log.result?.success ? '✅ SUCCESS' : '❌ FAILURE';
      console.log(`  ${status} - ${log.toolName}`);
      console.log(`  Result: ${log.result?.content?.substring(0, 100)}...`);
      break;
    case 'event':
      console.log(`  EVENT: ${log.name}`);
      if (log.meta) {
        console.log(`  Meta: ${JSON.stringify(log.meta, null, 2)}`);
      }
      break;
    case 'request':
      console.log(`  REQUEST to ${log.provider} (${log.model})`);
      console.log(`  Tools: ${log.tools?.count || 0}`);
      console.log(`  History Length: ${log.history?.length || 0}`);
      break;
    case 'response':
      console.log(`  RESPONSE from ${log.provider} (${log.model})`);
      break;
  }
}

function main() {
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    case 'sessions': {
      console.log('\n📂 Sessões de Log Disponíveis\n');
      const sessions = logViewer.listSessions();

      if (sessions.length === 0) {
        console.log('Nenhuma sessão de log encontrada.');
        break;
      }

      sessions.forEach((session, index) => {
        console.log(`\n[${index + 1}] ${session.fileName}`);
        console.log(`  Caminho: ${session.filePath}`);
        console.log(`  Tamanho: ${(session.size / 1024).toFixed(2)} KB`);
        console.log(`  Criado em: ${new Date(session.created).toLocaleString()}`);
        console.log(`  Modificado em: ${new Date(session.modified).toLocaleString()}`);
        console.log(`  Total de logs: ${session.logCount}`);
        if (session.firstLog) {
          console.log(`  Período: ${session.firstLog} até ${session.lastLog}`);
        }
      });
      console.log(`\nTotal: ${sessions.length} sessão(ões) encontrada(s)\n`);
      break;
    }

    case 'stats': {
      console.log('\n📊 Estatísticas de Logs\n');
      const stats = logViewer.getStats();
      console.log(`Total de Logs: ${stats.total}`);
      console.log(`\nPor Tipo:`);
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      console.log(`\nPor Modo:`);
      Object.entries(stats.byMode).forEach(([mode, count]) => {
        console.log(`  ${mode}: ${count}`);
      });
      console.log(`\nPor Fase:`);
      Object.entries(stats.byPhase).forEach(([phase, count]) => {
        console.log(`  ${phase}: ${count}`);
      });
      console.log(`\nPor Provedor:`);
      Object.entries(stats.byProvider).forEach(([provider, count]) => {
        console.log(`  ${provider}: ${count}`);
      });
      console.log(`\nFerramentas Mais Usadas:`);
      const topTools = Object.entries(stats.toolUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      topTools.forEach(([tool, count]) => {
        console.log(`  ${tool}: ${count}`);
      });
      console.log(`\nPeríodo:`);
      console.log(`  Primeiro log: ${stats.firstLog || 'N/A'}`);
      console.log(`  Último log: ${stats.lastLog || 'N/A'}`);
      break;
    }

    case 'list': {
      const type = args[1];
      if (!type) {
        console.error('❌ Especifique um tipo de log');
        console.log('Tipos disponíveis: system, user, assistant, tool_call, tool_result, event, request, response');
        process.exit(1);
      }
      const logs = logViewer.getLogsByType(type);
      console.log(`\n📋 Logs do tipo "${type}" (${logs.length} encontrados)\n`);
      logs.forEach((log, i) => formatLog(log, i));
      break;
    }

    case 'mode': {
      const mode = args[1];
      if (!mode) {
        console.error('❌ Especifique um modo');
        console.log('Modos disponíveis: normal, architect');
        process.exit(1);
      }
      const logs = logViewer.getLogsByMode(mode);
      console.log(`\n📋 Logs do modo "${mode}" (${logs.length} encontrados)\n`);
      logs.forEach((log, i) => formatLog(log, i));
      break;
    }

    case 'phase': {
      const phase = args[1];
      if (!phase) {
        console.error('❌ Especifique uma fase');
        console.log('Fases disponíveis: context-gathering, planning, execution, single');
        process.exit(1);
      }
      const logs = logViewer.getLogsByPhase(phase);
      console.log(`\n📋 Logs da fase "${phase}" (${logs.length} encontrados)\n`);
      logs.forEach((log, i) => formatLog(log, i));
      break;
    }

    case 'export': {
      const outputPath = args[1];
      if (!outputPath) {
        console.error('❌ Especifique um caminho para o arquivo de saída');
        process.exit(1);
      }
      const count = logViewer.exportLogs(outputPath);
      console.log(`✅ ${count} logs exportados para ${outputPath}`);
      break;
    }

    case 'clean': {
      const days = parseInt(args[1]) || 7;
      console.log(`🧹 Limpando logs mais antigos que ${days} dias...`);
      const result = logViewer.cleanOldLogs(days);
      console.log(`✅ Removidos: ${result.removed}, Mantidos: ${result.kept}`);
      break;
    }

    default:
      console.error(`❌ Comando desconhecido: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
