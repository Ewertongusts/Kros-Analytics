<template>
  <div class="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-8 h-full">
    <div>
      <h4 class="text-xs font-bold text-white uppercase tracking-widest">Testar Envio Manual</h4>
      <p class="text-[9px] text-white/40 uppercase tracking-widest mt-1">Validação instantânea de conectividade</p>
    </div>

    <div class="space-y-5">
      <div class="space-y-2">
        <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Número de Destino</label>
        <input 
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="5581900000000"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Tipo de Teste</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="testType = 'text'"
            :class="[
              'py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
              testType === 'text' 
                ? 'bg-kros-blue text-white' 
                : 'bg-white/[0.03] border border-white/10 text-white/50 hover:text-white/70'
            ]"
          >
            📝 Texto
          </button>
          <button
            @click="testType = 'image'"
            :class="[
              'py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
              testType === 'image' 
                ? 'bg-kros-blue text-white' 
                : 'bg-white/[0.03] border border-white/10 text-white/50 hover:text-white/70'
            ]"
          >
            📎 Anexo
          </button>
        </div>
      </div>

      <div v-if="testType === 'image'" class="space-y-3">
        <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Origem do Anexo</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="imageSource = 'url'"
            :class="[
              'py-2 px-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all',
              imageSource === 'url' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/[0.03] border border-white/10 text-white/50 hover:text-white/70'
            ]"
          >
            🔗 URL
          </button>
          <button
            @click="imageSource = 'file'"
            :class="[
              'py-2 px-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all',
              imageSource === 'file' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/[0.03] border border-white/10 text-white/50 hover:text-white/70'
            ]"
          >
            📎 Arquivo
          </button>
        </div>

        <div v-if="imageSource === 'url'" class="space-y-2">
          <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">URL do Anexo</label>
          <input 
            v-model="imageUrl"
            type="text"
            placeholder="https://exemplo.com/arquivo.jpg"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-kros-blue transition-all"
          />
        </div>

        <div v-else class="space-y-2">
          <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Selecionar Arquivo</label>
          <div class="relative">
            <input 
              ref="fileInput"
              type="file"
              accept="image/*,application/pdf,.pdf"
              @change="handleFileSelect"
              class="hidden"
            />
            <button
              @click="() => fileInput?.click()"
              class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white/70 hover:text-white hover:border-kros-blue transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ selectedFileName || 'Clique para selecionar' }}
            </button>
          </div>
          <p v-if="selectedFileName" class="text-[9px] text-emerald-400 pl-1">✓ {{ selectedFileName }}</p>
          <p class="text-[8px] text-white/30 pl-1">Formatos: JPG, PNG, GIF, PDF (máx. 5MB)</p>
        </div>
      </div>

      <button 
        @click="handleTest"
        :disabled="testing || !apiUrl || (testType === 'image' && imageSource === 'url' && !imageUrl) || (testType === 'image' && imageSource === 'file' && !selectedFile)"
        class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <div v-if="testing" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        {{ testing ? 'ENVIANDO...' : testType === 'image' ? 'TESTAR ANEXO' : 'TESTAR TEXTO' }}
      </button>
    </div>

    <!-- Last Result -->
    <div v-if="lastTestAt" class="pt-6 border-t border-white/5 mt-auto">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Último Verificado</span>
        <span class="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{{ formatDate(lastTestAt) }}</span>
      </div>
      <div :class="[
        'p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-500',
        lastTestStatus === 'success' 
          ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
          : 'bg-red-500/5 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
      ]">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 border', lastTestStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20']">
          <svg v-if="lastTestStatus === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{{ lastTestStatus === 'success' ? 'Conexão Estável' : 'Conexão Interrompida' }}</p>
          <p class="text-[11px] font-medium leading-tight truncate">{{ lastTestResponse }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  testing: boolean
  apiUrl: string
  lastTestAt?: string
  lastTestStatus?: string
  lastTestResponse?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  test: []
  testImage: [imageUrl: string]
  testImageFile: [file: File]
}>()

const testType = ref<'text' | 'image'>('text')
const imageSource = ref<'url' | 'file'>('url')
const imageUrl = ref('https://picsum.photos/800/600')
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Valida tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > maxSize) {
      alert('Arquivo muito grande! Tamanho máximo: 5MB')
      target.value = ''
      return
    }
    
    // Verifica se é PDF
    if (file.type === 'application/pdf') {
      alert('PDFs não são suportados via upload direto. Use a opção "URL" e forneça um link público do arquivo.')
      target.value = ''
      return
    }
    
    selectedFile.value = file
    selectedFileName.value = file.name
  }
}

const handleTest = () => {
  if (testType.value === 'image') {
    if (imageSource.value === 'url') {
      emit('testImage', imageUrl.value)
    } else if (selectedFile.value) {
      emit('testImageFile', selectedFile.value)
    }
  } else {
    emit('test')
  }
}

const formatDate = (dateValue: string) => {
  const d = new Date(dateValue)
  return d.toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  }) + 'h'
}
</script>
