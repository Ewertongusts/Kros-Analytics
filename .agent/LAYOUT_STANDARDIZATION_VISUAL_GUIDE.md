# Layout Standardization - Visual Guide

## Antes vs Depois

### DESPESAS (Referência)
```
✅ Já estava bem estruturada
- Header com abas + botões
- Cards de resumo 4 colunas
- Filtros em linha única
- Espaçamento space-y-4
```

### VENDAS (Modificado)
```
ANTES:
- Componente SalesTableKSaleFilterTabs
- Componente SalesTableKSaleSummaryCards
- Componente SalesFiltersKSaleFilters (com dropdown)
- Espaçamento space-y-4

DEPOIS:
✅ Header inline com abas + botões
✅ Cards de resumo inline (4 colunas)
✅ Filtros em linha única (sem dropdown)
✅ Espaçamento space-y-4 (mantido)
✅ White label aplicado nas abas
```

### ASSINATURAS (Modificado)
```
ANTES:
- Espaçamento space-y-0 (muito compacto)
- Componente KSubscriptionsContent com px-6

DEPOIS:
✅ Espaçamento space-y-4 (consistente)
✅ Removido px-6 do componente
✅ White label aplicado nas abas
✅ Header padronizado
```

## Estrutura Padrão Aplicada

### 1. Layout Base
```vue
<LayoutsKPageLayout>
  <div class="space-y-4 mb-20 animate-in fade-in duration-700">
    <!-- Conteúdo -->
  </div>
</LayoutsKPageLayout>
```

### 2. Header Padrão
```vue
<div class="flex items-center justify-between gap-4 mb-6">
  <!-- Abas com white label -->
  <div class="flex items-center gap-2 border-b border-white/10">
    <button :style="activeTab === tab.id ? { 
      color: `var(--kros-blue, #FF0000)`, 
      borderColor: `var(--kros-blue, #FF0000)` 
    } : {}">
      {{ tab.label }}
    </button>
  </div>
  
  <!-- Botões -->
  <div class="flex items-center gap-2">
    <button>Indicadores</button>
    <button>Histórico</button>
    <button :style="{ backgroundColor: `var(--kros-blue, #007BFF)` }">
      Novo
    </button>
  </div>
</div>
```

### 3. Cards de Resumo
```vue
<div class="grid grid-cols-4 gap-4">
  <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
    <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
      Label
    </p>
    <p class="text-2xl font-black text-white">{{ value }}</p>
    <p class="text-[10px] text-white/40 mt-2">Descrição</p>
  </div>
</div>
```

### 4. Filtros em Linha Única
```vue
<div class="flex items-center gap-3">
  <input v-model="searchQuery" placeholder="Buscar..." 
    class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl" />
  <select v-model="status" 
    class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl" />
  <input v-model="startDate" type="date" 
    class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl" />
  <input v-model="endDate" type="date" 
    class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl" />
  <button @click="clearFilters">Limpar</button>
  <button @click="export">Exportar</button>
</div>
```

## Espaçamentos Padronizados

| Elemento | Classe | Valor |
|----------|--------|-------|
| Padding Top | `pt-6` | 1.5rem |
| Padding Horizontal | `px-6` | 1.5rem |
| Espaço entre seções | `space-y-4` | 1rem |
| Margin Bottom (header) | `mb-6` | 1.5rem |
| Margin Bottom (footer) | `mb-20` | 5rem |
| Gap em componentes | `gap-3` ou `gap-4` | 0.75rem ou 1rem |
| Padding em cards | `p-6` | 1.5rem |
| Border Radius | `rounded-2xl` | 1rem |

## Cores Padronizadas

| Elemento | Cor | Fallback |
|----------|-----|----------|
| Aba ativa | `var(--kros-blue)` | `#FF0000` |
| Botão primário | `var(--kros-blue)` | `#007BFF` |
| Background card | `bg-white/5` | - |
| Border card | `border-white/10` | - |
| Texto label | `text-white/50` | - |
| Texto descrição | `text-white/40` | - |

## Resultado Visual

Todas as 3 páginas agora têm:
- ✅ Mesma estrutura de header
- ✅ Mesmos espaçamentos
- ✅ Mesmas cores (com white label)
- ✅ Mesmos filtros
- ✅ Mesmos cards de resumo
- ✅ Experiência visual coerente
