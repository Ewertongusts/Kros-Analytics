# Kanban 2 - Fase 3: Testes Manuais

## 📋 Objetivo

Validar que o Kanban 2 funciona corretamente em produção e está pronto para ser usado.

**Status:** ✅ PRONTO PARA TESTES
**Data:** 15 de Março de 2026

---

## 🚀 Como Acessar

### URL
```
http://localhost:3000/kanban2
```

### Navegação
- Clique em "Kanban 2" no menu (se houver)
- Ou acesse diretamente a URL acima

---

## ✅ Checklist de Testes

### 1. Carregamento Inicial

- [ ] Página carrega sem erros
- [ ] Board aparece com colunas
- [ ] Cards aparecem nas colunas
- [ ] Contador de cards está correto
- [ ] Sem erros no console (F12)

**Esperado:**
- Board com múltiplas colunas
- Cards distribuídos nas colunas
- Interface responsiva

---

### 2. Drag-Drop

#### 2.1 Arrastar Card Entre Colunas

- [ ] Clicar e arrastar um card
- [ ] Card segue o mouse
- [ ] Indicador visual aparece (linha azul)
- [ ] Card move para coluna de destino
- [ ] Card desaparece da coluna original
- [ ] Sem flashing ou piscar

**Esperado:**
- Card move suavemente
- Sem lag ou delay
- Sem flashing

#### 2.2 Reordenar Cards Dentro de Coluna

- [ ] Arrastar card para cima/baixo na mesma coluna
- [ ] Card reordena corretamente
- [ ] Indicador "above/below" aparece

**Esperado:**
- Cards reordenam dentro da coluna
- Sem erros

#### 2.3 Drop em Coluna Vazia

- [ ] Arrastar card para coluna vazia
- [ ] Card aparece na coluna vazia
- [ ] Sem erros

**Esperado:**
- Card move para coluna vazia
- Coluna não fica vazia se tinha cards

---

### 3. Seleção de Cards

#### 3.1 Checkbox Individual

- [ ] Clicar checkbox em um card
- [ ] Card fica destacado (fundo azul)
- [ ] Batch actions bar aparece na parte inferior
- [ ] Contador mostra "1 selecionada(s)"

**Esperado:**
- Card selecionado fica destacado
- Batch actions bar aparece

#### 3.2 Múltiplas Seleções

- [ ] Clicar checkbox em vários cards
- [ ] Todos ficam destacados
- [ ] Contador atualiza corretamente

**Esperado:**
- Múltiplos cards selecionados
- Contador correto

#### 3.3 Limpar Seleção

- [ ] Clicar botão "✕ Limpar" na batch actions bar
- [ ] Todos os cards deselecionam
- [ ] Batch actions bar desaparece

**Esperado:**
- Seleção limpa
- Batch actions bar desaparece

---

### 4. Criar Tarefa

#### 4.1 Botão "Adicionar Tarefa"

- [ ] Clicar "+ Adicionar Tarefa" em uma coluna
- [ ] Modal abre
- [ ] Modal tem campos: Título, Descrição, Status

**Esperado:**
- Modal abre com formulário vazio

#### 4.2 Preencher Formulário

- [ ] Digitar título
- [ ] Digitar descrição
- [ ] Selecionar status
- [ ] Clicar "Criar"

**Esperado:**
- Modal fecha
- Nova tarefa aparece na coluna
- Tarefa tem os dados corretos

#### 4.3 Validação

- [ ] Tentar criar sem título
- [ ] Deve mostrar erro ou não permitir

**Esperado:**
- Validação funciona

---

### 5. Editar Tarefa

#### 5.1 Abrir Modal de Edição

- [ ] Clicar botão "✏️" em um card
- [ ] Modal abre com dados da tarefa

**Esperado:**
- Modal abre com dados preenchidos

#### 5.2 Editar Dados

- [ ] Alterar título
- [ ] Alterar descrição
- [ ] Alterar status
- [ ] Clicar "Atualizar"

**Esperado:**
- Modal fecha
- Card atualizado com novos dados

---

### 6. Deletar Tarefa

#### 6.1 Deletar Individual

- [ ] Clicar botão "🗑️" em um card
- [ ] Confirmação aparece
- [ ] Clicar "OK"

**Esperado:**
- Card desaparece
- Contador de cards diminui

