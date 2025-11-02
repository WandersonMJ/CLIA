import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

/**
 * Campo de input com label
 */
export const InputField = ({ label, value, onChange, placeholder, focus = true }) => {
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
					placeholder={placeholder}
					focus={focus}
				/>
			</Box>
		</Box>
	);
};

export default InputField;
