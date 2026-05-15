-- ============================================================
-- AgroNexus — Migration 003: Campos Extras de Pecuária
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Adicionar colunas faltantes à tabela animais
ALTER TABLE animais 
ADD COLUMN IF NOT EXISTS historico_vacinal JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS custo_acumulado NUMERIC(12, 2) DEFAULT 0;

-- Notificar PostgREST para recarregar o esquema (necessário no Supabase)
NOTIFY pgrst, 'reload schema';
