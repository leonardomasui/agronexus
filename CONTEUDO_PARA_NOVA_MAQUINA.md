# AgroNexus — Relatório de Transferência de Projeto (Handoff)

Este documento contém tudo o que foi desenvolvido até agora para garantir que o projeto possa ser continuado sem perdas em qualquer outra máquina.

## 🚀 Progresso Atual (Sprint 4 Concluída)

### 1. Módulo de Onboarding e Configurações
- **Fluxo de 3 Etapas**: Seleção de município, Culturas e Animais.
- **Sincronização de Localização**: O usuário pode trocar de cidade na página de **Configurações**.
- **Geocoding**: A busca de cidade agora obtém automaticamente Latitude e Longitude (via API Open-Meteo) para alimentar o sistema de clima.
- **Persistência**: Geração de UUID salvo no `localStorage` e sincronização assíncrona com Supabase.

### 2. Gestão de Pecuária (Rebanho) 
- **CRUD Completo**: Cadastro, Listagem, Edição e Exclusão de lotes de animais.
- **Campos Avançados**: Suporte total para Data de Entrada, Última Visita Veterinária e Motivo da Visita.
- **Correção de Datas**: Implementada lógica para evitar deslocamento de fuso horário (problema de mostrar o dia anterior).
- **Checklist de Rotina**: Sistema de tarefas diárias integrado a cada card de animal com persistência.

### 3. Sistema de Clima e UI
- **Dashboard Dinâmico**: O WeatherWidget na Home e a página de Clima agora são 100% sincronizados com a cidade selecionada pelo usuário.
- **Navegação**: Menu inferior funcional para Início, Clima, Impactos, Notícias e Agenda.
- **Layout**: Totalmente responsivo e mobile-first com Rich Aesthetics.

---

## 🛠️ Requisitos para Continuar

### Variáveis de Ambiente (.env)
Você precisará configurar as seguintes variáveis na raiz do projeto:
```env
# API
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
API_PORT=3001

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Banco de Dados
A estrutura completa e consolidada está em `apps/api/src/database/migrations/001_initial_schema.sql`.
1. Execute o script SQL consolidado para criar todas as tabelas e permissões.
2. **IMPORTANTE**: Sempre que adicionar colunas via migração, execute `NOTIFY pgrst, 'reload schema';` no SQL Editor do Supabase para atualizar o cache da API.

### Comandos Úteis
1. **Instalar Dependências**: `npm install` na raiz.
2. **Rodar o Projeto Completo**: `npm run dev` na raiz (inicia API e Web simultaneamente).
3. **Servidor Web**: `cd apps/web && npm run dev` (Porta 3002).
4. **Servidor API**: `cd apps/api && npm run dev` (Porta 3001).

---

## 📌 Próximos Passos Sugeridos
1. **Notícias Reais**: Implementar a rota `/api/noticias` no backend para consumir um RSS real (ex: Canal Rural).
2. **Lógica de Impactos**: Desenvolver o cálculo de risco na página de Impactos cruzando clima e solo.
3. **Relatórios**: Implementar exportação de PDF para os lotes de animais e histórico de produção.

**Documento atualizado em 13/05/2026 às 17:20** — *AgroNexus Team*
