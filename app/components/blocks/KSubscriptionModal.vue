<template>
  <UiKModal :is-open="isOpen" @close="close">
    <UiKModalHeader :title="getModalTitle()" />

    <form @submit.prevent="handleSave" class="space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
      <!-- Seleção de Cliente -->
      <SubscriptionsKSubscriptionCustomerSelector
        v-model="form.customer"
        :is-editing="!!editingSubscription"
        @create-customer="handleCreateCustomer"
      />
      
      <!-- WhatsApp do Cliente -->
      <div v-if="form.customer" class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">WhatsApp</label>
        <input 
          :value="form.customer.whatsapp || form.customer.phone || '-'"
          type="text"
          disabled
          class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none font-medium opacity-60 cursor-not-allowed"
        />
      </div>
      
      <!-- Seleção de Plano -->
      <SubscriptionsKSubscriptionPlanSelector
        v-model="form.plan"
      />
      
      <!-- Informações da Assinatura -->
      <div class="space-y-3">
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-kros-blue">Cobrança</h3>
        
        <div class="grid grid-cols-3 gap-3">
          <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
              Início *
            </label>
            <input 
              v-model="form.start_date"
              type="date"
              required
              class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-kros-blue transition-all font-medium"
            />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
              Vencimento *
            </label>
            <input 
              v-model.number="form.due_day"
              type="number"
              min="1"
              max="31"
              required
              placeholder="10"
              class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
              Status *
            </label>
            <select 
              v-model="form.status"
              class="w-full bg-[#111112] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
            >
              <option value="active">Ativa</option>
              <option value="suspended">Suspensa</option>
              <option value="cancelled">Cancelada</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Observações -->
      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">Notas</label>
        <textarea 
          v-model="form.notes"
          rows="3"
          placeholder="Anotações..."
          class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 resize-none"
        ></textarea>
      </div>

      <UiKModalActions
        cancel-text="Cancelar"
        :confirm-text="editingSubscription ? 'SALVAR ALTERAÇÕES' : 'CRIAR'"
        :loading-text="editingSubscription ? 'SALVANDO...' : 'CRIANDO...'"
        :loading="loading"
        submit-type="submit"
        @cancel="close"
      />
    </form>
    
    <!-- Modal de Criar Cliente (nested) -->
    <BlocksKCompanyModal
      :is-open="showCustomerModal"
      :loading="customerLoading"
      :prefilled-name="customerPrefilledName"
      @close="showCustomerModal = false; customerPrefilledName = ''"
      @save="handleSaveCustomer"
    />
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import { useSubscriptionsManager } from '~/composables/useSubscriptionsManager'
import { useCustomers } from '~/composables/useCustomers'

const props = defineProps<{
  isOpen: boolean
  editingSubscription?: any
}>()

const emit = defineEmits(['close', 'created'])

const { success, error } = useToast()
const { createSubscription, updateSubscription } = useSubscriptionsManager()
const { createCustomer } = useCustomers()

const loading = ref(false)
const showCustomerModal = ref(false)
const customerLoading = ref(false)
const customerPrefilledName = ref('')

const getDefaultDate = () => new Date().toISOString().split('T')[0]

const getDefaultDueDay = () => {
  const today = new Date()
  const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias a partir de hoje
  return dueDate.getDate()
}

const form = reactive({
  customer: null as any,
  plan: null as any,
  start_date: getDefaultDate(),
  due_day: getDefaultDueDay() as number,
  status: 'active' as string,
  notes: '' as string
})

const resetForm = () => {
  form.customer = null
  form.plan = null
  form.start_date = getDefaultDate()
  form.due_day = getDefaultDueDay()
  form.status = 'active'
  form.notes = ''
}

const handleCreateCustomer = (prefilledName?: string) => {
  showCustomerModal.value = true
  customerPrefilledName.value = prefilledName || ''
}

