import path from 'path'
import cors from 'cors'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { validateBody, validateQuery, authenticate } from './validation'
import { signupSchema, loginSchema, productCreateSchema, productUpdateSchema, productListQuerySchema, customerCreateSchema, customerUpdateSchema, saleCreateSchema, saleUpdateSchema, postCreateSchema, postUpdateSchema } from './schemas'

const app = express()
const prisma = new PrismaClient()
const PORT = Number(process.env.PORT ?? 3000)
const JWT_SECRET = process.env.JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

app.use(cors())
app.use(express.json())
const publicDir = path.join(process.cwd(), 'public')
app.use(express.static(publicDir))

// Auth Routes
app.post('/auth/signup', validateBody(signupSchema), async (req, res) => {
  const { email, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hash } })
  res.status(201).json({ id: user.id, email: user.email })
})
app.post('/auth/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// Health-check
app.get('/health', (_req, res) => res.send('OK 🩺'))

// Product CRUD with pagination & search
app.get('/products', validateQuery(productListQuerySchema), async (req, res) => {
  const { skip, take, search } = req.query as any
  const where = search ? { name: { contains: search, mode: 'insensitive' } } : {}
  const total = await prisma.product.count({ where })
  const list = await prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } })
  res.json({ total, skip, take, list })
})
app.post('/products', authenticate(), validateBody(productCreateSchema), async (req, res) => { const product = await prisma.product.create({ data: req.body }); res.status(201).json(product) })
app.get('/products/:id', async (req, res) => { const id = Number(req.params.id); const item = await prisma.product.findUnique({ where: { id } }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item) })
app.put('/products/:id', authenticate(), validateBody(productUpdateSchema), async (req, res) => { const id = Number(req.params.id); try { const updated = await prisma.product.update({ where: { id }, data: req.body }); res.json(updated) } catch { res.status(404).json({ error: 'Not found or invalid data' }) } })
app.delete('/products/:id', authenticate(), async (req, res) => { const id = Number(req.params.id); try { await prisma.product.delete({ where: { id } }); res.status(204).send() } catch { res.status(404).json({ error: 'Not found' }) } })

// Relation-based: Sales for Customer & Product
app.get('/customers/:id/sales', async (req, res) => {
  const id = Number(req.params.id)
  const sales = await prisma.sale.findMany({ where: { customerId: id }, include: { product: true } })
  res.json(sales)
})
app.get('/products/:id/sales', async (req, res) => {
  const id = Number(req.params.id)
  const sales = await prisma.sale.findMany({ where: { productId: id }, include: { customer: true } })
  res.json(sales)
})

// Customer CRUD
app.get('/customers', async (_, res) => { const customers = await prisma.customer.findMany(); res.json(customers) })
app.post('/customers', authenticate(), validateBody(customerCreateSchema), async (req, res) => { const customer = await prisma.customer.create({ data: req.body }); res.status(201).json(customer) })
app.get('/customers/:id', async (req, res) => { const id = Number(req.params.id); const c = await prisma.customer.findUnique({ where: { id } }); if (!c) return res.status(404).json({ error: 'Not found' }); res.json(c) })
app.put('/customers/:id', authenticate(), validateBody(customerUpdateSchema), async (req, res) => { const id = Number(req.params.id); try { const updated = await prisma.customer.update({ where: { id }, data: req.body }); res.json(updated) } catch { res.status(404).json({ error: 'Not found or invalid data' }) } })
app.delete('/customers/:id', authenticate(), async (req, res) => { const id = Number(req.params.id); try { await prisma.customer.delete({ where: { id } }); res.status(204).send() } catch { res.status(404).json({ error: 'Not found' }) } })

// Sale CRUD
app.get('/sales', async (_, res) => { const sales = await prisma.sale.findMany({ include: { product: true, customer: true }, orderBy: { date: 'desc' } }); res.json(sales) })
app.post('/sales', authenticate(), validateBody(saleCreateSchema), async (req, res) => { const data = { ...req.body, date: new Date(req.body.date) }; const sale = await prisma.sale.create({ data }); res.status(201).json(sale) })
app.get('/sales/:id', async (req, res) => { const id = Number(req.params.id); const sale = await prisma.sale.findUnique({ where: { id }, include: { product: true, customer: true } }); if (!sale) return res.status(404).json({ error: 'Not found' }); res.json(sale) })
app.put('/sales/:id', authenticate(), validateBody(saleUpdateSchema), async (req, res) => { const id = Number(req.params.id); try { const data = req.body.date ? { ...req.body, date: new Date(req.body.date) } : req.body; const updated = await prisma.sale.update({ where: { id }, data }); res.json(updated) } catch { res.status(404).json({ error: 'Not found or invalid data' }) } })
app.delete('/sales/:id', authenticate(), async (req, res) => { const id = Number(req.params.id); try { await prisma.sale.delete({ where: { id } }); res.status(204).send() } catch { res.status(404).json({ error: 'Not found' }) } })

// Post CRUD
app.get('/posts', async (_, res) => { const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } }); res.json(posts) })
app.post('/posts', authenticate(), validateBody(postCreateSchema), async (req, res) => { const post = await prisma.post.create({ data: req.body }); res.status(201).json(post) })
app.get('/posts/:id', async (req, res) => { const id = Number(req.params.id); const p = await prisma.post.findUnique({ where: { id } }); if (!p) return res.status(404).json({ error: 'Not found' }); res.json(p) })
app.put('/posts/:id', authenticate(), validateBody(postUpdateSchema), async (req, res) => { const id = Number(req.params.id); try { const updated = await prisma.post.update({ where: { id }, data: req.body }); res.json(updated) } catch { res.status(404).json({ error: 'Not found or invalid data' }) } })
app.delete('/posts/:id', authenticate(), async (req, res) => { const id = Number(req.params.id); try { await prisma.post.delete({ where: { id } }); res.status(204).send() } catch { res.status(404).json({ error: 'Not found' }) } })

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
