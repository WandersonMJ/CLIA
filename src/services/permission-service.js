import inquirer from 'inquirer';
import { DEFAULT_SESSION_PERMISSIONS } from '../config/constants.js';

class PermissionService {
  static instance;
  #sessionPermissions = DEFAULT_SESSION_PERMISSIONS;

  constructor() {
    if (PermissionService.instance) {
      return PermissionService.instance;
    }
    PermissionService.instance = this;
  }

  static getInstance() {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Verifica se uma ação é permitida, perguntando ao usuário se necessário.
   * @param {string} action - O tipo de ação (READ, CREATE, UPDATE, DELETE).
   * @param {string} details - A descrição da ação (ex: 'o arquivo path/to/file.js').
   * @returns {Promise<boolean>} - Retorna true se a ação for permitida, false caso contrário.
   */
  async check(action, details) {
    
    if (this.#sessionPermissions[action]) {
      return true;
    }

    const { confirmation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'confirmation',
        message: `A IA deseja executar a seguinte ação: ${action} ${details}. Você permite?`,
        choices: [
          { name: 'Sim, apenas desta vez.', value: 'once' },
          { name: `Sim, e permitir todas as futuras ações de ${action} nesta sessão.`, value: 'always' },
          { name: 'Não.', value: 'no' },
        ],
      },
    ]);

    if (confirmation === 'always') {
      this.#sessionPermissions[action] = true; 
      return true;
    }

    return confirmation === 'once';
  }
}

export default PermissionService.getInstance();