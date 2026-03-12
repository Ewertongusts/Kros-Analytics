<template>
  <div v-if="payments.length > 0" class="mt-2 max-h-32 overflow-y-auto custom-scrollbar bg-black/40 border border-white/5 rounded-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-200">
    <div v-for="p in payments" :key="p.id" class="flex items-center justify-between gap-3 text-left">
      <div class="flex items-center gap-2 overflow-hidden">
        <div v-if="sentStatus[p.id] === 'success'" class="text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div v-else-if="sentStatus[p.id] === 'error'" class="text-red-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
        <div v-else-if="sentStatus[p.id] === 'sending'" class="text-kros-blue shrink-0 animate-spin">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <div v-else-if="sentStatus[p.id] === 'skipped' || (skipRecent && checkSkipLimit(p.id))" class="text-amber-500/50 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
        </div>
        <div v-else class="w-3 h-3 rounded-full border border-white/10 shrink-0"></div>
        <span class="text-[11px] font-bold text-white/70 truncate">{{ p.company_name }}</span>
      </div>
      <span class="text-[10px] font-semibold text-white/20">{{ p.company_whatsapp }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  payments: any[]
  sentStatus: Record<string, string>
  skipRecent: boolean
  checkSkipLimit: (id: string) => boolean
}>()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
</style>
