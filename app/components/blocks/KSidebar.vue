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
      <div v-for="item in navItems" :key="item.name">
        <!-- Regular Link -->
        <NuxtLink 
          v-if="!item.subItems"
          :to="item.path" 
          class="group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative"
          :class="route.path === item.path ? 'btn-primary text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'"
        >
          <div class="flex-shrink-0">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span v-if="isExpanded" class="text-[12px] font-bold uppercase tracking-widest whitespace-nowrap transition-all">
            {{ item.name }}
          </span>

          <!-- Tooltip for collapsed mode -->
          <div v-if="!isExpanded" class="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-[70] whitespace-nowrap">
            {{ item.name }}
          </div>
        </NuxtLink>

        <!-- Collapsible Menu (Ferramentas) -->
        <div v-else class="space-y-1">
          <button 
            @click="item.isOpen = !item.isOpen"
            class="w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative text-white/50 hover:bg-white/5 hover:text-white"
            :class="{ 'bg-white/[0.03] text-white border border-white/5': item.isOpen || item.subItems.some(s => route.path === s.path) }"
          >
            <div class="flex-shrink-0">
               <component :is="item.icon" class="w-5 h-5" />
            </div>
            <span v-if="isExpanded" class="text-[12px] font-bold uppercase tracking-widest whitespace-nowrap transition-all flex-1 text-left">
              {{ item.name }}
            </span>
            <svg 
              v-if="isExpanded" 
              xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" 
              class="transition-transform duration-300"
              :class="{ 'rotate-180': item.isOpen }"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>

            <!-- Tooltip for collapsed mode -->
            <div v-if="!isExpanded" class="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-[70] whitespace-nowrap">
              {{ item.name }}
            </div>
          </button>

          <!-- Sub-items -->
          <div v-if="isExpanded && item.isOpen" class="mt-1 px-4 space-y-0.5 overflow-hidden transition-all duration-300">
            <NuxtLink 
              v-for="sub in item.subItems" 
              :key="sub.path"
              :to="sub.path"
              class="flex items-center gap-3 py-2 px-3 text-[10.5px] font-bold uppercase tracking-widest transition-all rounded-xl"
              :class="route.path === sub.path ? 'bg-white/[0.04] text-white' : 'text-white/30 hover:text-white hover:bg-white/[0.02]'"
            >
              <component :is="sub.icon" class="w-4 h-4" :class="route.path === sub.path ? 'text-kros-blue' : 'text-white/20'" />
              {{ sub.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
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
          <span class="text-xs font-bold text-white uppercase tracking-tight truncate">
            {{ user?.user_metadata?.full_name || 'Gestor Kros' }}
          </span>
          <div class="flex items-center gap-1.5 mt-0.5">
             <div :class="[
               'w-1.5 h-1.5 rounded-full',
               crmSettings?.last_test_status === 'success' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : (crmSettings?.last_test_status === 'error' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-white/20')
             ]"></div>
             <span class="text-[8px] font-bold uppercase tracking-widest truncate" :class="crmSettings?.api_token ? 'text-white/60' : 'text-orange-400/60'">
               {{ crmSettings?.api_token ? 'WhatsApp ON' : 'WhatsApp OFF' }}
             </span>
          </div>
        </div>
      </div>


      <!-- Logout Button -->
      <button 
        @click="handleLogout"
        :class="[
          'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group overflow-hidden',
          isExpanded ? 'justify-start' : 'justify-center'
        ]"
        class="text-red-400 hover:bg-red-500/10 hover:text-red-500"
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


  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard,
  Receipt,
  Settings,
  Hash,
  CreditCard,
  Calendar,
  Wrench,
  FileText,
  KanbanSquare
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const { settings: crmSettings, fetchCrmData: fetchCrmSettings } = useCrm()
const { isExpanded, toggleSidebar } = useSidebar()
const isAutoHidden = ref(false)
let hideTimer: any = null

const navItems = reactive([
  { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Cobranças', path: '/cobrancas', icon: Receipt },
  { name: 'Despesas', path: '/despesas', icon: CreditCard },
  { name: 'Tarefas', path: '/tarefas', icon: KanbanSquare },
  { name: 'Calendário', path: '/calendario', icon: Calendar },
  { 
    name: 'Ferramentas', 
    icon: Wrench,
    isOpen: false,
    subItems: [
      { name: 'Tags de Negócio', path: '/tags', icon: Hash },
      { name: 'Modelos de Envios', path: '/ferramentas/templates', icon: FileText },
    ]
  },
  { name: 'Ajustes', path: '/ajustes', icon: Settings },
])

const handleToggle = () => {
  toggleSidebar()
  isAutoHidden.value = !isExpanded.value
}

const handleMouseEnter = () => {
  if (hideTimer) clearTimeout(hideTimer)
  if (!isExpanded.value) {
    isExpanded.value = true
    isAutoHidden.value = true
  }
}

const handleMouseLeave = () => {
  hideTimer = setTimeout(() => {
    if (isAutoHidden.value) {
      isExpanded.value = false
    }
  }, 1000) // Auto-recolhe após 1 segundo de inatividade
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/')
}

onMounted(async () => {
  await fetchCrmSettings()
  // Iniciar sempre recolhido
  isExpanded.value = false
  isAutoHidden.value = true
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}
</style>
