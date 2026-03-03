import { z as baseZ } from "zod";

export const z = baseZ;

export type ZodResult<T> = { success: true; data: T } | { success: false; errors: string[] };

export function parseWithZod<T>(input: unknown, schema: baseZ.ZodType<T>): ZodResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`);
  return { success: false, errors };
}

export const idSchema = z.union([z.string().min(1), z.number().int()]);
export const isoDateSchema = z.string().datetime({ offset: true });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(20),
});

export const planCodeSchema = z.enum(["ADULT_UNLIMITED", "YOUTH_2X", "DROP_IN"]);
