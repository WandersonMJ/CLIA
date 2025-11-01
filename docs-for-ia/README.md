# CLIA - Documentação interna para IA

Este documento descreve, em alto nível, a arquitetura e o fluxo da aplicação CLIA (Copiloto de IA CLI autônomo), com foco em IA e ações de automação em código e no sistema de arquivos.

Resumo executivo:
- Nome: CLIA (Copiloto de IA CLI autônomo)
- Propósito: CLI autônoma para interagir com Gemini, OpenAI e Claude, com execução de ações no FS e prompts dinâmicos.
- Escopo: Ler a árvore de projeto, gerenciar configuração persistente, e permitir que IA utilize ferramentas para modificar código de forma controlada.

Arquitetura em alto nível:
- Núcleo de execução
  - src/index.js: Ponto de entrada da aplicação. Carrega configuração salva, inicializa clientes de IA e inicia o loop principal.
  - src/cli-loop.js: Loop de linha de comando com comandos especiais.
- Configuração, localização e sessão
  - src/services/config-service.js, src/services/api-session.js, src/services/language-service.js: Gerenciam configuração, sessão e i18n.
- Clientes de IA
  - Gemini, OpenAI, Claude: src/agent/api/ai/gemini-client.js, open-ai-client.js, claude-client.js
- Sistema de prompts e OS commands
  - Prompts: src/prompts/en-US/system-prompt.md, pt-BR/system-prompt.md
  - OS commands: linux.json, windows.json
- Prompt AI e ferramentas
  - handle-ai-prompt.js, filesystem-tools.js, fs-actions.js
- UI e utilitários
  - cli-ui.js, logger.js
- Estrutura de diretório e locais de tradução
  - locales pt-BR/en-US, etc

Fluxo de uso (alto nível):
1) Ex.: clia
2) Inicia configuração se não houver config.json
3) O usuário interage com prompts da IA para obter respostas e possivelmente acionar ferramentas
4) Ferramentas incluem: read, edit, create, patch, etc., com salvaguardas para ações CRITICAS.

Observações:
- Suporte a i18n (pt-BR, en-US)
- Modo economia para reduzir tokens
- Segurança com permissões para ações sensíveis

Se quiser, posso adicionar mais seções, como guias de uso, exemplos de prompts por provedor, ou um roadmap.
