<template>
  <div v-if="saleType !== 'personalizado'" class="space-y-2">
    <SalesUiKSaleSelect
      v-model="planNameLocal"
      :label="`Selecione o ${saleType === 'produto' ? 'Produto' : 'Serviço'}`"
      required
    >
      <option value="">Selecione...</option>
      <option value="__PERSONALIZADO__">✨ Venda Personalizada (valor livre)</option>
      <option disabled>──────────────────────</option>
      <option v-for="item in catalogItems" :key="item.id" :value="item.name">
        {{ item.name }} - {{ formatCurrency(item.price) }}
      </option>
    </SalesUiKSaleSelect>

    <!-- Checkbox para personalizar venda -->
    <div v-if="planNameLocal && planNameLocal !== '__PERSONALIZADO__'" class="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/10 rounded-xl mt-2">
      <input 
        type="checkbox" 
        id="customize-sale"
        :checked="customizeSale"
        @change="$emit('update:customizeSale', ($event.target as HTMLInputElement).checked)"
        class="w-4 h-4 rounded border-white/20 bg-white/5 text-kros-blue focus:ring-kros-blue focus:ring-offset-0"
      />
      <label for="customize-sale" class="text-xs text-white/80 cursor-pointer">
        Personalizar esta venda (valor, nome ou descrição diferentes)
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'

const props = defineProps<{
  saleType: string
  planName: string
  customizeSale: boolean
  catalogItems: any[]
}>()

const emit = defineEmits<{
  'update:planName': [value: string]
  'update:customizeSale': [value: boolean]
  'planSelected': [item: any]
}>()

const planNameLocal = computed({
  get: () => props.planName,
  set: (value) => {
    emit('update:planName', value)
    // Emitir o evento após atualizar o valor
    nextTick(() => {
      if (value === '__PERSONALIZADO__') {
        emit('planSelected', null)
      } else {
        const selected = props.catalogItems.find(item => item.name === value)
        if (selected) {
          emit('planSelected', selected)
        }
      }
    })
  }
})

const onPlanSelect = () => {
  // Função removida, lógica movida para o setter acima
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
