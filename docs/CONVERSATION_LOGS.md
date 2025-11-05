# Sistema de Logs de Conversação

O CLIA possui um sistema completo de logs que registra todas as interações com as IAs em formato JSONL (JSON Lines).

## 📍 Localização

Os logs são salvos em: `.claude/ai-conversations.jsonl`

> ⚠️ Este arquivo está no `.gitignore` e **não será commitado** no repositório.

## 📊 Tipos de Logs

### Logs de Alto Nível (Conversação)

1. **`system`** - System prompts enviados à IA
   - Contém: `mode`, `phase`, `content`, `meta`

2. **`user`** - Mensagens do usuário
   - Contém: `mode`, `phase`, `content`, `meta`

3. **`assistant`** - Respostas da IA
   - Contém: `mode`, `phase`, `message` (objeto completo da resposta)

4. **`tool_call`** - Chamadas de ferramentas pela IA
   - Contém: `toolName`, `args`, `tool_call_id`

5. **`tool_result`** - Resultados das ferramentas
   - Contém: `toolName`, `result`, `tool_call_id`

6. **`event`** - Eventos importantes (início/fim de modos, etc.)
   - Contém: `name`, `meta`

### Logs de Baixo Nível (API)

7. **`request`** - Requisições enviadas aos provedores de IA
   - Contém: `provider`, `model`, `history`, `tools` (resumido)

8. **`response`** - Respostas recebidas dos provedores
   - Contém: `provider`, `model`, `response`

## 🏗️ Estrutura de um Log

Cada linha do arquivo é um objeto JSON com:

```json
{
  "ts": "2025-01-03T10:30:45.123Z",  // Timestamp ISO
  "type": "user",                     // Tipo de log
  "mode": "architect",                // Modo (normal, architect)
  "phase": "planning",                // Fase (single, context-gathering, planning, execution)
  "meta": {},                         // Metadados adicionais
  // ... campos específicos do tipo
}
```

## 🔍 Visualizando Logs

### Via Script CLI

```bash
# Estatísticas gerais
node scripts/view-logs.js stats

# Listar logs por tipo
node scripts/view-logs.js list tool_call

# Logs de um modo específico
node scripts/view-logs.js mode architect

# Logs de uma fase
node scripts/view-logs.js phase planning

# Exportar para arquivo legível
node scripts/view-logs.js export output.txt

# Limpar logs antigos (padrão: 7 dias)
node scripts/view-logs.js clean 7
```

### Via Código

```javascript
import logViewer from './src/utils/log-viewer.js';

// Ler todos os logs
const logs = logViewer.readAllLogs();

// Filtrar por tipo
const userMessages = logViewer.getLogsByType('user');

// Filtrar por modo
const architectLogs = logViewer.getLogsByMode('architect');

// Filtrar por fase
const planningLogs = logViewer.getLogsByPhase('planning');

// Obter estatísticas
const stats = logViewer.getStats();
console.log(stats);

// Reconstruir uma conversa
const conversation = logViewer.reconstructConversation(
  'architect',
  new Date('2025-01-03T10:00:00Z')
);

// Exportar logs filtrados
logViewer.exportLogs('export.txt', {
  mode: 'architect',
  phase: 'execution',
  startTime: new Date('2025-01-03T10:00:00Z')
});

// Limpar logs antigos
const result = logViewer.cleanOldLogs(7);
console.log(`Removidos: ${result.removed}, Mantidos: ${result.kept}`);
```

## 🎯 Casos de Uso

### 1. Debugging

Quando algo dá errado, você pode:

```bash
# Ver todas as ferramentas chamadas
node scripts/view-logs.js list tool_call

# Ver apenas resultados de ferramentas que falharam
# (precisa filtrar manualmente no código ou arquivo)

# Exportar tudo de uma sessão específica
node scripts/view-logs.js export debug-session.txt
```

### 2. Análise de Performance

```javascript
import logViewer from './src/utils/log-viewer.js';

const stats = logViewer.getStats();

// Ferramentas mais usadas
console.log('Top ferramentas:', stats.toolUsage);

// Distribuição por modo
console.log('Uso por modo:', stats.byMode);

// Requisições por provedor
console.log('Requisições:', stats.byProvider);
```

### 3. Reproduzir Conversas

```javascript
const conversation = logViewer.reconstructConversation(
  'architect',
  new Date('2025-01-03T10:00:00Z')
);

console.log('Fases executadas:', conversation.phases);
console.log('Ferramentas usadas:', conversation.toolsUsed);

// Reprocessar a mesma conversa
conversation.logs.forEach(log => {
  if (log.type === 'user') {
    // Reenviar para a IA
  }
});
```

### 4. Manutenção

```bash
# Limpar logs de mais de 30 dias
node scripts/view-logs.js clean 30

# Exportar logs antes de limpar
node scripts/view-logs.js export backup.txt
node scripts/view-logs.js clean 7
```

## 🔐 Privacidade e Segurança

- ✅ Logs são **locais** e não são enviados para nenhum servidor
- ✅ Logs estão no **`.gitignore`** e não serão commitados
- ⚠️ Logs podem conter **informações sensíveis** (código, comandos, etc.)
- ⚠️ **Não compartilhe** arquivos de log sem revisar o conteúdo

## 📝 Formato JSONL

O formato JSONL (JSON Lines) facilita:

- **Append eficiente** - Adicionar novos logs sem ler o arquivo inteiro
- **Processamento streaming** - Processar linha por linha
- **Resiliência** - Uma linha corrompida não quebra o arquivo todo
- **Compatibilidade** - Fácil de processar com ferramentas Unix (`grep`, `jq`, etc.)

### Exemplos com ferramentas Unix

```bash
# Contar logs por tipo
cat .claude/ai-conversations.jsonl | jq -r '.type' | sort | uniq -c

# Encontrar todas as tool_calls
cat .claude/ai-conversations.jsonl | jq -r 'select(.type=="tool_call") | .toolName'

# Logs de hoje
cat .claude/ai-conversations.jsonl | jq -r 'select(.ts | startswith("2025-01-03"))'

# Ferramentas que falharam
cat .claude/ai-conversations.jsonl | jq -r 'select(.type=="tool_result" and .result.success==false)'
```

## 🚀 Extensibilidade

Para adicionar novos tipos de logs, edite `src/utils/conversation-logger.js`:

```javascript
export function logCustomEvent({ mode, phase, customData }) {
  append({
    ts: new Date().toISOString(),
    type: 'custom_event',
    mode,
    phase,
    customData
  });
}
```

## 📚 Referências

- **Logger**: `src/utils/conversation-logger.js`
- **Viewer**: `src/utils/log-viewer.js`
- **CLI**: `scripts/view-logs.js`
- **Documentação**: `docs/CONVERSATION_LOGS.md`
