# Marketplace Frontend (MVP)

Frontend do Marketplace MVP em **React + Vite + TypeScript + Tailwind CSS + shadcn/ui**,
consumindo a API real do [`marketplace-backend`](../marketplace-backend) (.NET 9 +
PostgreSQL + JWT).

## Pré-requisitos

- **Node.js** 20+ (recomendado 22+)
- **npm** 10+
- **Backend rodando** em `http://localhost:5066` — ver
  [`../marketplace-backend/README.md`](../marketplace-backend/README.md).

## Instalação

```bash
cd marketplace-frontend
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

O Vite tem um `server.proxy` em [`vite.config.ts`](vite.config.ts) que
encaminha todas as chamadas `/api/*` para `http://localhost:5066` (backend .NET).
Como o axios já usa `baseURL: '/api'` (ver [`src/lib/axios.ts`](src/lib/axios.ts)),
não é preciso configurar CORS nem `VITE_API_URL` em desenvolvimento.

## Build de produção

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`. Em produção, sirva o `dist/`
por trás de um reverse proxy que também roteie `/api/*` para o backend
(ou configure `VITE_API_URL` apontando para a URL absoluta da API).

## Preview do build

```bash
npm run preview
```

Serve a pasta `dist/` em `http://localhost:4173`.

## Usuários de teste

Semeados na primeira execução do backend (migration `002_seed_data.sql`,
senhas em BCrypt):

| Papel     | E-mail               | Senha  |
|-----------|----------------------|--------|
| Comprador | comprador@teste.com  | 123456 |
| Vendedor  | vendedor@teste.com   | 123456 |
| Admin     | admin@teste.com      | 123456 |

Após o `POST /api/auth/login`, o `token` (JWT HS256) devolvido é persistido
em `localStorage` pelo `AuthProvider` e injetado em todas as chamadas
subsequentes via interceptor do axios (`Authorization: Bearer <jwt>`).

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Home com listagem de produtos |
| `/busca?q=` | Busca de produtos |
| `/produto/:id` | Detalhe do produto |
| `/login`, `/registro` | Autenticação |
| `/carrinho` | Carrinho + cálculo de frete |
| `/checkout` | Pagamento Pix + upload de comprovante |
| `/conta/pedidos` | Histórico do comprador |
| `/vendedor/*` | Painel do vendedor |
| `/admin/*` | Backoffice (usuários, categorias, pagamentos, repasses) |

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## Variáveis de ambiente

Copie [`.env.example`](.env.example) para `.env` se precisar apontar para
um backend em outra origem:

```bash
VITE_API_URL=/api   # default (usa o proxy do Vite → localhost:5066)
```

## Stack

- React 18, Vite 6, TypeScript
- Tailwind CSS + shadcn/ui (Radix)
- React Router DOM, React Hook Form + Zod
- Axios, date-fns, lucide-react, embla-carousel

## Arquitetura

Organização **Feature-Based** em `src/features/`
(`auth`, `catalog`, `checkout`, `seller-panel`, `backoffice`), com
providers globais (`AuthProvider`, `CartProvider`) e cliente HTTP único em
`src/lib/axios.ts`. Toda a persistência acontece no backend .NET —
`localStorage` guarda apenas o JWT + itens do carrinho + snapshot do
`user` para hidratação inicial.
