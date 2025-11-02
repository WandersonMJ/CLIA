import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useRouter } from '../hooks/useRouter.js';
import MainLayout from '../layouts/MainLayout.js';
import StatusBar from '../components/StatusBar.js';

export const HelpPage = () => {
	const { goBack } = useRouter();

	useInput((input, key) => {
		if (key.escape) {
			goBack();
		}
	});

	const commands = [
		{ name: 'scrap', description: 'Gerar árvore do projeto (application-tree.json)' },
		{ name: 'config', description: 'Abrir fluxo de configuração' },
		{ name: 'chat', description: 'Iniciar conversa com IA' },
		{ name: 'help', description: 'Exibir esta ajuda' },
		{ name: 'exit / sair', description: 'Sair da aplicação' },
	];

	const shortcuts = [
		{ key: 'ESC', description: 'Voltar para página anterior' },
		{ key: 'Ctrl+C', description: 'Sair da aplicação' },
		{ key: '↑↓', description: 'Navegar em listas' },
		{ key: 'Enter', description: 'Confirmar/Enviar' },
		{ key: 'Tab', description: 'Alternar foco (quando disponível)' },
	];

	const header = (
		<Box flexDirection="column">
			<Text bold color="cyan">
				❓ Ajuda - Comandos Disponíveis
			</Text>
		</Box>
	);

	return (
		<MainLayout header={header}>
			<Box flexDirection="column">
				{/* Comandos */}
				<Box flexDirection="column" marginY={1}>
					<Text bold color="yellow">
						📋 Comandos:
					</Text>
					<Box flexDirection="column" marginLeft={2} marginTop={1}>
						{commands.map((cmd, index) => (
							<Box key={`cmd-${cmd.name}`} marginY={0}>
								<Text color="green" bold>
									{cmd.name.padEnd(20)}
								</Text>
								<Text dimColor>{cmd.description}</Text>
							</Box>
						))}
					</Box>
				</Box>

				{/* Atalhos de teclado */}
				<Box flexDirection="column" marginY={1}>
					<Text bold color="yellow">
						⌨️  Atalhos de Teclado:
					</Text>
					<Box flexDirection="column" marginLeft={2} marginTop={1}>
						{shortcuts.map((shortcut, index) => (
							<Box key={`shortcut-${shortcut.key}`} marginY={0}>
								<Text color="cyan" bold>
									{shortcut.key.padEnd(20)}
								</Text>
								<Text dimColor>{shortcut.description}</Text>
							</Box>
						))}
					</Box>
				</Box>

				{/* Informações adicionais */}
				<Box flexDirection="column" marginY={1}>
					<Text bold color="yellow">
						ℹ️  Informações:
					</Text>
					<Box flexDirection="column" marginLeft={2} marginTop={1}>
						<Text dimColor>
							• CLIA é um copiloto de IA CLI autônomo
						</Text>
						<Text dimColor>
							• Suporta Gemini, OpenAI e Claude
						</Text>
						<Text dimColor>
							• Permite execução de ações no filesystem com segurança
						</Text>
						<Text dimColor>
							• Modo economia disponível para reduzir consumo de tokens
						</Text>
					</Box>
				</Box>

				<StatusBar rightContent="ESC: Voltar | Ctrl+C: Sair" />
			</Box>
		</MainLayout>
	);
};

export default HelpPage;
