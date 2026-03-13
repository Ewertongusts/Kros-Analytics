---
inclusion: auto
---

# Histórico de Problemas: Contatos Desaparecendo

## 🔴 Problema Crítico
Contatos desapareciam repetidamente da página de clientes (11+ vezes). Cada vez era um problema diferente, causando frustração e perda de confiança no sistema.

---

## 📋 Histórico Completo de Ocorrências e Soluções

### Ocorrência #1-3: Erro de Variável Duplicada
**Sintoma:** Build error - "The symbol 'result' has already been declared"
**Causa:** Linha 22-23 em `useClientsFilters.ts` tinha declaração duplicada de `let result = [...companies]`
**Solução:** Removida declaração duplicada
**Arquivo:** `app/composables/useClientsFilters.ts`

### Ocorrência #4-5: Data Field Mismatch
**Sintoma:** Contatos apareciam vazios na tabela
**Causa:** Componente tentava exibir `company.phone` mas o campo correto era `company.whatsapp`
**Solução:** Alterado para usar `company.whatsapp` em:
- `app/components/clients/KClientsTableRow.vue`
- `app/composables/useClientsFilters.ts` (filtro de busca)
**Raiz:** Mapeamento incorreto de campos do Supabase

### Ocorrência #6-8: Contatos Desaparecendo Após Salvar
**Sintoma:** Contatos sumiam após criar/editar um cliente
**Causa:** `useCompanies.ts` salvava apenas 11 de 22 campos na tabela `companies`
**Solução:** 
1. Expandida interface `Company` para incluir todos os campos:
   - `document`, `phone`, `website`, `birthday`, `segment`, `sales_rep`
   - `address_zipcode`, `address_street`, `address_number`, `address_complement`, `address_neighborhood`, `address_city`, `address_state`
2. Atualizado payload em `upsertCompany()` para incluir todos os campos
3. Adicionadas validações robustas em `fetchCompanies()` para garantir arrays nunca ficam undefined
**Arquivo:** `app/composables/useCompanies.ts`
**Raiz:** Perda de dados durante operação de upsert

### Ocorrência #9: Modal de Status Não Responsivo
**Sintoma:** Clicar no badge de status não abria o modal
**Causa:** Falta de backdrop invisível para capturar clicks fora do dropdown
**Solução:**
1. Adicionado backdrop invisível: `fixed inset-0 z-[9998]`
2. Adicionado `@click.stop` ao botão e itens do menu
3. Aumentado z-index de `z-50` para `z-[9999]`
**Arquivo:** `app/components/finance/subscription/KSubscriptionStatusBadge.vue`

### Ocorrência #10-11: Contatos Desaparecendo Novamente (CRÍTICO)
**Sintoma:** Contatos sumiam sem motivo aparente, mesmo após todas as correções anteriores
**Causa Raiz:** Falta de mecanismo de recarregamento automático
- `fetchCompanies()` era chamado apenas no `onMounted`
- Sem polling automático
- Sem recarregamento ao voltar para a página
- Sem recarregamento após operações de salvar/deletar
**Solução Definitiva:**

#### 1. Adicionado Polling Automático
```typescript
const startPolling = () => {
  if (pollingInterval) return
  console.log('🔄 Iniciando polling automático de contatos (30s)')
  pollingInterval = setInterval(() => {
    fetchCompanies()
  }, 30000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('⏹️ Polling automático parado')
  }
}
```

#### 2. Adicionado Listener de Visibilidade
```typescript
const setupVisibilityListener = () => {
  if (typeof window === 'undefined') return
  
  visibilityListener = () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ Página visível - recarregando contatos')
      fetchCompanies()
    }
  }
  
  document.addEventListener('visibilitychange', visibilityListener)
}
```

#### 3. Adicionado Cleanup Automático
```typescript
const cleanup = () => {
  stopPolling()
  if (visibilityListener && typeof window !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityListener)
  }
}
```

