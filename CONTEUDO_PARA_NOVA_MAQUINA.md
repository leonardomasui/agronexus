# 📁 AgroNexus — Documento de Transição de Contexto (Atualizado)

Este documento garante que você possa continuar o desenvolvimento do **AgroNexus** em outra máquina com total clareza do progresso atual.

---

## 🛠️ Stack Tecnológica
- **Estrutura**: Monorepo (NPM Workspaces)
- **Frontend**: Next.js 14, TailwindCSS, Lucide Icons
- **Backend**: Express.js (TypeScript)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Integrações**: INMET (Alertas via RSS), Open-Meteo (Previsão 30 dias) e IBGE (Municípios)

---

## ✅ Funcionalidades Finalizadas nesta Sessão
1. **Navegação Inteligente**: 
   - O ícone de **Sino** no cabeçalho agora abre a **Central de Avisos**.
   - A aba inferior "Avisos" foi substituída por **Clima** (Previsão Mensal).
2. **Central de Avisos (Notificações)**:
   - Filtros por: Todos, Clima, Lembretes e Eventos.
   - Opção de **Marcar como Lido / Não Lido** com persistência no banco para Agenda.
   - Cores específicas: Verde (Eventos), Azul (Lembretes), Vermelho/Laranja (Alertas).
3. **Previsão Climática Avançada**:
   - Página de 30 dias com Temperatura (Mín/Máx), **Probabilidade de Chuva (%)**, **Índice UV** (com cores de risco) e **Incidência Solar (kWh/m²)**.
   - Card de clima na Home agora é clicável e leva para esta página.
4. **CRUD de Lavouras com UX Premium**:
   - Edição de culturas e cálculo automático de colheita.
   - **Exclusão com "Undo" (Desfazer)**: O card some na hora, mas você tem 2 segundos para desfazer antes da deleção real.

---

## 🚀 Prompt para colar no Antigravity na Máquina Nova:

> "Olá, Antigravity! Estou continuando o projeto **AgroNexus** nesta máquina. O código está no GitHub: https://github.com/leonardomasui/agronexus.
> 
> **Resumo do Estado Atual:** 
> - O monorepo está configurado e a API (porta 3001) já conversa com o Supabase.
> - Finalizamos a Central de Avisos (acessada pelo Sino) e a página de Clima Mensal (30 dias).
> - Implementamos o CRUD completo de Lavouras com sistema de 'Undo' na exclusão.
> - O Dashboard está sincronizado e reflete os hectares totais e animais cadastrados.
> 
> **Próximos Passos Sugeridos:**
> 1. Validar as variáveis de ambiente (`.env` na API e `.env.local` na Web).
> 2. Implementar a finalização de ciclos de colheita (mover cultura para histórico).
> 3. Implementar a aba 'Pecuária' com persistência completa das rotinas no banco.
> 
> Analise a estrutura atual e vamos continuar de onde paramos!"

---

## 🔑 Configuração de Ambiente (Obrigatório)
Ao clonar, certifique-se de configurar:
1. `apps/api/.env`:
   ```
   SUPABASE_URL=seu_url
   SUPABASE_KEY=sua_chave
   PORT=3001
   ```
2. `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:3001
   ```
3. Rodar `npm install` na raiz para instalar todas as dependências do monorepo.
