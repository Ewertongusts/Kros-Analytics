<template>
  <UiKModal :is-open="isOpen" size="md" @close="$emit('close')">
    <UiKModalHeader title="REGISTRAR GASTO" />

    <form @submit.prevent="handleSave" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Descrição</label>
          <input 
            v-model="form.description"
            type="text"
            required
            placeholder="Ex: Servidor AWS, ChatGPT API"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Valor (R$)</label>
            <input 
                v-model.number="form.amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
            </div>

            <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Data</label>
            <input 
                v-model="form.date"
                type="date"
                required
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 color-scheme-dark"
                style="color-scheme: dark;"
            />
            </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Categoria</label>
          <select 
            v-model="form.category"
            required
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
          >
            <option value="Infraestrutura">Infraestrutura</option>
            <option value="Software">Softwares e APIs</option>
            <option value="Operacional">Custo Operacional</option>
            <option value="Marketing">Marketing</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div class="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl cursor-pointer" @click="form.is_recurring = !form.is_recurring">
          <div class="w-5 h-5 rounded border flex items-center justify-center transition-all bg-[#0D0D0E]" :class="form.is_recurring ? 'border-kros-blue' : 'border-white/20'">
            <svg v-if="form.is_recurring" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <div>
             <p class="text-xs font-bold text-white uppercase tracking-tight">Despesa Mensal Fixa</p>
             <p class="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Lançar automaticamente todo mês</p>
          </div>
        </div>

      <UiKModalActions
        cancel-text="Cancelar"
        confirm-text="REGISTRAR CUSTO"
        :loading="submitting"
        submit-type="submit"
        confirm-class="bg-red-500 hover:bg-red-600"
        @cancel="$emit('close')"
      />
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  submitting?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const form = reactive({
  description: '',
  amount: null as number | null,
  date: new Date().toISOString().split('T')[0],
  category: 'Infraestrutura',
  is_recurring: false
})

watch(() => props.isOpen, (val) => {
  if (val) {
    form.description = ''
    form.amount = null
    form.date = new Date().toISOString().split('T')[0]
    form.category = 'Infraestrutura'
    form.is_recurring = false
  }
})

const handleSave = () => {
  emit('save', { 
    ...form, 
    type: 'expense'
  })
}
</script>

<style scoped>
</style>
