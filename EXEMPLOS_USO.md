# 📚 Exemplos de Uso - Sistema de Assinaturas

Este documento contém exemplos práticos de como usar os novos composables e funcionalidades.

---

## 🧑‍💼 Gerenciamento de Clientes

### Listar todos os clientes

```vue
<script setup>
import { useCustomers } from '~/composables/useCustomers'

const { customers, loading, fetchCustomers } = useCustomers()

onMounted(async () => {
  await fetchCustomers()
})
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else>
    <div v-for="customer in customers" :key="customer.id">
      {{ customer.name }} - {{ customer.email }}
    </div>
  </div>
</template>
```

### Criar novo cliente

```typescript
import { useCustomers } from '~/composables/useCustomers'
import { useToast } from '~/composables/useToast'

const { createCustomer } = useCustomers()
const { success, error } = useToast()

const handleCreateCustomer = async () => {
  const result = await createCustomer({
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '11987654321',
    document: '123.456.789-00',
    birthday: '1990-05-15',
    segment: 'Tecnologia',
    sales_rep: 'João Vendedor',
    address_zipcode: '01234-567',
    address_street: 'Rua das Flores',
    address_number: '123',
    address_city: 'São Paulo',
    address_state: 'SP',
    tags: ['vip', 'tecnologia']
  })

  if (result.success) {
    success('Cliente criado', 'Cliente cadastrado com sucesso')
    console.log('Cliente criado:', result.data)
  } else {
    error('Erro', result.error)
  }
}
```

### Buscar clientes

```typescript
import { useCustomers } from '~/composables/useCustomers'

const { searchCustomers } = useCustomers()

const handleSearch = async (query: string) => {
  const result = await searchCustomers(query)
  
  if (result.success) {
    console.log('Clientes encontrados:', result.data)
    // result.data contém até 20 clientes que correspondem à busca
  }
}

// Buscar por nome, email ou documento
await handleSearch('maria')
await handleSearch('maria@example.com')
await handleSearch('123.456')
```

### Atualizar cliente

```typescript
import { useCustomers } from '~/composables/useCustomers'

const { updateCustomer } = useCustomers()

const handleUpdateCustomer = async (customerId: string) => {
  const result = await updateCustomer(customerId, {
    phone: '11999999999',
    segment: 'E-commerce',
    tags: ['vip', 'e-commerce', 'premium']
  })

  if (result.success) {
    console.log('Cliente atualizado:', result.data)
  }
}
```

### Atualizar tags do cliente

```typescript
import { useCustomers } from '~/composables/useCustomers'

const { updateCustomerTags } = useCustomers()

const handleUpdateTags = async (customerId: string) => {
  const result = await updateCustomerTags(customerId, ['vip', 'premium', 'ativo'])
  
  if (result.success) {
    console.log('Tags atualizadas')
  }
}
```

---

## 📋 Gerenciamento de Assinaturas

### Listar todas as assinaturas

```vue
<script setup>
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { subscriptions, loading, fetchSubscriptions } = useSubscriptionsManager()

onMounted(async () => {
  await fetchSubscriptions()
})
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else>
    <div v-for="sub in subscriptions" :key="sub.id">
      <h3>{{ sub.customer_name }}</h3>
      <p>Plano: {{ sub.plan_name }}</p>
      <p>Status: {{ sub.status }}</p>
      <p>Valor: R$ {{ sub.amount }}</p>
      <p>Vencimento: dia {{ sub.due_day }}</p>
    </div>
  </div>
</template>
```

### Criar nova assinatura

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'
import { useToast } from '~/composables/useToast'

const { createSubscription } = useSubscriptionsManager()
const { success, error } = useToast()

const handleCreateSubscription = async () => {
  const result = await createSubscription({
    customer_id: 'uuid-do-cliente',
    plan_id: 'uuid-do-plano',
    status: 'active',
    start_date: '2024-01-01',
    due_day: 10,
    amount: 99.90,
    discount_percent: 10, // 10% de desconto
    notes: 'Cliente VIP - desconto especial',
    auto_billing_enabled: false
  })

  if (result.success) {
    success('Assinatura criada', 'Assinatura cadastrada com sucesso')
    console.log('Assinatura criada:', result.data)
  } else {
    error('Erro', result.error)
  }
}
```

### Buscar assinaturas de um cliente

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { fetchCustomerSubscriptions } = useSubscriptionsManager()

const handleFetchCustomerSubs = async (customerId: string) => {
  const result = await fetchCustomerSubscriptions(customerId)
  
  if (result.success) {
    console.log('Assinaturas do cliente:', result.data)
    // result.data contém todas as assinaturas do cliente
  }
}
```

### Atualizar assinatura

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { updateSubscription } = useSubscriptionsManager()

