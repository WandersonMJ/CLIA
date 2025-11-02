import { useCallback, useMemo } from 'react';
import { useAppState } from '../states/AppContext.js';

/**
 * Hook para navegação entre páginas do TUI
 */
export const useRouter = () => {
	const { currentPage, navigate } = useAppState();

	// Navegação para páginas específicas
	const goToHome = useCallback(() => navigate('home'), [navigate]);
	const goToChat = useCallback(() => navigate('chat'), [navigate]);
	const goToConfig = useCallback(() => navigate('config'), [navigate]);
	const goToScrap = useCallback(() => navigate('scrap'), [navigate]);
	const goToHelp = useCallback(() => navigate('help'), [navigate]);

	// Histórico de navegação (simples, sem stack por enquanto)
	const goBack = useCallback(() => {
		// Por padrão, voltar sempre para home
		navigate('home');
	}, [navigate]);

	// Verificações
	const isHome = useMemo(() => currentPage === 'home', [currentPage]);
	const isChat = useMemo(() => currentPage === 'chat', [currentPage]);
	const isConfig = useMemo(() => currentPage === 'config', [currentPage]);
	const isScrap = useMemo(() => currentPage === 'scrap', [currentPage]);
	const isHelp = useMemo(() => currentPage === 'help', [currentPage]);

	return {
		// Estado atual
		currentPage,

		// Navegação
		navigate,
		goToHome,
		goToChat,
		goToConfig,
		goToScrap,
		goToHelp,
		goBack,

		// Verificações
		isHome,
		isChat,
		isConfig,
		isScrap,
		isHelp,
	};
};

export default useRouter;
