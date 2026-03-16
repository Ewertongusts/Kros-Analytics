# 🧪 Guia de Testes - Transferência em Lote

## ✅ Testes Unitários

### Componente: KBulkActionsBar.vue

```typescript
describe('KBulkActionsBar', () => {
  it('deve renderizar quando selectedCount > 0', () => {
    // Arrange
    const wrapper = mount(KBulkActionsBar, {
      props: { selectedCount: 3 }
    })
    
    // Assert
    expect(wrapper.isVisible()).toBe(true)
  })

  it('deve emitir @transfer quando clicado', async () => {
    const wrapper = mount(KBulkActionsBar, {
      props: { selectedCount: 1 }
    })
    
    await wrapper.find('[title="Transferir para coluna"]').trigger('click')
    
    expect(wrapper.emitted('transfer')).toBeTruthy()
  })

  it('deve emitir @delete quando clicado', async () => {
    const wrapper = mount(KBulkActionsBar, {
      props: { selectedCount: 1 }
    })
    
    await wrapper.find('[title="Deletar selecionadas"]').trigger('click')
    
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('deve emitir @clear quando clicado', async () => {
    const wrapper = mount(KBulkActionsBar, {
      props: { selectedCount: 1 }
    })
    
    await wrapper.find('[title="Limpar seleção"]').trigger('click')
    
    expect(wrapper.emitted('clear')).toBeTruthy()
  })
})
```

### Componente: KBulkTransferModal.vue

```typescript
describe('KBulkTransferModal', () => {
  it('deve renderizar quando isOpen = true', () => {
    const wrapper = mount(KBulkTransferModal, {
      props: {
        isOpen: true,
        selectedTaskIds: ['1', '2'],
        columns: [{ column_id: 'col1', name: 'Coluna 1' }],
        tasks: [],
        getTasksInColumn: () => []
      }
    })
    
    expect(wrapper.isVisible()).toBe(true)
  })

  it('deve desabilitar botão sem seleção de coluna', () => {
    const wrapper = mount(KBulkTransferModal, {
      props: {
        isOpen: true,
        selectedTaskIds: ['1'],
        columns: [{ column_id: 'col1', name: 'Coluna 1' }],
        tasks: [],
        getTasksInColumn: () => []
      }
    })
    
    const button = wrapper.find('button:contains("Transferir")')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('deve emitir @transfer com columnId correto', async () => {
    const wrapper = mount(KBulkTransferModal, {
      props: {
        isOpen: true,
        selectedTaskIds: ['1'],
        columns: [{ column_id: 'col1', name: 'Coluna 1' }],
        tasks: [],
        getTasksInColumn: () => []
      }
    })
    
    // Selecionar coluna
    await wrapper.find('[data-column="col1"]').trigger('click')
    
    // Clicar transferir
    await wrapper.find('button:contains("Transferir")').trigger('click')
    
    expect(wrapper.emitted('transfer')).toBeTruthy()
  })
})
```

### Composable: useBulkTaskTransfer

```typescript
describe('useBulkTaskTransfer', () => {
  it('deve inicializar com modal fechado', () => {
    const { isBulkTransferModalOpen } = useBulkTaskTransfer()
    
    expect(isBulkTransferModalOpen.value).toBe(false)
  })

  it('deve abrir modal', () => {
    const { isBulkTransferModalOpen, openBulkTransferModal } = useBulkTaskTransfer()
    
    openBulkTransferModal()
    
    expect(isBulkTransferModalOpen.value).toBe(true)
  })

  it('deve fechar modal', () => {
    const { isBulkTransferModalOpen, openBulkTransferModal, closeBulkTransferModal } = useBulkTaskTransfer()
    
    openBulkTransferModal()
    closeBulkTransferModal()
    
    expect(isBulkTransferModalOpen.value).toBe(false)
  })
})
```

## 🎯 Testes de Integração

### Fluxo Completo: Seleção → Transferência

```typescript
describe('Bulk Transfer Flow', () => {
  it('deve completar fluxo de transferência', async () => {
    // 1. Montar container
    const wrapper = mount(KTasksKanbanViewContainer, {
      props: {
        tasks: [
          { id: '1', title: 'Task 1', column_id: 'col1' },
          { id: '2', title: 'Task 2', column_id: 'col1' }
        ],
        columns: [
          { column_id: 'col1', name: 'Coluna 1' },
          { column_id: 'col2', name: 'Coluna 2' }
        ]
      }
    })

    // 2. Selecionar cards
    const cards = wrapper.findAll('[data-task]')
    await cards[0].find('input[type="checkbox"]').setValue(true)
    await cards[1].find('input[type="checkbox"]').setValue(true)

    // 3. Verificar barra de ações
    const bulkBar = wrapper.findComponent(KBulkActionsBar)
    expect(bulkBar.props('selectedCount')).toBe(2)

    // 4. Clicar transferir
    await bulkBar.vm.$emit('transfer')

    // 5. Verificar modal
    const modal = wrapper.findComponent(KBulkTransferModal)
    expect(modal.props('isOpen')).toBe(true)

    // 6. Selecionar coluna
    await modal.find('[data-column="col2"]').trigger('click')

    // 7. Confirmar transferência
    await modal.vm.$emit('transfer', 'col2', ['1', '2'])

    // 8. Verificar que tarefas foram movidas
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.tasks[0].column_id).toBe('col2')
    expect(wrapper.vm.tasks[1].column_id).toBe('col2')
  })
})
```

