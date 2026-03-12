<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <input 
        type="checkbox" 
        id="has-discount"
        :checked="hasDiscount"
        @change="$emit('update:hasDiscount', ($event.target as HTMLInputElement).checked)"
        class="w-4 h-4 rounded border-white/20 bg-white/5 text-kros-blue focus:ring-kros-blue focus:ring-offset-0"
      />
      <label for="has-discount" class="text-xs text-white/80 cursor-pointer">
        🏷️ Aplicar desconto
      </label>
    </div>

    <div v-if="hasDiscount" class="space-y-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 pl-1">Tipo de Desconto</label>
          <select 
            :value="discountType"
            @change="$emit('update:discountType', ($event.target as HTMLSelectElement).value)"
            class="w-full bg-[#111112] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
          >
            <option value="percentage">📊 Percentual (ex: 10% de desconto)</option>
            <option value="fixed">💰 Valor fixo em reais (ex: R$ 50 de desconto)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 pl-1">
            {{ discountType === 'percentage' ? 'Percentual (%)' : 'Valor (R$)' }}
          </label>
          <input 
            :value="discountValue"
            @input="$emit('update:discountValue', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.01"
            min="0"
            :max="discountType === 'percentage' ? 100 : originalValue"
            :placeholder="discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50.00'"
            class="w-full bg-white/[0.03] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all font-medium placeholder:text-white/20"
          />
        </div>
      </div>

      <div class="p-2 bg-emerald-500/10 rounded-lg">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-emerald-400">Valor original:</span>
          <span class="font-bold text-white line-through">{{ formatCurrency(originalValue) }}</span>
        </div>
        <div class="flex justify-between items-center text-[10px] mt-1">
          <span class="text-emerald-400">Desconto aplicado:</span>
          <span class="font-bold text-emerald-300">
            - {{ discountType === 'percentage' 
              ? `${discountValue}% (${formatCurrency(discountAmount)})` 
              : formatCurrency(discountValue) 
            }}
          </span>
        </div>
        <div class="flex justify-between items-center text-xs mt-2 pt-2 border-t border-emerald-500/20">
          <span class="text-emerald-400 font-bold">Valor final:</span>
          <span class="font-bold text-white">{{ formatCurrency(finalValue) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasDiscount: boolean
  discountType: string
  discountValue: number
  originalValue: number
}>()

defineEmits<{
  'update:hasDiscount': [value: boolean]
  'update:discountType': [value: string]
  'update:discountValue': [value: number]
}>()

const discountAmount = computed(() => {
  if (!props.hasDiscount) return 0
  
  if (props.discountType === 'percentage') {
    return props.originalValue * (props.discountValue / 100)
  } else {
    return props.discountValue
  }
})

const finalValue = computed(() => {
  return props.originalValue - discountAmount.value
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
