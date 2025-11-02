import aiService from '../../services/ai-service.js';
import apiSession from '../../services/api-session.js';
import fsActions from '../../utils/fs-actions.js';
import generateFileTree from '../../utils/file-tree-generator.js';
import { getTools } from '../../agent/api/tools/filesystem-tools.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
	MAX_ITERATIONS,
	OS_PROMPTS_DIR,
	PROMPTS_DIR,
	PERSONAL_CONTEXT,
	TIMEOUT,
	MAX_BUFFER,
} from '../../config/constants.js';

/**
 * Serviço para integração com IA no TUI
 * Versão customizada que suporta callbacks para tool calls e permissões
 */

// Mapeamento de tool names para tipos de ação de permissão
const TOOL_TO_ACTION_MAP = {
	READ: 'READ',
	READ_START: 'READ',
	READ_END: 'READ',
	CREATE: 'CREATE',
	CREATE_WITH_CONTENT: 'CREATE',
	CREATE_DIRECTORY: 'CREATE',
	UPDATE: 'UPDATE',
	EDIT_LINES: 'UPDATE',
	INSERT_LINES: 'UPDATE',
	REPLACE_IN_FILE: 'UPDATE',
	APPLY_PATCH: 'UPDATE',
	MOVE: 'UPDATE',
	DELETE: 'DELETE',
	SHELL: 'SHELL',
};

