import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type Source = "body" | "query" | "params";

export function validate<T extends ZodSchema>(schema: T, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) return next(parsed.error);
    // Replace with validated/coerced data
    (req as unknown as Record<Source, unknown>)[source] = parsed.data;
    next();
  };
}