#### 4. Integrado em KCompaniesManagement.vue
```typescript
onMounted(() => {
  console.log('📱 KCompaniesManagement montado - iniciando carregamento de contatos')
  fetchCompanies()
  setupVisibilityListener()
  startPolling()
})

onUnmounted(() => {
  console.log('🛑 KCompaniesManagement desmontado - parando polling')
  cleanup()
})
```

#### 5. Recarregamento Imediato Após Operações
```typescript
const handleSave = async (formData: any) => {
  const result = await upsertCompany(formData)
  if (result.success) {
    closeModal()
    await fetchCompanies() // Recarregar imediatamente
  }
}

const handleDelete = async (id: string) => {
  // ... confirmação ...
  const result = await deleteCompany(id)
  if (result.success) {
    await fetchCompanies() // Recarregar imediatamente
  }
}
```

#### 6. Proteção Extra em useClientsFilters
```typescript
const getCompaniesArray = () => {
  try {
    if (Array.isArray(companiesRef)) {
      return companiesRef.length > 0 ? companiesRef : []
    } else if (companiesRef && companiesRef.value && Array.isArray(companiesRef.value)) {
      return companiesRef.value.length > 0 ? companiesRef.value : []
    }
    return []
  } catch (e) {
    console.error('❌ Erro ao obter array de companies:', e)
    return []
  }
}
```

**Arquivos Modificados:**
- `app/composables/useCompanies.ts` (adicionado polling, visibility listener, cleanup)
- `app/components/blocks/KCompaniesManagement.vue` (integrado polling e cleanup)
- `app/composables/useClientsFilters.ts` (proteção extra com getCompaniesArray)

---

## 🔍 Diagnósticos para Futuras Ocorrências

### Se contatos desaparecerem novamente, verificar em ordem:

1. **Console Logs**
   - Procurar por: `🔄 Iniciando polling automático`
   - Procurar por: `👁️ Página visível - recarregando contatos`
   - Procurar por: `❌ Erro ao obter array de companies`
   - Se não aparecer: polling não está rodando

2. **Network Tab (DevTools)**
   - Verificar se há requisições GET para `companies` a cada 30 segundos
   - Se não houver: polling não está funcionando
   - Verificar status das requisições (200 OK vs erro)

3. **Supabase Dashboard**
   - Verificar se dados estão realmente no banco
   - Verificar se há erros de permissão (RLS policies)
   - Verificar se há erros de schema (colunas faltando)

4. **React DevTools / Vue DevTools**
   - Verificar se `companies` ref está vazia ou undefined
   - Verificar se `filteredCompanies` computed está retornando array vazio
   - Verificar se `paginatedCompanies` está vazio

5. **Checklist de Verificação**
   - [ ] `onMounted` está sendo chamado em KCompaniesManagement?
   - [ ] `startPolling()` está sendo chamado?
   - [ ] `setupVisibilityListener()` está sendo chamado?
   - [ ] Não há erro no console durante fetch?
   - [ ] Dados existem no Supabase?
   - [ ] RLS policies permitem leitura?
   - [ ] Usuário está logado?

---

## 📊 Métricas de Confiabilidade

### Antes da Solução Definitiva
- ❌ Contatos desapareciam 11+ vezes
- ❌ Sem mecanismo de recarregamento automático
- ❌ Sem proteção contra perda de dados
- ❌ Sem logs para diagnóstico

### Depois da Solução Definitiva
- ✅ Polling automático a cada 30 segundos
- ✅ Recarregamento ao voltar para a página
- ✅ Recarregamento imediato após salvar/deletar
- ✅ Proteção extra em 3 camadas (fetch, filter, display)
- ✅ Logs detalhados para diagnóstico
- ✅ Cleanup automático ao desmontar componente

---

## 🛠️ Arquivos Críticos

### Composables
- `app/composables/useCompanies.ts` - Fetch, polling, visibility listener
- `app/composables/useClientsFilters.ts` - Proteção extra de arrays

