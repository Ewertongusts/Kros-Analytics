<template>
  <aside 
    :class="[
      'fixed left-0 top-0 h-screen z-[60] bg-kros-main dark:bg-[#0A0A0B] border-r border-kros-outline dark:border-[#1F1F21] transition-all duration-500 ease-in-out flex flex-col',
      isExpanded ? 'w-64' : 'w-20'
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Logo Section -->
    <div class="h-20 flex items-center px-6 flex-shrink-0">
      <UiKLogo size="sm" :collapsed="!isExpanded" />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path" 
        class="group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative"
        :class="route.path === item.path ? 'btn-primary text-white' : 'text-kros-text/60 dark:text-white/60 hover:bg-kros-text/5 dark:hover:bg-white/5 hover:text-kros-blue'"
      >
        <div class="flex-shrink-0">
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <span v-if="isExpanded" class="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all">
          {{ item.name }}
        </span>

        <!-- Tooltip for collapsed mode -->
        <div v-if="!isExpanded" class="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-[70] whitespace-nowrap">
          {{ item.name }}
        </div>
      </NuxtLink>
    </nav>

    <!-- User & Actions -->
    <div class="p-4 border-t border-kros-outline dark:border-[#1F1F21] space-y-4">
      <!-- User Profile -->
      <div 
        :class="[
          'flex items-center gap-3 p-3 rounded-2xl bg-kros-text/[0.03] dark:bg-white/[0.03] transition-all overflow-hidden',
          isExpanded ? 'px-4' : 'justify-center px-0'
        ]"
      >
        <div class="w-8 h-8 rounded-full bg-kros-blue/20 flex items-center justify-center text-kros-blue font-bold text-xs flex-shrink-0 border border-kros-blue/10">
          {{ user?.user_metadata?.full_name?.charAt(0) || 'G' }}
        </div>
        <div v-if="isExpanded" class="flex flex-col min-w-0">
          <span class="text-[10px] font-bold text-kros-text dark:text-kros-surface uppercase tracking-tight truncate">
            {{ user?.user_metadata?.full_name || 'Gestor Kros' }}
          </span>
          <span class="text-[8px] font-bold text-kros-blue/60 uppercase tracking-tighter truncate">
            Administrador
          </span>
        </div>
      </div>

      <!-- Logout Button -->
      <button 
        @click="handleLogout"
        :class="[
          'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group overflow-hidden',
          isExpanded ? 'justify-start' : 'justify-center'
        ]"
        class="text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
      >
        <div class="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <span v-if="isExpanded" class="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
          Sair do Sistema
        </span>
      </button>
    </div>

    <!-- Toggle Button (Absolute) -->
    <button 
      @click="handleToggle"
      class="absolute -right-3 top-24 w-6 h-6 bg-kros-blue text-white rounded-full flex items-center justify-center shadow-lg border border-white/10 z-[70] hover:scale-110 active:scale-95 transition-all"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" height="14" 
        viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="3" 
        stroke-linecap="round" stroke-linejoin="round"
        :class="['transition-transform duration-500', isExpanded ? 'rotate-180' : '']"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWhiteLabel } from '~/composables/useWhiteLabel'
import { 
  LayoutDashboard,
  Building2, 
  Receipt, 
  Settings,
  Hash
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const { settings } = useWhiteLabel()

const { isExpanded, toggleSidebar } = useSidebar()
const isAutoHidden = ref(false)
let hideTimer: any = null

const navItems = [
  { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Empresas', path: '/empresas', icon: Building2 },
  { name: 'Tags', path: '/tags', icon: Hash },
  { name: 'Financeiro', path: '/financeiro', icon: Receipt },
  { name: 'Ajustes', path: '/ajustes', icon: Settings },
]

const handleToggle = () => {
  toggleSidebar()
  isAutoHidden.value = !isExpanded.value
}

const handleMouseEnter = () => {
  if (isAutoHidden.value) {
    isExpanded.value = true
  }
  if (hideTimer) clearTimeout(hideTimer)
}

const handleMouseLeave = () => {
  if (isAutoHidden.value) {
    hideTimer = setTimeout(() => {
      isExpanded.value = false
    }, 2000) // Auto-recolhe após 2 segundos de inatividade
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/')
}

onMounted(() => {
  // Opcional: Iniciar recolhido em telas menores
  if (window.innerWidth < 1024) {
    isExpanded.value = false
    isAutoHidden.value = true
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}
</style>
