<template>
  <thead>
    <tr :class="['uppercase tracking-[0.15em] text-white/50', isCompact ? 'text-[9px] font-bold' : 'text-[10px] font-bold']">
      <th :class="['w-10', isCompact ? 'px-3 py-2' : 'px-4 py-3']">
        <div @click="$emit('toggle-select-all')" class="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="isAllSelected ? 'bg-kros-blue border-kros-blue' : ''">
          <svg v-if="isAllSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </th>
      
      <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'company_name')">
        <div class="flex items-center gap-2">
          Cliente
          <svg v-if="sortColumn === 'company_name'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>
      
      <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'due_date')">
        <div class="flex items-center gap-2">
          Plano
          <svg v-if="sortColumn === 'due_date'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>
      
      <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'due_date')">
        <div class="flex items-center gap-2">
          Vencimento
          <svg v-if="sortColumn === 'due_date'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>
      
      <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'plan_billing_cycle')">
        <div class="flex items-center gap-2">
          Ciclo
          <svg v-if="sortColumn === 'plan_billing_cycle'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>
      
      <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'amount')">
        <div class="flex items-center gap-2">
          Valor
          <svg v-if="sortColumn === 'amount'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>
      
      <th :class="['text-center w-12 cursor-pointer hover:text-white transition-colors group relative', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'subscription_status')">
        <div class="flex items-center justify-center gap-2">
          Status Assinatura
          <svg v-if="sortColumn === 'subscription_status'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 delay-500 whitespace-nowrap z-[100]">
          <p class="text-[9px] font-bold text-white/90">Estado do contrato (Ativa, Suspensa, Cancelada, Trial)</p>
        </div>
      </th>
      
      <th :class="['text-center w-12 cursor-pointer hover:text-white transition-colors group relative', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="$emit('sort', 'payment_status')">
        <div class="flex items-center justify-center gap-2">
          Status Pagamento
          <svg v-if="sortColumn === 'payment_status'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 delay-500 whitespace-nowrap z-[100]">
          <p class="text-[9px] font-bold text-white/90">Estado da cobrança mensal (Pago, Pendente, Atrasado)</p>
        </div>
      </th>
      <th :class="isCompact ? 'px-3 py-2' : 'px-4 py-3'">Último Alerta</th>
      <th :class="['text-right sticky right-0 bg-[#111112] text-white/50 z-10', isCompact ? 'px-3 py-2' : 'px-4 py-3']">Ações</th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
defineProps<{
  isCompact: boolean
  isAllSelected: boolean
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
}>()

defineEmits(['toggle-select-all', 'sort'])
</script>
