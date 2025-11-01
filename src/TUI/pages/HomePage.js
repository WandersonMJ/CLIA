import React from 'react';
import { Box, Text } from 'ink';
import CommandCard from '../components/CommandCard.js';

export default function HomePage() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan" bold>Command Center</Text>
      <CommandCard title="scrap" description="Gerar a árvore do projeto (application-tree.json)" />
      <CommandCard title="config" description="Abrir fluxo de configuração" />
      <CommandCard title="edit-constants" description="Editar src/config/constants.js" />
      <CommandCard title="help" description="Mostrar ajuda" />
      <CommandCard title="sair / exit" description="Sair da CLI" />
    </Box>
  );
}
