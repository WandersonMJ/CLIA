// src/TUI/index.js
import inquirer from 'inquirer';

async function showMainMenu() {
  const choices = [
    { name: 'Iniciar interface', value: 'start' },
    { name: 'Mostrar status', value: 'status' },
    { name: 'Sair', value: 'exit' }
  ];
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'TUI - Escolha uma ação',
    choices
  });
  return action;
}

async function startTUI() {
  console.clear();
  console.log('CLIA TUI - Terminal User Interface (prototype)');
  let running = true;
  while (running) {
    const action = await showMainMenu();
    if (action === 'start') {
      console.log('Iniciando as integrações de IA (em desenvolvimento)...');
      const { provider } = await inquirer.prompt({
        type: 'list',
        name: 'provider',
        message: 'Selecione um provedor de IA',
        choices: [
          { name: 'OpenAI (GPT)', value: 'openai' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Claude', value: 'claude' },
          { name: 'Voltar', value: 'back' }
        ]
      });
      if (provider === 'back') continue;
      console.log(`Provedor selecionado: ${provider} ( integração ainda não implementada ).`);
    } else if (action === 'status') {
      console.log('Status: TUI em modo protótipo. Sem estado persistente.');
    } else if (action === 'exit') {
      running = false;
    }
  }
  console.log('Encerrando TUI...');
}

export { startTUI };
