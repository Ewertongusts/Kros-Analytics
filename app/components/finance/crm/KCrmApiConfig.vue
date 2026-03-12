<template>
  <div class="p-8 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21]">
    <form @submit.prevent="$emit('save')" class="space-y-8">
      <!-- API Keys -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">URL da API (Webhook/Endpoint)</label>
          <input 
            :value="apiUrl"
            @input="$emit('update:apiUrl', ($event.target as HTMLInputElement).value)"
            type="url"
            required
            placeholder="https://api.exemplo.com/messages/send"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">Bearer Token de Autorização</label>
          <input 
            :value="apiToken"
            @input="$emit('update:apiToken', ($event.target as HTMLInputElement).value)"
            type="password"
            placeholder="Insira o seu token de conexão..."
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>
      </div>

      <!-- Anti-Ban Settings -->
      <div class="pt-6 border-t border-white/5 space-y-6">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h4 class="text-xs font-bold text-white uppercase tracking-widest">Configurações Anti-Bloqueio (Tempos Randômicos)</h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Intervalo entre msgs -->
          <div class="space-y-3">
            <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Intervalo entre Mensagens</label>
            <div class="flex items-center gap-2">
              <input 
                :value="delayMin"
                @input="$emit('update:delayMin', Number(($event.target as HTMLInputElement).value))"
                type="number" 
                class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" 
                placeholder="Min (seg)" 
              />
              <span class="text-white/20 text-xs">a</span>
              <input 
                :value="delayMax"
                @input="$emit('update:delayMax', Number(($event.target as HTMLInputElement).value))"
                type="number" 
                class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" 
                placeholder="Max (seg)" 
              />
            </div>
            <p class="text-[8px] text-white/30 uppercase font-black pl-1">Segundos (Randômico)</p>
          </div>

          <!-- Após quantas mensagens -->
          <div class="space-y-3">
            <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Pausa após quanto envios</label>
            <input 
              :value="breakAfter"
              @input="$emit('update:breakAfter', Number(($event.target as HTMLInputElement).value))"
              type="number" 
              class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" 
              placeholder="Ex: 15" 
            />
            <p class="text-[8px] text-white/30 uppercase font-black pl-1">Contagem de Mensagens</p>
          </div>

          <!-- Intervalo maior -->
          <div class="space-y-3">
            <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Duração da Pausa Longa</label>
            <div class="flex items-center gap-2">
              <input 
                :value="breakDelayMin"
                @input="$emit('update:breakDelayMin', Number(($event.target as HTMLInputElement).value))"
                type="number" 
                class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" 
                placeholder="Min (min)" 
              />
              <span class="text-white/20 text-xs text-nowrap">a</span>
              <input 
                :value="breakDelayMax"
                @input="$emit('update:breakDelayMax', Number(($event.target as HTMLInputElement).value))"
                type="number" 
                class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" 
                placeholder="Max (min)" 
              />
            </div>
            <p class="text-[8px] text-white/30 uppercase font-black pl-1">Minutos (Randômico)</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button 
          type="submit"
          :disabled="loading"
          class="btn-primary text-[10px] font-extrabold uppercase tracking-[0.2em] px-10 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
        >
          {{ loading ? 'PROCESSANDO...' : 'SALVAR TODAS AS CONFIGURAÇÕES' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  apiUrl: string
  apiToken: string
  delayMin: number
  delayMax: number
  breakAfter: number
  breakDelayMin: number
  breakDelayMax: number
  loading: boolean
}>()

defineEmits<{
  'update:apiUrl': [value: string]
  'update:apiToken': [value: string]
  'update:delayMin': [value: number]
  'update:delayMax': [value: number]
  'update:breakAfter': [value: number]
  'update:breakDelayMin': [value: number]
  'update:breakDelayMax': [value: number]
  save: []
}>()
</script>
