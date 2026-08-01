export const config = {
  name: "anyrem-mcp",
  version: "1.0.0",
  anyremApiUrl: process.env.ANYREM_API_URL,
  anyremHealthPath: process.env.ANYREM_HEALTH_PATH ?? "/api/health",
  keycloak: {
    url: process.env.KEYCLOAK_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
};

export function hasKeycloakConfig(): boolean {
  return Boolean(
    config.keycloak.url &&
      config.keycloak.realm &&
      config.keycloak.clientId &&
      config.keycloak.clientSecret,
  );
}
