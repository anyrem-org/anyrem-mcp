import { config, hasKeycloakConfig } from "../config.js";

type TokenResponse = {
  access_token: string;
  expires_in?: number;
};

let cachedToken: { value: string; expiresAt: number } | undefined;

export async function getKeycloakAccessToken(): Promise<string | undefined> {
  if (!hasKeycloakConfig()) {
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
