import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import { applyPatch } from 'diff';

let partiallyReadFiles = {};

export function clearPartialCache() {
    partiallyReadFiles = {};
}

function listNearbyFiles(filePath) {
    try {
        const dir = path.dirname(filePath);
        const dirExists = fs.existsSync(dir);

        if (!dirExists) {
            const parentDir = path.dirname(dir);
            if (fs.existsSync(parentDir)) {
                const files = fs.readdirSync(parentDir);
                return `\nDiretório '${dir}' não existe.\nConteúdo de '${parentDir}':\n${files.slice(0, 10).join('\n')}`;
            }
            return `\nDiretório '${dir}' não existe.`;
        }

        const files = fs.readdirSync(dir);
        return `\nArquivos no diretório '${dir}':\n${files.slice(0, 15).join('\n')}`;
    } catch (error) {
        logger.error('Falha ao listar arquivos próximos:', error);
        return '\nNão foi possível listar arquivos próximos.';
    }
}

/**
 * Valida se um caminho é um arquivo existente e não um diretório.
 * @param {string} filePath 
 * @returns {{success: boolean, content: string}|{success: boolean, normalizedPath: string, stats: fs.Stats}}
 */
function _validateFile(filePath) {
    const normalizedPath = path.normalize(filePath);
    if (!fs.existsSync(normalizedPath)) {
        return {
            success: false,
            content: `ERRO: Arquivo '${normalizedPath}' não encontrado.${listNearbyFiles(normalizedPath)}`
        };
    }
    const stats = fs.statSync(normalizedPath);
    if (stats.isDirectory()) {
        return {
            success: false,
            content: `ERRO: '${normalizedPath}' é um diretório, não um arquivo.${listNearbyFiles(normalizedPath)}`
        };
    }
    return { success: true, normalizedPath, stats };
}

function readFile(filePath) {
    logger.info(`Tentando ler o arquivo: ${filePath}`);
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath, stats } = validation;

        logger.info(`Lendo o conteúdo do arquivo: ${normalizedPath}`);
        const content = fs.readFileSync(normalizedPath, 'utf-8');
        const lines = content.split('\n').length;
        logger.info(`Leitura bem sucedida. Linhas: ${lines}, Tamanho: ${stats.size} bytes`);

        return {
            success: true,
            content: `Arquivo: ${normalizedPath}\nLinhas: ${lines}\nTamanho: ${stats.size} bytes\n\n--- INÍCIO DO ARQUIVO ---\n${content}\n--- FIM DO ARQUIVO ---`
        };
    } catch (error) {
        logger.error(`Erro inesperado ao ler o arquivo: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao ler arquivo: ${error.message}\nCaminho tentado: ${filePath}`
        };
    }
}

function createFile(filePath) {
    try {
        const normalizedPath = path.normalize(filePath);

        if (fs.existsSync(normalizedPath)) {
            return {
                success: false,
                content: `ERRO: O arquivo '${normalizedPath}' já existe.\n\nDica: Use UPDATE para modificar arquivos existentes.`
            };
        }

        const dir = path.dirname(normalizedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`   📁 Diretório '${dir}' criado.`);
        }

        fs.writeFileSync(normalizedPath, '', 'utf-8');
        return {
            success: true,
            content: `✅ Arquivo '${normalizedPath}' criado com sucesso.\n\nPróximo passo: Use UPDATE para adicionar conteúdo ao arquivo.`
        };
    } catch (error) {
        logger.error(`Erro ao criar arquivo: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao criar arquivo: ${error.message}\nCaminho: ${filePath}\n\nVerifique se:\n- O caminho é válido\n- Você tem permissões de escrita\n- Não há caracteres inválidos no nome`
        };
    }
}

