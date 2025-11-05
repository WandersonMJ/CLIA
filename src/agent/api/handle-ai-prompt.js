import aiService from '../../services/ai-service.js';
import session from '../../services/api-session.js';
import permissionService from '../../services/permission-service.js';
import fsActions, { clearPartialCache } from '../../utils/fs-actions.js';
import generateFileTree from '../../utils/file-tree-generator.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getTools } from './tools/filesystem-tools.js';
import logger from '../../utils/logger.js';
import lang from '../../services/language-service.js';
import ora from 'ora';
import architectOrchestrator from '../architect-orchestrator.js';
import interruptionHandler from '../../utils/interruption-handler.js';
import convoLogger from '../../utils/conversation-logger.js';

import {
    MAX_ITERATIONS,
    CRITICAL_ACTIONS,
    TIMEOUT,
    MAX_BUFFER,
    OS_PROMPTS_DIR,
    PROMPTS_DIR,
    LOG_PREVIEW_LENGTH,
    PERSONAL_CONTEXT
} from '../../config/constants.js';

let conversationHistory = [];

function getOsCommands() {
    const os = session.getOS();
    if (!os) return lang.get('noSoConfigured');

    try {
        const filePath = path.join(process.cwd(), OS_PROMPTS_DIR, `${os}.json`);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const commandsData = JSON.parse(fileContent);

        let commandsString = `${PERSONAL_CONTEXT}\n`;

        commandsString = lang.get('cli.shell');

        for (const category of commandsData.command_categories) {
            commandsString += `\n# ${category.category_name}\n`;
            for (const cmd of category.commands) {
                commandsString += `- \`${cmd.command}\`: ${cmd.description}\n`;
            }
        }

        return commandsString;
    } catch (error) {
        logger.error(lang.get('errorLoadingCommandsOS'), error);
        return lang.get('errorLoadingCommands');
    }
}

function getSystemPrompt() {
    try {
        const lang = session.getLanguage() || 'en-US';
        const promptFileName = 'system-prompt.md';
        const promptTemplatePath = path.join(process.cwd(), PROMPTS_DIR, lang, promptFileName);

        let promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');

        const currentWorkingDir = process.cwd();
        const fileTree = generateFileTree('.');
        const fileTreeString = JSON.stringify(fileTree, null, 2);
        const osCommands = getOsCommands();

        promptTemplate = promptTemplate.replace('{{FILE_TREE}}', `Working Directory: ${currentWorkingDir}\n\n${fileTreeString}`);
        promptTemplate = promptTemplate.replace('{{OS_COMMANDS}}', osCommands);

        return promptTemplate;
    } catch (error) {
        logger.error(lang.get('fatalErrorSystemPrompt'), error);
        throw new Error(lang.get('couldNotLoadSystemPrompt'));
    }
}

function executeShellCommand(command) {
    try {
        const output = execSync(command, {
            encoding: 'utf8',
            timeout: TIMEOUT,
            maxBuffer: MAX_BUFFER
        });
        return {
            success: true,
            content: lang.get('agent.shell.result', command, output)
        };
    } catch (error) {
        return {
            success: false,
            content: lang.get('agent.shell.error', command, error.message)
        };
    }
}

function getToolImplementation(toolName) {
    const toolMap = {
        'READ': fsActions.readFile,
        'READ_START': fsActions.readStartOfFile,
        'READ_END': fsActions.readEndOfFile,
        'CREATE_DIRECTORY': fsActions.createDirectory,
        'CREATE': fsActions.createFile,
        'CREATE_WITH_CONTENT': fsActions.createFileWithContent,
        'DELETE': fsActions.deleteFile,
        'MOVE': fsActions.moveFile,
        'EDIT_LINES': fsActions.editLines,
        'INSERT_LINES': fsActions.insertLines,
        'REPLACE_IN_FILE': fsActions.replaceInFile,
        'SHELL': executeShellCommand,
        'APPLY_PATCH': fsActions.applyPatchToFile,
        'UPDATE': fsActions.updateFile,
    };
    return toolMap[toolName];
}

