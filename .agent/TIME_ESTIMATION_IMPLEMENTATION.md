# Estimativa de Tempo - Implementação Completa

## Overview
Sistema completo de estimativa de tempo para tarefas, permitindo rastrear horas/dias de trabalho com conversão automática e estatísticas em tempo real.

## Database Changes

### Migration: `add_time_estimation.sql`
- Adicionado `estimated_hours` (DECIMAL) - Horas estimadas
- Adicionado `estimated_days` (DECIMAL) - Dias estimados
- Adicionado `time_unit` (VARCHAR) - Unidade de tempo ('hours' ou 'days')
- Índices para performance em queries de filtro

## Composables

### `useTimeEstimation.ts`
Utilitários para gerenciar estimativas de tempo:

**Conversões:**
- `hoursToDays(hours)` - Converte horas para dias (8h = 1d)
- `daysToHours(days)` - Converte dias para horas

**Formatação:**
- `formatEstimation(estimation)` - Formata para exibição (ex: "2.5h", "1d")
- `getHours(estimation)` - Obtém valor normalizado em horas
- `getDays(estimation)` - Obtém valor normalizado em dias

**Cálculos:**
- `calculateTotalTime(estimations, unit)` - Soma tempo total de múltiplas tarefas
- `getEstimationColor(estimation)` - Cor baseada na duração (verde/amarelo/vermelho)
- `getEstimationIcon(estimation)` - Ícone baseado na duração (⚡/⏰/📅/⚠️)

## Components

### `KTimeEstimationInput.vue`
Input para definir estimativa de tempo:
- **Features:**
  - Input numérico com step 0.5
  - Seletor de unidade (Horas/Dias)
  - Conversão automática exibida
  - Sugestões rápidas (30min, 1h, 2h, 4h, 1d, 2d, 1w)
  - Validação de valores

- **Props:**
  - `modelValue` - Objeto com estimated_hours, estimated_days, time_unit

- **Events:**
  - `update:modelValue` - Emitido quando valor muda

### `KTimeEstimationBadge.vue`
Badge compacto exibido no card da tarefa:
- Mostra estimativa formatada (ex: "2h", "1d")
- Ícone indicador de duração
- Cor dinâmica baseada na estimativa
- Renderiza apenas se houver estimativa

### `KTimeEstimationStats.vue`
Painel de estatísticas de tempo no dashboard:
- **Métricas:**
  - Total estimado (todas as tarefas)
  - Média por tarefa
  - Tempo estimado por status (A Fazer, Em Andamento)
  - Breakdown por prioridade (Alta, Média, Baixa)

- **Props:**
  - `tasks` - Array de tarefas

## Integration Points

### Task Modal (`KTaskModal.vue`)
- Campo de estimativa entre Tags e Subtasks
- Carrega estimativa ao editar tarefa
- Salva estimativa ao criar/atualizar

### Task Card (`KTaskCard.vue`)
- Badge de estimativa exibido na seção de conteúdo
- Mostra progresso visual com ícone e cor

### Dashboard (`KTasksDashboard.vue`)
- Componente `KTimeEstimationStats` exibido ao final
- Estatísticas em tempo real

## Usage Flow

1. **Criar/Editar Tarefa** → Abrir modal
2. **Definir Estimativa** → Usar input com sugestões rápidas
3. **Escolher Unidade** → Horas ou Dias (conversão automática)
4. **Salvar** → Estimativa é persistida
5. **Visualizar** → Badge no card + estatísticas no dashboard

## Data Structure

```typescript
interface TimeEstimation {
  estimated_hours?: number      // Ex: 2.5
  estimated_days?: number       // Ex: 0.31 (2.5h / 8)
  time_unit: 'hours' | 'days'   // Unidade principal
}
```

## Conversão de Tempo

- **1 dia = 8 horas** (padrão de trabalho)
- Conversão automática bidirecional
- Arredondamento para 2 casas decimais

## Cores e Ícones

| Duração | Cor | Ícone | Significado |
|---------|-----|-------|------------|
| 0h | Cinza | ⏱️ | Sem estimativa |
| ≤ 2h | Verde | ⚡ | Rápido |
| ≤ 8h | Amarelo | ⏰ | Normal |
| ≤ 24h | Laranja | 📅 | Longo |
| > 24h | Vermelho | ⚠️ | Muito longo |

## Features

✅ Input com conversão automática horas/dias
✅ Sugestões rápidas (30min, 1h, 2h, 4h, 1d, 2d, 1w)
✅ Badge compacto no card da tarefa
✅ Estatísticas em tempo real no dashboard
✅ Cálculo de total estimado
✅ Média por tarefa
✅ Breakdown por status e prioridade
✅ Cores e ícones dinâmicos
✅ Formatação inteligente (30min, 2h, 1d, etc)

## Files Created/Modified

**Created:**
- `supabase/migrations/add_time_estimation.sql`
- `app/composables/useTimeEstimation.ts`
- `app/components/tasks/KTimeEstimationInput.vue`
- `app/components/tasks/KTimeEstimationBadge.vue`
- `app/components/tasks/KTimeEstimationStats.vue`

**Modified:**
- `app/components/blocks/KTaskModal.vue` - Adicionado input de estimativa
- `app/components/tasks/KTaskCard.vue` - Adicionado badge de estimativa
- `app/components/tasks/KTasksDashboard.vue` - Adicionado componente de estatísticas

## Next Steps

1. Aplicar migration ao Supabase
2. Testar criação/edição de tarefas com estimativa
3. Verificar conversão horas/dias
4. Validar estatísticas no dashboard
5. Testar sugestões rápidas
6. Verificar formatação em diferentes resoluções

## Exemplos de Uso

**Criar tarefa com 2.5 horas:**
1. Abrir modal
2. Digitar "2.5" no input
3. Selecionar "Horas"
4. Salvar → Exibe "2.5h" no card

**Criar tarefa com 1 dia:**
1. Abrir modal
2. Digitar "1" no input
3. Selecionar "Dias"
4. Salvar → Exibe "1d" no card

**Usar sugestão rápida:**
1. Abrir modal
2. Clicar em "2h" (sugestão)
3. Salvar → Estimativa definida

## Performance

- Cálculos de estatísticas são computed properties (reativo)
- Índices no banco para queries de filtro
- Sem queries adicionais (dados já carregados)
- Formatação em tempo real

## Notas

- Estimativas são opcionais (campo pode estar vazio)
- Conversão é automática e bidirecional
- Estatísticas atualizam em tempo real
- Sugestões rápidas cobrem casos comuns
- Cores ajudam a identificar tarefas longas rapidamente