function updateFile(filePath, newContent) {
    try {
        const normalizedPath = path.normalize(filePath);
        const fileExists = fs.existsSync(normalizedPath);

        if (!fileExists) {
            const dir = path.dirname(normalizedPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }

        fs.writeFileSync(normalizedPath, newContent, 'utf-8');
        const stats = fs.statSync(normalizedPath);
        const lines = newContent.split('\n').length;

        return {
            success: true,
            content: `✅ Arquivo '${normalizedPath}' ${fileExists ? 'atualizado' : 'criado'} com sucesso.\n\nEstatísticas:\n- Linhas: ${lines}\n- Tamanho: ${stats.size} bytes\n- Caminho absoluto: ${path.resolve(normalizedPath)}`
        };
    } catch (error) {
        logger.error(`Erro ao atualizar arquivo: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao atualizar arquivo: ${error.message}\nCaminho: ${filePath}\nTamanho do conteúdo: ${newContent.length} caracteres`
        };
    }
}

function deleteFile(filePath) {
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath, stats } = validation;

        const size = stats.size;
        fs.unlinkSync(normalizedPath);

        return {
            success: true,
            content: `✅ Arquivo '${normalizedPath}' deletado com sucesso.\n- Tamanho liberado: ${size} bytes`
        };
    } catch (error) {
        logger.error(`Erro ao deletar arquivo: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao deletar arquivo: ${error.message}\nCaminho: ${filePath}`
        };
    }
}

function readStartOfFile(filePath) {
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath } = validation;

        const content = fs.readFileSync(normalizedPath, 'utf-8');
        const lines = content.split('\n');
        const halfwayPoint = Math.ceil(lines.length / 2);

        const firstHalf = lines.slice(0, halfwayPoint).join('\n');

        partiallyReadFiles[normalizedPath] = {
            lines: lines,
            splitIndex: halfwayPoint,
        };

        const message = lines.length > 1
            ? `\n\n--- FIM DA PRIMEIRA PARTE (Linhas 1-${halfwayPoint} de ${lines.length}) ---\nUse READ_END ${filePath} para ler o restante do arquivo.`
            : `\n\n--- FIM DO ARQUIVO ---`;

        return {
            success: true,
            content: `--- INÍCIO DO ARQUIVO: ${filePath} ---\n${firstHalf}${message}`
        };
    } catch (error) {
        logger.error(`Erro ao ler o início do arquivo: ${filePath}`, error);
        return { success: false, content: `ERRO ao ler o início do arquivo: ${error.message}` };
    }
}

function readEndOfFile(filePath) {
    try {
        const normalizedPath = path.normalize(filePath);
        const partialData = partiallyReadFiles[normalizedPath];

        if (!partialData) {
            return {
                success: false,
                content: `ERRO: A primeira parte do arquivo '${normalizedPath}' não foi lida ainda. Use READ_START ${normalizedPath} primeiro.`
            };
        }

        const secondHalf = partialData.lines.slice(partialData.splitIndex).join('\n');
        delete partiallyReadFiles[normalizedPath];

        return {
            success: true,
            content: `--- CONTINUAÇÃO DO ARQUIVO: ${filePath} (Linhas ${partialData.splitIndex + 1}-${partialData.lines.length}) ---\n${secondHalf}\n\n--- FIM DO ARQUIVO ---`
        };
    } catch (error) {
        logger.error(`Erro ao ler o final do arquivo: ${filePath}`, error);
        return { success: false, content: `ERRO ao ler o final do arquivo: ${error.message}` };
    }
}

function editLines(filePath, startLine, endLine, newContent) {
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath } = validation;

        const fileContent = fs.readFileSync(normalizedPath, 'utf-8');
        const lines = fileContent.split('\n');
        const totalLines = lines.length;

        if (startLine < 1 || startLine > totalLines) {
            return {
                success: false,
                content: `ERRO: Linha inicial ${startLine} inválida. O arquivo tem ${totalLines} linhas.`
            };
        }
        if (endLine < startLine || endLine > totalLines) {
            return {
                success: false,
                content: `ERRO: Linha final ${endLine} inválida. Deve estar entre ${startLine} e ${totalLines}.`
            };
        }

        const originalLines = lines.slice(startLine - 1, endLine).join('\n');
        const newLines = newContent.split('\n');
        lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
        const updatedContent = lines.join('\n');
        fs.writeFileSync(normalizedPath, updatedContent, 'utf-8');

        return {
            success: true,
            content: `✅ Arquivo '${normalizedPath}' atualizado com sucesso.\n\nLinhas editadas: ${startLine}-${endLine}\nLinhas removidas: ${endLine - startLine + 1}\nLinhas inseridas: ${newLines.length}\nTotal de linhas agora: ${lines.length}\n\n--- CONTEÚDO ANTERIOR ---\n${originalLines}\n\n--- NOVO CONTEÚDO ---\n${newContent}`
        };
    } catch (error) {
        logger.error(`Erro ao editar linhas: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao editar linhas: ${error.message}\nCaminho: ${filePath}`
        };
    }
}

