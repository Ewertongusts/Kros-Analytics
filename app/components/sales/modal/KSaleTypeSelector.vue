<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
      
      <div class="relative bg-gradient-to-br from-[#0D0D0E] to-[#1a1a1e] border border-white/10 rounded-3xl w-full max-w-[500px] aspect-square p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col justify-between">
        <div class="text-center">
          <h3 class="text-2xl font-bold uppercase tracking-tight text-white">
            NOVA <span class="text-kros-blue">VENDA</span>
          </h3>
          <p class="text-[10px] text-white/40 uppercase tracking-widest mt-3">Selecione o tipo de venda</p>
          <div class="h-1 w-12 bg-gradient-to-r from-kros-blue to-transparent mx-auto mt-4 rounded-full"></div>
        </div>

        <div class="grid grid-cols-2 gap-4 flex-1 flex items-center">
          <button 
            @click="$emit('select', 'produto')"
            class="group relative p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-purple-500/5 to-purple-500/0 hover:border-purple-500/50 hover:from-purple-500/10 hover:to-purple-500/5 transition-all duration-300 flex flex-col items-center justify-center text-center hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/0 transition-all duration-300"></div>
            <div class="relative w-16 h-16 mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400 group-hover:text-purple-300 transition-colors">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h4 class="relative text-sm font-bold uppercase tracking-wider text-white mb-1 group-hover:text-purple-300 transition-colors">Produto</h4>
            <p class="relative text-[10px] text-white/50 group-hover:text-white/70 transition-colors">Venda de produto do catálogo ou personalizado</p>
          </button>

          <button 
            @click="$emit('select', 'servico')"
            class="group relative p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-blue-500/5 to-blue-500/0 hover:border-blue-500/50 hover:from-blue-500/10 hover:to-blue-500/5 transition-all duration-300 flex flex-col items-center justify-center text-center hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
            <div class="relative w-16 h-16 mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 group-hover:text-blue-300 transition-colors">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h4 class="relative text-sm font-bold uppercase tracking-wider text-white mb-1 group-hover:text-blue-300 transition-colors">Serviço</h4>
            <p class="relative text-[10px] text-white/50 group-hover:text-white/70 transition-colors">Venda de serviço do catálogo ou personalizado</p>
          </button>
        </div>

        <button 
          @click="$emit('close')"
          class="w-full py-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/60 hover:bg-white/5 rounded-xl transition-all duration-300 border border-white/5 hover:border-white/10"
        >
          Cancelar
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
  select: [type: string]
}>()
</script>
