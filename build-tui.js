// build-tui.js
// Script para compilar o TUI (JSX -> JS) usando esbuild com bundle otimizado
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryPoint = path.join(__dirname, 'src', 'TUI', 'index.js');
const outfile = path.join(__dirname, 'src', 'TUI', 'loader.js');

// console.log('Compilando TUI (transpilando JSX para JS com bundle otimizado)...');

try {
	await esbuild.build({
		entryPoints: [entryPoint],
		bundle: true,
		outfile,
		allowOverwrite: true,
		platform: 'node',
		target: 'node20',
		format: 'esm',
		jsx: 'automatic',
		jsxImportSource: 'react',
		external: [
			// NPM packages
			'ink',
			'ink-*',
			'react',
			'react/jsx-runtime',
			'fs',
			'path',
			'child_process',
			'url',
			'inquirer',
			'yoctocolors-cjs',
			'chalk',
			'ora',
			'@google/generative-ai',
			'@anthropic-ai/sdk',
			'openai',
			'axios',
			'ignore',
			'diff',
			'yargs',
			'util',
			// Local modules - prevent circular imports and keep external modules separate
			'../init-client.js',
			'../services/api-session.js',
			'../services/config-service.js',
			'../services/language-service.js',
			'../services/permission-service.js',
			'../utils/logger.js',
			'../utils/cli-ui.js',
			'../utils/fs-actions.js',
			'../utils/file-tree-generator.js',
			'../utils/node-scrapper.js',
			'../config/constants.js',
			'../agent/api/handle-ai-prompt.js',
			'../agent/api/tools/filesystem-tools.js',
			'../agent/api/ai/claude-client.js',
			'../agent/api/ai/open-ai-client.js',
			'../agent/api/ai/gemini-client.js',
		],
		loader: {
			'.js': 'jsx',
		},
		logLevel: 'info',
	});

	// console.log('\n✓ TUI compilado com sucesso em src/TUI/loader.js');
} catch (error) {
	// console.error('✗ Erro ao compilar TUI:', error);
	process.exit(1);
}
