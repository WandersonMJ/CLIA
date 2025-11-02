Descrição da Melhoria: Modo Arquiteto

Problema Atual: Atualmente, o agente (em handleAiPrompt.js) usa um único modelo de IA (ex: GPT-4o) para todo o ciclo de vida de uma tarefa. Isso é ineficiente e caro para tarefas complexas. O modelo caro é consumido em cada iteração (ler arquivo, analisar erro, tentar de novo, editar), enviando repetidamente um contexto gigante (o conteúdo dos arquivos), o que gera um custo de input de tokens muito alto.

Solução Proposta (Modo Arquiteto): Implementar um sistema hierárquico (multi-agente) que divide o trabalho entre dois tipos de IA:

O Arquiteto (Ex: GPT-4o, Claude Opus): Um modelo caro e de alta inteligência, usado apenas para planejamento estratégico.

O Executor (Ex: Claude Haiku, Gemini Flash): Um modelo barato e rápido, usado para todo o "trabalho pesado" (iteração, leitura de arquivos, execução de ferramentas).

Isso otimiza o custo, pois o processamento do contexto gigante (leitura de arquivos) é feito pelo modelo barato. O modelo caro é chamado poucas vezes, apenas com resumos.

Fluxo de Implementação (3 Fases)
O handleAiPrompt.js precisaria ser refatorado para atuar como um Orquestrador, gerenciando o seguinte fluxo:

Fase 1: Coleta de Contexto (Liderada pelo Executor) O Orquestrador não envia a tarefa direto para o Arquiteto. Ele primeiro delega a coleta de informações ao Executor.

Input (Executor): Prompt do usuário + Árvore de Arquivos (do file-tree-generator.js).

Missão (Executor): "Sua tarefa não é executar o pedido, mas sim coletar o contexto. Use as ferramentas (como ls via SHELL ou READ_START) para explorar os arquivos relevantes."

Processo (Executor): O Executor itera sozinho (em "modo economia"), lendo partes de arquivos para entender o "snapshot" do problema.

Output (Executor): Um resumo de texto: "Análise concluída. O problema está no service.js (linha X) e no controller.js (linha Y). Aqui está o resumo do código relevante..."

Fase 2: Planejamento Estratégico (Liderada pelo Arquiteto) O Orquestrador agora "escala" a tarefa para o Arquiteto.

Input (Arquiteto): Prompt original do usuário + o Resumo de Contexto gerado pelo Executor na Fase 1.

Missão (Arquiteto): "Com base no prompt do usuário e no contexto coletado pelo seu assistente, gere um planoMestre detalhado (ex: em JSON) com os passos exatos para a execução."

Output (Arquiteto): Um planoMestre (ex: [{ "acao": "EDIT_LINES", "path": "x.js", ... }, { "acao": "CREATE_FILE", ... }]).

Fase 3: Execução (Liderada pelo Executor) O Orquestrador entrega o plano mestre para uma nova instância do Executor.

Input (Executor): O planoMestre gerado pelo Arquiteto.

Missão (Executor): "Execute este plano. Você tem autonomia para usar ferramentas e corrigir pequenos erros (como caminhos de arquivo), mas se o plano falhar fundamentalmente, reporte a falha."

Processo (Executor): O Executor executa o loop de iteração (como o agente atual), seguindo o plano. Se encontrar um erro simples (ex: ls para achar um arquivo), ele se autocorrige.

Output (Executor): 

Sucesso: "Plano executado com sucesso."

Falha (Escalada): Se o Executor falhar (ex: a lógica do plano estava errada), ele para e reporta o erro ao Orquestrador. O Orquestrador, então, reiniciaria a Fase 2, enviando o erro de volta ao Arquiteto para um novo plano.

--- FIM DO ARQUIVO ---