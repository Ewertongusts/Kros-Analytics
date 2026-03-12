<template>
  <div class="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
    <h4 class="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">⚡ Atalhos</h4>
    
    <div class="space-y-2">
      <button 
        type="button"
        @click="$emit('desconto10')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        🎁 Desconto 10%
      </button>

      <button 
        type="button"
        @click="$emit('desconto20')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        🔥 Desconto 20%
      </button>

      <button 
        type="button"
        @click="$emit('paymentAVista')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        💳 Pagamento à Vista
      </button>
      
      <button 
        type="button"
        @click="$emit('payment3xSemJuros')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        📊 3x sem Juros
      </button>

      <button 
        type="button"
        @click="$emit('payment6xComJuros')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        💰 6x com Juros (2%)
      </button>

      <button 
        type="button"
        @click="$emit('payment12xComJuros')"
        class="w-full p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all"
      >
        📈 12x com Juros (3%)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'paymentAVista': []
  'payment3xSemJuros': []
  'payment6xComJuros': []
  'payment12xComJuros': []
  'desconto10': []
  'desconto20': []
}>()
</script>
