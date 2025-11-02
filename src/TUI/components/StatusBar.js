import React from 'react';
import { Box, Text } from 'ink';

/**
 * Barra de status no rodapé
 */
export const StatusBar = ({ leftContent, centerContent, rightContent }) => {
	return (
		<Box
			width="100%"
			justifyContent="space-between"
			borderStyle="single"
			borderColor="gray"
			paddingX={1}
		>
			<Box>
				<Text dimColor>{leftContent}</Text>
			</Box>
			{centerContent && (
				<Box>
					<Text dimColor>{centerContent}</Text>
				</Box>
			)}
			<Box>
				<Text dimColor>{rightContent || 'ESC: Voltar | Ctrl+C: Sair'}</Text>
			</Box>
		</Box>
	);
};

export default StatusBar;
