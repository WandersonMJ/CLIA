import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

/**
 * Componente de seleção de opções com navegação por teclado
 * @param {Object} props
 * @param {string} props.label - Label do select
 * @param {Array<{label: string, value: any}>} props.options - Opções disponíveis
 * @param {Function} props.onSelect - Callback quando seleciona opção
 * @param {number} props.initialIndex - Índice inicial selecionado
 */
export const SelectInput = ({ label, options = [], onSelect, initialIndex = 0 }) => {
	const [selectedIndex, setSelectedIndex] = useState(initialIndex);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		}

		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(options.length - 1, prev + 1));
		}

		if (key.return) {
			if (options[selectedIndex]) {
				onSelect(options[selectedIndex].value, selectedIndex);
			}
		}
	});

	return (
		<Box flexDirection="column" marginY={1}>
			{label && (
				<Box marginBottom={1}>
					<Text bold color="cyan">
						{label}
					</Text>
				</Box>
			)}
			<Box flexDirection="column">
				{options.map((option, index) => {
					const isSelected = index === selectedIndex;
					return (
						<Box key={`option-${option.value}`} marginLeft={1}>
							<Text
								color={isSelected ? 'green' : 'white'}
								bold={isSelected}
							>
								{isSelected ? '▶ ' : '  '}
								{option.label}
							</Text>
						</Box>
					);
				})}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>↑↓ para navegar | Enter para selecionar</Text>
			</Box>
		</Box>
	);
};

export default SelectInput;
