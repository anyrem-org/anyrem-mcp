import { McpServer } from "@modelcontextprotocol/server";

import { config } from "./config.js";
import { registerTools } from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  registerTools(server);

  return server;
}
