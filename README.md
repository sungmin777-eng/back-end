# 🍎 Fruit CRUD API (TypeScript + Express + Prisma)

과일 쇼핑몰 백엔드 기능을 실습하며 Express.js 기반으로 CRUD API 서버를 구현했습니다.  
관계형 데이터를 중심으로 Prisma ORM, PostgreSQL, Docker, Zod 등 실무에서 사용되는 스택을 도입해 학습했습니다.

---

## ⚙️ 기술 스택

| 항목 | 기술 |
|------|------|
| Language | TypeScript |
| Server Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Container | Docker (학습용 설치) |
| Validator | Zod |
| API Test | Postman / Thunder Client |
| Runtime | Node.js (v20+) |

---

## 📌 프로젝트 개요

- 경량화된 Express.js 프레임워크를 사용해 직접 라우팅, 미들웨어 흐름을 구성했습니다.
- Prisma ORM을 통해 DB 쿼리를 코드로 정의하고, TypeScript 기반으로 타입 안전성을 확보했습니다.
- 과일 상품과 관련된 CRUD(생성/조회/수정/삭제) API를 구현하며, RESTful 설계 원칙을 적용했습니다.
- 관계형 데이터(RDBMS)의 구조를 이해하기 위해 PostgreSQL을 선택했고, 도커로 환경 구성 실습을 병행했습니다.
- zod를 통해 요청 데이터에 대한 유효성 검사 및 에러 핸들링을 강화했습니다.

---

## 🛠 주요 기능

- `GET /fruits` - 과일 목록 조회
- `GET /fruits/:id` - 특정 과일 조회
- `POST /fruits` - 과일 추가
- `PUT /fruits/:id` - 과일 정보 수정
- `DELETE /fruits/:id` - 과일 삭제

---

## 🔐 예비 학습 및 CS 기반 이해 요소

| 개념 | 내용 |
|------|------|
| HTTP/REST | GET/POST/PUT/DELETE 요청 구조 이해 |
| 비동기 처리 | async/await + Promise 흐름 |
| 데이터 정규화 | PostgreSQL 테이블 설계 시 고려 |
| 에러 처리 | try/catch + zod 기반 유효성 검사 |
| 컨테이너화 | Docker Compose로 DB와 서버 분리 예정 |
| 확장성 | 추후 JWT 인증, 파일 업로드, 테스트 코드 도입 가능 |

---

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. .env 파일 설정
DATABASE_URL="postgresql://user:password@localhost:5432/fruitdb"

# 3. Prisma 초기화
npx prisma migrate dev --name init

# 4. 서버 실행
npm run dev
