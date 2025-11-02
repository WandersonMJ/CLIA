import React from 'react';
import { Box, Text } from 'ink';

/**
 * Bolha de mensagem para exibir conversas
 * @param {Object} props
 * @param {string} props.role - 'user' | 'assistant' | 'system'
 * @param {string} props.content - Conteúdo da mensagem
 */
export const MessageBubble = ({ role, content }) => {
	const isUser = role === 'user';
	const isAssistant = role === 'assistant';
	const isSystem = role === 'system';

	const colors = {
		user: 'green',
		assistant: 'cyan',
		system: 'yellow',
	};

	const labels = {
		user: 'Você',
		assistant: 'IA',
		system: 'Sistema',
	};

	const borderColors = {
		user: 'green',
		assistant: 'cyan',
		system: 'yellow',
	};

	// Garantir que content é sempre uma string
	const displayContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

	return (
		<Box
			flexDirection="column"
			marginY={1}
			borderStyle="round"
			borderColor={borderColors[role]}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text bold color={colors[role]}>
					{labels[role]}
				</Text>
			</Box>
			<Box>
				<Text>{displayContent}</Text>
			</Box>
		</Box>
	);
};

export default MessageBubble;
