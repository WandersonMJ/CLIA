import React, { createContext, useContext, useState, useCallback } from 'react';
import configService from '../../services/config-service.js';
const { readConfig } = configService;
import apiSession from '../../services/api-session.js';

// Criar o contexto
const AppContext = createContext(null);

// Provider do contexto
export const AppProvider = ({ children }) => {
	const [currentPage, setCurrentPage] = useState('home');
	const [config, setConfig] = useState(null);
	const [conversationHistory, setConversationHistory] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [sessionPermissions, setSessionPermissions] = useState({
		READ: true,
		CREATE: false,
		UPDATE: false,
		DELETE: false,
		SHELL: false,
	});

	// Carregar configuração ao iniciar
	const loadConfig = useCallback(async () => {
		try {
			const savedConfig = await readConfig();
			if (savedConfig) {
				setConfig(savedConfig);

				// Sincronizar com api-session
				if (savedConfig.language) {
					apiSession.setLanguage(savedConfig.language);
				}
				if (savedConfig.os) {
					apiSession.setOS(savedConfig.os);
				}
				if (savedConfig.economyMode !== undefined) {
					apiSession.setEconomyMode(savedConfig.economyMode);
				}
				if (savedConfig.provider && savedConfig.credentials) {
					apiSession.configure(savedConfig.provider, savedConfig.credentials);
				}
			}
			return savedConfig;
		} catch (err) {
			setError(err.message);
			return null;
		}
	}, []);

	// Atualizar configuração
	const updateConfig = useCallback((newConfig) => {
		setConfig(newConfig);
	}, []);

	// Navegar entre páginas
	const navigate = useCallback((page) => {
		setCurrentPage(page);
		setError(null); // Limpar erros ao navegar
	}, []);

	// Adicionar mensagem ao histórico com ID único
	const addMessage = useCallback((message) => {
		const messageWithId = {
			...message,
			id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		};
		setConversationHistory(prev => [...prev, messageWithId]);
	}, []);

	// Limpar histórico
	const clearHistory = useCallback(() => {
		setConversationHistory([]);
	}, []);

	// Atualizar permissões
	const updatePermission = useCallback((action, allowed) => {
		setSessionPermissions(prev => ({
			...prev,
			[action]: allowed,
		}));
	}, []);

	// Resetar permissões
	const resetPermissions = useCallback(() => {
		setSessionPermissions({
			READ: true,
			CREATE: false,
			UPDATE: false,
			DELETE: false,
			SHELL: false,
		});
	}, []);

	const value = {
		// Estado
		currentPage,
		config,
		conversationHistory,
		isLoading,
		error,
		sessionPermissions,

		// Ações
		navigate,
		loadConfig,
		updateConfig,
		addMessage,
		clearHistory,
		setIsLoading,
		setError,
		updatePermission,
		resetPermissions,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook para usar o contexto
export const useAppState = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppState deve ser usado dentro de AppProvider');
	}
	return context;
};

export default AppContext;
