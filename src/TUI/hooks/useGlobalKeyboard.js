import { useInput, useApp } from 'ink';
import { useRouter } from './useRouter.js';

/**
 * Hook para atalhos de teclado globais
 */
export const useGlobalKeyboard = () => {
	const { exit } = useApp();
	const { goBack, currentPage } = useRouter();

	useInput((input, key) => {
		// Ctrl+C para sair (handled by Ink automatically, but can add custom logic)
		if (key.ctrl && input === 'c') {
			// Ink já lida com isso, mas podemos adicionar lógica de cleanup se necessário
		}

		// ESC para voltar (apenas se não estiver na home)
		if (key.escape && currentPage !== 'home') {
			goBack();
		}

		// Ctrl+H para ajuda rápida
		if (key.ctrl && input === 'h') {
			// TODO: Mostrar ajuda rápida ou ir para help page
		}
	});
};

export default useGlobalKeyboard;
