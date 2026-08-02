import {
  OAuthError,
  OAuthErrorCode,
  type AuthInfo,
  type OAuthMetadata,
  type OAuthTokenVerifier,
} from "@modelcontextprotocol/server";

import {
  config,
  hasKeycloakClientConfig,
  hasKeycloakConfig,
} from "../config.js";
import ky from "ky";

type TokenResponse = {
  access_token: string;
  expires_in?: number;
};

type IntrospectionResponse = {
  active: boolean;
  client_id?: string;
  azp?: string;
  scope?: string;
  exp?: number;
  sub?: string;
};

let cachedToken: { value: string; expiresAt: number } | undefined;

export async function getKeycloakAccessToken(): Promise<string | undefined> {
  if (!hasKeycloakClientConfig()) {
    return undefined;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const tokenUrl = new URL(
    `/realms/${config.keycloak.realm!}/protocol/openid-connect/token`,
    config.keycloak.url!,
  );

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.keycloak.clientId!,
    client_secret: config.keycloak.clientSecret!,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Keycloak token request failed: ${response.status}`);
  }

  const token = (await response.json()) as TokenResponse;
  const ttl = token.expires_in ?? 60;
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + Math.max(ttl - 10, 1) * 1000,
  };

  return cachedToken.value;
}

export const keycloakVerifier: OAuthTokenVerifier = {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    if (!hasKeycloakClientConfig()) {
      throw new Error(
        "KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, and KEYCLOAK_CLIENT_SECRET are required for HTTP auth",
      );
    }

    // https://datatracker.ietf.org/doc/html/rfc7662#section-2.1
    // Content-Type: Must be application/x-www-form-urlencoded
    const body = new URLSearchParams({
      token,
      client_id: config.keycloak.clientId!,
      client_secret: config.keycloak.clientSecret!,
    });

    const response = await ky.post(keycloakUrl("token/introspect"), {
      body,
    });

    if (!response.ok) {
      throw new Error(`Keycloak introspection failed: ${response.status}`);
    }

    const result = (await response.json()) as IntrospectionResponse;

    if (!result.active || !result.exp) {
      throw new OAuthError(OAuthErrorCode.InvalidToken, "Invalid access token");
    }

    return {
      token,
      clientId: result.client_id ?? result.azp ?? config.keycloak.clientId!,
      scopes: result.scope?.split(" ").filter(Boolean) ?? [],
      expiresAt: result.exp,
      extra: { sub: result.sub },
    };
  },
};

// https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/authorization#mcp-server-setup
export async function getKeycloakOAuthMetadata(): Promise<OAuthMetadata> {
  if (!hasKeycloakConfig()) {
    throw new Error(
      "KEYCLOAK_URL and KEYCLOAK_REALM are required for HTTP auth metadata",
    );
  }

  const response = await fetch(
    new URL(
      `/realms/${config.keycloak.realm!}/.well-known/openid-configuration`,
      config.keycloak.url!,
    ),
  );

  if (!response.ok) {
    throw new Error(`Keycloak metadata request failed: ${response.status}`);
  }

  return (await response.json()) as OAuthMetadata;
}

function keycloakUrl(path: string): URL {
  return new URL(
    `/realms/${config.keycloak.realm!}/protocol/openid-connect/${path}`,
    config.keycloak.url!,
  );
}