### Componentes
- `app/components/blocks/KCompaniesManagement.vue` - Orquestração de polling
- `app/components/clients/KClientsTable.vue` - Exibição de dados
- `app/components/clients/KClientsTableRow.vue` - Mapeamento de campos

---

## 🚨 Próximas Ações se Problema Persistir

1. **Adicionar Real-time Subscriptions**
   ```typescript
   const subscription = supabase
     .from('companies')
     .on('*', payload => {
       console.log('Mudança detectada:', payload)
       fetchCompanies()
     })
     .subscribe()
   ```

2. **Adicionar Cache Local**
   ```typescript
   const cachedCompanies = localStorage.getItem('companies')
   if (!companies.value.length && cachedCompanies) {
     companies.value = JSON.parse(cachedCompanies)
   }
   ```

3. **Adicionar Retry Logic**
   ```typescript
   const fetchWithRetry = async (retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         await fetchCompanies()
         return
       } catch (e) {
         if (i === retries - 1) throw e
         await new Promise(r => setTimeout(r, 1000 * (i + 1)))
       }
     }
   }
   ```

---

## 📝 Resumo

**Problema:** Contatos desapareciam 11+ vezes
**Causa Raiz:** Falta de mecanismo de recarregamento automático + perda de dados em upsert
**Solução:** Polling automático (30s) + visibility listener + recarregamento imediato + proteção em 3 camadas
**Status:** ✅ RESOLVIDO COM DIAGNÓSTICOS COMPLETOS

### Ocorrência #12: Contatos Desaparecendo NOVAMENTE (CRÍTICO x2) 🔴
**Sintoma:** Contatos sumiam após adicionar indicadores na página de assinaturas
**Causa Raiz:** Polling automático + visibility listeners criavam conflitos e race conditions
- Múltiplos listeners sendo registrados
- Polling interferindo com renderização
- Cleanup não funcionando corretamente
- Componentes sendo montados/desmontados causando perda de estado
- Indicadores adicionados em KSubscriptionsContent causaram re-renders que quebraram o estado

**Solução Definitiva - SIMPLIFICAÇÃO RADICAL:**

#### 1. Removido TODO o sistema de polling
```typescript
// ❌ REMOVIDO: startPolling(), stopPolling(), setupVisibilityListener(), cleanup()
// Esses causavam race conditions e conflitos
```

#### 2. Fetch simples e direto com logs
```typescript
const fetchCompanies = async () => {
  loading.value = true
  error.value = null
  console.log('🔄 Iniciando fetch de contatos...')
  try {
    const { data, error: fetchError } = await supabase
      .from('companies')
      .select(`*, payments (amount, status)`)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Erro do Supabase:', fetchError)
      throw fetchError
    }
    
    console.log('✅ Dados recebidos do Supabase:', data?.length || 0, 'contatos')
    
    // Processar e atribuir
    companies.value = processedCompanies
    console.log('✅ Contatos carregados:', companies.value.length)
  } catch (e) {
    console.error('❌ Erro:', e.message)
    companies.value = [] // Garantir array vazio, nunca undefined
  }
}
```

#### 3. Componente ultra-simples
```typescript
onMounted(() => {
  console.log('📱 KCompaniesManagement montado')
  fetchCompanies() // Apenas isso
})
// Sem onUnmounted, sem listeners, sem polling
```

#### 4. Debug logging em useClientsFilters
```typescript
const filteredCompanies = computed(() => {
  console.log('🔍 useClientsFilters - computando filteredCompanies')
  const companies = getCompaniesArray()
  console.log('  companies array:', companies?.length || 0)
  // ... resto da lógica
  console.log('  ✅ Retornando', result.length, 'contatos filtrados')
  return result
})
```

#### 5. Watch em KClientsTable para debug
```typescript
watch(() => props.companies, (newCompanies) => {
  console.log('🔍 KClientsTable - companies prop mudou:', newCompanies?.length || 0)
  console.log('🔍 filteredCompanies:', filteredCompanies.value?.length || 0)
}, { deep: true })
```

