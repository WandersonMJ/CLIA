import fs from 'fs/promises';
import path from 'path';
import ignore from 'ignore';
import logger from './logger.js';

import { DEFAULT_IGNORE_RULES, GITIGNORE_FILE, SCRAP_FILE } from '../config/constants.js';

/**
 * Carrega as regras do .gitignore e adiciona regras padrão (versão assíncrona).
 * @returns {Promise<object>} Uma instância 'ig' da biblioteca 'ignore'.
 */
async function loadGitIgnore(projectRoot, outputFileName) {
    const ig = ignore();
    
    ig.add(DEFAULT_IGNORE_RULES); 
    ig.add(outputFileName); 
    
    try {
        const gitignorePath = path.join(projectRoot, GITIGNORE_FILE); 
        
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        ig.add(gitignoreContent);
        logger.info('.gitignore carregado.');
    } catch (error) {
        logger.warn('Nenhum .gitignore encontrado. Usando apenas ignores padrão.');
    }
    return ig;
}

/**
 * Mapeia recursivamente a estrutura de diretórios e o conteúdo dos arquivos.
 * @param {string} dirPath O caminho do diretório a ser percorrido.
 * @param {string} rootPath O diretório raiz do projeto.
 * @param {object} ig A instância 'ig' com as regras de ignore.
 * @returns {Promise<Object>} Um objeto representando a árvore de arquivos.
 */
async function mapDirectory(dirPath, rootPath, ig) {
    const tree = {};
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(rootPath, fullPath);

            if (relativePath === '') {
                continue;
            }
        
            const pathToCheck = entry.isDirectory() ? relativePath + '/' : relativePath;
            if (ig.ignores(pathToCheck)) {
                continue;
            }

            if (entry.isDirectory()) {
                const subTree = await mapDirectory(fullPath, rootPath, ig);
                Object.assign(tree, subTree);
            } else {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    tree[relativePath] = content;
                } catch (readError) {
                    logger.error(`Erro ao ler o arquivo ${relativePath}:`, readError.message);
                    tree[relativePath] = `ERRO_AO_LER_ARQUIVO: ${readError.message}`;
                }
            }
        }
    } catch (dirError) {
        logger.error(`Erro ao ler o diretório ${dirPath}:`, dirError.message);
    }
    return tree;
}

/**
 * Função principal para fazer o scraping da estrutura do projeto.
 * @param {string} outputPath - Caminho onde o arquivo JSON será salvo.
 * @returns {Promise<string>} O caminho completo do arquivo gerado.
 */
export async function scrapProject(outputPath = process.cwd()) {
    logger.info('Iniciando o scraping da estrutura do projeto...');
    const projectRoot = process.cwd();
    
    const outputFileName = SCRAP_FILE; 
    
    const fullOutputPath = path.join(outputPath, outputFileName);

    try {
        const ig = await loadGitIgnore(projectRoot, outputFileName);
    
        logger.info('Mapeando diretórios...');
        const projectTree = await mapDirectory(projectRoot, projectRoot, ig);
        
        logger.info('Escrevendo arquivo JSON...');
        const jsonContent = JSON.stringify(projectTree, null, 2);
        await fs.writeFile(fullOutputPath, jsonContent, 'utf-8');
        
        logger.success(`Scraping concluído! A árvore do projeto foi salva em: ${fullOutputPath}`);
        return fullOutputPath;

    } catch (error) {
        logger.error('Ocorreu um erro durante o scraping:', error);
        throw error;
    }
}

export default scrapProject;