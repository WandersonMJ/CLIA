/**
 * Serviço de Permissões para o TUI
 * Gerencia permissões de operações críticas de filesystem e shell
 * Usa o AppContext para verificar e atualizar permissões
 */

const ACTION_MAP = {
	// Operações de leitura
	READ: 'READ',
	READ_START: 'READ',
	READ_END: 'READ',

	// Operações de criação
	CREATE: 'CREATE',
	CREATE_WITH_CONTENT: 'CREATE',
	CREATE_DIRECTORY: 'CREATE',

	// Operações de atualização
	UPDATE: 'UPDATE',
	EDIT_LINES: 'UPDATE',
	INSERT_LINES: 'UPDATE',
	REPLACE_IN_FILE: 'UPDATE',
	APPLY_PATCH: 'UPDATE',
	MOVE: 'UPDATE',

	// Operações de deleção
	DELETE: 'DELETE',

	// Operações de shell
	SHELL: 'SHELL',
};

class TUIPermissionService {
	#appState = null;
	#pendingPermissionRequest = null;

	/**
	 * Inicializa o serviço com o estado da aplicação
	 * @param {Object} appState - Estado do AppContext (useAppState)
	 */
	initialize(appState) {
		this.#appState = appState;
	}

	/**
	 * Verifica se uma ação é permitida
	 * @param {string} toolName - Nome da ferramenta/ação (CREATE, UPDATE, DELETE, SHELL)
	 * @param {string} details - Detalhes da ação (path do arquivo, comando, etc)
	 * @returns {Promise<boolean>} - true se permitido, false se negado
	 */
	async check(toolName, details) {
		if (!this.#appState) {
			// console.error('TUIPermissionService não foi inicializado com appState');
			return false;
		}

		// Mapear o nome da ferramenta para o tipo de ação
		const action = ACTION_MAP[toolName] || toolName;

		// Verificar se já tem permissão na sessão
		if (this.#appState.sessionPermissions[action]) {
			return true;
		}

		// Solicitar permissão ao usuário
		return new Promise((resolve) => {
			this.#pendingPermissionRequest = {
				action,
				toolName,
				details,
				resolve,
			};
		});
	}

	/**
	 * Retorna a solicitação de permissão pendente
	 * @returns {Object|null} - Objeto com action, toolName, details, resolve
	 */
	getPendingRequest() {
		return this.#pendingPermissionRequest;
	}

	/**
	 * Resolve uma solicitação de permissão pendente
	 * @param {string} response - 'once', 'session', ou 'deny'
	 */
	resolveRequest(response) {
		if (!this.#pendingPermissionRequest) {
			return;
		}

		const { action, resolve } = this.#pendingPermissionRequest;

		if (response === 'session') {
			// Permitir para toda a sessão
			this.#appState.updatePermission(action, true);
			resolve(true);
		} else if (response === 'once') {
			// Permitir apenas desta vez
			resolve(true);
		} else {
			// Negar
			resolve(false);
		}

		this.#pendingPermissionRequest = null;
	}

	/**
	 * Verifica se tem uma solicitação de permissão pendente
	 * @returns {boolean}
	 */
	hasPendingRequest() {
		return this.#pendingPermissionRequest !== null;
	}

	/**
	 * Obtém descrição amigável da ação
	 * @param {string} action - Tipo de ação
	 * @returns {string}
	 */
	getActionDescription(action) {
		const descriptions = {
			READ: 'Leitura de arquivos',
			CREATE: 'Criação de arquivos/diretórios',
			UPDATE: 'Modificação de arquivos',
			DELETE: 'Exclusão de arquivos',
			SHELL: 'Execução de comandos shell',
		};
		return descriptions[action] || action;
	}

	/**
	 * Verifica se uma ação é crítica e requer permissão
	 * @param {string} toolName - Nome da ferramenta
	 * @returns {boolean}
	 */
	isCriticalAction(toolName) {
		const criticalActions = [
			'CREATE',
			'CREATE_WITH_CONTENT',
			'CREATE_DIRECTORY',
			'UPDATE',
			'EDIT_LINES',
			'INSERT_LINES',
			'REPLACE_IN_FILE',
			'APPLY_PATCH',
			'DELETE',
			'MOVE',
			'SHELL',
		];
		return criticalActions.includes(toolName);
	}
}

// Exportar instância singleton
const tuiPermissionService = new TUIPermissionService();
export default tuiPermissionService;
