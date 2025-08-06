// src/validation.ts
import { ZodSchema } from 'zod'
import { RequestHandler, Request, NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// Body 검증
export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      // ZodError.issues를 사용합니다
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return res.status(400).json({ errors })
    }
    req.body = result.data
    next()
  }
}

// Query 검증
export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return res.status(400).json({ errors })
    }
    // safeParse로 변환된 타입을 덮어씌웁니다
    req.query = result.data as any
    next()
  }
}

// 인증 미들웨어 (변경 불필요)
export function authenticate(): RequestHandler {
  return (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Unauthorized' })
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
      ;(req as any).userId = payload.userId
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}
