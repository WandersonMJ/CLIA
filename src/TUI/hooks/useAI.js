import { useCallback } from 'react';
import { useAppState } from '../states/AppContext.js';
import { sendPromptToAI } from '../services/ai-service.js';

/**
 * Hook para interação com IA
 */
export const useAI = () => {
	const {
		conversationHistory,
		addMessage,
		setIsLoading,
		setError,
		sessionPermissions,
	} = useAppState();

	/**
	 * Envia um prompt para a IA
	 * @param {string} message - Mensagem do usuário
	 * @param {Function} onToolCall - Callback para tool calls
	 * @param {Function} onPermissionRequest - Callback para permissões
	 * @param {AbortSignal} signal - Signal para cancelamento
	 */
	const sendPrompt = useCallback(
		async (message, onToolCall = null, onPermissionRequest = null, signal = null) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await sendPromptToAI(
					message,
					conversationHistory,
					onToolCall,
					onPermissionRequest,
					sessionPermissions,
					signal
				);

				// Adicionar resposta ao histórico
				if (response && response.content) {
					addMessage({
						role: 'assistant',
						content: response.content,
					});
				}

				return response;
			} catch (err) {
				setError(err.message);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[conversationHistory, addMessage, setIsLoading, setError, sessionPermissions]
	);

	return {
		sendPrompt,
		conversationHistory,
	};
};

export default useAI;