## 🧑‍💻 Testes Manuais

### Teste 1: Seleção Básica

**Passos:**
1. Abrir página de tarefas (Kanban)
2. Clicar no checkbox de um card
3. Verificar que o card tem anel verde
4. Verificar que a barra de ações aparece

**Resultado Esperado:**
- ✅ Card com anel verde
- ✅ Barra de ações visível
- ✅ Contador mostra "1 tarefa selecionada"

### Teste 2: Múltiplas Seleções

**Passos:**
1. Selecionar 3 cards diferentes
2. Verificar contador
3. Deselecionar 1 card
4. Verificar contador atualizado

**Resultado Esperado:**
- ✅ Contador mostra "3 tarefas selecionadas"
- ✅ Após deselecionar: "2 tarefas selecionadas"
- ✅ Todos os cards têm anel verde

### Teste 3: Transferência Simples

**Passos:**
1. Selecionar 2 cards
2. Clicar "Transferir"
3. Escolher coluna "Concluído"
4. Clicar "Transferir"

**Resultado Esperado:**
- ✅ Modal abre
- ✅ Cards se movem com animação
- ✅ Seleção é limpa
- ✅ Barra desaparece

### Teste 4: Deleção em Lote

**Passos:**
1. Selecionar 2 cards
2. Clicar "Deletar"
3. Confirmar na caixa de diálogo

**Resultado Esperado:**
- ✅ Caixa de confirmação aparece
- ✅ Cards são deletados
- ✅ Seleção é limpa
- ✅ Barra desaparece

### Teste 5: Limpeza de Seleção

**Passos:**
1. Selecionar 3 cards
2. Clicar "Limpar"

**Resultado Esperado:**
- ✅ Todos os cards perdem anel verde
- ✅ Barra desaparece
- ✅ Contador volta a 0

### Teste 6: Animações

**Passos:**
1. Selecionar cards
2. Observar barra aparecendo
3. Transferir cards
4. Observar animações

**Resultado Esperado:**
- ✅ Barra slide-up suave
- ✅ Modal fade-in suave
- ✅ Cards fade-out e fade-in
- ✅ Sem travamentos

### Teste 7: Responsividade

**Passos:**
1. Redimensionar janela
2. Testar em mobile (viewport 375px)
3. Testar em tablet (viewport 768px)
4. Testar em desktop (viewport 1920px)

**Resultado Esperado:**
- ✅ Barra se adapta ao tamanho
- ✅ Modal responsivo
- ✅ Botões acessíveis em todos os tamanhos

### Teste 8: Validação

**Passos:**
1. Abrir modal
2. Tentar clicar "Transferir" sem selecionar coluna
3. Selecionar coluna
4. Clicar "Transferir"

**Resultado Esperado:**
- ✅ Botão desabilitado sem seleção
- ✅ Botão habilitado com seleção
- ✅ Transferência funciona

## 🔍 Testes de Performance

### Teste 1: Muitos Cards

**Passos:**
1. Criar 100+ cards
2. Selecionar 10 cards
3. Transferir

**Resultado Esperado:**
- ✅ Sem lag
- ✅ Animações suaves
- ✅ Tempo < 2s

### Teste 2: Muitas Colunas

**Passos:**
1. Criar 20+ colunas
2. Abrir modal de transferência
3. Scroll na lista

**Resultado Esperado:**
- ✅ Modal renderiza rápido
- ✅ Scroll suave
- ✅ Sem travamentos

## 🐛 Testes de Erro

### Teste 1: Sem Permissão

**Passos:**
1. Remover permissão RLS
2. Tentar transferir

**Resultado Esperado:**
- ✅ Erro tratado graciosamente
- ✅ Mensagem de erro exibida
- ✅ Sem crash

### Teste 2: Conexão Perdida

**Passos:**
1. Desconectar internet
2. Tentar transferir

**Resultado Esperado:**
- ✅ Erro tratado
- ✅ Mensagem de erro
- ✅ Sem crash

## 📋 Checklist de Testes

- [ ] Seleção básica funciona
- [ ] Múltiplas seleções funcionam
- [ ] Transferência funciona
- [ ] Deleção funciona
- [ ] Limpeza funciona
- [ ] Animações são suaves
- [ ] Responsivo em todos os tamanhos
- [ ] Validação funciona
- [ ] Performance é boa
- [ ] Erros são tratados
- [ ] Sem console errors
- [ ] Sem console warnings

## 🚀 Executar Testes

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes e2e
npm run test:e2e

# Todos os testes
npm run test

# Com cobertura
npm run test:coverage
```

---

**Todos os testes devem passar antes de fazer deploy!** ✅
