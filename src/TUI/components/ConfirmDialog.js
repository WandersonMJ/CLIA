import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

/**
 * Dialog de confirmação (Yes/No)
 */
export const ConfirmDialog = ({ message, onConfirm, onCancel, defaultYes = true }) => {
	const [selected, setSelected] = useState(defaultYes ? 'yes' : 'no');

	useInput((input, key) => {
		if (key.leftArrow || key.rightArrow) {
			setSelected(prev => (prev === 'yes' ? 'no' : 'yes'));
		}

		if (key.return) {
			if (selected === 'yes') {
				onConfirm();
			} else {
				onCancel();
			}
		}

		if (input === 'y' || input === 'Y') {
			onConfirm();
		}

		if (input === 'n' || input === 'N') {
			onCancel();
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="yellow"
			paddingX={2}
			paddingY={1}
		>
			<Box marginBottom={1}>
				<Text>{message}</Text>
			</Box>
			<Box>
				<Text
					color={selected === 'yes' ? 'green' : 'gray'}
					bold={selected === 'yes'}
				>
					{selected === 'yes' ? '▶ ' : '  '}
					Yes (Y)
				</Text>
				<Text>  </Text>
				<Text
					color={selected === 'no' ? 'red' : 'gray'}
					bold={selected === 'no'}
				>
					{selected === 'no' ? '▶ ' : '  '}
					No (N)
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>←→ para navegar | Enter, Y ou N para confirmar</Text>
			</Box>
		</Box>
	);
};

export default ConfirmDialog;