const handleUpdateSubscription = async (subscriptionId: string) => {
  const result = await updateSubscription(subscriptionId, {
    amount: 149.90,
    due_day: 15,
    notes: 'Valor atualizado conforme negociação'
  })

  if (result.success) {
    console.log('Assinatura atualizada:', result.data)
  }
}
```

### Cancelar assinatura

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { cancelSubscription } = useSubscriptionsManager()

const handleCancelSubscription = async (subscriptionId: string) => {
  const result = await cancelSubscription(
    subscriptionId, 
    'Cliente solicitou cancelamento'
  )

  if (result.success) {
    console.log('Assinatura cancelada')
    // Status mudado para 'cancelled'
    // end_date definido como hoje
  }
}
```

### Suspender assinatura

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { suspendSubscription } = useSubscriptionsManager()

const handleSuspendSubscription = async (subscriptionId: string) => {
  const result = await suspendSubscription(
    subscriptionId,
    'Inadimplência - 3 meses sem pagamento'
  )

  if (result.success) {
    console.log('Assinatura suspensa')
    // Status mudado para 'suspended'
  }
}
```

### Reativar assinatura

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { reactivateSubscription } = useSubscriptionsManager()

const handleReactivateSubscription = async (subscriptionId: string) => {
  const result = await reactivateSubscription(subscriptionId)

  if (result.success) {
    console.log('Assinatura reativada')
    // Status mudado para 'active'
    // end_date removido
  }
}
```

### Ativar cobrança automática

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { toggleAutoBilling } = useSubscriptionsManager()

const handleEnableAutoBilling = async (subscriptionId: string) => {
  const customMessage = `
Olá! Este é um lembrete automático de pagamento.
Seu plano vence no dia {due_day}.
Valor: R$ {amount}
  `.trim()

  const result = await toggleAutoBilling(subscriptionId, true, customMessage)

  if (result.success) {
    console.log('Cobrança automática ativada')
  }
}
```

### Desativar cobrança automática

```typescript
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'

const { toggleAutoBilling } = useSubscriptionsManager()

const handleDisableAutoBilling = async (subscriptionId: string) => {
  const result = await toggleAutoBilling(subscriptionId, false)

  if (result.success) {
    console.log('Cobrança automática desativada')
  }
}
```

---

## 📦 Gerenciamento de Planos

### Listar planos

```vue
<script setup>
import { usePlans } from '~/composables/usePlans'

const { plans, loading, fetchPlans } = usePlans()

onMounted(async () => {
  await fetchPlans()
})
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else>
    <div v-for="plan in plans" :key="plan.id">
      {{ plan.name }} - R$ {{ plan.price }} / {{ plan.billing_cycle }}
    </div>
  </div>
</template>
```

### Criar plano

```typescript
import { usePlans } from '~/composables/usePlans'

const { createPlan } = usePlans()

const handleCreatePlan = async () => {
  try {
    const plan = await createPlan({
      name: 'Plano Premium',
      type: 'Plano Recorrente',
      category: 'Premium',
      description: 'Plano com todos os recursos',
      price: 199.90,
      billing_cycle: 'Mensal'
    })
    
    console.log('Plano criado:', plan)
  } catch (err) {
    console.error('Erro ao criar plano:', err)
  }
}
```

---

## 🔄 Fluxo Completo: Criar Cliente e Assinatura

```typescript
import { useCustomers } from '~/composables/useCustomers'
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'
import { usePlans } from '~/composables/usePlans'
import { useToast } from '~/composables/useToast'

const { createCustomer } = useCustomers()
const { createSubscription } = useSubscriptionsManager()
const { plans, fetchPlans } = usePlans()
const { success, error } = useToast()