function insertLines(filePath, lineNumber, content) {
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath } = validation;

        const fileContent = fs.readFileSync(normalizedPath, 'utf-8');
        const lines = fileContent.split('\n');
        const totalLines = lines.length;

        if (lineNumber < 0 || lineNumber > totalLines) {
            return {
                success: false,
                content: `ERRO: Linha ${lineNumber} inválida. O arquivo tem ${totalLines} linhas. Use 0 para inserir no início ou ${totalLines} para inserir no final.`
            };
        }

        const newLines = content.split('\n');
        lines.splice(lineNumber, 0, ...newLines);
        const updatedContent = lines.join('\n');
        fs.writeFileSync(normalizedPath, updatedContent, 'utf-8');

        return {
            success: true,
            content: `✅ Linhas inseridas com sucesso em '${normalizedPath}'.\n\nPosição: após linha ${lineNumber}\nLinhas inseridas: ${newLines.length}\nTotal de linhas agora: ${lines.length}\n\n--- CONTEÚDO INSERIDO ---\n${content}`
        };
    } catch (error) {
        logger.error(`Erro ao inserir linhas: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao inserir linhas: ${error.message}\nCaminho: ${filePath}`
        };
    }
}

function replaceInFile(filePath, searchText, replaceText, replaceAll = false) {
    try {
        const validation = _validateFile(filePath);
        if (!validation.success) {
            return validation;
        }
        const { normalizedPath } = validation;

        let fileContent = fs.readFileSync(normalizedPath, 'utf-8');
        const occurrences = (fileContent.match(new RegExp(escapeRegExp(searchText), 'g')) || []).length;

        if (occurrences === 0) {
            return {
                success: false,
                content: `ERRO: Texto não encontrado no arquivo.\n\nTexto procurado:\n\"${searchText}\"\n\nDica: Verifique se o texto existe exatamente como digitado (case-sensitive).`
            };
        }

        if (replaceAll) {
            fileContent = fileContent.split(searchText).join(replaceText);
        } else {
            fileContent = fileContent.replace(searchText, replaceText);
        }

        fs.writeFileSync(normalizedPath, fileContent, 'utf-8');

        return {
            success: true,
            content: `✅ Substituição realizada com sucesso em '${normalizedPath}'.\n\nOcorrências encontradas: ${occurrences}\nOcorrências substituídas: ${replaceAll ? occurrences : 1}\n\n--- TEXTO ORIGINAL ---\n${searchText}\n\n--- TEXTO NOVO ---\n${replaceText}`
        };
    } catch (error) {
        logger.error(`Erro ao substituir texto: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao substituir texto: ${error.message}\nCaminho: ${filePath}`
        };
    }
}

function createFileWithContent(filePath, content) {
    try {
        const normalizedPath = path.normalize(filePath);

        if (fs.existsSync(normalizedPath)) {
            return {
                success: false,
                content: `ERRO: O arquivo '${normalizedPath}' já existe.\n\nDica: Use EDIT_LINES ou REPLACE_IN_FILE para modificar arquivos existentes.`
            };
        }

        const dir = path.dirname(normalizedPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`   📁 Diretório '${dir}' criado.`);
        }

        fs.writeFileSync(normalizedPath, content, 'utf-8');
        const stats = fs.statSync(normalizedPath);
        const lines = content.split('\n').length;

        return {
            success: true,
            content: `✅ Arquivo '${normalizedPath}' criado com sucesso.\n\nEstatísticas:\n- Linhas: ${lines}\n- Tamanho: ${stats.size} bytes\n- Caminho absoluto: ${path.resolve(normalizedPath)}\n\n--- CONTEÚDO ---\n${content.split('\n').slice(0, 10).join('\n')}${lines > 10 ? '\n...(truncado)' : ''}`
        };
    } catch (error) {
        logger.error(`Erro ao criar arquivo com conteúdo: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao criar arquivo: ${error.message}\nCaminho: ${filePath}`
        };
    }
}

