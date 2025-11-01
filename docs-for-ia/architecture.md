# CLIA - Arquitetura de alto nível

Este documento descreve a arquitetura da aplicação CLIA (Copiloto de IA CLI autônomo) e como as peças se encaixam para permitir que o usuário interaja com IAs, gerencie a configuração, e execute ações no filesystem com salvaguardas.

Visão geral
- CLIA é uma CLI que integra três provedores de IA (Gemini, OpenAI e Claude) e expõe ferramentas de manipulação de código/FS que a IA pode solicitar.
- Dados fluem entre o usuário, o orquestrador (CLI), o modelo de IA e as ferramentas do sistema de arquivos, com registro de histórico e auditoria.

Componentes principais
- Núcleo de execução
  - src/index.js: Ponto de entrada, carrega config salva, inicializa clientes de IA, prepara e inicia o loop principal. 
  - src/cli-loop.js: Loop de CLI para aceitar comandos, exibir comandos disponíveis e abrir editores quando necessário.
- Configuração, localização e sessão
  - src/services/config-service.js: Lida com leitura/escrita de config.json, prompts de idioma/ilumin, credenciais, provedores e modelos.
  - src/services/api-session.js: Gerencia estado da sessão (provider, credentials, OS, economy mode, language).
  - src/services/language-service.js: Serviço de i18n que carrega PT-BR e EN-US e fornece traduções via get(key).
- Clientes de IA
  - Gemini: src/agent/api/ai/gemini-client.js
  - OpenAI: src/agent/api/ai/open-ai-client.js
  - Claude: src/agent/api/ai/claude-client.js
- Prompt e OS commands
  - Prompts: src/prompts/en-US/system-prompt.md e src/prompts/pt-BR/system-prompt.md
  - OS commands: src/prompts/os-commands/linux.json e windows.json
- Prompt AI e ferramentas
  - handle-ai-prompt.js: Coopera com a IA, organiza o histórico, obtém tool_calls e gerencia permissões.
  - filesystem-tools.js: Conjunto de ferramentas de FS para leitura/escrita/criação/edits/patches.
  - fs-actions.js: Implementação robusta de ações de FS (READ, CREATE, EDIT, PATCH, etc.).
- UI e utilitários
  - cli-ui.js: Exibe comandos e facilita prompt multiline.
  - logger.js: Logging estruturado com cores e prefixos.
- Estrutura de diretórios e traduções
  - src/config/locales PT-BR/EN-US: Pacotes de tradução para prompts e mensagens de UI.
- Observações de design
  - i18n com PT-BR e EN-US
  - Modo economia para leitura de arquivos em partes
  - Segurança com CRITICAL_ACTIONS para permissões
  - SO Shell com comando via SHELL

Fluxo de dados (alto nível)
1) O usuário inicia CLIA pela CLI.
2) index.js carrega config salvo (ou inicia configuração se não existir) e prepara os clientes de IA.
3) O loop principal (cli-loop.js) recebe comandos do usuário e pode acionar funções de configuração, scrap da árvore do projeto, ou editar arquivos.
4) Quando o usuário faz uma pergunta/prompts para IA, handle-ai-prompt.js constrói o system prompt, passa o histórico e as ferramentas disponíveis para a IA.
5) A IA pode retornar mensagens simples ou tool_calls (para acionar ferramentas FS).
6) tool_calls são executadas pela FS actions via fs-actions.js (READ, EDIT_LINES, PATCH, etc.).
7) O fluxo registra o histórico, mostra saídas e continua até o usuário sair.

Notas técnicas e paletes de dados
- Estruturas de dados principais:
  - Conversation history: array de objetos { role, content, ... }, onde IA pode retornar tool_calls.
  - aiMessage: pode conter { content, tool_calls, ... } conforme o provedor.
  - Tool calls: { id, name, arguments } que são passados para a função correspondente (READ, UPDATE, etc.).
- CRITICAL_ACTIONS: lista de ações sensíveis que são checadas via permission-service antes de executar.
- APPLY_PATCH: ferramenta para aplicar patch diff a arquivos para modificações complexas.

Arquitetura de dados de prompts e OS commands
- system-prompt.md: instruções e regras, com placeholders {{FILE_TREE}} e {{OS_COMMANDS}} que são substituídos em tempo de execução pela função getSystemPrompt().
- OS commands: linux.json/windows.json contêm a descrição e comandos para exibir na ajuda da shell.

Observações finais
- Este documento pode servir de referência para novos desenvolvedores ou para sessões de demonstração de IA.
- Se quiser, posso adicionar diagramas, exemplos de prompt por IA, ou um guia de contribuição detalhado.
