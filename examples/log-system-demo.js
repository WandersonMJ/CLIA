#!/usr/bin/env node

/**
 * Demonstração do Sistema de Logs de Conversação
 *
 * Este script mostra como o sistema de logs funciona internamente.
 */

import convoLogger from '../src/utils/conversation-logger.js';

console.log('🎯 Demonstração do Sistema de Logs\n');

// Simular uma conversa no modo normal
console.log('1️⃣  Simulando conversa no modo normal...\n');

// Log do system prompt
convoLogger.logSystem({
  mode: 'normal',
  phase: 'single',
  content: 'Você é um assistente útil que ajuda com programação.',
  meta: { timestamp: Date.now() }
});

// Log de mensagem do usuário
convoLogger.logUser({
  mode: 'normal',
  phase: 'single',
  content: 'Como faço para ler um arquivo em Node.js?'
});

// Log de request
convoLogger.logRequest({
  provider: 'openai',
  model: 'gpt-4o',
  mode: 'normal',
  phase: 'single',
  history: [
    { role: 'system', content: 'Você é um assistente útil...' },
    { role: 'user', content: 'Como faço para ler um arquivo em Node.js?' }
  ],
  tools: [{ name: 'READ', description: 'Lê um arquivo' }],
  meta: {}
});

// Log de response
convoLogger.logResponse({
  provider: 'openai',
  model: 'gpt-4o',
  mode: 'normal',
  phase: 'single',
  response: {
    role: 'assistant',
    content: null,
    tool_calls: [{
      id: 'call_123',
      type: 'function',
      function: {
        name: 'READ',
        arguments: '{"filePath": "package.json"}'
      }
    }]
  }
});

// Log de assistant
convoLogger.logAssistant({
  mode: 'normal',
  phase: 'single',
  message: {
    role: 'assistant',
    content: null,
    tool_calls: [{
      id: 'call_123',
      type: 'function',
      function: {
        name: 'READ',
        arguments: '{"filePath": "package.json"}'
      }
    }]
  }
});

// Log de tool call
convoLogger.logToolCall({
  mode: 'normal',
  phase: 'single',
  toolName: 'READ',
  args: { filePath: 'package.json' },
  tool_call_id: 'call_123'
});

// Log de tool result
convoLogger.logToolResult({
  mode: 'normal',
  phase: 'single',
  toolName: 'READ',
  result: {
    success: true,
    content: '{\n  "name": "cl.ia",\n  "version": "1.0.0"\n}'
  },
  tool_call_id: 'call_123'
});

console.log('✅ Logs do modo normal criados!\n');

// Simular uma conversa no modo architect
console.log('2️⃣  Simulando conversa no modo architect...\n');

// Evento de início
convoLogger.logEvent({
  name: 'architect_mode_start',
  mode: 'architect',
  phase: 'init',
  meta: {
    architect: { provider: 'claude', model: 'claude-sonnet-4' },
    executor: { provider: 'openai', model: 'gpt-4o-mini' }
  }
});

// Fase 1: Context Gathering
convoLogger.logSystem({
  mode: 'architect',
  phase: 'context-gathering',
  content: 'FASE 1: COLETA DE CONTEXTO\n\nSua missão é coletar informações...'
});

convoLogger.logUser({
  mode: 'architect',
  phase: 'context-gathering',
  content: 'Adicione validação de email no formulário de registro'
});

convoLogger.logToolCall({
  mode: 'architect',
  phase: 'context-gathering',
  toolName: 'READ',
  args: { filePath: 'src/components/RegisterForm.js' },
  tool_call_id: 'call_456'
});

convoLogger.logToolResult({
  mode: 'architect',
  phase: 'context-gathering',
  toolName: 'READ',
  result: {
    success: true,
    content: 'export function RegisterForm() { ... }'
  },
  tool_call_id: 'call_456'
});

convoLogger.logEvent({
  name: 'context_collected',
  mode: 'architect',
  phase: 'context-gathering',
  meta: { summaryLength: 450 }
});

// Fase 2: Planning
convoLogger.logSystem({
  mode: 'architect',
  phase: 'planning',
  content: 'FASE 2: PLANEJAMENTO\n\nCrie um plano mestre...'
});

convoLogger.logRequest({
  provider: 'claude',
  model: 'claude-sonnet-4',
  mode: 'architect',
  phase: 'planning',
  history: [],
  tools: [],
  meta: { role: 'architect' }
});

convoLogger.logResponse({
  provider: 'claude',
  model: 'claude-sonnet-4',
  mode: 'architect',
  phase: 'planning',
  response: {
    role: 'assistant',
    content: 'Plano: 1. Adicionar função de validação... 2. Integrar no formulário...'
  }
});

convoLogger.logEvent({
  name: 'plan_created',
  mode: 'architect',
  phase: 'planning',
  meta: { planLength: 850 }
});

// Fase 3: Execution
convoLogger.logSystem({
  mode: 'architect',
  phase: 'execution',
  content: 'FASE 3: EXECUÇÃO\n\nExecute o plano mestre...'
});

convoLogger.logToolCall({
  mode: 'architect',
  phase: 'execution',
  toolName: 'CREATE_WITH_CONTENT',
  args: {
    filePath: 'src/utils/validation.js',
    content: 'export function isValidEmail(email) { ... }'
  },
  tool_call_id: 'call_789'
});

convoLogger.logToolResult({
  mode: 'architect',
  phase: 'execution',
  toolName: 'CREATE_WITH_CONTENT',
  result: {
    success: true,
    content: '✅ Arquivo criado com sucesso'
  },
  tool_call_id: 'call_789'
});

convoLogger.logEvent({
  name: 'architect_mode_success',
  mode: 'architect',
  phase: 'done'
});

console.log('✅ Logs do modo architect criados!\n');

console.log('📊 Agora você pode visualizar os logs com:\n');
console.log('  npm run logs:stats');
console.log('  npm run logs');
console.log('  node scripts/view-logs.js list tool_call');
console.log('  node scripts/view-logs.js mode architect\n');
