import ky from "ky";

import { getKeycloakAccessToken } from "../auth/keycloak.js";
import type { RequestAuth } from "../auth/request.js";
import { config } from "../config.js";

type QueryValue = string | number | boolean | undefined;

export async function anyremGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  auth?: RequestAuth,
): Promise<T> {
  const url = anyremUrl(path);
  const token = auth?.accessToken ?? (await getKeycloakAccessToken());

  return ky
    .get(url, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      searchParams: cleanQuery(query),
    })
    .json<T>();
}

function anyremUrl(path: string): URL {
  if (!config.anyremApiUrl) {
    throw new Error("ANYREM_API_URL is required");
  }

  const base = config.anyremApiUrl.endsWith("/")
    ? config.anyremApiUrl
    : `${config.anyremApiUrl}/`;

  return new URL(path.replace(/^\/+/, ""), base);
}

function cleanQuery(query?: Record<string, QueryValue>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query ?? {})
      .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );
}
