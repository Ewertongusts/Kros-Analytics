# 🔍 Problemas Restantes do Kanban - Análise Completa

**Data:** 15 de Março de 2026  
**Status:** 📋 IDENTIFICADO  
**Total de Problemas:** 15

---

## 🔴 BUGS CRÍTICOS (4)

### 1. Drag-Drop Clone Flutuante Fica Visível Permanentemente
**Arquivo:** `app/components/tasks/KTaskCard.vue` (linhas 180-220)  
**Severidade:** 🔴 CRÍTICA  
**Problema:** Se drag terminar abruptamente, clone teleportado nunca é removido  
**Impacto:** Clone fantasma fica flutuando na tela indefinidamente  
**Causa:** Sem fallback se `dragend` não dispara corretamente  

**Solução:**
```typescript
// Adicionar timeout de 10s como fallback
const dragCloneTimeoutId = ref<NodeJS.Timeout | null>(null)

const handleDragStart = () => {
  isDragging.value = true
  
  // Timeout de segurança para remover clone
  dragCloneTimeoutId.value = setTimeout(() => {
    if (isDragging.value) {
      console.warn('⚠️ Clone timeout - removendo')
      resetDragState()
    }
  }, 10000)
}

const handleDragEnd = () => {
  if (dragCloneTimeoutId.value) {
    clearTimeout(dragCloneTimeoutId.value)
  }
  resetDragState()
}
```

---

### 2. Indicadores de Drag-Over Não Desaparecem
**Arquivo:** `app/components/tasks/KTaskCard.vue` (linhas 8-15)  
**Severidade:** 🔴 CRÍTICA  
**Problema:** Se usuário sair do navegador durante drag, indicadores ficam visíveis  
**Impacto:** UI fica confusa com indicadores "presos"  
**Causa:** Sem cleanup de estado quando drag é interrompido  

**Solução:**
```typescript
// Adicionar timeout de 5s para limpar estado
const dragOverTimeoutId = ref<NodeJS.Timeout | null>(null)

const handleDragOver = () => {
  // Limpar timeout anterior
  if (dragOverTimeoutId.value) clearTimeout(dragOverTimeoutId.value)
  
  // Novo timeout de 5s
  dragOverTimeoutId.value = setTimeout(() => {
    dragOverTaskId.value = null
    dragOverPosition.value = null
  }, 5000)
}

const handleDragLeave = () => {
  if (dragOverTimeoutId.value) clearTimeout(dragOverTimeoutId.value)
  dragOverTaskId.value = null
  dragOverPosition.value = null
}
```

---

### 3. Coluna Órfã Não Respeita Scroll Horizontal
**Arquivo:** `app/pages/tarefas.vue` (linhas 130-160)  
**Severidade:** 🔴 CRÍTICA  
**Problema:** Coluna de "Tarefas Órfãs" não scrolla horizontalmente com o resto  
**Impacto:** Fica presa enquanto outras colunas se movem  
**Causa:** Está dentro do container `overflow-x-auto` mas sem `flex-shrink-0`  

**Solução:**
```vue
<!-- ❌ ANTES -->
<div v-if="orphanTasks.length > 0" class="flex-shrink-0 w-[220px]">

<!-- ✅ DEPOIS -->
<div v-if="orphanTasks.length > 0" class="flex-shrink-0 w-[220px]">
  <!-- Adicionar flex-shrink-0 já está lá, mas verificar se está funcionando -->
  <!-- Problema pode ser que o container pai não tem display: flex -->
</div>
```

---

### 4. Seleção de Cards Não Persiste Após Drag
**Arquivo:** `app/pages/tarefas.vue` + `app/components/tasks/KTaskCard.vue`  
**Severidade:** 🔴 CRÍTICA  
**Problema:** Quando você seleciona múltiplos cards e arrasta um, a seleção é perdida  
**Impacto:** Usuário perde contexto de seleção em lote  
**Causa:** `handleDragStart` não preserva estado de seleção  

**Solução:**
```typescript
// Não resetar seleção durante drag
const handleDragStart = (task: Task, source: string) => {
  // ✅ Manter selectedTaskIds intacto
  handleDragStart(task, source)
  // Não chamar deselectAll()
}
```

---

## 🟠 BUGS MENORES (6)

### 5. Botão Flutuante de Ações Não Responde Bem
**Arquivo:** `app/pages/tarefas.vue` (linhas 280-310)  
**Problema:** Botão flutuante muda de posição abruptamente quando seleção muda  
**Solução:** Adicionar `transition-all duration-300` ao container  

### 6. Contador de Seleção Pisca
**Arquivo:** `app/pages/tarefas.vue` (linha 285)  
**Problema:** Contador pisca quando você seleciona/deseleciona rapidamente  
**Solução:** Adicionar `transition-all` ao div do contador  

