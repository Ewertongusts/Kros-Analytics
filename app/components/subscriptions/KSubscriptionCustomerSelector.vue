<template>
  <div class="space-y-2" ref="containerRef">
    <div class="flex items-center justify-between">
      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">
        Cliente *
      </label>
      <span class="text-[9px] text-white/40">Digite 2+ caracteres ou "/" para ver todos</span>
    </div>
    
    <div class="relative">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Buscar cliente por nome..."
        @focus="showDropdown = true"
        @input="handleSearch"
        @keydown.enter="handleEnter"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
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
          <div class="text-xs font-bold text-white">{{ customer.name }}</div>
          <div v-if="customer.whatsapp" class="text-[10px] text-emerald-400 mt-0.5">{{ customer.whatsapp }}</div>
          <div v-else-if="customer.phone" class="text-[10px] text-emerald-400 mt-0.5">{{ customer.phone }}</div>
          <div v-else-if="customer.email" class="text-[10px] text-white/40 mt-0.5">{{ customer.email }}</div>
        </button>
      </div>
    </div>
    
    <!-- Cliente selecionado -->
    <div 
      v-if="selectedCustomer"
      class="mt-3 p-4 bg-kros-blue/5 border border-kros-blue/20 rounded-xl"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCustomers } from '~/composables/useCustomers'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue', 'create-customer'])

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
  searchQuery.value = customer.name
  showDropdown.value = false
  emit('update:modelValue', customer)
}

const clearSelection = () => {
  selectedCustomer.value = null
  searchQuery.value = ''
  emit('update:modelValue', null)
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (val) => {
  if (val && val.id) {
    selectedCustomer.value = val
    searchQuery.value = val.name
    showDropdown.value = false
  } else {
    selectedCustomer.value = null
    searchQuery.value = ''
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
