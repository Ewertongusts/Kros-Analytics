<template>
  <div class="bg-kros-main dark:bg-[#0A0A0B] min-h-screen">
    <!-- Sidebar Global (Show only if logged in) -->
    <template v-if="user">
       <BlocksKSidebar />
       
       <!-- Main content with dynamic padding -->
       <div 
         class="transition-all duration-500 ease-in-out min-h-screen bg-[#0A0A0B]" 
         :class="isExpanded ? 'pl-64' : 'pl-20'"
         id="main-content"
       >
         <NuxtPage />
       </div>
    </template>

    <!-- Initial Screen / Login -->
    <template v-else>
      <NuxtPage />
    </template>

    <!-- Toast Global -->
    <UiKToast ref="toastRef" />
    
    <!-- Toast Container -->
    <UiKToastContainer ref="toastContainerRef" />
    
    <!-- Confirm Dialog -->
    <UiKConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useWhiteLabel } from '~/composables/useWhiteLabel'
import { useToast } from '~/composables/useToast'

const user = useSupabaseUser()
const { isExpanded } = useSidebar()
const { settings, fetchSettings, applyColors, initializeColorsFromStorage } = useWhiteLabel()
const { setToastInstance, setConfirmInstance } = useToast()
const toastRef = ref()
const toastContainerRef = ref()
const confirmDialogRef = ref()

useHead({
  titleTemplate: (title) => title ? `${title} | ${settings.value.system_name}` : settings.value.system_name,
  htmlAttrs: {
    class: 'dark'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: settings.value.favicon_url || '/favicon.ico'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
      rel: 'stylesheet'
    }
  ]
})

// Watch for user authentication changes
watch(() => user.value, async (newUser) => {
  if (newUser) {
    await fetchSettings()
    if (settings.value.primary_color) {
      applyColors(settings.value.primary_color)
    }
  }
}, { immediate: true })

onMounted(async () => {
  // Initialize colors from localStorage immediately
  initializeColorsFromStorage()
  
  // Registrar instância do Toast
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
  
  // Registrar instância do Toast Container
  if (toastContainerRef.value) {
    setToastInstance(toastContainerRef.value)
  }
  
  // Registrar instância do Confirm Dialog
  if (confirmDialogRef.value) {
    setConfirmInstance(confirmDialogRef.value)
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --kros-gradient: linear-gradient(135deg, #004fcc, #007BFF, #4da6ff);
}

html, body {
  background-color: #0A0A0B !important;
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Botão com gradiente dinâmico da cor principal */
.btn-primary {
  background: var(--kros-gradient) !important;
  color: white;
  transition: filter 0.2s ease, transform 0.15s ease;
}
.btn-primary:hover { filter: brightness(1.12); }
.btn-primary:active { transform: scale(0.97); }

/* Scrollbar personalizada para combinar com o design dark */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

