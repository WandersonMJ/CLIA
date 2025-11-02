import cliUi from './utils/cli-ui.js';
import configService from './services/config-service.js';
import scrapProject from './utils/node-scrapper.js';
import handleAiPrompt from './agent/api/handle-ai-prompt.js';
import logger from './utils/logger.js';
import lang from './services/language-service.js';

import { spawn } from 'child_process';
import path from 'path';

import fs from 'fs';
import session from './services/api-session.js';
import { OS_PROMPTS_DIR } from './config/constants.js';

import { startTUI } from './TUI/loader.js';

/**
 * Busca o comando do editor padrão no arquivo JSON do SO.
 * @returns {string} O comando do editor (ex: 'nano' ou 'notepad').
 */
function getDefaultEditorCommand() {
  try {
    const os = session.getOS();
    if (!os) return 'nano';

    const commandFilePath = path.join(process.cwd(), OS_PROMPTS_DIR, `${os}.json`);
    const fileContent = fs.readFileSync(commandFilePath, 'utf8');
    const commandsData = JSON.parse(fileContent);

    return commandsData.system_commands.editor || 'nano';
  } catch (error) {
    logger.error("Falha ao ler o editor padrão do JSON do SO.", error);
    return 'nano';
  }
}

/**
 * Abre um arquivo no editor de terminal padrão (nano, vim, etc.).
 * @param {string} filePath - O caminho relativo do arquivo (ex: 'src/config/constants.js').
 */
async function editFileInTerminal(filePath) {
  const defaultEditor = getDefaultEditorCommand();
  const editor = process.env.EDITOR || defaultEditor;
  const fullPath = path.join(process.cwd(), filePath);

  const isTUI = ['nano', 'vim', 'vi', 'emacs'].includes(editor);

  let spawnOptions;
  if (isTUI) {
    spawnOptions = { stdio: 'inherit' };
  } else {
    spawnOptions = { detached: true, shell: true };
  }
  return new Promise((resolve, reject) => {
    const child = spawn(editor, [fullPath], spawnOptions);

    if (isTUI) {
      child.on('exit', (code) => {
        if (code === 0) {
          resolve(); 
        } else {
          reject(new Error(`Editor saiu com código ${code}`));
        }
      });

    } else {
      child.unref();
      resolve();
    }
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * O loop principal que lê o input e roteia para o comando correto.
 * @returns {Promise<string|void>} Retorna 'sair' se o usuário quiser sair.
 */
async function loopPrincipal() {
  try {
    const input = await cliUi.promptMultiline();

    const [comandoPrincipal, ..._args] = input.split(' ');

    switch (comandoPrincipal) {
      case 'sair':
      case 'exit':
        return 'sair';
      case 'scrap':
        try {
          await scrapProject();
        } catch (error) {
          logger.error(lang.get('cli.scrapError'), error.message);
        }
        break;
      case 'config':
        await configService.ajustarConfiguracoes();
        break;
      case 'help':
        console.clear()
        cliUi.mostrarComandos();
        break;

      case 'tui':
        try {
          console.clear();
          logger.info('Iniciando TUI (Terminal User Interface)...');
          await startTUI();
          console.clear();
          logger.info('TUI encerrado. Voltando ao CLI clássico...');
        } catch (error) {
          logger.error('Erro ao iniciar TUI:', error.message);
        }
        break;

      case 'edit-constants':
        try {
          await editFileInTerminal('src/config/constants.js');
          logger.warn(lang.get('cli.constants.edited'));
        } catch (error) {
          logger.error(lang.get('cli.constants.error'), error);
        }
        break;

      default:
        if (input) {
          // Enviar para a camada IA para gerar resposta ou tool_calls
          await handleAiPrompt(input);
        }
        break;
    }
  } catch (error) {
    if (error.message.includes('SIGINT')) {
      logger.warn(lang.get('cli.interrupt'));
      return 'sair';
    }
    logger.error(lang.get('cli.commandError', error.message), error);
  }
}

export default loopPrincipal;

