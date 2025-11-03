export default {
    config: {
        readError: "Error reading configuration file:",
        writeError: "Error writing configuration file:",
        saveSuccess: "Configuration saved successfully.",

        providerPrompt: "Select the AI provider you want to use:",
        provider: {
            gemini: "Gemini (Google)",
            openai: "ChatGPT (OpenAI)",
            claude: "Claude (Anthropic)"
        },

        keyExists: "Key already configured for {0}. Change key?",

        modelPrompt: {
            gemini: "Which Gemini model do you want to use?",
            openai: "Which OpenAI model do you want to use?",
            claude: "Which Claude model do you want to use?"
        },

        keyPrompt: {
            gemini: "Enter your Google AI Studio API Key:",
            openai: "Enter your OpenAI API Key:",
            claude: "Enter your Anthropic API Key:"
        },

        invalidKey: "Invalid API Key. Configuration failed.",
        keySuccess: "Using existing key for {0}.",

        iaSettings: "AI Settings: Provider={0}, Model={1}",

        welcome: "Welcome! Before starting, let's set up a few things.",
        loaded: "Configuration loaded: OS={0}, Economy={1}, Credentials={2}",
        noCreds: "none",
        nd: "N/A",

        osPrompt: "Which operating system are you using?",
        osSet: "Operating system set to: {0}",

        economyPrompt: "Enable 'economy mode'? (AI will read files in parts to save tokens)",
        economyOn: "Economy mode ACTIVATED.",
        economyOff: "Economy mode DEACTIVATED.",

        iaSetup: "Now, let's configure the AI.",
        providerSuccess: "Provider '{0}' configured and ready to use!",

        adjustTitle: "=== Adjust Settings ===",
        adjustPrompt: "What do you want to configure?",
        adjustOptions: {
            provider: "Change AI provider",
            economy: "Toggle economy mode",
            os: "Change operating system",
            all: "Reconfigure everything"
        },

        providerChange: "--- Change AI Provider ---",
        reconfigAll: "--- Reconfigure Everything ---",
        updateSuccess: "Settings updated successfully!",
        noSoConfigured: "No OS configured.",
        errorLoadingCommands: "Error loading specific OS commands.",
        errorLoadingCommandsOS: "Error loading commands for OS \"${os}\":",
        fatalErrorSystemPrompt: "Fatal error building the system prompt:",
        couldNotLoadSystemPrompt: "Could not load system-prompt.md",
        errorExecutingTool: "ERROR executing tool: ${error.message}\nStack: ${error.stack}",
        iterationLimitReached: "Iteration limit reached. The task may not be complete.",
        actionDenied: "Action {0} was denied by the user.",
        toolNotFound: "Error: Tool '{0}' not implemented.",
        previousConfigs: "Applying previous configurations...",
        previousConfigsApplied: "Session config applied:",
    },
    logger: {
        errorPrefix: "ERROR",
        warnPrefix: "WARNING",
        aiResponse: "AI",
        resultPrefix: "RESULT"
    },
    cli: {
        commands: {
            header: {
                command: "Command",
                description: "Description"
            },
            exit: {
                cmd: "exit, quit",
                desc: "Exits the application."
            },
            scrap: {
                cmd: "scrap",
                desc: "(Respects .gitignore) Generates a JSON file of the project structure."
            },
            config: {
                cmd: "config",
                desc: "Allows adjusting AI and session settings."
            },
            help: {
                cmd: "help",
                desc: "Displays this list of available commands."
            },
            edit: {
                cmd: "edit-constants",
                desc: "Opens the constants file in the editor (Requires app restart)."
            },
            prompt: {
                cmd: "<text>",
                desc: "Any other text will be used as a prompt for the configured AI."
            }
        },
        shell: "### Commands Shell usables (using SHELL tool):\n",
        constants: {
            edited: "You need to reopen the CLI to apply those adjusts!"
        },
        scrapError: "Error during scraping:",
        interrupt: "Interrupt via Ctrl+C detected. Shutting down...",
        commandError: "Error processing command:",
        notConfigured: "Session not configured, starting setup...",
        goodbye: "Goodbye!"
    },
    agent: {
        iteration: "Iteration {0}/{1}",
        thinking: "Thinking...",
        toolExec: "AI wants to execute: {0}",
        denied: "Action {0} was denied by the user.",
        toolNotFound: "Error: Tool '{0}' not implemented.",
        sysPromptError: "Fatal error building system prompt:",
        sysPromptLoadError: "Could not load system-prompt.md",
        iterationLimit: "Iteration limit reached. The task may not be complete.",
        interrupted: "⚠️  Processing interrupted by user (ESC pressed).",
        shell: {
            result: "Result of command '$ {0}':\n{1}",
            error: "ERROR executing '$ {0}': {1}"
        }
    },
    client: {
        init: {
            claude: "Anthropic (Claude) client initialized with model: {0}",
            gemini: "Gemini client initialized with model: {0}",
            openai: "OpenAI client initialized with model: {0}"
        },
        gemini: {
            emptyWarn: "Gemini returned empty or blocked response:",
            contentWarn: "Gemini returned empty content:"
        },
        openai: {
            emptyWarn: "OpenAI returned empty or blocked response:",
            contentWarn: "OpenAI returned empty content:"
        },
        claude: {
            emptyWarn: "Claude returned empty or blocked response:",
            contentWarn: "Claude returned empty content:"
        },
    }
};