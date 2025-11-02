import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { useRouter } from '../hooks/useRouter.js';
import MainLayout from '../layouts/MainLayout.js';
import SelectInput from '../components/SelectInput.js';
import StatusBar from '../components/StatusBar.js';
import BigText from 'ink-big-text';

export const HomePage = () => {
	const { goToChat, goToConfig, goToScrap, goToHelp } = useRouter();
	const { exit } = useApp();

	const commands = [
		{ label: '💬 Chat - Conversar com IA', value: 'chat' },
		{ label: '📁 Scrap - Gerar árvore do projeto', value: 'scrap' },
		{ label: '⚙️  Config - Configurações', value: 'config' },
		{ label: '❓ Help - Ajuda', value: 'help' },
		{ label: '🚪 Exit - Sair', value: 'exit' },
	];

	const handleSelect = (value) => {
		switch (value) {
			case 'chat':
				goToChat();
				break;
			case 'scrap':
				goToScrap();
				break;
			case 'config':
				goToConfig();
				break;
			case 'help':
				goToHelp();
				break;
			case 'exit':
				exit();
				break;
			default:
				break;
		}
	};

	const header = (
		<Box flexDirection="column" alignItems="center">
			<BigText text="CLIA" font="tiny" colors={['cyan', 'blue']} />
			<Text dimColor>Copiloto de IA CLI Autônomo</Text>
		</Box>
	);

	return (
		<MainLayout header={header}>
			<Box flexDirection="column">
				<Box marginY={1}>
					<Text bold color="yellow">
						Bem-vindo! Selecione uma opção:
					</Text>
				</Box>

				<SelectInput
					options={commands}
					onSelect={handleSelect}
				/>

				<StatusBar
					leftContent="v1.0.0"
					rightContent="↑↓: Navegar | Enter: Selecionar | Ctrl+C: Sair"
				/>
			</Box>
		</MainLayout>
	);
};

export default HomePage;
