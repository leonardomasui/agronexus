# AgroNexus - Guia de Contexto para Claude Code

Este arquivo fornece contexto sobre a arquitetura e padrões do projeto AgroNexus.

## 🏗️ Estrutura do Projeto
O AgroNexus é um **Monorepo** utilizando npm workspaces:
- `apps/web`: Frontend Next.js 14 (App Router, Tailwind CSS). Porta: 3002.
- `apps/api`: Backend Node.js/Express (TypeScript, Prisma/Supabase). Porta: 3001.
- `packages/shared`: Tipos e interfaces compartilhadas entre apps.

## 🛠️ Comandos Principais
- `npm run dev`: Inicia API e Web simultaneamente (via `concurrently`).
- `npm run dev --workspace=apps/web`: Roda apenas o frontend.
- `npm run dev --workspace=apps/api`: Roda apenas a API.
- `npm run build`: Compila o projeto para produção.

## 🎨 Padrões de Código
- **Linguagem:** TypeScript (estrito).
- **Frontend:** Componentes funcionais React, Next.js App Router.
- **Estilização:** Vanilla CSS ou Tailwind CSS (conforme especificado no componente).
- **Backend:** Express com rotas modulares em `src/routes`.
- **Banco de Dados:** Supabase (PostgreSQL).

## 🌍 Variáveis de Ambiente
As variáveis principais estão no arquivo `.env` na raiz:
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (aponta para o backend)

## 🎯 Objetivos do Projeto
O AgroNexus é um dashboard de gestão agrícola inteligente, integrando dados de clima, gestão de rebanho (pecuária) e lavouras.
