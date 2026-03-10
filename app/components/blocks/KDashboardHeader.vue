<template>
  <header class="border-b border-kros-outline dark:border-[#1F1F21] bg-kros-main/90 dark:bg-[#0A0A0B]/90 backdrop-blur-xl sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-10">
        <UiKLogo size="sm" />
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="text-[10px] font-bold uppercase tracking-widest transition-all pb-1"
            :class="route.path === item.path ? 'text-kros-blue border-b border-kros-blue' : 'text-kros-text/60 dark:text-white/60 hover:text-kros-blue'"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-5">
        <div class="flex flex-col items-end hidden sm:flex">
          <span class="text-[11px] font-bold text-kros-text dark:text-kros-surface uppercase tracking-tight">{{ user?.user_metadata?.full_name || 'Gestor Kros' }}</span>
          <span class="text-[9px] font-bold text-kros-blue/60 uppercase tracking-tighter tabular-nums">ID: #{{ user?.id?.substring(0, 8) }}</span>
        </div>
        <div class="h-8 w-px bg-kros-outline dark:bg-[#1F1F21] mx-2"></div>
        <button 
          @click="handleLogout"
          class="p-2.5 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all active:scale-95 group shadow-sm"
          title="Sair do Sistema"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const navItems = [
  { name: 'Visão Geral', path: '/dashboard' },
  { name: 'Empresas', path: '/empresas' },
  { name: 'Financeiro', path: '/financeiro' },
  { name: 'Ajustes', path: '/ajustes' },
]

const handleLogout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/')
}
</script>