const CRITICAL_ACTIONS = [
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

function getOsCommands() {
	const os = apiSession.getOS();
	if (!os) return 'Sistema operacional não configurado.';

	try {
		const filePath = path.join(process.cwd(), OS_PROMPTS_DIR, `${os}.json`);
		const fileContent = fs.readFileSync(filePath, 'utf8');
		const commandsData = JSON.parse(fileContent);

		let commandsString = `${PERSONAL_CONTEXT}\n\nComandos disponíveis no shell:\n`;

		for (const category of commandsData.command_categories) {
			commandsString += `\n# ${category.category_name}\n`;
			for (const cmd of category.commands) {
				commandsString += `- \`${cmd.command}\`: ${cmd.description}\n`;
			}
		}

		return commandsString;
	} catch (error) {
		// console.error('Erro ao carregar comandos do OS:', error);
		return 'Erro ao carregar comandos do sistema.';
	}
}

function getSystemPrompt() {
	try {
		const lang = apiSession.getLanguage() || 'en-US';
		const promptFileName = 'system-prompt.md';
		const promptTemplatePath = path.join(
			process.cwd(),
			PROMPTS_DIR,
			lang,
			promptFileName
		);

		let promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');

		const fileTree = generateFileTree('.');
		const fileTreeString = JSON.stringify(fileTree, null, 2);
		const osCommands = getOsCommands();

		promptTemplate = promptTemplate.replace('{{FILE_TREE}}', fileTreeString);
		promptTemplate = promptTemplate.replace('{{OS_COMMANDS}}', osCommands);

		return promptTemplate;
	} catch (error) {
		// console.error('Erro fatal ao carregar system prompt:', error);
		throw new Error('Não foi possível carregar o system prompt.');
	}
}

function executeShellCommand(command) {
	try {
		const output = execSync(command, {
			encoding: 'utf8',
			timeout: TIMEOUT,
			maxBuffer: MAX_BUFFER,
		});
		return {
			success: true,
			content: `Comando executado: ${command}\n\nResultado:\n${output}`,
		};
	} catch (error) {
		return {
			success: false,
			content: `Erro ao executar comando: ${command}\n\nErro: ${error.message}`,
		};
	}
}

function getToolImplementation(toolName) {
	const toolMap = {
		READ: fsActions.readFile,
		READ_START: fsActions.readStartOfFile,
		READ_END: fsActions.readEndOfFile,
		CREATE_DIRECTORY: fsActions.createDirectory,
		CREATE: fsActions.createFile,
		CREATE_WITH_CONTENT: fsActions.createFileWithContent,
		DELETE: fsActions.deleteFile,
		MOVE: fsActions.moveFile,
		EDIT_LINES: fsActions.editLines,
		INSERT_LINES: fsActions.insertLines,
		REPLACE_IN_FILE: fsActions.replaceInFile,
		SHELL: executeShellCommand,
		APPLY_PATCH: fsActions.applyPatchToFile,
		UPDATE: fsActions.updateFile,
	};
	return toolMap[toolName];
}

/**
 * Envia um prompt para a IA e processa a resposta
 * @param {string} userMessage - Mensagem do usuário
 * @param {Array} history - Histórico de conversação
 * @param {Function} onToolCall - Callback quando ferramenta é executada
 * @param {Function} onPermissionRequest - Callback quando permissão é necessária
 * @param {Object} sessionPermissions - Permissões da sessão
 * @param {AbortSignal} signal - Signal para cancelamento
 * @returns {Promise<Object>} Resposta da IA
 */
export async function sendPromptToAI(
	userMessage,
	history = [],
	onToolCall = null,
	onPermissionRequest = null,
	sessionPermissions = null,
	signal = null
) {
	try {
		// Verificar se está configurado
		if (!apiSession.isConfigured()) {
			throw new Error(
				'IA não configurada. Por favor, configure o provider nas configurações.'
			);
		}

		// Construir histórico com system prompt se necessário
		let conversationHistory = [...history];
		if (conversationHistory.length === 0 || conversationHistory[0].role !== 'system') {
			conversationHistory = [
				{ role: 'system', content: getSystemPrompt() },
				...conversationHistory,
			];
		}

		// Adicionar mensagem do usuário
		conversationHistory.push({ role: 'user', content: userMessage });

		const isEconomy = apiSession.isEconomyMode();
		const availableTools = getTools(isEconomy);

		let iterationCount = 0;

		while (iterationCount < MAX_ITERATIONS) {
			// Verificar se foi solicitado cancelamento
			if (signal && signal.aborted) {
				throw new Error('Operação cancelada pelo usuário.');
			}

			iterationCount++;

			// Enviar prompt para IA
			const aiMessage = await aiService.sendPrompt(conversationHistory, availableTools);
			conversationHistory.push(aiMessage);

			// Se não tem tool calls, retornar resposta
			if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
				return {
					content: aiMessage.content,
					history: conversationHistory,
				};
			}

			// Processar tool calls
			for (const toolCall of aiMessage.tool_calls) {
				// Verificar cancelamento antes de cada tool call
				if (signal && signal.aborted) {
					throw new Error('Operação cancelada pelo usuário.');
				}

				const toolName = toolCall.function.name;
				const toolArgs = JSON.parse(toolCall.function.arguments);

				// [CORREÇÃO] Notificação removida daqui.
				// if (onToolCall) {
				// 	onToolCall({
				// 		name: toolName,
				// 		arguments: toolArgs,
				// 		id: toolCall.id,
				// 	});
				// }

				// Verificar se é ação crítica e precisa de permissão
				if (CRITICAL_ACTIONS.includes(toolName)) {
					const action = TOOL_TO_ACTION_MAP[toolName];
					const hasPermission =
						sessionPermissions && sessionPermissions[action] === true;

					if (!hasPermission && onPermissionRequest) {
						// Solicitar permissão
						const argDetails =
							toolArgs.filePath || toolArgs.sourcePath || toolArgs.command || 'ação';

						const permissionResult = await onPermissionRequest(action, argDetails);

						if (!permissionResult || !permissionResult.allowed) {
							// Permissão negada
							conversationHistory.push({
								role: 'tool',
								tool_call_id: toolCall.id,
								name: toolName,
								content: JSON.stringify({
									success: false,
									content: `[PERMISSÃO NEGADA] O usuário negou a permissão para executar: ${toolName} ${argDetails}`,
								}),
							});
							continue;
						}
					}
				}

				// Executar a ferramenta
				const toolFunction = getToolImplementation(toolName);
				if (!toolFunction) {
					conversationHistory.push({
						role: 'tool',
						tool_call_id: toolCall.id,
						name: toolName,
						content: JSON.stringify({
							success: false,
							content: `Ferramenta '${toolName}' não encontrada.`,
						}),
					});
					continue;
				}

				let toolResult;
				try {
					const args = Object.values(toolArgs);
					toolResult = await toolFunction(...args);
				} catch (error) {
					toolResult = {
						success: false,
						content: `Erro ao executar ferramenta: ${error.message}`,
					};
				}

				// Adicionar resultado ao histórico
				conversationHistory.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					name: toolName,
					content: JSON.stringify(toolResult),
				});

				// [CORREÇÃO] Notificar sobre resultado (APENAS AQUI)
				if (onToolCall) {
					onToolCall({
						name: toolName,
						arguments: toolArgs,
						id: toolCall.id,
						result: toolResult,
						status: toolResult.success ? 'success' : 'error',
					});
				}
			}

			// Continuar o loop para próxima iteração
		}

		// Limite de iterações atingido
		return {
			content:
				'Limite de iterações atingido. A IA não conseguiu completar a tarefa.',
			history: conversationHistory,
		};
	} catch (error) {
		// console.error('Erro ao enviar prompt para IA:', error);
		throw error;
	}
}

/**
 * Inicializa o cliente de IA com as credenciais configuradas
 */
export function initializeAIClient() {
	const provider = apiSession.getProvider();
	const credentials = apiSession.getCredentials();

	if (!provider || !credentials) {
		return false;
	}

	// A inicialização já é feita pelo apiSession.configure
	return true;
}

export default {
	sendPromptToAI,
	initializeAIClient,
};