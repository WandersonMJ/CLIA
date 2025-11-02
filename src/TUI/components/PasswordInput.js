import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

/**
 * Input para senhas/API keys (mascarado)
 */
export const PasswordInput = ({
	label,
	value,
	onChange,
	onSubmit,
	placeholder,
	focus = true,
}) => {
	return (
		<Box flexDirection="column" marginY={1}>
			{label && (
				<Box marginBottom={1}>
					<Text bold color="cyan">
						{label}
					</Text>
				</Box>
			)}
			<Box>
				<Text color="gray">{'> '}</Text>
				<TextInput
					value={value}
					onChange={onChange}
					onSubmit={onSubmit}
					placeholder={placeholder}
					focus={focus}
					mask="*"
				/>
			</Box>
		</Box>
	);
};

export default PasswordInput;
