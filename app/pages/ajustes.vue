<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-kros-text dark:text-kros-surface tracking-tighter uppercase">
          Configurações <span class="text-kros-blue">do Sistema</span>
        </h1>
        <p class="text-[10px] text-kros-text/40 dark:text-kros-surface/40 tracking-widest font-medium uppercase mt-1">Personalização e Chaves de API</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="i in 4" :key="i" class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] flex items-center gap-6">
          <div class="w-12 h-12 rounded-xl bg-kros-blue/10 flex items-center justify-center text-kros-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="flex-1">
            <div class="h-4 w-32 bg-kros-text/10 dark:bg-white/10 rounded-full mb-2"></div>
            <div class="h-2 w-48 bg-kros-text/5 dark:bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
