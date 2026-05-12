-- ============================================================
-- AgroNexus — Migration 001: Criação das tabelas principais
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: produtores
-- ============================================================
create table if not exists produtores (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  cpf_cnpj    text unique,
  email       text unique,
  telefone    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABELA: propriedades
-- ============================================================
create table if not exists propriedades (
  id                uuid primary key default uuid_generate_v4(),
  produtor_id       uuid references produtores(id) on delete cascade,
  nome              text not null,
  municipio_ibge_id integer not null,
  municipio_nome    text not null,
  uf                char(2) not null,
  latitude          numeric(10, 7),
  longitude         numeric(10, 7),
  area_ha           numeric(12, 4),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- TABELA: culturas
-- ============================================================
create table if not exists culturas (
  id                  uuid primary key default uuid_generate_v4(),
  propriedade_id      uuid references propriedades(id) on delete cascade,
  nome                text not null,
  variedade           text,
  data_plantio        date,
  data_colheita_prev  date,
  area_ha             numeric(12, 4),
  status              text default 'plantado'
                      check (status in ('plantado', 'crescimento', 'colheita', 'colhido', 'perdido')),
  observacoes         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- TABELA: animais
-- ============================================================
create table if not exists animais (
  id             uuid primary key default uuid_generate_v4(),
  propriedade_id uuid references propriedades(id) on delete cascade,
  especie        text not null,
  raca           text,
  quantidade     integer not null default 1,
  data_registro  date default current_date,
  observacoes    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- TABELA: alertas
-- ============================================================
create table if not exists alertas (
  id             uuid primary key default uuid_generate_v4(),
  propriedade_id uuid references propriedades(id) on delete cascade,
  tipo           text not null
                 check (tipo in ('clima', 'praga', 'doenca', 'irrigacao', 'geral')),
  mensagem       text not null,
  severidade     text default 'info'
                 check (severidade in ('info', 'aviso', 'critico')),
  fonte          text default 'sistema',
  lido           boolean default false,
  created_at     timestamptz default now()
);

-- ============================================================
-- TABELA: emails_cadastro
-- ============================================================
create table if not exists emails_cadastro (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  nome       text,
  origem     text default 'landing_page',
  created_at timestamptz default now()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_propriedades_produtor on propriedades(produtor_id);
create index if not exists idx_propriedades_uf on propriedades(uf);
create index if not exists idx_culturas_propriedade on culturas(propriedade_id);
create index if not exists idx_culturas_status on culturas(status);
create index if not exists idx_animais_propriedade on animais(propriedade_id);
create index if not exists idx_alertas_propriedade on alertas(propriedade_id);
create index if not exists idx_alertas_lido on alertas(lido);

-- ============================================================
-- TRIGGER: atualizar updated_at automaticamente
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_produtores_updated_at
  before update on produtores
  for each row execute function update_updated_at();

create trigger trg_propriedades_updated_at
  before update on propriedades
  for each row execute function update_updated_at();

create trigger trg_culturas_updated_at
  before update on culturas
  for each row execute function update_updated_at();

create trigger trg_animais_updated_at
  before update on animais
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (básico — liberar para desenvolvimento)
-- ============================================================
alter table produtores enable row level security;
alter table propriedades enable row level security;
alter table culturas enable row level security;
alter table animais enable row level security;
alter table alertas enable row level security;
alter table emails_cadastro enable row level security;

-- Políticas temporárias para desenvolvimento (liberar tudo com anon key)
create policy "dev_all_produtores" on produtores for all using (true) with check (true);
create policy "dev_all_propriedades" on propriedades for all using (true) with check (true);
create policy "dev_all_culturas" on culturas for all using (true) with check (true);
create policy "dev_all_animais" on animais for all using (true) with check (true);
create policy "dev_all_alertas" on alertas for all using (true) with check (true);
create policy "dev_all_emails" on emails_cadastro for all using (true) with check (true);
