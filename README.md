# CL.IA: O Coder genérico

## 📝 Descrição

Esta é uma ferramenta de linha de comando (CLI) projetada para ser o seu **copiloto de desenvolvimento**.

Integre e alterne fluidamente entre as principais APIs de IA — **OpenAI (GPT)**, **Google (Gemini)** e **Anthropic (Claude)** — diretamente do seu terminal. Esqueça a troca de contextos; use o poder da IA para automatizar tarefas, analisar código, editar arquivos e executar comandos de shell.

## 🌟 Principais Recursos

* **Multi-Provedor:** Alterne entre OpenAI, Gemini e Claude com um único comando (`config`). Use o melhor modelo para cada tarefa.
* **Agente Autônomo:** Capaz de executar tarefas complexas, ler arquivos (`READ`), editar código (`EDIT_LINES`) e executar comandos de shell (`SHELL`) para atingir um objetivo.
* **Seguro e Interativo:** O agente sempre pedirá sua permissão antes de executar ações críticas, como modificar ou deletar arquivos.
* **Configuração Rápida:** Um setup inicial interativo guia você na configuração de chaves, modelos e preferências (como modo de economia de tokens).
* **Estrutura Modular:** Código limpo e organizado, facilitando a expansão com novas ferramentas ou provedores de IA.

## 🛠️ Comandos Principais

| Comando | Descrição |
| :--- | :--- |
| `config` | Abre o menu interativo para ajustar provedor de IA, modelo, SO ou modo de economia. |
| `scrap` | Gera um `application-tree.json` com o conteúdo de todos os arquivos (respeita o `.gitignore`). |
| `help` | Mostra esta lista de comandos. |
| `edit-constants` | Atalho para editar as constantes internas da CLI no seu editor padrão. |
| `sair` / `exit` | Encerra a aplicação. |
| `<qualquer outro texto>` | Inicia o agente de IA para resolver sua solicitação (Ex: "crie um novo serviço em `src/services`"). |

## 🚀 Como Funciona

1.  **Configuração:** Na primeira vez, use `config` para um setup guiado (API Keys, Modelo, SO).
2.  **Prompt:** Descreva sua tarefa. (Ex: *"Refatore o `gemini-client.js` para usar um `try-catch` melhor no `sendMessage`"*).
3.  **Execução:** O agente de IA planeja as etapas, lê os arquivos, solicita sua permissão para ações críticas e executa a tarefa.
4.  **Resultado:** A IA informa a conclusão ou entrega a resposta final diretamente no terminal.

## 🏗️ Estrutura do Projeto

```
src/ 
├── agent/          # O "cérebro" do agente (loop de prompt, ferramentas)
│   ├── api/ 
│   │   ├── ai/     # Clientes específicos (gemini, openai, claude) 
│   │   └── tools/  # Definição das ferramentas (READ, EDIT_LINES, SHELL) 
├── config/         # Constantes, modelos de IA e arquivos de localização (i18n) 
├── prompts/        # System prompts (en-US, pt-BR) e listas de comandos de SO 
├── services/       # Serviços de núcleo (config, sessão, permissão) 
├── utils/          # Utilitários (logger, scrapper, file-tree) 
├── cli-loop.js     # Loop principal de comandos do usuário 
└── index.js        # Ponto de entrada da aplicação
```

## 🤝 Contribuição

Contribuições são muito bem-vindas! Sinta-se à vontade para abrir *issues*, sugerir melhorias ou enviar *pull requests*.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT.