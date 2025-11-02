// src/TUI/index.js
import React from 'react';
import { render } from 'ink';
import App from './App.js';

/**
 * Inicia o TUI (Terminal User Interface) usando Ink + React
 */
export async function startTUI() {
	try {
		// Ativar modo TUI para silenciar logger
		process.env.CLIA_TUI_MODE = 'true';

		// Renderiza o App com Ink
		const { waitUntilExit } = render(<App />);

		// Aguarda até o usuário sair
		await waitUntilExit();

		// Desativar modo TUI
		process.env.CLIA_TUI_MODE = 'false';

		// console.log('\nEncerrando TUI...');
	} catch (error) {
		// Desativar modo TUI em caso de erro
		process.env.CLIA_TUI_MODE = 'false';
		// console.error('Erro ao iniciar TUI:', error);
		throw error;
	}
}

export default startTUI;