const handleCompleteFlow = async () => {
  // 1. Criar cliente
  const customerResult = await createCustomer({
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    phone: '11988887777',
    document: '987.654.321-00'
  })

  if (!customerResult.success) {
    error('Erro ao criar cliente', customerResult.error)
    return
  }

  const customer = customerResult.data
  console.log('Cliente criado:', customer)

  // 2. Buscar planos disponíveis
  await fetchPlans()
  const selectedPlan = plans.value.find(p => p.name === 'Plano Premium')

  if (!selectedPlan) {
    error('Plano não encontrado', 'Plano Premium não está disponível')
    return
  }

  // 3. Criar assinatura
  const subscriptionResult = await createSubscription({
    customer_id: customer.id!,
    plan_id: selectedPlan.id!,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    due_day: 10,
    amount: selectedPlan.price,
    notes: 'Primeira assinatura do cliente'
  })

  if (!subscriptionResult.success) {
    error('Erro ao criar assinatura', subscriptionResult.error)
    return
  }

  success('Sucesso!', 'Cliente e assinatura criados com sucesso')
  console.log('Assinatura criada:', subscriptionResult.data)
}
```

---

## 🎨 Componente Completo de Exemplo

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Gerenciar Assinaturas</h1>

    <!-- Filtros -->
    <div class="mb-4 flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar cliente..."
        class="px-4 py-2 border rounded"
      />
      <select v-model="statusFilter" class="px-4 py-2 border rounded">
        <option value="">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="pending">Pendente</option>
        <option value="suspended">Suspenso</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>

    <!-- Lista de assinaturas -->
    <div v-if="loading" class="text-center py-8">
      Carregando assinaturas...
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="sub in filteredSubscriptions"
        :key="sub.id"
        class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg">{{ sub.customer_name }}</h3>
            <p class="text-sm text-gray-600">{{ sub.customer_email }}</p>
            <p class="text-sm mt-2">
              <span class="font-semibold">Plano:</span> {{ sub.plan_name }}
            </p>
            <p class="text-sm">
              <span class="font-semibold">Valor:</span> R$ {{ sub.amount }}
            </p>
            <p class="text-sm">
              <span class="font-semibold">Vencimento:</span> dia {{ sub.due_day }}
            </p>
            <span
              :class="getStatusClass(sub.status)"
              class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ getStatusLabel(sub.status) }}
            </span>
          </div>

          <div class="flex gap-2">
            <button
              v-if="sub.status === 'active'"
              @click="handleSuspend(sub.id!)"
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Suspender
            </button>
            <button
              v-if="sub.status === 'suspended'"
              @click="handleReactivate(sub.id!)"
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Reativar
            </button>
            <button
              v-if="sub.status !== 'cancelled'"
              @click="handleCancel(sub.id!)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'
import { useToast } from '~/composables/useToast'

const {
  subscriptions,
  loading,
  fetchSubscriptions,
  suspendSubscription,
  reactivateSubscription,
  cancelSubscription
} = useSubscriptionsManager()

const { success, error } = useToast()

const searchQuery = ref('')
const statusFilter = ref('')

const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      sub =>
        sub.customer_name?.toLowerCase().includes(query) ||
        sub.customer_email?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(sub => sub.status === statusFilter.value)
  }

  return filtered
})

const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    trial: 'bg-blue-100 text-blue-800',
    suspended: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: 'Ativo',
    pending: 'Pendente',
    trial: 'Teste',
    suspended: 'Suspenso',
    cancelled: 'Cancelado'
  }
  return labels[status as keyof typeof labels] || status
}

const handleSuspend = async (id: string) => {
  if (!confirm('Deseja suspender esta assinatura?')) return

  const result = await suspendSubscription(id, 'Suspensão manual')
  if (result.success) {
    success('Assinatura suspensa', 'A assinatura foi suspensa com sucesso')
    await fetchSubscriptions()
  } else {
    error('Erro', result.error)
  }
}

const handleReactivate = async (id: string) => {
  const result = await reactivateSubscription(id)
  if (result.success) {
    success('Assinatura reativada', 'A assinatura foi reativada com sucesso')
    await fetchSubscriptions()
  } else {
    error('Erro', result.error)
  }
}

const handleCancel = async (id: string) => {
  if (!confirm('Deseja cancelar esta assinatura? Esta ação não pode ser desfeita.')) return

  const result = await cancelSubscription(id, 'Cancelamento manual')
  if (result.success) {
    success('Assinatura cancelada', 'A assinatura foi cancelada com sucesso')
    await fetchSubscriptions()
  } else {
    error('Erro', result.error)
  }
}

onMounted(async () => {
  await fetchSubscriptions()
})
</script>
```

---

## 🔍 Queries SQL Úteis

### Ver todas as assinaturas com detalhes

```sql
SELECT 
  s.id,
  s.status,
  s.start_date,
  s.due_day,
  s.amount,
  c.name as customer_name,
  c.email as customer_email,
  p.name as plan_name,
  p.billing_cycle
FROM subscriptions s
JOIN companies c ON c.id = s.customer_id
JOIN plans p ON p.id = s.plan_id
ORDER BY s.created_at DESC;
```

### Ver assinaturas ativas

```sql
SELECT 
  c.name as customer,
  p.name as plan,
  s.amount,
  s.due_day
FROM subscriptions s
JOIN companies c ON c.id = s.customer_id
JOIN plans p ON p.id = s.plan_id
WHERE s.status = 'active'
ORDER BY c.name;
```

### Ver receita mensal recorrente (MRR)

```sql
SELECT 
  SUM(amount) as mrr,
  COUNT(*) as total_subscriptions
FROM subscriptions
WHERE status = 'active';
```

### Ver assinaturas por plano

```sql
SELECT 
  p.name as plan_name,
  COUNT(*) as total_subscriptions,
  SUM(s.amount) as total_revenue
FROM subscriptions s
JOIN plans p ON p.id = s.plan_id
WHERE s.status = 'active'
GROUP BY p.name
ORDER BY total_revenue DESC;
```

---

Estes exemplos cobrem os casos de uso mais comuns. Para mais detalhes, consulte a documentação completa em `REFORMA_ASSINATURAS_COMPLETO.md`.
