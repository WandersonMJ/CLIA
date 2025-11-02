import dualAiService from '../services/dual-ai-service.js';
import session from '../services/api-session.js';
import permissionService from '../services/permission-service.js';
import fsActions from '../utils/fs-actions.js';
import generateFileTree from '../utils/file-tree-generator.js';
import logger from '../utils/logger.js';
import lang from '../services/language-service.js';
import ora from 'ora';
import { execSync } from 'child_process';
import { getTools } from './api/tools/filesystem-tools.js';
import {
  MAX_ITERATIONS,
  CRITICAL_ACTIONS,
  TIMEOUT,
  MAX_BUFFER,
  LOG_PREVIEW_LENGTH
} from '../config/constants.js';

import fs from 'fs';
import path from 'path';
import { OS_PROMPTS_DIR, PROMPTS_DIR } from '../config/constants.js';

/**
 * Gera o system prompt para uma fase específica
 */
function getSystemPromptForPhase(phase, additionalContext = '') {
  try {
    const language = session.getLanguage() || 'en-US';
    const promptFileName = 'system-prompt.md';
    const promptTemplatePath = path.join(process.cwd(), PROMPTS_DIR, language, promptFileName);

    let promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');

    const currentWorkingDir = process.cwd();
    const fileTree = generateFileTree('.');
    const fileTreeString = JSON.stringify(fileTree, null, 2);

    // Busca comandos do SO
    let osCommands = '';
    const os = session.getOS();
    if (os) {
      try {
        const filePath = path.join(process.cwd(), OS_PROMPTS_DIR, `${os}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const commandsData = JSON.parse(fileContent);

        osCommands = lang.get('cli.shell') || 'OS Commands:';
        for (const category of commandsData.command_categories) {
          osCommands += `\n# ${category.category_name}\n`;
          for (const cmd of category.commands) {
            osCommands += `- \`${cmd.command}\`: ${cmd.description}\n`;
          }
        }
      } catch (error) {
        logger.warn('Erro ao carregar comandos do SO', error);
      }
    }

    promptTemplate = promptTemplate.replace('{{FILE_TREE}}', `Working Directory: ${currentWorkingDir}\n\n${fileTreeString}`);
    promptTemplate = promptTemplate.replace('{{OS_COMMANDS}}', osCommands);

    // Adiciona instruções específicas da fase
    const phaseInstructions = getPhaseInstructions(phase);
    promptTemplate += `\n\n${phaseInstructions}`;

    if (additionalContext) {
      promptTemplate += `\n\n${additionalContext}`;
    }

    return promptTemplate;
  } catch (error) {
    logger.error('Erro ao gerar system prompt', error);
    throw error;
  }
}

/**
 * Retorna instruções específicas para cada fase
 */