#### 6.2 Deletar em Batch

- [ ] Selecionar múltiplos cards
- [ ] Clicar "🗑️ Deletar" na batch actions bar
- [ ] Confirmação aparece
- [ ] Clicar "OK"

**Esperado:**
- Todos os cards selecionados desaparecem
- Batch actions bar desaparece

---

### 7. Colunas

#### 7.1 Adicionar Coluna

- [ ] Clicar "+ Adicionar Coluna" no header
- [ ] Prompt pede nome da coluna
- [ ] Digitar nome
- [ ] Clicar "OK"

**Esperado:**
- Nova coluna aparece
- Coluna vazia

#### 7.2 Editar Coluna

- [ ] Clicar "✏️" no header da coluna
- [ ] Modal abre (se implementado)

**Esperado:**
- Modal abre ou ação funciona

#### 7.3 Deletar Coluna

- [ ] Clicar "🗑️" no header da coluna
- [ ] Confirmação aparece
- [ ] Clicar "OK"

**Esperado:**
- Coluna desaparece
- Cards da coluna desaparecem

---

### 8. Responsividade

#### 8.1 Desktop (1920x1080)

- [ ] Layout completo
- [ ] Todas as colunas visíveis
- [ ] Scroll horizontal se necessário

**Esperado:**
- Layout desktop funciona

#### 8.2 Tablet (768x1024)

- [ ] Layout adaptado
- [ ] Colunas em grid
- [ ] Botões acessíveis

**Esperado:**
- Layout tablet funciona

#### 8.3 Mobile (375x667)

- [ ] Layout adaptado
- [ ] Colunas em stack
- [ ] Batch actions bar acessível

**Esperado:**
- Layout mobile funciona

---

### 9. Performance

#### 9.1 Carregamento

- [ ] Página carrega em < 2 segundos
- [ ] Sem lag ao interagir

**Esperado:**
- Performance boa

#### 9.2 Drag-Drop

- [ ] Drag-drop suave
- [ ] Sem lag ao arrastar
- [ ] Sem lag ao soltar

**Esperado:**
- Drag-drop responsivo

#### 9.3 Muitos Cards

- [ ] Adicionar 100+ cards
- [ ] Verificar se performance degrada
- [ ] Scroll suave

**Esperado:**
- Performance aceitável com muitos cards

---

### 10. Integração com Supabase

#### 10.1 Persistência

- [ ] Criar tarefa
- [ ] Recarregar página (F5)
- [ ] Tarefa ainda existe

**Esperado:**
- Dados persistem no Supabase

#### 10.2 Sincronização

- [ ] Abrir Kanban 2 em duas abas
- [ ] Criar tarefa em uma aba
- [ ] Verificar se aparece na outra aba

**Esperado:**
- Dados sincronizam (se realtime implementado)

---

## 🐛 Bugs Conhecidos

### Nenhum no momento

Se encontrar bugs, documente aqui:

```
- [Bug] Descrição
  - Passos para reproduzir
  - Comportamento esperado
  - Comportamento atual
```

---

## 📊 Resultados

### Testes Passando

- [ ] Carregamento: ✅ / ❌
- [ ] Drag-Drop: ✅ / ❌
- [ ] Seleção: ✅ / ❌
- [ ] Criar: ✅ / ❌
- [ ] Editar: ✅ / ❌
- [ ] Deletar: ✅ / ❌
- [ ] Colunas: ✅ / ❌
- [ ] Responsividade: ✅ / ❌
- [ ] Performance: ✅ / ❌
- [ ] Supabase: ✅ / ❌

### Score Total

```
Testes Passando: X / 10
Percentual: X%
```

---

## 🎯 Próximos Passos

Se todos os testes passarem:
1. ✅ Fase 3 completa
2. ⏳ Fase 4: Testes & Otimizações
3. ⏳ Comparação com Tarefas
4. ⏳ Migração de usuários

---

## 📝 Notas

### O Que Testar Primeiro

1. Carregamento inicial
2. Drag-drop básico
3. Criar/editar/deletar
4. Responsividade

### O Que Testar Depois

1. Performance com muitos cards
2. Integração com Supabase
3. Casos extremos

---

**Data:** 15 de Março de 2026
**Versão:** 3.0.0
**Status:** ✅ PRONTO PARA TESTES
