# 📁 AgroNexus — Documento de Transição de Contexto

Este documento foi criado para que você possa continuar este projeto em outra máquina sem perder o histórico do que já construímos.

---

## 🛠️ Stack Tecnológica
- **Estrutura**: Monorepo (NPM Workspaces)
- **Frontend**: Next.js 14, TailwindCSS, Lucide Icons
- **Backend**: Express.js (TypeScript)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Integrações**: INMET (Alertas via RSS) e IBGE (Municípios)

---

## ✅ Funcionalidades Prontas
1. **Dashboard (Início)**: Widget de clima compacto, Resumo de Lavouras e Pecuária, Feed de Alertas e Lembretes.
2. **Módulo de Lavouras**: Listagem de culturas com barras de progresso e formulário de adição (Modal).
3. **Módulo de Pecuária**: Cartões de rebanho com Checklist de rotina interativo e formulário de adição.
4. **Agenda Inteligente**: Sistema de Eventos e Lembretes. Lembretes da agenda são replicados automaticamente na tela de Avisos e no Dashboard.
5. **API Integrada**: Rotas de GET e POST já funcionais para Lavouras, Animais e Agenda, conectadas ao Supabase.

---

## 🚀 Prompt para colar no Antigravity na Máquina Nova:

> "Olá, Antigravity! Estou continuando o projeto **AgroNexus** nesta máquina. O código já foi clonado do GitHub (https://github.com/leonardomasui/agronexus). 
> 
> **Contexto Atual:** Já finalizamos toda a interface mobile-first e a navegação (BottomNav com 5 abas). Os formulários de adição para Lavouras, Animais e Agenda já estão enviando dados via `fetch` para a API Express (porta 3001). 
> 
> **O que precisamos fazer agora:** 
> 1. Garantir que as variáveis de ambiente (.env) do Supabase estejam configuradas.
> 2. Finalizar a integração das rotas de 'Lembretes' e 'Rotinas' no banco de dados.
> 3. Implementar a lógica de 'Concluir Tarefa' no checklist dos animais para salvar no banco.
> 
> Por favor, analise a estrutura das pastas `apps/web` e `apps/api` e me diga qual o primeiro passo para testarmos a persistência real dos dados."

---

## 🔑 Lembrete de Arquivos Ocultos
Ao clonar o projeto, você precisará criar manualmente o arquivo:
- `apps/api/.env` (Com as chaves do Supabase)
- `apps/web/.env.local` (Com `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001`)