async function handleAiPrompt(userInput) {
    clearPartialCache();

    // Se o Modo Arquiteto estiver ativado, usar o orquestrador
    if (session.isArchitectMode()) {
        logger.info('🎯 Modo Arquiteto detectado. Iniciando orquestração...');
        return await architectOrchestrator.orchestrate(userInput);
    }

    // Modo normal (single-agent)
    if (conversationHistory.length === 0) {
        const system = getSystemPrompt();
        conversationHistory = [
            { role: 'system', content: system }
        ];
        try { convoLogger.logSystem({ mode: session.getMode?.() || 'normal', phase: 'single', content: system }); } catch (_) {}
    }
    conversationHistory.push({ role: 'user', content: userInput });
    try { convoLogger.logUser({ mode: session.getMode?.() || 'normal', phase: 'single', content: userInput }); } catch (_) {}

    const isEconomy = session.isEconomyMode();
    const availableTools = getTools(isEconomy);

    let iterationCount = 0;

    // Ativar o listener de interrupção (ESC)
    interruptionHandler.reset();
    interruptionHandler.startListening();

    while (iterationCount < MAX_ITERATIONS) {
        iterationCount++;

        // Verificar se houve interrupção via ESC
        if (interruptionHandler.isInterrupted()) {
            logger.warn(lang.get('agent.interrupted') || '⚠️  Processamento interrompido pelo usuário.');
            interruptionHandler.stopListening();
            return;
        }

        logger.iteration(lang.get('agent.iteration', iterationCount, MAX_ITERATIONS));

        const spinner = ora(lang.get('agent.thinking')).start();
        let aiMessage;

        try {
            // Wrapper para verificar interrupção durante a chamada da IA
            const checkInterruptionInterval = setInterval(() => {
                if (interruptionHandler.isInterrupted()) {
                    spinner.stop();
                    clearInterval(checkInterruptionInterval);
                }
            }, 100); // Verifica a cada 100ms

            aiMessage = await aiService.sendPrompt(conversationHistory, availableTools);

            clearInterval(checkInterruptionInterval);
            spinner.stop();

            // Verificar novamente após a chamada
            if (interruptionHandler.isInterrupted()) {
                logger.warn(lang.get('agent.interrupted') || '⚠️  Processamento interrompido pelo usuário.');
                interruptionHandler.stopListening();
                return;
            }
        } catch (error) {
            spinner.fail('Erro ao processar IA');
            logger.error('Erro no aiService.sendPrompt', error);
            interruptionHandler.stopListening();
            return;
        }

        conversationHistory.push(aiMessage);
        try { convoLogger.logAssistant({ mode: session.getMode?.() || 'normal', phase: 'single', message: aiMessage }); } catch (_) {}

        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            for (const toolCall of aiMessage.tool_calls) {
                // Verificar interrupção antes de cada tool call
                if (interruptionHandler.isInterrupted()) {
                    logger.warn(lang.get('agent.interrupted') || '⚠️  Processamento interrompido pelo usuário.');
                    interruptionHandler.stopListening();
                    return;
                }

                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                logger.tool(lang.get('agent.toolExec', toolName));
                try { convoLogger.logToolCall({ mode: session.getMode?.() || 'normal', phase: 'single', toolName, args: toolArgs, tool_call_id: toolCall.id }); } catch (_) {}

                if (CRITICAL_ACTIONS.includes(toolName)) {
                    const argDetails = toolArgs.filePath || toolArgs.sourcePath || toolArgs.command || 'ação';
                    const isAllowed = await permissionService.check(toolName, argDetails);

                    if (!isAllowed) {

                        const denialMessage = lang.get('agent.denied', toolName);
                        logger.warn(denialMessage);

                        const denialPayload = { success: false, content: `[SYSTEM ERROR] ${denialMessage}` };
                        conversationHistory.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: JSON.stringify(denialPayload),
                        });
                        try { convoLogger.logToolResult({ mode: session.getMode?.() || 'normal', phase: 'single', toolName, result: denialPayload, tool_call_id: toolCall.id }); } catch (_) {}
                        continue;
                    }
                }

                const toolFunction = getToolImplementation(toolName);
                if (!toolFunction) {
                    logger.error(lang.get('agent.toolNotFound', toolName));
                    continue;
                }

                let toolResult;
                try {
                    const args = Object.values(toolArgs);
                    toolResult = await toolFunction(...args);
                } catch (error) {
                    toolResult = {
                        success: false,
                        content: `lang.get('errorExecutingTool')`
                    };
                }

                const preview = String(toolResult.content).substring(0, LOG_PREVIEW_LENGTH);
                logger.result(toolResult.success, `${preview}${toolResult.content.length > LOG_PREVIEW_LENGTH ? '...' : ''}`);

                conversationHistory.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolName,
                    content: JSON.stringify(toolResult)
                });
                try { convoLogger.logToolResult({ mode: session.getMode?.() || 'normal', phase: 'single', toolName, result: toolResult, tool_call_id: toolCall.id }); } catch (_) {}
            }

            continue;
        } else {
            logger.response(aiMessage.content);

            // Desativar o listener quando terminar
            interruptionHandler.stopListening();
            return;
        }
    }

    logger.warn(lang.get('agent.iterationLimit'));

    // Desativar o listener ao final
    interruptionHandler.stopListening();
}

export default handleAiPrompt;