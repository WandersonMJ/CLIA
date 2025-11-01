# CLIA - Perguntas frequentes (FAQ)

Q: O que é CLIA?
A: Um copiloto de IA CLI autônomo que pode interagir com Gemini, OpenAI e Claude e executar ações de FS com segurança.

Q: Como é a configuração inicial?
A: O app verifica se existe config.json; se não, inicia o loop de configuração perguntando idioma, OS, economia e provider/model/keys.

Q: O que é o modo economia?
A: Lê o conteúdo de arquivos em partes para reduzir o consumo de tokens durante a interação com IA.

Q: Como é garantida a segurança?
A: Existem CRITICAL_ACTIONS que requerem permissão por meio do permission-service antes de executar ações sensíveis no FS.

Q: Como contribuo?
A: Este repositório já inclui docs para IA, e pode-se contribuir com melhorias e exemplos.