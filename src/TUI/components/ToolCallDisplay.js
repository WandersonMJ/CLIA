import React from 'react';
import { Box, Text } from 'ink';

/**
 * Exibe uma ferramenta sendo executada pela IA
 * @param {Object} props
 * @param {string} props.name - Nome da ferramenta (READ, CREATE, etc)
 * @param {Object} props.arguments - Argumentos da ferramenta
 * @param {string} props.result - Resultado da execução (opcional)
 * @param {string} props.status - 'pending' | 'executing' | 'success' | 'error'
 */
export const ToolCallDisplay = ({ name, arguments: args, result, status = 'pending' }) => {
	const statusColors = {
		pending: 'yellow',
		executing: 'blue',
		success: 'green',
		error: 'red',
	};

	const statusIcons = {
		pending: '⏳',
		executing: '⚙️',
		success: '✓',
		error: '✗',
	};

	return (
		<Box
			flexDirection="column"
			marginY={1}
			borderStyle="single"
			borderColor={statusColors[status]}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text color={statusColors[status]} bold>
					{statusIcons[status]} Ferramenta: {name}
				</Text>
			</Box>

			{args && Object.keys(args).length > 0 && (
				<Box flexDirection="column" marginBottom={1}>
					<Text dimColor>Argumentos:</Text>
					{Object.entries(args).map(([key, value]) => (
						<Box key={key} marginLeft={2}>
							<Text color="gray">
								{key}: {JSON.stringify(value)}
							</Text>
						</Box>
					))}
				</Box>
			)}

			{result && (
				<Box flexDirection="column">
					<Text dimColor>Resultado:</Text>
					<Box marginLeft={2}>
						<Text>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
};

// Correção: Envolve o componente com React.memo
export default React.memo(ToolCallDisplay);