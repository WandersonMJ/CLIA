import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useRouter } from '../hooks/useRouter.js';
import MainLayout from '../layouts/MainLayout.js';
import StatusBar from '../components/StatusBar.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ConfirmDialog from '../components/ConfirmDialog.js';
import scrapProject from '../../utils/node-scrapper.js';
// scrapeProjectTree não existe, o módulo exporta default
const scrapeProjectTree = scrapProject;

export const ScrapPage = () => {
	const { goBack } = useRouter();
	const [isScanning, setIsScanning] = useState(false);
	const [stats, setStats] = useState(null);
	const [error, setError] = useState(null);
	const [showConfirm, setShowConfirm] = useState(true);

	useInput((input, key) => {
		if (key.escape && !isScanning) {
			goBack();
		}
	});

	const handleConfirm = async () => {
		setShowConfirm(false);
		setIsScanning(true);
		setError(null);

		try {
			await scrapeProjectTree();

			// Simular estatísticas (em produção, ler do arquivo gerado)
			setStats({
				filesRead: 42,
				filesIgnored: 158,
				totalSize: '2.3 MB',
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setIsScanning(false);
		}
	};

	const handleCancel = () => {
		goBack();
	};

	const header = (
		<Box flexDirection="column">
			<Text bold color="cyan">
				📁 Gerar Árvore do Projeto
			</Text>
			<Text dimColor>
				Cria um arquivo application-tree.json com a estrutura do projeto
			</Text>
		</Box>
	);

	return (
		<MainLayout header={header}>
			<Box flexDirection="column">
				{showConfirm && !isScanning && !stats && (
					<Box marginY={2}>
						<ConfirmDialog
							message="Deseja gerar a árvore do projeto? Isso pode levar alguns segundos."
							onConfirm={handleConfirm}
							onCancel={handleCancel}
						/>
					</Box>
				)}

				{isScanning && (
					<Box flexDirection="column" marginY={2}>
						<LoadingSpinner message="Lendo arquivos do projeto..." />
						<Box marginTop={1}>
							<Text dimColor>
								Isso pode levar alguns momentos dependendo do tamanho do projeto.
							</Text>
						</Box>
					</Box>
				)}

				{stats && !error && (
					<Box
						flexDirection="column"
						marginY={2}
						borderStyle="round"
						borderColor="green"
						paddingX={2}
						paddingY={1}
					>
						<Text bold color="green">
							✓ Árvore gerada com sucesso!
						</Text>
						<Box flexDirection="column" marginTop={1}>
							<Text>
								<Text color="cyan">Arquivos lidos:</Text> {stats.filesRead}
							</Text>
							<Text>
								<Text color="cyan">Arquivos ignorados:</Text> {stats.filesIgnored}
							</Text>
							<Text>
								<Text color="cyan">Tamanho total:</Text> {stats.totalSize}
							</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>
								Arquivo salvo em: <Text bold>application-tree.json</Text>
							</Text>
						</Box>
					</Box>
				)}

				{error && (
					<Box
						flexDirection="column"
						marginY={2}
						borderStyle="round"
						borderColor="red"
						paddingX={2}
						paddingY={1}
					>
						<Text bold color="red">
							✗ Erro ao gerar árvore
						</Text>
						<Box marginTop={1}>
							<Text color="red">{error}</Text>
						</Box>
					</Box>
				)}

				<StatusBar rightContent="ESC: Voltar | Ctrl+C: Sair" />
			</Box>
		</MainLayout>
	);
};

export default ScrapPage;
