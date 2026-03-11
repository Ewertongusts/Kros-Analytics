<template>
  <div class="p-8">
    <BlocksKFinanceMessageTemplates />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
