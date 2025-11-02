import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

/**
 * Indicador de carregamento
 */
export const LoadingSpinner = ({ message = 'Carregando...' }) => {
	return (
		<Box>
			<Text color="cyan">
				<Spinner type="dots" />
			</Text>
			<Text> {message}</Text>
		</Box>
	);
};

export default LoadingSpinner;
