# CLIA - Exemplos de uso

Este arquivo demonstra cenários de uso ideais para a CLI, incluindo exemplos de prompts para cada provedor, e exemplos de operações de FS usando as ferramentas disponibilizadas.

1) Iniciando sem config.json (primeiro uso)
- Explicação: ao rodar CLIA, o sistema inicia loop de configuração para idioma, OS, modo economia e IA provider/model/credenciais. Ao finalizar, salva config.json.
- Comandos: apenas execute clia no terminal.

2) Rodando com economia ativada
- A IA lerá grandes conteúdos em partes para reduzir tokens.
- Observações: pode exigir mais prompts de leitura de arquivos.

3) Executando operações de FS via IA
- Exemplo: usar tool READ para visualizar conteúdo de src/config/constants.js, depois usar EDIT_LINES para editar a seção de configurações de timeout.

4) Atualização de modelo ou credenciais
- Use a cadeia de prompts com o provider escolhido e, se necessário, use UPDATE/REPLACE_IN_FILE ou PATCH via APPLY_PATCH.
