import { z } from "zod";

export const searchNotesSchema = z.object({
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.enum(["relevance", "recent"]).optional(),
  pinned: z.enum(["true", "false"]).optional(),
  categoryId: z.uuid().optional(),
});
