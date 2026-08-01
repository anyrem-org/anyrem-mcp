#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { logger } from "./logger.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  logger.info("AnyRem MCP server running on stdio");
}

main().catch((error: unknown) => {
  logger.error(error);
  process.exit(1);
});
