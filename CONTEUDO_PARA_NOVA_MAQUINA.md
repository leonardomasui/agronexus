# AgroNexus — Relatório de Transferência de Projeto (Handoff)

Este documento contém tudo o que foi desenvolvido até agora para garantir que o projeto possa ser continuado sem perdas em qualquer outra máquina.

## 🚀 Progresso Atual (Sprint 5 Concluída)

### 1. Central de Avisos e Clima
- **Monitoramento Inteligente**: Sistema de avisos 100% dinâmico baseado na localização do usuário.
- **Sensibilidade Ajustada**: Alertas automáticos para chuvas (>2mm), variações de temperatura (>4°C) e extremos térmicos.
- **Filtro em Tempo Real**: Os avisos agora somem automaticamente assim que o horário do compromisso passa, mantendo a lista limpa e focada no futuro.
- **Ordenação Cronológica**: Lista organizada por data e hora em ordem crescente (o mais próximo primeiro).
- **Integração Inteligente**: Ao cadastrar uma nova lavoura, o sistema cria automaticamente um lembrete na Agenda para a data estimada de colheita.

### 2. Gestão de Pecuária (Rebanho) 
- **Correção de Persistência**: Resolvido problema onde novos lotes não eram salvos por falta de colunas no banco.
- **Novos Campos**: Suporte total para **Histórico Vacinal** (JSONB) e **Custo Acumulado** (Numeric).
- **Redesign de Cards**: Layout otimizado com foco em usabilidade, trazendo Cabeças e Investimento em destaque logo abaixo da identificação do animal.
- **Correção de Datas**: Implementada lógica `T12:00:00` em todo o projeto para evitar que o fuso horário mostre o dia anterior ao selecionado.

### 2. Módulo de Gestão Geral
- **Nova Aba "Gestão"**: Substituiu a antiga aba de "Impactos" no menu inferior.
- **Dashboard de Operações**: Nova página `/gestao` consolidando resumos de Lavouras (Hectares/Ativas) e Rebanho (Cabeças/Lotes) com acesso rápido aos gerenciadores.

### 3. Sincronização e UI
- **Tipos Consolidados**: Pacote `@agronexus/shared` agora possui interfaces completas para Animais e Rotinas.
- **Navegação**: Menu inferior 100% funcional e sincronizado com o roteamento do Next.js.
- **Rich Aesthetics**: Design responsivo com paleta de cores harmoniosa e tipografia normalizada.

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

### Banco de Dados (Supabase)
Existem 3 arquivos de migração em `apps/api/src/database/migrations/`:
1. `001_initial_schema.sql`: Estrutura base (Produtores, Propriedades, Culturas, Animais).
2. `002_agenda_schema.sql`: Tabelas para Agenda e Rotinas Diárias.
3. `003_add_livestock_fields.sql`: **IMPORTANTE** — Adiciona as colunas de vacinas e custos.

**Passo a passo:** Execute os 3 arquivos na ordem no SQL Editor do Supabase. Sempre que houver mudanças estruturais, execute `NOTIFY pgrst, 'reload schema';` no editor para atualizar o cache da API.

### Comandos Úteis
1. **Instalar Dependências**: `npm install` na raiz.
2. **Rodar o Projeto Completo**: `npm run dev` na raiz (inicia API e Web simultaneamente).
3. **Servidor Web**: `cd apps/web && npm run dev` (Porta 3002).
4. **Servidor API**: `cd apps/api && npm run dev` (Porta 3001).
5. **Apresentação**: Confira o arquivo `SCRIPTS_APRESENTACAO.md` na raiz para roteiros de apresentação (Técnico e Leigo).

---

## 📌 Próximos Passos Sugeridos
1. **Notícias Reais**: Implementar a rota `/api/noticias` no backend para consumir um RSS real (ex: Canal Rural).
2. **Relatórios**: Implementar exportação de PDF para os lotes de animais e histórico de produção.
3. **Lógica de Impactos**: Re-implementar a lógica de riscos climáticos dentro da nova aba de Gestão ou em uma subseção.

**Documento atualizado em 14/05/2026 às 17:10** — *AgroNexus Team*
