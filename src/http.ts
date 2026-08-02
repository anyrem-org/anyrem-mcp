#!/usr/bin/env node
import {
  createServer as createHttpServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import {
  createMcpHandler,
  getOAuthProtectedResourceMetadataUrl,
  oauthMetadataResponse,
  requireBearerAuth,
  type AuthMetadataOptions,
} from "@modelcontextprotocol/server";

import { getKeycloakOAuthMetadata, keycloakVerifier } from "./auth/keycloak.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { createServer } from "./server.js";

// https://ts.sdk.modelcontextprotocol.io/v2/serving/express.html
const handler = createMcpHandler(() => createServer(), {
  onerror: (error) => logger.error(error),
});

const resourceServerUrl = mcpServerUrl();
const authMetadata: AuthMetadataOptions = {
  oauthMetadata: await getKeycloakOAuthMetadata(),
  resourceServerUrl,
  resourceName: "AnyRem MCP",
  dangerouslyAllowInsecureIssuerUrl: config.http.allowInsecureIssuer,
};
// check authMiddleware: https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/authorization#mcp-server-setup
const authGate = requireBearerAuth({
  verifier: keycloakVerifier,
  resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(resourceServerUrl),
});

const httpServer = createHttpServer(async (nodeReq, nodeRes) => {
  try {
    const request = await toWebRequest(nodeReq);
    // https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery#protected-resource-metadata-discovery-requirements
    const metadataResponse = oauthMetadataResponse(request, authMetadata);
    if (metadataResponse) {
      await writeWebResponse(nodeRes, metadataResponse);
      return;
    }

    if (
      request.method === "GET" &&
      new URL(request.url).pathname === "/healthz"
    ) {
      await writeWebResponse(nodeRes, Response.json({ ok: true }));
      return;
    }

    if (new URL(request.url).pathname !== config.http.path) {
      nodeRes.writeHead(404).end("Not found");
      return;
    }

    const auth = await authGate(request);

    const response =
      auth instanceof Response
        ? auth
        : await handler.fetch(request, { authInfo: auth });

    await writeWebResponse(nodeRes, response);
  } catch (error) {
    logger.error(error);
    nodeRes.writeHead(500).end("Internal server error");
  }
});

httpServer.listen(config.http.port, () => {
  logger.info(
    `AnyRem MCP HTTP server listening on :${config.http.port}${config.http.path}`,
  );
});

function mcpServerUrl(): URL {
  return new URL(
    config.http.serverUrl ??
      `http://localhost:${config.http.port}${config.http.path}`,
  );
}

function toWebRequest(req: IncomingMessage): Promise<Request> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
      resolve(
        new Request(url, {
          method: req.method,
          headers: req.headers as HeadersInit,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        }),
      );
    });
  });
}

async function writeWebResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
  res.writeHead(response.status, Object.fromEntries(response.headers));

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
