import type { ServerContext } from "@modelcontextprotocol/server";

export type RequestAuth = {
  accessToken?: string;
};

export function requestAuth(ctx: ServerContext): RequestAuth {
  return { accessToken: ctx.http?.authInfo?.token };
}