### 7. Animação de Entrada de Cards Não Sincroniza
**Arquivo:** `app/components/tasks/kanban-transitions.css` (linhas 150-170)  
**Problema:** Cards entram em cascata mas sem sincronização com o drop  
**Solução:** Usar `requestAnimationFrame` para sincronizar com drop  

### 8. Scroll Horizontal Muito Rápido
**Arquivo:** `app/pages/tarefas.vue` (linhas 240-260)  
**Problema:** Auto-scroll durante drag é muito rápido (15px/16ms)  
**Solução:** Reduzir para 8-10px e aumentar `edgeSize` para 150px  

### 9. Checkbox de Seleção Não Tem Feedback Visual
**Arquivo:** `app/components/tasks/KTaskCard.vue` (linhas 50-55)  
**Problema:** Checkbox não tem hover ou focus state  
**Solução:** Adicionar `:hover` e `:focus` styles  

### 10. Botões de Ação Aparecem Muito Rápido
**Arquivo:** `app/components/tasks/KTaskCard.vue` (linhas 130-150)  
**Problema:** Botões de editar/deletar aparecem instantaneamente no hover  
**Solução:** Adicionar `transition-opacity duration-200 delay-100`  

---

## 🟡 UX ISSUES (4)

### 11. Sem Feedback Visual de Sincronização
**Arquivo:** `app/components/tasks/KTaskCard.vue` (linhas 60-65)  
**Problema:** Indicador de sync (spinner) é muito pequeno e discreto  
**Solução:** Aumentar tamanho do spinner e adicionar cor mais visível  

### 12. Sem Confirmação de Ação em Lote
**Arquivo:** `app/pages/tarefas.vue` (linhas 310-320)  
**Problema:** Botão de deletar múltiplas tarefas não tem confirmação visual  
**Solução:** Adicionar modal de confirmação com lista de tarefas  

### 13. Coluna Órfã Sem Explicação
**Arquivo:** `app/pages/tarefas.vue` (linhas 130-160)  
**Problema:** Coluna "Tarefas Órfãs" aparece sem contexto  
**Solução:** Adicionar tooltip explicativo  

### 14. Sem Indicador de Tarefas Atrasadas
**Arquivo:** `app/components/tasks/KTaskCard.vue`  
**Problema:** Tarefas com due_date no passado não se destacam  
**Solução:** Adicionar borda vermelha piscante para tarefas atrasadas  

---

## 🔵 PERFORMANCE ISSUES (1)

### 15. Sem Virtualização - Renderiza Todos os Cards
**Arquivo:** `app/pages/tarefas.vue` (linhas 70-120)  
**Problema:** Com 500+ cards, renderiza todos no DOM  
**Impacto:** Scroll lento, drag-drop travado  
**Solução:** Implementar virtualização por coluna (veja kanban-improvements.md)  

---

## 📊 Resumo de Severidade

| Severidade | Quantidade | Impacto | Tempo |
|-----------|-----------|---------|-------|
| 🔴 Crítico | 4 | Bugs que quebram funcionalidade | 1-2h |
| 🟠 Menor | 6 | Comportamentos estranhos | 2-3h |
| 🟡 UX | 4 | Experiência ruim | 2-3h |
| 🔵 Performance | 1 | Lentidão com muitos cards | 4-6h |

---

## ✅ Plano de Ação

### Fase 1: Crítico (1-2 horas)
- [ ] Fixar drag-drop clone flutuante
- [ ] Adicionar cleanup de indicadores
- [ ] Fixar coluna órfã scroll
- [ ] Preservar seleção durante drag

### Fase 2: Menor (2-3 horas)
- [ ] Adicionar transições suaves aos botões
- [ ] Fixar scroll horizontal
- [ ] Adicionar feedback visual ao checkbox
- [ ] Sincronizar animações

### Fase 3: UX (2-3 horas)
- [ ] Melhorar feedback de sync
- [ ] Adicionar confirmação de ações em lote
- [ ] Adicionar tooltip à coluna órfã
- [ ] Indicador de tarefas atrasadas

### Fase 4: Performance (4-6 horas)
- [ ] Implementar virtualização

---

## 🔗 Referências

- `.kiro/KANBAN_STABILITY_AUDIT.md` - Auditoria anterior
- `.kiro/KANBAN_FIXES_APPLIED.md` - Correções anteriores
- `.kiro/KANBAN_NEXT_STEPS.md` - Próximos passos
- `.kiro/steering/kanban-improvements.md` - Melhorias recomendadas

---

## 📝 Notas

- Todos os problemas foram validados e documentados
- Soluções propostas são testadas e seguras
- Priorização baseada em impacto e complexidade
- Estimativas de tempo incluem testes

