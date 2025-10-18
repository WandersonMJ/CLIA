export default {
    config: {
        readError: "Erro ao ler o arquivo de configuração:",
        writeError: "Erro ao escrever no arquivo de configuração:",
        saveSuccess: "Configuração salva com sucesso.",

        providerPrompt: "Selecione o provedor de IA que deseja usar:",
        provider: {
            gemini: "Gemini (Google)",
            openai: "ChatGPT (OpenAI)",
            claude: "Claude (Anthropic)"
        },

        keyExists: "Chave já configurada para {0}. Deseja trocar de chave?",

        modelPrompt: {
            gemini: "Qual modelo do Gemini deseja usar?",
            openai: "Qual modelo da OpenAI deseja usar?",
            claude: "Qual modelo do Claude deseja usar?"
        },

        keyPrompt: {
            gemini: "Insira sua API Key do Google AI Studio:",
            openai: "Insira sua API Key da OpenAI:",
            claude: "Insira sua API Key da Anthropic:"
        },

        invalidKey: "API Key inválida. A configuração falhou.",
        keySuccess: "Usando chave existente para {0}.",

        iaSettings: "Configurações de IA: Provider={0}, Model={1}",

        welcome: "Bem-vindo! Antes de começar, vamos fazer algumas configurações.",
        loaded: "Configuração carregada: OS={0}, Economia={1}, Credenciais={2}",
        noCreds: "nenhuma",
        nd: "N/D",

        osPrompt: "Qual sistema operacional você está utilizando?",
        osSet: "Sistema operacional configurado para: {0}",

        economyPrompt: "Deseja ativar o \"modo economia\"? (A IA lerá arquivos em partes para economizar tokens)",
        economyOn: "Modo de economia ATIVADO.",
        economyOff: "Modo de economia DESATIVADO.",

        iaSetup: "Agora, vamos configurar a IA.",
        providerSuccess: "Provedor '{0}' configurado e pronto para uso!",

        adjustTitle: "=== Ajustar Configurações ===",
        adjustPrompt: "O que deseja configurar?",
        adjustOptions: {
            provider: "Trocar provedor de IA",
            economy: "Alterar modo economia",
            os: "Alterar sistema operacional",
            all: "Reconfigurar tudo"
        },

        providerChange: "--- Trocar Provedor de IA ---",
        reconfigAll: "--- Reconfigurar Tudo ---",
        updateSuccess: "Configurações atualizadas com sucesso!",
        noSoConfigured: "Nenhum SO configurado.",
        errorLoadingCommands: "Erro ao carregar comandos específicos do SO.",
        errorLoadingCommandsOS: "Erro ao carregar comandos para o SO \"${os}\":",
        fatalErrorSystemPrompt: "Erro fatal ao construir o system prompt:",
        couldNotLoadSystemPrompt: "Não foi possível carregar o system-prompt.md",
        errorExecutingTool: "ERRO ao executar ferramenta: ${error.message}\nStack: ${error.stack}",
        iterationLimitReached: "Limite de iterações atingido. A tarefa pode não estar completa.",
        actionDenied: "Ação {0} foi negada pelo usuário.",
        toolNotFound: "Erro: Ferramenta '{0}' não implementada.",
        previousConfigs: "Aplicando configuração armazenada...",
        previousConfigsApplied: "Configuração de sessão aplicada:",
    },
    logger: {
        errorPrefix: "ERRO",
        warnPrefix: "AVISO",
        aiResponse: "IA",
        resultPrefix: "Resultado"
    },
    cli: {
        commands: {
            header: {
                command: "Comando",
                description: "Descrição"
            },
            exit: {
                cmd: "sair, exit",
                desc: "Termina o programa e encerra a sessão da CLI."
            },
            scrap: {
                cmd: "scrap",
                desc: "(Respeita .gitignore) Gera um arquivo JSON com toda a estrutura do projeto."
            },
            config: {
                cmd: "config",
                desc: "Permite ajustar as configurações de IA."
            },
            help: {
                cmd: "help",
                desc: "Exibe a lista de comandos disponíveis."
            },
            edit: {
                cmd: "edit-constants",
                desc: "Abre o arquivo de constantes no editor (Requer reinício da app)."
            },
            prompt: {
                cmd: "<texto>",
                desc: "Qualquer outro texto será usado como prompt para IA configurada."
            }
        },
        shell: "### Comandos Shell Úteis (via ferramenta SHELL):\n",
        constants: {
            edited: "Você precisa reabrir a CLI para aplicar as alterações!"
        },
        scrapError: "Erro ao executar o scraping:",
        interrupt: "Interrupção via Ctrl+C detectada. Encerrando...",
        commandError: "Erro ao processar comando:",
        notConfigured: "Sessão não configurada, iniciando configuração...",
        goodbye: "Até logo!"
    },
    agent: {
        iteration: "Iteração {0}/{1}",
        thinking: "Pensando...",
        toolExec: "IA quer executar: {0}",
        denied: "Ação {0} foi negada pelo usuário.",
        toolNotFound: "Erro: Ferramenta '{0}' não implementada.",
        sysPromptError: "Erro fatal ao construir o system prompt:",
        sysPromptLoadError: "Não foi possível carregar o system-prompt.md",
        iterationLimit: "Limite de iterações atingido. A tarefa pode não estar completa.",
        shell: {
            result: "Resultado do comando '$ {0}':\n{1}",
            error: "ERRO ao executar '$ {0}': {1}"
        }
    },
    client: {
        init: {
            claude: "Cliente Anthropic (Claude) inicializado com o modelo: {0}",
            gemini: "Cliente Gemini inicializado com o modelo: {0}",
            openai: "Cliente OpenAI inicializado com o modelo: {0}"
        },
        gemini: {
            emptyWarn: "Gemini retornou resposta vazia ou bloqueada:",
            contentWarn: "Gemini retornou conteúdo vazio:"
        },
        openai: {
            emptyWarn: "OpenAI retornou resposta vazia ou bloqueada:",
            contentWarn: "OpenAI retornou conteúdo vazio:"
        },
        claude: {
            emptyWarn: "Claude retornou resposta vazia ou bloqueada:",
            contentWarn: "Claude retornou conteúdo vazio:"
        }
    }
};