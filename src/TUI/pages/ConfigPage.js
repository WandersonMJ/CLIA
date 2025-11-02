import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppState } from '../states/AppContext.js';
import { useRouter } from '../hooks/useRouter.js';
import MainLayout from '../layouts/MainLayout.js';
import StatusBar from '../components/StatusBar.js';
import SelectInput from '../components/SelectInput.js';
import InputField from '../components/InputField.js';
import PasswordInput from '../components/PasswordInput.js';
import configService from '../../services/config-service.js';
const { writeConfig } = configService;
import apiSession from '../../services/api-session.js';
import { initializeAIClient } from '../../init-client.js';

export const ConfigPage = () => {
	const { config, updateConfig, loadConfig } = useAppState();
	const { goBack } = useRouter();
	const [step, setStep] = useState('menu'); // menu, language, os, economy, provider, model, apiKey
	const [tempConfig, setTempConfig] = useState(config || {});
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		if (!config) {
			loadConfig();
		}
	}, [config, loadConfig]);

	useInput((input, key) => {
		if (key.escape && step === 'menu') {
			goBack();
		}
	});

	const handleLanguageSelect = (value) => {
		setTempConfig({ ...tempConfig, language: value });
		apiSession.setLanguage(value);
		setStep('menu');
	};

	const handleOSSelect = (value) => {
		setTempConfig({ ...tempConfig, os: value });
		apiSession.setOS(value);
		setStep('menu');
	};

	const handleEconomySelect = (value) => {
		setTempConfig({ ...tempConfig, economyMode: value === 'on' });
		apiSession.setEconomyMode(value === 'on');
		setStep('menu');
	};

	const handleProviderSelect = (value) => {
		setTempConfig({ ...tempConfig, provider: value });
		setStep('model');
	};

	const handleModelSelect = (value) => {
		setTempConfig({ ...tempConfig, model: value });
		setStep('apiKey');
	};

	const handleSave = async () => {
		try {
			// Preparar estrutura de configuração para salvar
			const configToSave = {
				language: tempConfig.language,
				os: tempConfig.os,
				economyMode: tempConfig.economyMode,
				provider: tempConfig.provider,
				model: tempConfig.model,
				apiKey: tempConfig.apiKey,
				credentials: tempConfig.credentials || {},
			};

			// Atualizar credentials do provider atual
			if (tempConfig.provider && tempConfig.apiKey && tempConfig.model) {
				configToSave.credentials[tempConfig.provider] = {
					apiKey: tempConfig.apiKey,
					model: tempConfig.model,
				};
			}

			// Salvar no arquivo
			await writeConfig(configToSave);

			// Atualizar contexto
			updateConfig(configToSave);

			// Configurar sessão
			if (tempConfig.provider && tempConfig.apiKey && tempConfig.model) {
				apiSession.configure(tempConfig.provider, {
					apiKey: tempConfig.apiKey,
					model: tempConfig.model,
				});

				// IMPORTANTE: Reinicializar o cliente de IA com as novas credenciais
				initializeAIClient(tempConfig.provider, {
					apiKey: tempConfig.apiKey,
					model: tempConfig.model,
				});
			}

			goBack();
		} catch (err) {
			// console.error('Erro ao salvar configuração:', err);
		}
	};

	const header = (
		<Box flexDirection="column">
			<Text bold color="yellow">
				⚙️  Configurações
			</Text>
			<Text dimColor>Configure idioma, provider de IA e outras opções</Text>
		</Box>
	);

	// Menu principal
	if (step === 'menu') {
		const menuOptions = [
			{ label: `Idioma: ${tempConfig.language || 'não configurado'}`, value: 'language' },
			{
				label: `Sistema Operacional: ${tempConfig.os || 'não configurado'}`,
				value: 'os',
			},
			{
				label: `Modo Economia: ${tempConfig.economyMode ? 'ativado' : 'desativado'}`,
				value: 'economy',
			},
			{
				label: `Provider de IA: ${tempConfig.provider || 'não configurado'}`,
				value: 'provider',
			},
			{ label: 'Salvar e Voltar', value: 'save' },
			{ label: 'Voltar sem Salvar', value: 'back' },
		];

		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label="Selecione uma opção:"
						options={menuOptions}
						onSelect={(value) => {
							if (value === 'save') {
								handleSave();
							} else if (value === 'back') {
								goBack();
							} else {
								setStep(value);
							}
						}}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar | ESC: Voltar" />
				</Box>
			</MainLayout>
		);
	}

	// Seleção de idioma
	if (step === 'language') {
		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label="Selecione o idioma:"
						options={[
							{ label: 'English (en-US)', value: 'en-US' },
							{ label: 'Português Brasil (pt-BR)', value: 'pt-BR' },
						]}
						onSelect={handleLanguageSelect}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar" />
				</Box>
			</MainLayout>
		);
	}

	// Seleção de OS
	if (step === 'os') {
		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label="Selecione o sistema operacional:"
						options={[
							{ label: 'Linux', value: 'linux' },
							{ label: 'Windows', value: 'windows' },
						]}
						onSelect={handleOSSelect}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar" />
				</Box>
			</MainLayout>
		);
	}

	// Modo economia
	if (step === 'economy') {
		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label="Modo Economia (reduz consumo de tokens):"
						options={[
							{ label: 'Ativado', value: 'on' },
							{ label: 'Desativado', value: 'off' },
						]}
						onSelect={handleEconomySelect}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar" />
				</Box>
			</MainLayout>
		);
	}

	// Seleção de provider
	if (step === 'provider') {
		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label="Selecione o provider de IA:"
						options={[
							{ label: 'OpenAI (GPT)', value: 'openai' },
							{ label: 'Google Gemini', value: 'gemini' },
							{ label: 'Anthropic Claude', value: 'claude' },
						]}
						onSelect={handleProviderSelect}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar" />
				</Box>
			</MainLayout>
		);
	}

	// Seleção de modelo
	if (step === 'model') {
		let modelOptions = [];

		if (tempConfig.provider === 'openai') {
			modelOptions = [
				{ label: 'GPT-4o', value: 'gpt-4o' },
				{ label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
				{ label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
			];
		} else if (tempConfig.provider === 'gemini') {
			modelOptions = [
				{ label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
				{ label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
			];
		} else if (tempConfig.provider === 'claude') {
			modelOptions = [
				{ label: 'Claude Sonnet 4.5', value: 'claude-sonnet-4.5-20250929' },
				{ label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' },
				{ label: 'Claude Haiku 4.5', value: 'claude-4.5-haiku-20250815' },
			];
		}

		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<SelectInput
						label={`Selecione o modelo (${tempConfig.provider}):`}
						options={modelOptions}
						onSelect={handleModelSelect}
					/>
					<StatusBar rightContent="↑↓: Navegar | Enter: Selecionar" />
				</Box>
			</MainLayout>
		);
	}

	// Input de API Key
	if (step === 'apiKey') {
		const handleApiKeySubmit = () => {
			if (inputValue.trim()) {
				setTempConfig({ ...tempConfig, apiKey: inputValue });
				setInputValue('');
				setStep('menu');
			}
		};

		return (
			<MainLayout header={header}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>
							Digite a API Key para <Text bold color="cyan">{tempConfig.provider}</Text>:
						</Text>
					</Box>
					<PasswordInput
						value={inputValue}
						onChange={setInputValue}
						onSubmit={handleApiKeySubmit}
						placeholder="sk-..."
					/>
					<Box marginTop={1}>
						<Text dimColor>Pressione Enter para confirmar</Text>
					</Box>
					{inputValue && (
						<Box marginTop={1}>
							<Text color="green">✓ Chave digitada, pressione Enter para continuar</Text>
						</Box>
					)}
					<StatusBar rightContent="Enter: Confirmar | ESC: Cancelar" />
				</Box>
			</MainLayout>
		);
	}

	return null;
};

export default ConfigPage;
