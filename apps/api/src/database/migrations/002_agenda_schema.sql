-- ============================================================
-- AgroNexus — Migration 002: Agenda e Rotinas Pecuárias
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABELA: agenda_eventos
-- ============================================================
create table if not exists agenda_eventos (
  id             uuid primary key default uuid_generate_v4(),
  propriedade_id uuid references propriedades(id) on delete cascade,
  titulo         text not null,
  tipo           text not null check (tipo in ('evento', 'lembrete')),
  data_evento    timestamptz not null,
  descricao      text,
  concluido      boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- TABELA: rotinas_animais (Checklist diário)
-- ============================================================
create table if not exists rotinas_animais (
  id             uuid primary key default uuid_generate_v4(),
  animal_id      uuid references animais(id) on delete cascade,
  tarefa         text not null,
  concluido      boolean default false,
  frequencia     text default 'diaria' check (frequencia in ('diaria', 'semanal', 'mensal')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_agenda_propriedade on agenda_eventos(propriedade_id);
create index if not exists idx_agenda_data on agenda_eventos(data_evento);
create index if not exists idx_rotinas_animal on rotinas_animais(animal_id);

-- ============================================================
-- TRIGGER: atualizar updated_at
-- ============================================================
create trigger trg_agenda_updated_at
  before update on agenda_eventos
  for each row execute function update_updated_at();

create trigger trg_rotinas_updated_at
  before update on rotinas_animais
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (básico — liberar para desenvolvimento)
-- ============================================================
alter table agenda_eventos enable row level security;
alter table rotinas_animais enable row level security;

-- Políticas temporárias para desenvolvimento
create policy "dev_all_agenda" on agenda_eventos for all using (true) with check (true);
create policy "dev_all_rotinas" on rotinas_animais for all using (true) with check (true);
