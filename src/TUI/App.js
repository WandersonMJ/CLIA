import React, { useEffect } from 'react';
import { Box } from 'ink';
import { AppProvider, useAppState } from './states/AppContext.js';
import HomePage from './pages/HomePage.js';
import ChatPage from './pages/ChatPage.js';
import ConfigPage from './pages/ConfigPage.js';
import ScrapPage from './pages/ScrapPage.js';
import HelpPage from './pages/HelpPage.js';

/**
 * Componente Router que renderiza a página atual
 */
const Router = () => {
	const { currentPage } = useAppState();

	switch (currentPage) {
		case 'home':
			return <HomePage />;
		case 'chat':
			return <ChatPage />;
		case 'config':
			return <ConfigPage />;
		case 'scrap':
			return <ScrapPage />;
		case 'help':
			return <HelpPage />;
		default:
			return <HomePage />;
	}
};

/**
 * Componente principal que inicializa estado e config
 */
const AppContent = () => {
	const { loadConfig } = useAppState();

	useEffect(() => {
		// Carregar configuração salva ao iniciar
		loadConfig();
	}, [loadConfig]);

	return (
		<Box flexDirection="column">
			<Router />
		</Box>
	);
};

/**
 * App principal com Provider
 */
export const App = () => {
	return (
		<AppProvider>
			<AppContent />
		</AppProvider>
	);
};

export default App;
