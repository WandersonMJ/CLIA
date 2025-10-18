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

        const fileTree = generateFileTree('.');
        const fileTreeString = JSON.stringify(fileTree, null, 2);
        const osCommands = getOsCommands();

        promptTemplate = promptTemplate.replace('{{FILE_TREE}}', fileTreeString);
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
        'CREATE': fsActions.createFile,
        'CREATE_WITH_CONTENT': fsActions.createFileWithContent,
        'DELETE': fsActions.deleteFile,
        'MOVE': fsActions.moveFile,
        'EDIT_LINES': fsActions.editLines,
        'INSERT_LINES': fsActions.insertLines,
        'REPLACE_IN_FILE': fsActions.replaceInFile,
        'SHELL': executeShellCommand,
        'UPDATE': fsActions.updateFile,
    };
    return toolMap[toolName];
}

async function handleAiPrompt(userInput) {
    clearPartialCache();

    if (conversationHistory.length === 0) {
        conversationHistory = [
            { role: 'system', content: getSystemPrompt() }
        ];
    }
    conversationHistory.push({ role: 'user', content: userInput });

    const isEconomy = session.isEconomyMode();
    const availableTools = getTools(isEconomy);

    let iterationCount = 0;

    while (iterationCount < MAX_ITERATIONS) {
        iterationCount++;

        logger.iteration(lang.get('agent.iteration', iterationCount, MAX_ITERATIONS));

        const spinner = ora(lang.get('agent.thinking')).start();
        let aiMessage;

        try {
            aiMessage = await aiService.sendPrompt(conversationHistory, availableTools);
            spinner.stop();
        } catch (error) {
            spinner.fail('Erro ao processar IA');
            logger.error('Erro no aiService.sendPrompt', error);
            return;
        }

        conversationHistory.push(aiMessage);

        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            for (const toolCall of aiMessage.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                logger.tool(lang.get('agent.toolExec', toolName));

                if (CRITICAL_ACTIONS.includes(toolName)) {
                    const argDetails = toolArgs.filePath || toolArgs.sourcePath || toolArgs.command || 'ação';
                    const isAllowed = await permissionService.check(toolName, argDetails);

                    if (!isAllowed) {

                        const denialMessage = lang.get('agent.denied', toolName);
                        logger.warn(denialMessage);

                        conversationHistory.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: `[SYSTEM ERROR] ${denialMessage}`,
                        });
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
            }

            continue;
        } else {
            logger.response(aiMessage.content);

            return;
        }
    }

    logger.warn(lang.get('agent.iterationLimit'));
}

export default handleAiPrompt;