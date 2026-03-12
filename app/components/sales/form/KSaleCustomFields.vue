<template>
  <div v-if="showFields" class="space-y-3">
    <SalesUiKSaleInput
      v-model="customNameLocal"
      type="text"
      :label="saleType === 'personalizado' ? 'Nome do Item' : 'Nome Personalizado (Opcional)'"
      :required="saleType === 'personalizado'"
      :placeholder="saleType === 'personalizado' ? 'Ex: Consultoria Especial' : 'Deixe vazio para usar o nome do catálogo'"
    />

    <SalesUiKSaleSelect
      v-model="customCategoryLocal"
      label="Categoria (Opcional)"
    >
      <option value="">Selecione...</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.name">
        {{ cat.icon }} {{ cat.name }}
      </option>
    </SalesUiKSaleSelect>

    <div class="space-y-2">
      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Descrição (Opcional)</label>
      <textarea 
        :value="customDescription"
        @input="$emit('update:customDescription', ($event.target as HTMLTextAreaElement).value)"
        rows="2"
        placeholder="Detalhes sobre o item..."
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  saleType: string
  customizeSale: boolean
  planName: string
  customName: string
  customCategory: string
  customDescription: string
  categories: any[]
}>()

const emit = defineEmits<{
  'update:customName': [value: string]
  'update:customCategory': [value: string]
  'update:customDescription': [value: string]
}>()

const showFields = computed(() => {
  return props.saleType === 'personalizado' || 
         props.customizeSale || 
         props.planName === '__PERSONALIZADO__'
})

const customNameLocal = computed({
  get: () => props.customName,
  set: (value) => emit('update:customName', value)
})

const customCategoryLocal = computed({
  get: () => props.customCategory,
  set: (value) => emit('update:customCategory', value)
})
</script>
