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
-- Obs: Esta tabela já pode existir na migration 001. 
-- Aqui adicionamos a coluna frequência se ela não existir.
create table if not exists rotinas_animais (
  id             uuid primary key default uuid_generate_v4(),
  animal_id      uuid references animais(id) on delete cascade,
  tarefa         text not null,
  concluido      boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='rotinas_animais' and column_name='frequencia') then
    alter table rotinas_animais add column frequencia text default 'diaria' check (frequencia in ('diaria', 'semanal', 'mensal'));
  end if;
end $$;

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_agenda_propriedade on agenda_eventos(propriedade_id);
create index if not exists idx_agenda_data on agenda_eventos(data_evento);
create index if not exists idx_rotinas_animal on rotinas_animais(animal_id);

-- ============================================================
-- TRIGGER: atualizar updated_at (com proteção de existência)
-- ============================================================
drop trigger if exists trg_agenda_updated_at on agenda_eventos;
create trigger trg_agenda_updated_at
  before update on agenda_eventos
  for each row execute function update_updated_at();

drop trigger if exists trg_rotinas_updated_at on rotinas_animais;
create trigger trg_rotinas_updated_at
  before update on rotinas_animais
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY 
-- ============================================================
alter table agenda_eventos enable row level security;
alter table rotinas_animais enable row level security;

-- Políticas temporárias para desenvolvimento
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'dev_all_agenda') then
    create policy "dev_all_agenda" on agenda_eventos for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'dev_all_rotinas') then
    create policy "dev_all_rotinas" on rotinas_animais for all using (true) with check (true);
  end if;
end $$;
