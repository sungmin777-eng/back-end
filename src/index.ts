import express from 'express'
import { PrismaClient } from '@prisma/client'
import { validateBody } from './validation'
import { productCreateSchema, postCreateSchema } from './schemas'
const app = express()
const prisma = new PrismaClient()
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json())

// Health-check
app.get('/', (_req, res) => {
  res.send('🍎 과일 백엔드 서버 실행 중!')
})

// 생성할 때만 검증
app.post(
  '/products',
  validateBody(productCreateSchema),
  async (req, res) => {
    const { name, unitPrice, unit } = req.body
    const product = await prisma.product.create({ data: { name, unitPrice, unit } })
    res.status(201).json(product)
  }
)
// ── Product CRUD ─────────────────────────────────

// 1) 전체 조회
app.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany()
  res.json(products)
})

// 2) 단건 조회
app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json(product)
})

// 3) 생성
app.post('/products', async (req, res) => {
  const { name, unitPrice, unit } = req.body
  const product = await prisma.product.create({
    data: { name, unitPrice, unit }
  })
  res.status(201).json(product)
})

// 4) 업데이트
app.put('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { name, unitPrice, unit } = req.body
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { name, unitPrice, unit }
    })
    res.json(product)
  } catch {
    res.status(404).json({ error: 'Not found or invalid data' })
  }
})

// 5) 삭제
app.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    await prisma.product.delete({ where: { id } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})


// ── Post CRUD ────────────────────────────────────────

// 1) 전체 글 조회
app.get('/posts', async (_req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(posts);
});

// 2) 단건 글 조회
app.get('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// 3) 글 작성
app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  const post = await prisma.post.create({ data: { title, content } });
  res.status(201).json(post);
});

// 4) 글 수정
app.put('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;
  try {
    const post = await prisma.post.update({
      where: { id },
      data: { title, content },
    });
    res.json(post);
  } catch {
    res.status(404).json({ error: 'Post not found or invalid data' });
  }
});

// 5) 글 삭제
app.delete('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Post not found' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
}).on('error', (err: any) => {
  console.error('❌ Server failed to start:', err);
});