# CLIA - Guia de setup

Este guia descreve como iniciar uma sessão nova na CLIA, incluindo como iniciar um arquivo de configuração, como usar o modo economia para reduzir custos de IA, e como configurar com prompts de idioma.

Fluxo de inicialização (reconstruído a partir do código):
- Verifica se config.json existe; se não, inicia loop de configuração (idioma, OS, economia, provedores, modelos, credenciais).
- Configura OS e idioma e inicializa clientes de IA conforme provider escolhido.
- Salva as configurações em config.json.

Operações de demonstração úteis:
- scrap: gera a árvore do projeto no arquivo application-tree.json (com base no .gitignore).
- edit-constants: abre o arquivo src/config/constants.js no editor padrão do terminal.

Dicas:
- Use o modo economy para reduzir tokens.
- Verifique as permissões para ações sensíveis antes de permitir alterações no FS.
