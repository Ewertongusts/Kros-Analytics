<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative bg-[#111112] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#111112]">
            <h2 class="text-xl font-bold text-white uppercase tracking-tight">Detalhes do Cliente</h2>
            <button 
              @click="$emit('close')"
              class="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 hover:text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Status -->
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Status</p>
                <div class="flex items-center gap-2.5">
                  <span :class="['w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]', company.is_active ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20']"></span>
                  <span :class="['text-sm font-bold uppercase tracking-widest', company.is_active ? 'text-emerald-500' : 'text-red-500']">
                    {{ company.is_active ? 'Ativa' : 'Inativa' }}
                  </span>
                </div>
              </div>
              <button 
                @click="$emit('toggle-status')"
                class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {{ company.is_active ? 'Desativar' : 'Ativar' }}
              </button>
            </div>

            <!-- Informações Básicas -->
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Cliente</p>
                <p class="text-sm font-semibold text-white">{{ company.representative_name || company.name }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Empresa</p>
                <p class="text-sm font-semibold text-white">{{ company.name }}</p>
              </div>
            </div>

            <!-- Contato -->
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Email</p>
                <p class="text-sm text-white/70 break-all">{{ company.email || '-' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Telefone</p>
                <p class="text-sm text-white/70">{{ company.phone || '-' }}</p>
              </div>
            </div>

            <!-- WhatsApp -->
            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">WhatsApp</p>
              <p class="text-sm text-white/70">{{ company.whatsapp || '-' }}</p>
            </div>

            <!-- Endereço -->
            <div v-if="company.address || company.city || company.state || company.zip_code" class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Endereço</p>
                <p class="text-sm text-white/70">{{ company.address || '-' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Cidade/Estado</p>
                <p class="text-sm text-white/70">{{ company.city || '-' }} {{ company.state || '-' }}</p>
              </div>
            </div>

            <!-- Datas -->
            <div class="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Data de Cadastro</p>
                <p class="text-sm text-white/70">{{ formatDate(company.created_at) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Última Atualização</p>
                <p class="text-sm text-white/70">{{ formatDate(company.updated_at) }}</p>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="company.notes">
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Notas</p>
              <p class="text-sm text-white/70 bg-white/5 p-3 rounded-lg">{{ company.notes }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#111112]">
            <button 
              @click="$emit('close')"
              class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Fechar
            </button>
            <button 
              @click="$emit('edit')"
              class="px-4 py-2.5 bg-kros-blue hover:bg-kros-blue/80 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  company: any
}>()

defineEmits<{
  close: []
  edit: []
  'toggle-status': []
}>()

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
