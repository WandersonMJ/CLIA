import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import logger from './logger.js';

import { DEFAULT_IGNORE_RULES, GITIGNORE_FILE } from '../config/constants.js';

/**
 * Carrega as regras do .gitignore e adiciona regras padrão.
 * @returns {object} Uma instância 'ig' da biblioteca 'ignore'.
 */
function loadGitIgnore() {
    const ig = ignore();
    const projectRoot = process.cwd();
    
    ig.add(DEFAULT_IGNORE_RULES); 
    
    try {
        const gitignorePath = path.join(projectRoot, GITIGNORE_FILE); 
        
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        ig.add(gitignoreContent);
    } catch (error) {
        logger.warn('Nenhum .gitignore encontrado. Usando apenas ignores padrão.'); 
    }
    return ig;
}

/**
 * Função recursiva que "anda" pelos diretórios.
 * @param {string} dir - O diretório atual para escanear.
 * @param {string} rootDir - O diretório raiz do projeto (para calcular caminhos relativos).
 * @param {object} ig - A instância 'ig' com as regras de ignore.
 * @returns {string[]} Um array com os caminhos dos arquivos.
 */
function walk(dir, rootDir, ig) {
    let filePaths = [];
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const relativePath = path.relative(rootDir, fullPath);

            if (relativePath === '') {
                continue;
            }

            const stats = fs.statSync(fullPath);
            const pathToCheck = stats.isDirectory() ? relativePath + '/' : relativePath;

            if (ig.ignores(pathToCheck)) {
                continue;
            }

            if (stats.isDirectory()) {
                filePaths = [...filePaths, ...walk(fullPath, rootDir, ig)];
            } else {
                filePaths.push(relativePath);
            }
        }
    } catch (error) {
        logger.warn(`Não foi possível ler o diretório: ${dir}`); 
    }
    return filePaths;
}

/**
 * Lê as primeiras N linhas de um arquivo como string.
 * @param {string} absoluteFilePath Caminho absoluto do arquivo.
 * @param {number} lineCount Quantidade de linhas a retornar (padrão 5).
 * @returns {string} As primeiras N linhas unidas por \n ou mensagem de erro.
 */
function readFirstLines(absoluteFilePath, lineCount = 5) {
    try {
        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        const lines = content.split(/\r?\n/).slice(0, lineCount);
        return lines.join('\n');
    } catch (error) {
        logger.warn(`Não foi possível ler o arquivo: ${absoluteFilePath}`);
        return `[ERRO_AO_LER_ARQUIVO] ${error.message}`;
    }
}

/**
 * Gera um objeto JSON contendo a árvore de arquivos do projeto.
 * @param {string} rootDirParam - O diretório raiz (normalmente '.').
 * @returns {object} Um objeto no formato { projectTree: [...] }.
 */
function generateFileTree(rootDirParam = '.') {
    const ig = loadGitIgnore(); 
    const absoluteRootDir = path.resolve(rootDirParam); 
    const allPaths = walk(absoluteRootDir, absoluteRootDir, ig);
    
    // Para cada arquivo, inclui um preview com as 5 primeiras linhas.
    const projectTree = allPaths.map((relativePath) => {
        const absolutePath = path.join(absoluteRootDir, relativePath);
        const first5Lines = readFirstLines(absolutePath, 5);
        return { path: relativePath, first5Lines };
    });

    return { projectTree };
}

export default generateFileTree;
