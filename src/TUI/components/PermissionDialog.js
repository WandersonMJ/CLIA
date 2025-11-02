import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

/**
 * Dialog para solicitar permissão de ações críticas
 * @param {Object} props
 * @param {string} props.action - Nome da ação (CREATE, UPDATE, DELETE, etc)
 * @param {Object} props.details - Detalhes da ação (path, content, etc)
 * @param {Function} props.onAllow - Callback quando permitir
 * @param {Function} props.onAllowSession - Callback quando permitir para sessão
 * @param {Function} props.onDeny - Callback quando negar
 */
export const PermissionDialog = ({ action, details, onAllow, onAllowSession, onDeny }) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const options = [
		{ label: 'Permitir uma vez', value: 'once', color: 'yellow' },
		{ label: 'Permitir para esta sessão', value: 'session', color: 'green' },
		{ label: 'Negar', value: 'deny', color: 'red' },
	];

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		}

		if (key.downArrow) {
			setSelectedIndex(prev => Math.min(options.length - 1, prev + 1));
		}

		if (key.return) {
			const selected = options[selectedIndex].value;
			if (selected === 'once') {
				onAllow();
			} else if (selected === 'session') {
				onAllowSession();
			} else if (selected === 'deny') {
				onDeny();
			}
		}

		// Atalhos
		if (input === '1') onAllow();
		if (input === '2') onAllowSession();
		if (input === '3') onDeny();
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="double"
			borderColor="red"
			paddingX={2}
			paddingY={1}
		>
			<Box marginBottom={1}>
				<Text bold color="red">
					⚠️  PERMISSÃO NECESSÁRIA
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={1}>
				<Text>
					<Text bold color="yellow">
						Ação:
					</Text>{' '}
					{action}
				</Text>

				{details && (
					<Box flexDirection="column" marginLeft={2} marginTop={1}>
						{Object.entries(details).map(([key, value]) => (
							<Text key={key}>
								<Text color="cyan">{key}:</Text> {JSON.stringify(value).substring(0, 100)}
								{JSON.stringify(value).length > 100 && '...'}
							</Text>
						))}
					</Box>
				)}
			</Box>

			<Box flexDirection="column">
				<Text dimColor marginBottom={1}>
					Selecione uma opção:
				</Text>
				{options.map((option, index) => (
					<Box key={`perm-${option.value}`}>
						<Text color={selectedIndex === index ? option.color : 'gray'} bold={selectedIndex === index}>
							{selectedIndex === index ? '▶ ' : '  '}
							[{index + 1}] {option.label}
						</Text>
					</Box>
				))}
			</Box>

			<Box marginTop={1}>
				<Text dimColor>↑↓: Navegar | Enter ou 1/2/3: Selecionar</Text>
			</Box>
		</Box>
	);
};

export default PermissionDialog;
