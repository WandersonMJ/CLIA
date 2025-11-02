import React from 'react';
import { Box, Text } from 'ink';

/**
 * Card para exibir comandos disponíveis
 */
export default function CommandCard({ title, description, icon }) {
	return (
		<Box
			flexDirection="column"
			marginY={1}
			paddingX={2}
			paddingY={1}
			borderStyle="round"
			borderColor="cyan"
		>
			<Box marginBottom={1}>
				<Text bold color="cyan">
					{icon && `${icon} `}
					{title}
				</Text>
			</Box>
			<Box>
				<Text dimColor>{description}</Text>
			</Box>
		</Box>
	);
}
