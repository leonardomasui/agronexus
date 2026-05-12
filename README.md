# 🌱 AgroNexus

Sistema inteligente para gestão agropecuária integrado a dados climáticos de alta precisão.

## 🚀 Setup do Projeto (Monorepo)

Este repositório utiliza a estrutura de workspaces do npm.

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` com as chaves do seu banco de dados Supabase:
```env
SUPABASE_URL=https://ltypaklggvkkwjqqoims.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 3. Rodar o Projeto (Full-Stack)
Na raiz do monorepo, inicie tanto o frontend quanto o backend simultaneamente:
```bash
npm run dev
```

- **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
- **Backend API (Express):** [http://localhost:3001](http://localhost:3001)

## 🗄️ Banco de Dados (Supabase)

Antes de rodar a API completamente, é necessário criar as tabelas no Supabase.
1. Acesse o [Supabase SQL Editor](https://supabase.com/dashboard/project/ltypaklggvkkwjqqoims/sql)
2. Copie o conteúdo de `apps/api/src/database/migrations/001_initial_schema.sql`
3. Cole no editor e execute (`Run`)

## 🌐 APIs e Integrações

A API está configurada com os seguintes serviços:
- **IBGE API**: Busca de municípios (cache local)
- **Open-Meteo API**: Previsão do tempo de 7 dias e dados históricos
- **INMET API**: Busca de estação automática mais próxima e alertas (via RSS)

## 📁 Estrutura de Pastas

```
agronexus/
├── apps/
│   ├── api/           # Backend Express (Porta 3001)
│   └── web/           # Frontend Next.js 14 (Porta 3000)
├── packages/
│   └── shared/        # Tipos e utilitários compartilhados
├── package.json
└── .env
```
