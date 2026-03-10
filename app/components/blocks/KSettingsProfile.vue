<template>
  <div class="space-y-10">
    <div class="flex flex-col md:flex-row gap-10 items-start">
      <!-- Avatar Upload -->
      <div class="relative group mx-auto md:mx-0">
        <div class="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-kros-blue/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
          <img v-if="user?.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/20"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          
          <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
        </div>
        <p class="text-[9px] font-bold uppercase tracking-widest text-center mt-3 text-white/30">Alterar Foto</p>
      </div>

      <!-- Form -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome Completo</label>
          <input 
            type="text" 
            v-model="profile.name"
            placeholder="Nome do Usuário"
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">E-mail de Acesso</label>
          <input 
            type="email" 
            :value="user?.email" 
            disabled
            class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white/40 cursor-not-allowed"
          />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Cargo / Função</label>
          <select 
            v-model="profile.role"
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all appearance-none"
          >
            <option value="admin">Administrador</option>
            <option value="manager">Gerente Financeiro</option>
            <option value="analyst">Analista de Dados</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
          <input 
            type="text" 
            v-model="profile.phone"
            placeholder="(00) 00000-0000"
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all"
          />
        </div>
      </div>
    </div>
    
    <div class="pt-6 border-t border-white/5 flex justify-end">
      <button 
        @click="$emit('save', profile)"
        class="btn-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        Salvar Alterações
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  user: any
  profileData: {
    name: string
    role: string
    phone: string
  }
}>()

const emit = defineEmits(['save'])

const profile = reactive({ ...props.profileData })
</script>
