# Scripts de Apresentação — AgroNexus 🌾🚀

Estes scripts resumem a jornada de desenvolvimento e as capacidades do AgroNexus, preparados para dois públicos diferentes.

---

## 💻 Opção 1: Apresentação para Equipe Técnica (Desenvolvedores/CTO)

**Foco:** Arquitetura, Stack, Integrações e Desafios Resolvidos.

"Fala pessoal, vou apresentar o **AgroNexus**, uma plataforma de gestão agrícola que construímos focada em performance e experiência do usuário (UX).

**1. Arquitetura e Stack:**
O projeto foi estruturado em um **Monorepo**.
- **Frontend:** Next.js 14 com App Router e Tailwind CSS para uma UI responsiva e 'Rich Aesthetics'.
- **Backend:** Node.js com Express, utilizando TypeScript em todo o ciclo de vida.
- **Shared Package:** Criamos um pacote `@agronexus/shared` para garantir a integridade dos tipos (Interfaces de Animais, Culturas, etc.) entre o frontend e a API.
- **Database:** Supabase (PostgreSQL) com triggers automáticos para gestão de `updated_at` e integridade referencial.

**2. Funcionalidades de Engenharia:**
- **Geocoding & Clima:** Implementamos integração com a API Open-Meteo e INMET. O sistema captura a geolocalização do usuário no onboarding e sincroniza globalmente os dados meteorológicos.
- **Gestão de Estado & Persistência:** Implementamos um fluxo de onboarding que gera UUIDs únicos, salvos no `localStorage` e sincronizados via API para garantir persistência 'cross-device'.
- **Lógica de Negócio (Agendamento Automático):** Desenvolvemos uma integração onde a criação de uma entidade (Lavoura) dispara automaticamente a criação de eventos na agenda via API, baseada em cálculos de ciclo médio de safra.
- **Filtros em Tempo Real:** Implementamos uma lógica de filtragem de eventos no frontend que considera o `ISO Timestamp` para remoção automática de compromissos passados, otimizando o processamento de renderização.

**3. Desafios de Dados:**
Resolvemos problemas complexos de **TimeZone** no Javascript, garantindo que datas de vacinação e plantio não sofram o deslocamento de UTC para Horário de Brasília, utilizando normalização ISO com `T12:00:00`."

---

## 🌟 Opção 2: Apresentação para Leigos (Investidores/Clientes/Produtores)

**Foco:** Valor de Negócio, Facilidade de Uso e Impacto no Campo.

"Olá! Quero apresentar para vocês o **AgroNexus**, o cérebro digital da sua fazenda. 

**O Problema:**
O produtor rural hoje lida com excesso de informação: clima em um app, vacinas em um caderno e datas de colheita na cabeça. Isso gera perda de dinheiro e risco de safra.

**A Solução AgroNexus:**
Nós centralizamos toda a operação em uma interface simples, elegante e que funciona no celular.
- **Onboarding Inteligente:** Em 30 segundos, você configura sua localização, o que você planta e o que você cria. O AgroNexus entende sua realidade imediatamente.
- **Central de Avisos:** Imagine o app te avisando: 'Olha, vai chover forte na quarta, melhor antecipar o manejo'. Nosso sistema monitora o clima e te envia alertas automáticos de chuva, frio ou calor extremo.
- **Gestão de Rebanho:** Cada lote de animal tem seu próprio 'cartão de saúde', com histórico de vacinas, custos acumulados e tarefas diárias de rotina.
- **Automação de Safra:** Quando você cadastra um plantio de soja, o app já calcula sozinho quando será a colheita e coloca um lembrete na sua agenda. Você não precisa mais se preocupar em esquecer datas importantes.

**O Diferencial:**
O AgroNexus não é apenas uma planilha; é um assistente que pensa à frente. Ele limpa o que já passou e te mostra exatamente o que você precisa fazer hoje e nos próximos 7 dias para ter uma fazenda mais lucrativa e segura."

---

## 📊 Tópicos de Destaque (Para ambas)
- **Interface Mobile-First:** Funciona perfeitamente no campo.
- **Sincronização em Nuvem:** Dados seguros no Supabase.
- **Dashboard de Gestão:** Visão clara de Hectares e Cabeças de gado em uma única tela.
