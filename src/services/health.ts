import type { RequestAuth } from "../auth/request.js";
import { config } from "../config.js";
import { anyremGet } from "./anyrem-api.js";

export async function getAnyRemHealth(auth?: RequestAuth): Promise<unknown> {
  return anyremGet(config.anyremHealthPath, undefined, auth);
}
