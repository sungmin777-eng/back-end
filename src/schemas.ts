import { z } from 'zod'

// ── Auth ───────────────────────────────────────────────
export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
export const loginSchema = signupSchema

// ── Product ─────────────────────────────────────────────
export const productCreateSchema = z.object({ name: z.string().min(1), unitPrice: z.number().int().nonnegative(), unit: z.string().min(1) })
export const productUpdateSchema = productCreateSchema.partial()
export const productListQuerySchema = z.object({
  skip: z.string().optional().transform(val => Number(val ?? 0)),
  take: z.string().optional().transform(val => Number(val ?? 10)).refine(n => n > 0 && n <= 100, { message: 'take must be 1-100' }),
  search: z.string().optional()
})

// ── Customer ────────────────────────────────────────────
export const customerCreateSchema = z.object({ name: z.string().min(1), phone: z.string().min(1), memo: z.string().optional() })
export const customerUpdateSchema = customerCreateSchema.partial()

// ── Sale ────────────────────────────────────────────────
export const saleCreateSchema = z.object({ date: z.string().refine(s => !Number.isNaN(Date.parse(s))), productId: z.number().int().positive(), quantity: z.number().int().positive(), totalPrice: z.number().int().nonnegative(), customerId: z.number().int().positive().optional() })
export const saleUpdateSchema = saleCreateSchema.partial()

// ── Post ───────────────────────────────────────────────
export const postCreateSchema = z.object({ title: z.string().min(1), content: z.string().min(1) })
export const postUpdateSchema = postCreateSchema.partial()