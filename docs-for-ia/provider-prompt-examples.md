# CLIA - Exemplos de prompts por provedor de IA

Este documento fornece exemplos de prompts para cada provedor de IA (Gemini, OpenAI, Claude) para orientar o uso, com e sem ferramentas.

Observação: os exemplos seguem a convenção de prompts do sistema e do histórico de conversa já usados pela aplicação.

Gemini (Google)
- Prompt de cenário: Você é um assistente autônomo de programação. (instruções do system-prompt que descrevem o comportamento esperado)
- Exemplo de prompt sem ferramentas:
  - Pergunta: Como posso organizar meus componentes de IA no projeto X?
  - Resposta esperada: ...
- Exemplo de prompt com ferramentas:
  - Pergunta: Liste os arquivos modificáveis e peça para editar o arquivo Y. Use a ferramenta READ para ler X linhas.
  - Resposta esperada: ...

OpenAI (ChatGPT)
- Prompt de cenário: similar ao Gemini, com a formatação de mensagens e especificação de ferramentas no request.
- Exemplos com ferramentas similares aos do Gemini.

Claude (Anthropic)
- Prompt de cenário: semelhante, com uso de system prompt e a normalização das respostas para ferramenta_calls.
- Exemplos com tool_calls para READ, WRITE, PATCH, etc.

Observações:
- Esses exemplos são sugeridos para orientar interações, mas devem ser ajustados conforme o contexto da sessão e permissões.
