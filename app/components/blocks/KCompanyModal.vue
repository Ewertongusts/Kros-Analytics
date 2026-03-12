<template>
  <UiKModal :is-open="isOpen" size="md" @close="close">
    <UiKModalHeader 
      :title="`${isEditing ? 'EDITAR' : 'NOVO'} CLIENTE`"
    />

    <form @submit.prevent="handleSave" class="space-y-4 overflow-y-auto custom-scrollbar max-h-[60vh]">
      <!-- Informações do Cliente -->
      <div class="space-y-3">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome do Cliente *</label>
          <input 
            v-model="form.representative_name"
            type="text"
            required
            placeholder="Ex: João Silva"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome da Empresa (Opcional)</label>
          <input 
            v-model="form.name"
            type="text"
            placeholder="Razão Social ou Nome Fantasia"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">E-mail</label>
          <input 
            v-model="form.email"
            type="email"
            placeholder="exemplo@empresa.com"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">WhatsApp</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-kros-blue/60">+55</span>
            <input 
              v-model="form.whatsapp"
              type="text"
              placeholder="(00) 00000-0000"
              class="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Tags</label>
        <div class="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/[0.03] border border-white/10 rounded-xl">
          <div 
            v-for="(tag, index) in form.tags" 
            :key="index"
            class="flex items-center gap-2 bg-kros-blue/10 text-kros-blue border border-kros-blue/20 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase"
          >
            {{ tag }}
            <button @click.prevent="removeTag(index)" class="hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <input 
            v-model="tagInput"
            @keydown.enter.prevent="addTag"
            @keydown.,.prevent="addTag"
            placeholder="Adicionar tag..."
            class="flex-1 bg-transparent border-none outline-none text-xs text-white min-w-[100px] placeholder:text-white/20"
          />
        </div>
        
        <!-- Tag Suggestions -->
        <div v-if="tagSuggestions.length" class="flex flex-wrap gap-2">
          <button 
            v-for="tagDef in tagSuggestions.slice(0, 5)" 
            :key="tagDef.id"
            type="button"
            @click="addPredefinedTag(tagDef.name)"
            class="px-2 py-1 rounded-lg border text-[9px] font-bold uppercase transition-all hover:scale-105"
            :style="{ 
              backgroundColor: `${tagDef.color}10`, 
              color: tagDef.color, 
              borderColor: `${tagDef.color}20` 
            }"
          >
            + {{ tagDef.name }}
          </button>
        </div>
      </div>

      <!-- Observações -->
      <div class="space-y-2">
        <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Observações</label>
        <textarea 
          v-model="form.notes"
          rows="2"
          placeholder="Anotações sobre o cliente..."
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 resize-none"
        ></textarea>
      </div>

      <UiKModalActions
        cancel-text="Cancelar"
        :confirm-text="isEditing ? 'SALVAR' : 'CRIAR'"
        loading-text="SALVANDO..."
        :loading="loading"
        submit-type="submit"
        @cancel="close"
      />
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  isOpen: boolean
  company?: any
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const form = reactive({
  id: undefined,
  name: '',
  representative_name: '',
  email: '',
  whatsapp: '',
  notes: '',
  tags: [] as string[]
})

const { tags: tagDefinitions, fetchTags } = useTags()
const tagInput = ref('')

onMounted(() => {
  fetchTags()
})

const tagSuggestions = computed(() => {
  return tagDefinitions.value.filter(td => !form.tags.includes(td.name))
})

const addTag = () => {
  const val = tagInput.value.trim().replace(',', '')
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInput.value = ''
}

const addPredefinedTag = (name: string) => {
  if (!form.tags.includes(name)) {
    form.tags.push(name)
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const resetForm = () => {
  form.id = undefined
  form.name = ''
  form.representative_name = ''
  form.email = ''
  form.whatsapp = ''
  form.notes = ''
  form.tags = []
  tagInput.value = ''
}

const handleSave = () => {
  emit('save', { ...form })
}

const close = () => {
  emit('close')
}

watch(() => props.company, (newVal) => {
  if (newVal) {
    isEditing.value = true
    form.id = newVal.id
    form.name = newVal.name || ''
    form.representative_name = newVal.representative_name || ''
    form.email = newVal.email || ''
    form.whatsapp = newVal.whatsapp || ''
    form.notes = newVal.notes || ''
    form.tags = newVal.tags || []
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.3);
}
</style>
