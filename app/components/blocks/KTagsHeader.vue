<template>
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div></div>
    
    <button 
      @click="$emit('create')"
      class="btn-primary px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
      Nova Tag
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['create'])
</script>
