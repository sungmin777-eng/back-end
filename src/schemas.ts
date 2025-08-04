// src/schemas.ts
import { z } from 'zod';

export const productCreateSchema = {
  name: z.string().min(1, 'name은 필수입니다.'),
  unitPrice: z.number().int().nonnegative('unitPrice는 0 이상의 정수여야 합니다.'),
  unit: z.string().min(1, 'unit은 필수입니다.'),
};

export const postCreateSchema = {
  title: z.string().min(1, 'title은 필수입니다.'),
  content: z.string().min(1, 'content는 필수입니다.'),
};
