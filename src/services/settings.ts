import type { RequestAuth } from "../auth/request.js";
import { anyremGet } from "./anyrem-api.js";

export function getSettings(auth?: RequestAuth): Promise<unknown> {
  return anyremGet("/api/mcp/settings", undefined, auth);
}
