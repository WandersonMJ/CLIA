const applyPatch = {
  name: "APPLY_PATCH",
  description: "Aplica um patch de formato 'diff' a um arquivo existente. Esta é a forma PREFERIDA para modificações complexas.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser modificado (ex: 'src/service.js').",
      },
      patchContent: {
        type: "string",
        description: "O patch no formato 'unified diff' (começando com '--- a/...' e '+++ b/...').",
      },
    },
    required: ["filePath", "patchContent"],
  },
};

const readFile = {
  name: "READ",
  description: "Lê o conteúdo completo de um único arquivo no sistema.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/index.js').",
      },
    },
    required: ["filePath"],
  },
};

const readStartOfFile = {
  name: "READ_START",
  description: "Lê a PRIMEIRA METADE de um arquivo. Use isto para arquivos grandes ou para economizar tokens.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/main.js').",
      },
    },
    required: ["filePath"],
  },
};

const readEndOfFile = {
  name: "READ_END",
  description: "Lê a SEGUNDA METADE de um arquivo. Use SOMENTE após ter usado READ_START no mesmo arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser lido (ex: 'src/main.js').",
      },
    },
    required: ["filePath"],
  },
};

const createFile = {
  name: "CREATE",
  description: "Cria um novo arquivo vazio. Para adicionar conteúdo, use CREATE_WITH_CONTENT ou EDIT_LINES.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser criado (ex: 'src/novo-arquivo.js').",
      },
    },
    required: ["filePath"],
  },
};

const createFileWithContent = {
  name: "CREATE_WITH_CONTENT",
  description: "Cria um novo arquivo e já escreve o conteúdo nele.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser criado (ex: 'src/component.js').",
      },
      content: {
        type: "string",
        description: "O conteúdo completo a ser escrito no novo arquivo.",
      },
    },
    required: ["filePath", "content"],
  },
};

const deleteFile = {
  name: "DELETE",
  description: "Deleta um arquivo permanentemente.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser deletado (ex: 'src/temp.js').",
      },
    },
    required: ["filePath"],
  },
};

const moveFile = {
  name: "MOVE",
  description: "Move ou renomeia um arquivo. PREFIRA isto a deletar e criar um novo.",
  input_schema: {
    type: "object",
    properties: {
      sourcePath: {
        type: "string",
        description: "O caminho do arquivo original (ex: 'src/old-name.js').",
      },
      destPath: {
        type: "string",
        description: "O novo caminho ou nome do arquivo (ex: 'src/new-name.js').",
      },
    },
    required: ["sourcePath", "destPath"],
  },
};

const editLines = {
  name: "EDIT_LINES",
  description: "Edita (substitui) um bloco de linhas específico em um arquivo. É a forma MAIS EFICIENTE de modificar um arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser editado (ex: 'src/utils.js').",
      },
      startLine: {
        type: "number",
        description: "A primeira linha do bloco a ser substituído (1-indexado).",
      },
      endLine: {
        type: "number",
        description: "A última linha do bloco a ser substituído (1-indexado).",
      },
      newContent: {
        type: "string",
        description: "O novo conteúdo que substituirá as linhas de startLine até endLine.",
      },
    },
    required: ["filePath", "startLine", "endLine", "newContent"],
  },
};

const insertLines = {
  name: "INSERT_LINES",
  description: "Insere um novo bloco de código APÓS um número de linha específico em um arquivo.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser modificado (ex: 'src/main.js').",
      },
      lineNumber: {
        type: "number",
        description: "O número da linha (1-indexado) APÓS a qual o novo conteúdo será inserido. Use 0 para inserir no início do arquivo.",
      },
      content: {
        type: "string",
        description: "O novo conteúdo a ser inserido.",
      },
    },
    required: ["filePath", "lineNumber", "content"],
  },
};

const replaceInFile = {
  name: "REPLACE_IN_FILE",
  description: "Localiza um texto exato (case-sensitive) em um arquivo e o substitui por um novo texto (apenas a primeira ocorrência).",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo (ex: 'src/config.js').",
      },
      searchText: {
        type: "string",
        description: "O texto exato a ser procurado.",
      },
      replaceText: {
        type: "string",
        description: "O novo texto que substituirá o searchText.",
      },
    },
    required: ["filePath", "searchText", "replaceText"],
  },
};

const shell = {
  name: "SHELL",
  description: "Executa um comando do sistema operacional (shell, bash, cmd). Use com cuidado. Não use para comandos de arquivo (use READ, CREATE, etc).",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "O comando a ser executado (ex: 'npm install', 'ls -la').",
      },
    },
    required: ["command"],
  },
};

const updateFile = {
  name: "UPDATE",
  description: "Reescreve o arquivo INTEIRO com um novo conteúdo. Use apenas se EDIT_LINES ou INSERT_LINES não forem adequados.",
  input_schema: {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "O caminho relativo do arquivo a ser reescrito (ex: 'src/index.js').",
      },
      newContent: {
        type: "string",
        description: "O novo conteúdo COMPLETO do arquivo.",
      },
    },
    required: ["filePath", "newContent"],
  },
};

const createDirectory = {
  name: "CREATE_DIRECTORY",
  description: "Cria um novo diretório (pasta). Cria diretórios pais se não existirem.",
  input_schema: {
    type: "object",
    properties: {
      dirPath: {
        type: "string",
        description: "O caminho relativo do diretório a ser criado (ex: 'src/nova-pasta/componentes').",
      },
    },
    required: ["dirPath"],
  },
};

export function getTools(isEconomyMode) {
  const commonTools = [
    createFile,
    createFileWithContent,
    deleteFile,
    moveFile,
    editLines,
    insertLines,
    replaceInFile,
    applyPatch,
    shell,
    updateFile,
    createDirectory,
  ];

  if (isEconomyMode) {
    return [readStartOfFile, readEndOfFile, ...commonTools];
  } else {
    return [readFile, ...commonTools];
  }
}