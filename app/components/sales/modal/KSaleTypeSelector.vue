<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
      
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[700px] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div class="mb-6 text-center">
          <h3 class="text-xl font-bold uppercase tracking-tight text-white">
            NOVA <span class="text-kros-blue">VENDA</span>
          </h3>
          <p class="text-[10px] text-white/40 uppercase tracking-widest mt-2">Selecione o tipo de venda</p>
          <div class="h-1 w-8 bg-kros-blue mx-auto mt-3 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            @click="$emit('select', 'produto')"
            class="p-6 rounded-2xl border-2 border-white/10 bg-white/[0.02] hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
          >
            <div class="text-4xl mb-3">📦</div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-2">Produto</h4>
            <p class="text-[10px] text-white/40">Venda de produto do catálogo ou personalizado</p>
          </button>

          <button 
            @click="$emit('select', 'servico')"
            class="p-6 rounded-2xl border-2 border-white/10 bg-white/[0.02] hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
          >
            <div class="text-4xl mb-3">🛠️</div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-2">Serviço</h4>
            <p class="text-[10px] text-white/40">Venda de serviço do catálogo ou personalizado</p>
          </button>
        </div>

        <button 
          @click="$emit('close')"
          class="w-full mt-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
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
