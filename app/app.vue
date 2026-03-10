<template>
  <div class="font-inter bg-kros-main dark:bg-[#0A0A0B] min-h-screen">
    <!-- Sidebar Global (Show only if logged in) -->
    <template v-if="user">
       <BlocksKSidebar />
       
       <!-- Main content with dynamic padding -->
       <div 
         class="transition-all duration-500 ease-in-out" 
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
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { isExpanded } = useSidebar()
useHead({
  htmlAttrs: {
    class: 'dark'
  },
  link: [
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
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
      rel: 'stylesheet'
    }
  ]
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.02em;
}

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

