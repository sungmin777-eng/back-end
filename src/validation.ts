import { z, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

type SchemaMap = { [key: string]: ZodTypeAny };

export function validateBody<T extends SchemaMap>(schemas: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result: any = {};
    for (const key in schemas) {
      const parsed = schemas[key].safeParse(req.body[key]);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.errors.map(e => e.message) });
      }
      result[key] = parsed.data;
    }
    req.body = result;
    next();
  };
}