const handleSaveCustomer = async (customerData: any) => {
  customerLoading.value = true
  
  // Mapear os dados do modal para o formato esperado pelo composable
  const mappedData = {
    name: customerData.name || customerData.representative_name,
    representative_name: customerData.representative_name,
    email: customerData.email,
    whatsapp: customerData.whatsapp,
    phone: customerData.phone,
    document: customerData.document,
    birthday: customerData.birthday,
    segment: customerData.segment,
    sales_rep: customerData.sales_rep,
    website: customerData.website,
    address_zipcode: customerData.address_zipcode,
    address_street: customerData.address_street,
    address_number: customerData.address_number,
    address_complement: customerData.address_complement,
    address_neighborhood: customerData.address_neighborhood,
    address_city: customerData.address_city,
    address_state: customerData.address_state,
    tags: customerData.tags
  }
  
  const result = await createCustomer(mappedData)
  customerLoading.value = false
  
  if (result.success) {
    // Atualizar o cliente no formulário com os dados retornados
    form.customer = {
      id: result.data.id,
      name: result.data.representative_name || result.data.name,
      whatsapp: result.data.whatsapp,
      phone: result.data.phone,
      email: result.data.email
    }
    showCustomerModal.value = false
    customerPrefilledName.value = ''
    success('Cliente criado', 'Cliente cadastrado com sucesso')
  } else {
    error('Erro ao criar cliente', result.error)
  }
}

const handleSave = async () => {
  if (!form.customer) {
    error('Cliente obrigatório', 'Selecione um cliente para continuar')
    return
  }
  
  if (!form.plan) {
    error('Plano obrigatório', 'Selecione um plano para continuar')
    return
  }
  
  loading.value = true
  
  let result
  
  if (props.editingSubscription) {
    // Editar assinatura existente
    result = await updateSubscription(props.editingSubscription.id, {
      customer_id: form.customer.id,
      plan_id: form.plan.id,
      status: form.status as any,
      start_date: form.start_date,
      due_day: form.due_day,
      amount: form.plan.price,
      notes: form.notes || undefined
    })
  } else {
    // Criar nova assinatura
    result = await createSubscription({
      customer_id: form.customer.id,
      plan_id: form.plan.id,
      status: form.status as any,
      start_date: form.start_date,
      due_day: form.due_day,
      amount: form.plan.price,
      notes: form.notes || undefined,
      auto_billing_enabled: false
    })
  }
  
  loading.value = false
  
  if (result.success) {
    success(
      props.editingSubscription ? 'Assinatura atualizada' : 'Assinatura criada', 
      props.editingSubscription ? 'Assinatura atualizada com sucesso' : 'Assinatura cadastrada com sucesso'
    )
    emit('created')
    close()
  } else {
    error(
      props.editingSubscription ? 'Erro ao atualizar assinatura' : 'Erro ao criar assinatura', 
      result.error
    )
  }
}

const close = () => {
  resetForm()
  emit('close')
}

const getModalTitle = () => {
  if (!props.editingSubscription) {
    return 'NOVA ASSINATURA'
  }
  
  // Format creation date as DD/MM/YYYY
  const createdAt = props.editingSubscription.created_at
  if (createdAt) {
    const date = new Date(createdAt)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `EDITAR ASSINATURA - ${day}/${month}/${year}`
  }
  
  return 'EDITAR ASSINATURA'
}

watch(() => props.isOpen, (val) => {
  if (!val) {
    resetForm()
  } else if (props.editingSubscription) {
    // Preencher formulário com dados da assinatura sendo editada
    form.customer = {
      id: props.editingSubscription.customer_id,
      name: props.editingSubscription.customer_name
    }
    form.plan = {
      id: props.editingSubscription.plan_id,
      name: props.editingSubscription.plan_name,
      price: props.editingSubscription.amount
    }
    form.start_date = props.editingSubscription.start_date
    form.due_day = props.editingSubscription.due_day
    form.status = props.editingSubscription.status === 'Pendente' ? 'active' : props.editingSubscription.status
    form.notes = props.editingSubscription.notes || ''
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.3);
}
</style>
