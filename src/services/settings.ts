import type { RequestAuth } from "../auth/request.js";
import { anyremGet } from "./anyrem-api.js";

export function getSettings(auth?: RequestAuth): Promise<unknown> {
  return anyremGet("/api/settings", undefined, auth);
}

export function getDateTimeFormats(auth?: RequestAuth): Promise<unknown> {
  return anyremGet("/api/settings/date-time-format", undefined, auth);
}
