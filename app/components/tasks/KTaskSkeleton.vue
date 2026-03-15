<template>
  <div class="p-4 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-xl space-y-3">
    <!-- Header -->
    <div class="space-y-2">
      <div class="h-4 bg-white/10 rounded skeleton-loading w-3/4" />
      <div class="h-3 bg-white/10 rounded skeleton-loading w-1/2" />
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <div class="h-3 bg-white/10 rounded skeleton-loading w-full" />
      <div class="h-3 bg-white/10 rounded skeleton-loading w-5/6" />
      <div class="h-3 bg-white/10 rounded skeleton-loading w-4/5" />
    </div>

    <!-- Badges -->
    <div class="flex gap-2">
      <div class="h-5 bg-white/10 rounded-lg skeleton-loading w-12" />
      <div class="h-5 bg-white/10 rounded-lg skeleton-loading w-16" />
    </div>

    <!-- Buttons -->
    <div class="grid grid-cols-4 gap-1 pt-2 border-t border-white/10">
      <div class="h-8 bg-white/10 rounded-lg skeleton-loading" />
      <div class="h-8 bg-white/10 rounded-lg skeleton-loading" />
      <div class="h-8 bg-white/10 rounded-lg skeleton-loading" />
      <div class="h-8 bg-white/10 rounded-lg skeleton-loading" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-loading {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