**Arquivos Modificados:**
- `app/composables/useCompanies.ts` (removido polling, simplificado fetch, adicionado logging)
- `app/components/blocks/KCompaniesManagement.vue` (removido listeners, onUnmounted)
- `app/composables/useClientsFilters.ts` (adicionado debug logging)
- `app/components/clients/KClientsTable.vue` (adicionado watch com debug)
- `app/components/subscriptions/KSubscriptionsContent.vue` (adicionado indicadores)

**Status:** ✅ RESOLVIDO - Contatos aparecem e permanecem visíveis

**Lição Aprendida:** Simplicidade > Complexidade. Polling automático e listeners causam mais problemas do que resolvem. Melhor ter fetch simples e deixar o usuário recarregar quando necessário.



---

### Ocorrência #13: Produtos e Serviços Não Aparecem no Modal (RESOLVIDO)

**Sintoma:** Modal de detalhes do cliente não mostrava produtos e serviços nas abas correspondentes
**Causa Raiz:** Dois problemas combinados:
1. `useClientHistory.ts` estava buscando vendas de forma incorreta (consultando apenas o ID da venda, não todas as vendas do cliente)
2. Quando clicava em uma venda para abrir o modal, passava o ID da venda (não do cliente), então o modal não conseguia encontrar os dados corretos

**Solução Implementada:**

#### 1. Corrigido `useClientHistory.ts` para buscar vendas por customer name
```typescript
// ❌ ANTES - Buscava apenas a venda específica
const { data: allSales } = await supabase
  .from('companies')
  .select('*')
  .eq('id', companyId) // Isso retorna apenas 1 registro

// ✅ DEPOIS - Busca TODAS as vendas do cliente
const customerName = companyData?.representative_name || companyData?.name
const { data: allSales } = await supabase
  .from('companies')
  .select('*')
  .eq('representative_name', customerName) // Busca por nome do cliente
  .in('sale_type', ['produto', 'servico', 'personalizado']) // Filtra apenas vendas
  .order('created_at', { ascending: false })
```

#### 2. Corrigido `vendas.vue` para buscar cliente real antes de abrir modal
```typescript
// ❌ ANTES - Passava o ID da venda
clientDetailsModal.company = {
  id: sale.id, // ID da venda, não do cliente!
  ...
}

// ✅ DEPOIS - Busca o cliente real pelo representative_name
const { data: customer } = await supabase
  .from('companies')
  .select('*')
  .eq('representative_name', sale.representative_name)
  .is('sale_type', null) // Busca apenas registros de clientes
  .single()

if (customer) {
  clientDetailsModal.company = customer // Usa dados completos do cliente
}
```

#### 3. Corrigido `assinaturas.vue` para consistência
```typescript
// Agora busca o cliente completo pelo company_id
const { data: customer } = await supabase
  .from('companies')
  .select('*')
  .eq('id', payment.company_id)
  .single()
```

**Arquivos Modificados:**
- `app/composables/useClientHistory.ts` - Busca vendas por representative_name
- `app/pages/vendas.vue` - Busca cliente real antes de abrir modal
- `app/pages/assinaturas.vue` - Busca cliente completo para consistência

**Como Funciona Agora:**
```
Clica em venda na tabela
         ↓
handleOpenClientDetails(sale)
         ↓
Busca cliente real por representative_name
         ↓
Abre modal com ID do cliente (não da venda)
         ↓
fetchClientHistory(customerId)
         ↓
Busca assinaturas por customer_id
Busca vendas por representative_name
Busca histórico por company_id
         ↓
Modal exibe:
  - Abas: Resumo, Assinaturas, Produtos, Serviços, Pagamentos, Histórico
  - Produtos: Todas as vendas com sale_type='produto'
  - Serviços: Todas as vendas com sale_type='servico'
  - Métricas: Totais corretos de produtos, serviços e assinaturas
```

**Status:** ✅ RESOLVIDO - Produtos e serviços agora aparecem corretamente no modal