function getPhaseInstructions(phase) {
  switch (phase) {
    case 'context-gathering':
      return `
# MODO ARQUITETO - FASE 1: COLETA DE CONTEXTO

**SUA MISSÃO**: Você NÃO deve executar a tarefa solicitada. Sua missão é apenas COLETAR INFORMAÇÕES.

**PROCESSO**:
1. Use as ferramentas disponíveis (READ, READ_START, SHELL ls, etc.) para explorar o projeto
2. Identifique arquivos relevantes para a tarefa solicitada
3. Leia e analise o código necessário
4. NO FINAL, resuma suas descobertas em um formato estruturado

**FORMATO DA RESPOSTA FINAL**:
Quando terminar a coleta, responda com:

\`\`\`json
{
  "contextSummary": "Resumo da análise realizada",
  "relevantFiles": ["arquivo1.js", "arquivo2.js"],
  "keyFindings": [
    "Descoberta 1",
    "Descoberta 2"
  ],
  "technicalDetails": "Detalhes técnicos importantes (padrões, dependências, etc.)"
}
\`\`\`

**IMPORTANTE**: NÃO execute edições, criações ou deleções. Apenas LEIA e ANALISE.
`;

    case 'planning':
      return `
# MODO ARQUITETO - FASE 2: PLANEJAMENTO ESTRATÉGICO

**SUA MISSÃO**: Criar um plano mestre detalhado para executar a tarefa.

**CONTEXTO**: Você recebeu um resumo do contexto coletado por seu assistente. Use essas informações para criar um plano.

**FORMATO DO PLANO**:
Responda com um JSON estruturado:

\`\`\`json
{
  "planSummary": "Resumo de alto nível do plano",
  "steps": [
    {
      "stepNumber": 1,
      "action": "EDIT_LINES",
      "description": "Descrição do que será feito",
      "filePath": "src/example.js",
      "details": {
        "startLine": 10,
        "endLine": 15,
        "newContent": "código novo aqui"
      }
    },
    {
      "stepNumber": 2,
      "action": "CREATE_WITH_CONTENT",
      "description": "Criar novo arquivo",
      "filePath": "src/new-file.js",
      "details": {
        "content": "conteúdo do arquivo"
      }
    }
  ],
  "expectedOutcome": "O que deve acontecer após a execução",
  "risks": ["Risco 1", "Risco 2"]
}
\`\`\`

**AÇÕES DISPONÍVEIS**:
- READ, READ_START, READ_END
- CREATE, CREATE_WITH_CONTENT, CREATE_DIRECTORY
- EDIT_LINES, INSERT_LINES, REPLACE_IN_FILE, UPDATE
- DELETE, MOVE
- SHELL
- APPLY_PATCH

**IMPORTANTE**: Seja ESPECÍFICO. Inclua números de linha exatos, conteúdo completo, e todos os detalhes necessários.
`;

    case 'execution':
      return `
# MODO ARQUITETO - FASE 3: EXECUÇÃO

**SUA MISSÃO**: Executar o plano mestre fornecido pelo Arquiteto.

**PROCESSO**:
1. Siga o plano passo a passo
2. Execute cada ação usando as ferramentas disponíveis
3. Se encontrar um erro SIMPLES (ex: caminho errado), corrija e continue
4. Se encontrar um erro FUNDAMENTAL (ex: lógica do plano está errada), PARE e reporte

**AUTONOMIA**:
- Você PODE ajustar caminhos de arquivos se necessário
- Você PODE ler arquivos adicionais para confirmar informações
- Você NÃO PODE mudar a lógica fundamental do plano

**REPORTAR ERROS**:
Se algo der fundamentalmente errado, responda com:

\`\`\`json
{
  "status": "FAILED",
  "failedStep": 3,
  "error": "Descrição do erro",
  "reason": "Por que o plano não funcionou"
}
\`\`\`

**SUCESSO**:
Quando completar, responda com uma mensagem natural descrevendo o que foi feito.
`;

    default:
      return '';
  }
}

/**
 * Executa o comando shell
 */
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

/**
 * Obtém a implementação de uma ferramenta
 */
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

/**
 * Executa uma fase do modo arquiteto (Executor)
 */
async function runExecutorPhase(phase, executorConfig, systemPrompt, userMessage, tools) {
  const history = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  let iterationCount = 0;

  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    logger.iteration(
      lang.get('agent.iteration', iterationCount, MAX_ITERATIONS) +
      ` [${phase.toUpperCase()}]`
    );

    const spinner = ora(lang.get('agent.thinking')).start();
    let aiMessage;

    try {
      aiMessage = await dualAiService.sendToExecutor(executorConfig, history, tools);
      spinner.stop();
    } catch (error) {
      spinner.fail('Erro ao processar IA Executor');
      logger.error('Erro no Executor', error);
      throw error;
    }

    history.push(aiMessage);

    // Se há tool calls, executar
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        logger.tool(lang.get('agent.toolExec', toolName));

        // Verificar permissões para ações críticas
        if (CRITICAL_ACTIONS.includes(toolName)) {
          const argDetails = toolArgs.filePath || toolArgs.sourcePath || toolArgs.command || 'ação';
          const isAllowed = await permissionService.check(toolName, argDetails);

          if (!isAllowed) {
            const denialMessage = lang.get('agent.denied', toolName);
            logger.warn(denialMessage);

            history.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolName,
              content: `[SYSTEM ERROR] ${denialMessage}`,
            });
            continue;
          }
        }

        // Executar ferramenta
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
            content: `Erro ao executar ferramenta: ${error.message}`
          };
        }

        const preview = String(toolResult.content).substring(0, LOG_PREVIEW_LENGTH);
        logger.result(
          toolResult.success,
          `${preview}${toolResult.content.length > LOG_PREVIEW_LENGTH ? '...' : ''}`
        );

        history.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(toolResult)
        });
      }

      continue; // Próxima iteração
    } else {
      // Resposta final do executor
      logger.response(aiMessage.content);
      return {
        success: true,
        message: aiMessage.content,
        history
      };
    }
  }

  logger.warn(lang.get('agent.iterationLimit'));
  return {
    success: false,
    message: 'Limite de iterações atingido',
    history
  };
}

