import React from 'react';
import { Box } from 'ink';

export default function MainLayout({ header, children }) {
  return (
    <Box flexDirection="column" padding={1}>
      {header}
      <Box marginTop={1}>{children}</Box>
    </Box>
  );
}
