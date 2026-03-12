<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Cliente *</label>
      <input 
        :value="modelValue.representative_name"
        @input="updateField('representative_name', ($event.target as HTMLInputElement).value)"
        type="text"
        required
        placeholder="Nome do cliente"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
      />
    </div>

    <div class="space-y-2">
      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Empresa (Opcional)</label>
      <input 
        :value="modelValue.name"
        @input="updateField('name', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Nome da empresa"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">E-mail (Opcional)</label>
        <input 
          :value="modelValue.email"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
          type="email"
          placeholder="email@exemplo.com"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">WhatsApp *</label>
        <input 
          :value="modelValue.whatsapp"
          @input="updateField('whatsapp', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          placeholder="(00) 00000-0000"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ClientFields {
  representative_name: string
  name: string
  email: string
  whatsapp: string
}

const props = defineProps<{
  modelValue: ClientFields
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ClientFields]
}>()

const updateField = (field: keyof ClientFields, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>