/**
 * Executa a fase de planejamento (Arquiteto)
 */
async function runArchitectPhase(architectConfig, userPrompt, contextSummary) {
  const systemPrompt = getSystemPromptForPhase('planning');

  const fullPrompt = `
**TAREFA ORIGINAL DO USUÁRIO**:
${userPrompt}

**CONTEXTO COLETADO PELO ASSISTENTE**:
${contextSummary}

Por favor, crie um plano mestre detalhado para executar esta tarefa.
`;

  const history = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: fullPrompt }
  ];

  logger.info('🏗️  Arquiteto está criando o plano mestre...');
  const spinner = ora('Arquiteto planejando...').start();

  try {
    const aiMessage = await dualAiService.sendToArchitect(architectConfig, history, []);
    spinner.succeed('Plano mestre criado!');

    logger.response(aiMessage.content);

    return {
      success: true,
      plan: aiMessage.content,
      history
    };
  } catch (error) {
    spinner.fail('Erro ao processar Arquiteto');
    logger.error('Erro no Arquiteto', error);
    throw error;
  }
}

/**
 * Orquestrador principal do Modo Arquiteto
 */
async function orchestrate(userPrompt) {
  const architectConfig = session.getArchitectConfig();
  const executorConfig = session.getExecutorConfig();

  logger.info('🎯 Modo Arquiteto ativado');
  logger.info(`👷 Executor: ${executorConfig.provider} (${executorConfig.model})`);
  logger.info(`🏛️  Arquiteto: ${architectConfig.provider} (${architectConfig.model})`);

  const tools = getTools(true); // Modo economia = true para executor

  // ============================================================
  // FASE 1: COLETA DE CONTEXTO (Executor)
  // ============================================================
  logger.info('\n📋 FASE 1: Coleta de Contexto');

  const phase1SystemPrompt = getSystemPromptForPhase('context-gathering');
  const phase1Result = await runExecutorPhase(
    'context-gathering',
    executorConfig,
    phase1SystemPrompt,
    userPrompt,
    tools
  );

  if (!phase1Result.success) {
    logger.error('Falha na Fase 1: Coleta de Contexto');
    return;
  }

  const contextSummary = phase1Result.message;

  // ============================================================
  // FASE 2: PLANEJAMENTO (Arquiteto)
  // ============================================================
  logger.info('\n🏗️  FASE 2: Planejamento Estratégico');

  const phase2Result = await runArchitectPhase(
    architectConfig,
    userPrompt,
    contextSummary
  );

  if (!phase2Result.success) {
    logger.error('Falha na Fase 2: Planejamento');
    return;
  }

  const masterPlan = phase2Result.plan;

  // ============================================================
  // FASE 3: EXECUÇÃO (Executor)
  // ============================================================
  logger.info('\n⚙️  FASE 3: Execução do Plano');

  const phase3SystemPrompt = getSystemPromptForPhase('execution');
  const phase3Prompt = `
Execute o seguinte plano mestre:

${masterPlan}
`;

  const phase3Result = await runExecutorPhase(
    'execution',
    executorConfig,
    phase3SystemPrompt,
    phase3Prompt,
    tools
  );

  if (!phase3Result.success) {
    logger.error('Falha na Fase 3: Execução');
    logger.warn('Possível necessidade de replanejamento...');
    // TODO: Implementar loop de retry com o Arquiteto
    return;
  }

  logger.info('\n✅ Modo Arquiteto concluído com sucesso!');
}

export default {
  orchestrate
};
