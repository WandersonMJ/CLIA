import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useAppState } from '../states/AppContext.js';
import { useRouter } from '../hooks/useRouter.js';
import { useAI } from '../hooks/useAI.js';
import MessageBubble from '../components/MessageBubble.js';
import ToolCallDisplay from '../components/ToolCallDisplay.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import StatusBar from '../components/StatusBar.js';
import PermissionDialog from '../components/PermissionDialog.js';
import MainLayout from '../layouts/MainLayout.js';

export const ChatPage = () => {
	const {
		conversationHistory,
		addMessage,
		isLoading,
		config,
		updatePermission,
	} = useAppState();
	const { goBack } = useRouter();
	const { sendPrompt } = useAI();
	const [inputValue, setInputValue] = useState('');
	const [currentToolCalls, setCurrentToolCalls] = useState([]);
	const [pendingPermission, setPendingPermission] = useState(null);
	const abortControllerRef = useRef(null);
	const canceledRef = useRef(false);

	// Memoizar histórico filtrado para evitar re-cálculos
	const displayMessages = useMemo(() =>
		conversationHistory.filter((msg) => msg.role !== 'tool'),
		[conversationHistory]
	);

	// Memoizar renderização de tool calls
	const renderedToolCalls = useMemo(() =>
		currentToolCalls.map((tool, index) => ({
			...tool,
			key: tool.id || `tool-${index}-${tool.name}`,
		})),
		[currentToolCalls]
	);

	// Atalho ESC para cancelar IA ou voltar
	useInput((input, key) => {
		if (key.escape) {
			if (isLoading && abortControllerRef.current && !canceledRef.current) {
				// Se IA está processando, cancelar (apenas uma vez)
				canceledRef.current = true;
				abortControllerRef.current.abort();
				addMessage({
					role: 'system',
					content: '⚠️ Ação da IA cancelada pelo usuário.',
				});
			} else if (!pendingPermission && !isLoading) {
				// Se não está processando e sem permissão pendente, voltar
				goBack();
			}
		}
	}, [isLoading, pendingPermission, addMessage, goBack]);

	const handleToolCall = useCallback((toolCall) => {
		// [CORREÇÃO] Agora onToolCall só é chamado UMA VEZ, já com o resultado.
		// Não precisamos mais da lógica de "atualizar" um item existente.
		// Apenas adicionamos a ferramenta concluída.
		setCurrentToolCalls((prev) => [
			...prev,
			{
				...toolCall,
				// Garantir que o status não seja 'executing' (que vinha da lógica antiga)
				status: toolCall.status || (toolCall.result?.success ? 'success' : 'error'),
			},
		]);
	}, []);

	const handlePermissionRequest = useCallback((action, details) => {
		return new Promise((resolve) => {
			setPendingPermission({
				action,
				details,
				resolve,
			});
		});
	}, []);

	const handlePermissionAllow = useCallback(() => {
		if (pendingPermission) {
			pendingPermission.resolve({ allowed: true, session: false });
			setPendingPermission(null);
		}
	}, [pendingPermission]);

	const handlePermissionAllowSession = useCallback(() => {
		if (pendingPermission) {
			const { action } = pendingPermission;
			// Atualizar permissão da sessão no AppContext
			updatePermission(action, true);
			pendingPermission.resolve({ allowed: true, session: true });
			setPendingPermission(null);
		}
	}, [pendingPermission, updatePermission]);

	const handlePermissionDeny = useCallback(() => {
		if (pendingPermission) {
			pendingPermission.resolve({ allowed: false, session: false });
			setPendingPermission(null);
		}
	}, [pendingPermission]);

	const handleSubmit = useCallback(async () => {
		if (!inputValue.trim()) return;

		// Verificar se está configurado
		if (!config || !config.provider || !config.apiKey) {
			addMessage({
				role: 'system',
				content: 'Erro: IA não configurada. Por favor, configure nas Configurações primeiro.',
			});
			return;
		}

		// Criar AbortController para permitir cancelamento
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		// Adicionar mensagem do usuário
		const userMessage = {
			role: 'user',
			content: inputValue,
		};
		addMessage(userMessage);
		setInputValue('');
		setCurrentToolCalls([]); // Limpar tool calls anteriores
		canceledRef.current = false; // Resetar flag de cancelamento

		try {
			await sendPrompt(inputValue, handleToolCall, handlePermissionRequest, abortController.signal);
		} catch (err) {
			// Ignorar erro se foi abortado propositalmente
			if (err.name !== 'AbortError') {
				addMessage({
					role: 'system',
					content: `Erro: ${err.message}`,
				});
			}
		} finally {
			abortControllerRef.current = null;
			setCurrentToolCalls([]); // Limpar tool calls após processamento
			canceledRef.current = false; // Resetar flag
		}
	}, [inputValue, config, addMessage, sendPrompt, handleToolCall, handlePermissionRequest]);

	const header = useMemo(() => (
		<Box flexDirection="column">
			<Text bold color="cyan">
				💬 Chat com IA
			</Text>
			<Text dimColor>
				Provider: {config?.provider || 'não configurado'} | Model: {config?.model || 'não configurado'}
			</Text>
		</Box>
	), [config?.provider, config?.model]);

	return (
		<MainLayout header={header}>
			<Box flexDirection="column" height="100%">
				{/* Dialog de permissão sobreposto */}
				{pendingPermission && (
					<Box position="absolute" width="100%" justifyContent="center" marginTop={5}>
						<PermissionDialog
							action={pendingPermission.action}
							details={pendingPermission.details}
							onAllow={handlePermissionAllow}
							onAllowSession={handlePermissionAllowSession}
							onDeny={handlePermissionDeny}
						/>
					</Box>
				)}

				{/* Histórico de mensagens */}
				<Box flexDirection="column" flexGrow={1} overflowY="auto">
					{displayMessages.length === 0 ? (
						<Box marginY={2}>
							<Text dimColor>
								Nenhuma mensagem ainda. Digite algo para começar...
							</Text>
						</Box>
					) : (
						displayMessages.map((msg, index) => (
							<MessageBubble key={msg.id || index} role={msg.role} content={msg.content} />
						))
					)}

					{/* Tool calls ativos */}
					{renderedToolCalls.map((tool) => (
						<ToolCallDisplay
							key={tool.key}
							name={tool.name}
							arguments={tool.arguments}
							result={tool.result}
							status={tool.status}
						/>
					))}

					{/* Loading */}
					{isLoading && (
						<Box marginY={1}>
							<LoadingSpinner message="Aguardando resposta da IA..." />
						</Box>
					)}
				</Box>

				{/* Input de mensagem */}
				<Box
					flexDirection="column"
					marginTop={1}
					borderStyle="single"
					borderColor="green"
					paddingX={1}
				>
					<Box>
						<Text color="green">{'> '}</Text>
						<TextInput
							value={inputValue}
							onChange={setInputValue}
							onSubmit={handleSubmit}
							placeholder="Digite sua mensagem..."
							focus={!isLoading && !pendingPermission}
						/>
					</Box>
				</Box>

				{/* Barra de status */}
				<StatusBar
					leftContent={`Chat | Mensagens: ${conversationHistory.length}`}
					rightContent={isLoading ? "ESC: Cancelar IA | Ctrl+C: Sair" : "Enter: Enviar | ESC: Voltar | Ctrl+C: Sair"}
				/>
			</Box>
		</MainLayout>
	);
};

export default ChatPage;