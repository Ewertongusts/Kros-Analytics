<template>
  <div class="space-y-3" ref="containerRef">
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Cliente *</label>
        <span class="text-[9px] text-white/40">Digite 2+ caracteres ou "/" para ver todos</span>
      </div>
      
      <div class="relative">
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showDropdown = true"
          @keydown.enter="handleEnter"
          :disabled="isEditing"
          type="text"
          required
          placeholder="Buscar cliente por nome..."
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <!-- Dropdown de resultados -->
        <div 
          v-if="showDropdown && !selectedCustomer"
          class="absolute z-50 w-full mt-2 bg-[#111112] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          <div v-if="loading" class="p-4 text-center text-white/40 text-xs">
            Carregando clientes...
          </div>
          
          <div v-else-if="filteredCustomers.length === 0" class="space-y-2 p-2">
            <div class="p-4 text-center text-white/40 text-xs">
              Nenhum cliente encontrado para "{{ searchQuery }}"
            </div>
            
            <!-- Opção para criar novo cliente com o nome digitado -->
            <button
              type="button"
              @click="openCreateCustomerModal"
              class="w-full px-4 py-3 bg-kros-blue/10 hover:bg-kros-blue/20 border border-kros-blue/30 rounded-lg transition-colors text-left"
            >
              <div class="text-xs font-bold text-kros-blue flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Criar cliente: <span class="font-black">{{ searchQuery }}</span>
              </div>
            </button>
          </div>
          
          <button
            v-for="customer in filteredCustomers"
            :key="customer.id"
            type="button"
            @click="selectCustomer(customer)"
            class="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
          >
            <div class="text-xs font-bold text-white">{{ customer.representative_name || customer.name }}</div>
            <div v-if="customer.name && customer.representative_name" class="text-[10px] text-white/50 mt-0.5">{{ customer.name }}</div>
            <div v-if="customer.whatsapp" class="text-[10px] text-emerald-400 mt-0.5">{{ customer.whatsapp }}</div>
            <div v-else-if="customer.phone" class="text-[10px] text-emerald-400 mt-0.5">{{ customer.phone }}</div>
            <div v-else-if="customer.email" class="text-[10px] text-white/40 mt-0.5">{{ customer.email }}</div>
          </button>
        </div>
      </div>
      
      <!-- Cliente selecionado -->
      <div 
        v-if="selectedCustomer"
        class="p-3 bg-kros-blue/5 border border-kros-blue/20 rounded-xl"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="text-xs font-bold text-white">{{ selectedCustomer.name }}</div>
            <div v-if="selectedCustomer.whatsapp" class="text-[10px] text-kros-blue mt-1">{{ selectedCustomer.whatsapp }}</div>
            <div v-else-if="selectedCustomer.phone" class="text-[10px] text-kros-blue mt-1">{{ selectedCustomer.phone }}</div>
            <div v-else-if="selectedCustomer.email" class="text-[10px] text-white/40 mt-1">{{ selectedCustomer.email }}</div>
          </div>
          <button
            type="button"
            @click="clearSelection"
            class="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Empresa (Opcional)</label>
      <input 
        :value="modelValue.name"
        @input="updateField('name', ($event.target as HTMLInputElement).value)"
        :disabled="isEditing"
        type="text"
        placeholder="Nome da empresa"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">E-mail (Opcional)</label>
        <input 
          :value="modelValue.email"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
          :disabled="isEditing"
          type="email"
          placeholder="email@exemplo.com"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">WhatsApp *</label>
        <input 
          :value="modelValue.whatsapp"
          @input="updateField('whatsapp', ($event.target as HTMLInputElement).value)"
          :disabled="isEditing"
          type="tel"
          required
          autocomplete="tel"
          placeholder="(00) 00000-0000"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCustomers } from '~/composables/useCustomers'

interface ClientFields {
  representative_name: string
  name: string
  email: string
  whatsapp: string
}

const props = defineProps<{
  modelValue: ClientFields
  isEditing?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ClientFields]
  'create-customer': [name: string]
}>()

const { customers, loading, fetchCustomers } = useCustomers()
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedCustomer = ref<any>(null)
const containerRef = ref<HTMLElement | null>(null)

const filteredCustomers = computed(() => {
  // Atalho: "/" ou "*" mostra todos os contatos
  if (searchQuery.value === '/' || searchQuery.value === '*') {
    return customers.value.slice(0, 20)
  }
  
  // Remover espaços e caracteres especiais para validar
  const cleanQuery = searchQuery.value.replace(/[^a-zA-Z0-9]/g, '')
  
  // Só mostrar resultados se houver pelo menos 2 caracteres válidos
  if (!cleanQuery || cleanQuery.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(c => 
    c.representative_name?.toLowerCase().includes(query) ||
    c.name?.toLowerCase().includes(query) ||
    c.email?.toLowerCase().includes(query) ||
    c.whatsapp?.includes(query) ||
    c.phone?.includes(query) ||
    c.document?.includes(query)
  ).slice(0, 10)
})

const handleSearch = () => {
  showDropdown.value = true
}

const handleEnter = async () => {
  // Se há clientes filtrados, selecionar o primeiro
  if (filteredCustomers.value.length > 0) {
    selectCustomer(filteredCustomers.value[0])
    return
  }
  
  // Se não há clientes, abrir modal para criar com o nome digitado
  if (searchQuery.value && searchQuery.value.trim().length >= 2) {
    openCreateCustomerModal()
  }
}

const openCreateCustomerModal = () => {
  // Emitir evento passando o nome digitado
  emit('create-customer', searchQuery.value.trim())
}

const selectCustomer = (customer: any) => {
  selectedCustomer.value = customer
  searchQuery.value = customer.representative_name || customer.name
  showDropdown.value = false
  
  // Atualizar o modelo com os dados do cliente
  emit('update:modelValue', {
    representative_name: customer.representative_name || customer.name,
    name: customer.name || '',
    email: customer.email || '',
    whatsapp: customer.whatsapp || customer.phone || ''
  })
}

const clearSelection = () => {
  selectedCustomer.value = null
  searchQuery.value = ''
  emit('update:modelValue', {
    representative_name: '',
    name: '',
    email: '',
    whatsapp: ''
  })
}

const updateField = (field: keyof ClientFields, value: string) => {
  if (props.isEditing) return // Não permite edição se isEditing for true
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}

// Fechar dropdown ao clicar fora
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(async () => {
  await fetchCustomers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (val) => {
  if (val && val.representative_name && !selectedCustomer.value) {
    searchQuery.value = val.representative_name
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.2);
  border-radius: 10px;
}
</style>