function moveFile(sourcePath, destPath) {
    try {
        const sourceValidation = _validateFile(sourcePath);
        if (!sourceValidation.success) {
            return sourceValidation;
        }
        const { normalizedPath: normalizedSource, stats: sourceStats } = sourceValidation;

        const normalizedDest = path.normalize(destPath);

        if (fs.existsSync(normalizedDest)) {
            return {
                success: false,
                content: `ERRO: O arquivo destino '${normalizedDest}' já existe.\n\nDica: Delete o arquivo destino primeiro ou escolha outro nome.`
            };
        }

        const destDir = path.dirname(normalizedDest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            logger.info(`   📁 Diretório '${destDir}' criado.`);
        }

        fs.renameSync(normalizedSource, normalizedDest);

        return {
            success: true,
            content: `✅ Arquivo movido com sucesso.\n\nDe: ${normalizedSource}\nPara: ${normalizedDest}\n\nTamanho: ${sourceStats.size} bytes`
        };
    } catch (error) {
        logger.error(`Erro ao mover arquivo: ${sourcePath} -> ${destPath}`, error);
        return {
            success: false,
            content: `ERRO ao mover arquivo: ${error.message}\nOrigem: ${sourcePath}\nDestino: ${destPath}`
        };
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Aplica um patch (formato diff) a um arquivo.
 * @param {string} filePath - O caminho do arquivo.
 * @param {string} patchContent - O patch no formato unified diff.
 * @returns {{success: boolean, content: string}}
 */
function applyPatchToFile(filePath, patchContent) {
    const normalizedPath = path.normalize(filePath);

    // Validação (baseada nas suas outras funções)
    if (!fs.existsSync(normalizedPath)) {
        return {
            success: false,
            content: `ERRO: Arquivo '${normalizedPath}' não encontrado.${listNearbyFiles(normalizedPath)}`
        };
    }
    const stats = fs.statSync(normalizedPath);
    if (stats.isDirectory()) {
        return {
            success: false,
            content: `ERRO: '${normalizedPath}' é um diretório, não um arquivo.`
        };
    }

    try {
        const oldContent = fs.readFileSync(normalizedPath, 'utf-8');

        // Aplicar o Patch
        const newContent = applyPatch(oldContent, patchContent);

        if (newContent === false) {
            return {
                success: false,
                content: `ERRO: O patch não pôde ser aplicado. O patch pode estar mal formatado ou o conteúdo do arquivo mudou.`
            };
        }

        // Salvar o arquivo
        fs.writeFileSync(normalizedPath, newContent, 'utf-8');

        return {
            success: true,
            content: `✅ Patch aplicado com sucesso em '${normalizedPath}'.`
        };
    } catch (error) {
        logger.error(`Erro ao aplicar patch: ${filePath}`, error);
        return {
            success: false,
            content: `ERRO ao aplicar patch: ${error.message}`
        };
    }
}

/**
 * Cria um diretório (pasta) recursivamente.
 * @param {string} dirPath - O caminho do diretório.
 * @returns {{success: boolean, content: string}}
 */
function createDirectory(dirPath) {
    const normalizedPath = path.normalize(dirPath);

    try {
        if (fs.existsSync(normalizedPath)) {
            // Verifica se o caminho já existe e é um diretório
            if (fs.statSync(normalizedPath).isDirectory()) {
                return {
                    success: true,
                    content: `✅ Diretório '${normalizedPath}' já existe.`
                };
            } else {
                return {
                    success: false,
                    content: `ERRO: O caminho '${normalizedPath}' já existe, mas é um arquivo.`
                };
            }
        }

        // Cria o diretório (e pais, se necessário)
        fs.mkdirSync(normalizedPath, { recursive: true });

        return {
            success: true,
            content: `✅ Diretório '${normalizedPath}' criado com sucesso.`
        };
    } catch (error) {
        logger.error(`Erro ao criar diretório: ${dirPath}`, error);
        return {
            success: false,
            content: `ERRO ao criar diretório: ${error.message}`
        };
    }
}

export default {
    readFile,
    createFile,
    updateFile,
    deleteFile,
    moveFile,
    readStartOfFile,
    readEndOfFile,
    editLines,
    insertLines,
    replaceInFile,
    createFileWithContent,
    applyPatchToFile,
    createDirectory
};