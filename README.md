# Marketplace Frontend (MVP)

Frontend do Marketplace MVP em **React + Vite + TypeScript + Tailwind CSS + shadcn/ui**, com API mockada via **MSW** para desenvolvimento independente do backend.

## Pré-requisitos

- **Node.js** 20+ (recomendado 22+)
- **npm** 10+

## Instalação

```bash
# Clone o repositório e entre na pasta
cd marketplace-frontend

# Instale as dependências
npm install

# (Opcional) Se o MSW worker não existir em public/
npx msw init public/ --save
```

## Executar em desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

O MSW intercepta as chamadas para `/api/*` **somente em modo dev**, simulando auth, catálogo, checkout, vendedor e admin.

## Build de produção

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`.

## Preview do build

```bash
npm run preview
```

Serve a pasta `dist/` localmente (útil para testar o build antes do deploy).

> **Nota:** Em produção o MSW **não** é ativado. Para usar o app em produção, é necessário um backend real apontando para a mesma API (`/api`).

## Usuários de teste (mock)

| Papel     | E-mail               | Senha  |
|-----------|----------------------|--------|
| Comprador | comprador@teste.com  | 123456 |
| Vendedor  | vendedor@teste.com   | 123456 |
| Admin     | admin@teste.com      | 123456 |

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
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## Stack

- React 18, Vite 6, TypeScript
- Tailwind CSS + shadcn/ui (Radix)
- React Router DOM, React Hook Form + Zod
- Axios, MSW, date-fns, lucide-react

## Arquitetura

Organização **Feature-Based** em `src/features/` (auth, catalog, checkout, seller-panel, backoffice), com providers globais (`AuthContext`, `CartContext`) e mocks em `src/lib/mocks/`.
