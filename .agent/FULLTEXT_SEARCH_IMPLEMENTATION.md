# Full-Text Search - Implementação Completa

## Overview
Sistema avançado de busca full-text com fuzzy matching, ranking de relevância e autocomplete.

## Composable: `useFullTextSearch.ts`

### Algoritmos Implementados

**1. Tokenização**
- Normaliza texto (lowercase, remove caracteres especiais)
- Divide em tokens individuais
- Remove tokens vazios

**2. Levenshtein Distance**
- Calcula distância entre strings
- Permite fuzzy matching (busca com erros de digitação)
- Threshold configurável (padrão 0.7)

**3. Scoring de Relevância**
Pesos por campo:
- Título: 3x
- Descrição: 2x
- Empresa: 1.5x
- Tags: 1x
- Responsável: 0.5x

**4. Extração de Highlights**
- Extrai contexto ao redor do termo encontrado
- Limita a 3 highlights por resultado
- Mostra até 50 caracteres de contexto

### Funções Principais

```typescript
// Busca básica com ranking
search(query: string, tasks: Task[]): SearchResult[]

// Sugestões para autocomplete
getSearchSuggestions(query: string, tasks: Task[], limit = 5): string[]

// Busca com filtros combinados
advancedSearch(query: string, tasks: Task[], filters?: {...}): SearchResult[]

// Fuzzy matching
fuzzyMatch(query: string, text: string, threshold = 0.7): boolean

// Calcular score de similaridade
similarityScore(a: string, b: string): number
```

## Component: `KSearchBar.vue`

### Features

✅ Busca em tempo real
✅ Autocomplete com sugestões
✅ Resultados com ranking
✅ Highlights do contexto
✅ Fuzzy matching (tolera erros)
✅ Limpar busca
✅ Seleção de resultado

### Props
- `tasks` (Task[]) - Array de tarefas para buscar

### Events
- `search` - Emitido quando texto muda
- `select` - Emitido quando resultado é selecionado

## Como Funciona

### Exemplo 1: Busca Simples
```
Query: "cliente"
Resultados:
1. "Ligar para cliente X" (score: 3.0)
2. "Reunião com cliente importante" (score: 2.5)
3. "Email para cliente Y" (score: 2.0)
```

### Exemplo 2: Fuzzy Matching
```
Query: "clinte" (erro de digitação)
Resultados:
1. "Ligar para cliente X" (score: 2.8)
   → Encontra "cliente" mesmo com erro
```

### Exemplo 3: Busca Multi-campo
```
Query: "projeto web"
Resultados:
1. "Desenvolver projeto web" (score: 5.0)
   → Encontra em título
2. "Projeto de website" (score: 3.5)
   → Encontra "projeto" em título + "web" em descrição
```

## Algoritmo de Scoring

```
Score = (título_matches × 3) + 
        (descrição_matches × 2) + 
        (empresa_matches × 1.5) + 
        (tags_matches × 1) + 
        (responsável_matches × 0.5)
```

## Performance

- Tokenização: O(n) onde n = comprimento do texto
- Levenshtein: O(m×n) onde m,n = comprimento das strings
- Busca completa: O(tasks × tokens × fields)
- Otimizado para até 1000 tarefas

## Casos de Uso

1. **Busca Rápida**
   - Usuário digita "cliente"
   - Vê sugestões em tempo real
   - Seleciona resultado

2. **Busca com Erros**
   - Usuário digita "clinte" (erro)
   - Sistema encontra "cliente"
   - Mostra resultado correto

3. **Busca Multi-palavra**
   - Usuário digita "projeto web"
   - Encontra tarefas com ambas as palavras
   - Ranking por relevância

4. **Busca Avançada**
   - Combina busca full-text com filtros
   - Ex: "cliente" + status="todo"
   - Resultados filtrados e ranqueados

## Integração

### No Modal de Filtros
```typescript
const { advancedSearch } = useFullTextSearch()

const results = advancedSearch(query, tasks, {
  status: ['todo'],
  priority: ['alta'],
  assigned_to: ['user@email.com']
})
```

### Na Barra de Busca
```vue
<TasksKSearchBar 
  :tasks="tasks"
  @search="handleSearch"
  @select="handleSelectTask"
/>
```

## Melhorias Futuras

- [ ] Busca por data (ex: "hoje", "semana passada")
- [ ] Busca por intervalo de tempo
- [ ] Busca por estimativa (ex: "menos de 2 horas")
- [ ] Busca por status (ex: "atrasadas")
- [ ] Histórico de buscas
- [ ] Buscas salvas
- [ ] Busca por voz
- [ ] Índice de busca (para performance)

## Arquivos

**Created:**
- `app/composables/useFullTextSearch.ts`
- `app/components/tasks/KSearchBar.vue`

**Modified:**
- Nenhum arquivo modificado (implementação isolada)

## Testing

Para testar:
1. Abrir página de tarefas
2. Usar barra de busca
3. Testar com erros de digitação
4. Testar com múltiplas palavras
5. Verificar sugestões
6. Verificar ranking de resultados
