import Table from 'cli-table3';
import readline from 'readline';
import logger from './logger.js'; 
import lang from '../services/language-service.js';

/**
 * Exibe a tabela de comandos disponíveis, traduzida.
 */
function mostrarComandos() {
  
  const table = new Table({
    head: [
        lang.get('cli.commands.header.command'), 
        lang.get('cli.commands.header.description')
    ],
  
    colWidths: [20, 80],
  });
  
  table.push(
    [lang.get('cli.commands.exit.cmd'), lang.get('cli.commands.exit.desc')],
    [lang.get('cli.commands.scrap.cmd'), lang.get('cli.commands.scrap.desc')],
    [lang.get('cli.commands.config.cmd'), lang.get('cli.commands.config.desc')],
    [lang.get('cli.commands.help.cmd'), lang.get('cli.commands.help.desc')],
    [lang.get('cli.commands.edit.cmd'), lang.get('cli.commands.edit.desc')],
    [lang.get('cli.commands.prompt.cmd'), lang.get('cli.commands.prompt.desc')]
  );

  logger.raw(`${table.toString()}`); 
}

const COMANDOS = [
  'sair', 
  'exit', 
  'scrap', 
  'config', 
  'help', 
  'edit-constants'
];

/**
 * Função de auto-complete para o readline
 * @param {string} line A linha atual
 * @returns {[string[], string]} [sugestões, linha]
 */
function completer(line) {
  const hits = COMANDOS.filter((c) => c.startsWith(line));
  
  return [hits.length ? hits : COMANDOS, line];
}

/**
 * Função para ler input com suporte a múltiplas linhas usando barra invertida (\\)
 */
async function promptMultiline() {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    completer: completer 
  });

  let lines = [];
  let prompt = ' > ';

  return new Promise((resolve) => {
    const handleLine = (line) => {
      if (line.endsWith('\\')) {
        lines.push(line.slice(0, -1));
        prompt = '...       > ';
        rl.setPrompt(prompt);
        rl.prompt();
      } else {
        lines.push(line);
        rl.close();
        resolve(lines.join('\n').trim());
      }
    };

    rl.setPrompt(prompt);
    rl.prompt();
    rl.on('line', handleLine);
  });
}

export default {
    mostrarComandos,
    promptMultiline
};