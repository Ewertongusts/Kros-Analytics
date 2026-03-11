<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <!-- TABS INTEGRADAS -->
      <div class="flex items-center gap-1 bg-black/20 p-1 rounded-xl shadow-inner self-start">
          <button 
            @click="$emit('update:activeSubTab', 'operational')"
            :class="[
              'px-4 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
              activeSubTab === 'operational' 
                ? 'bg-kros-blue text-white shadow-lg' 
                : 'text-white/20 hover:text-white/60 hover:bg-white/5'
            ]"
          >
            Gestão
          </button>
          <button 
            @click="$emit('update:activeSubTab', 'history')"
            :class="[
              'px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all',
              activeSubTab === 'history' 
                ? 'bg-kros-blue text-white shadow-lg' 
                : 'text-white/20 hover:text-white/60 hover:bg-white/5'
            ]"
          >
            Histórico
          </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 sm:gap-4 lg:flex-1 lg:justify-end">
          <!-- Novo Filtro de Tags (Dropdown Multi-select) -->
          <div class="relative group/tags shrink-0">
             <button 
               @click="isTagDropdownOpen = !isTagDropdownOpen"
               class="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
             >
               <span class="text-xs font-bold uppercase tracking-widest text-[9px] sm:text-xs">Tags</span>
               <div v-if="selectedTags.length > 0" class="flex items-center justify-center min-w-[20px] h-[20px] bg-kros-blue text-white rounded-full text-[10px] font-bold">
                 {{ selectedTags.length }}
               </div>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isTagDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
             </button>

             <!-- Dropdown Menu -->
             <div 
               v-if="isTagDropdownOpen" 
               class="absolute top-full right-0 lg:left-0 lg:right-auto mt-3 w-60 sm:w-64 bg-[#111112] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[100] p-2 overflow-hidden"
             >
                <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                   <button 
                     @click="toggleAllTags"
                     class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                   >
                     <span class="text-[10px] font-bold text-white/70 uppercase tracking-widest">Todas as Tags</span>
                     <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.length === tagDefinitions.length ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
                        <svg v-if="selectedTags.length === tagDefinitions.length" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                   </button>
                   
                   <div class="h-px bg-white/5 my-1"></div>

                   <button 
                     v-for="tag in tagDefinitions" 
                     :key="tag.id"
                     @click="toggleTag(tag.name)"
                     class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                   >
                     <div class="flex items-center gap-3">
                        <div :style="{ backgroundColor: tag.color }" class="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
                        <span class="text-[10px] font-bold text-white/50 group-hover/item:text-white uppercase tracking-widest transition-colors">{{ tag.name }}</span>
                     </div>
                     <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.includes(tag.name) ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
                        <svg v-if="selectedTags.includes(tag.name)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                   </button>
                </div>

                <div v-if="selectedTags.length > 0" class="p-2 border-t border-white/5">
                   <button 
                     @click="selectedTags = []"
                     class="w-full py-2.5 text-[10px] font-bold text-center text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
                   >
                     Limpar Filtros
                   </button>
                </div>
             </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
               @click="$emit('open-logs')"
               title="Logs de Disparos e Cobrança"
               class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10 flex items-center justify-center shrink-0"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16 20h.01"/><path d="M3 14h.01"/><path d="M8 14h.01"/><path d="M3 10h.01"/><path d="M8 10h.01"/><path d="M3 6h.01"/><path d="M8 6h.01"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </button>
            <div class="shrink-0 scale-90 sm:scale-100 origin-right">
               <UiKFilterTabs v-model="activeFilter" :options="filterOptions" />
            </div>
          </div>
          <!-- Botões Globais Integrados -->
          <div class="flex items-center gap-2 ml-2 pl-4 border-l border-white/5">
              <button 
                @click="$emit('config')"
                class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Gerenciar Empresas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </button>
              <button 
                @click="$emit('sync')"
                class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Sincronizar Dados"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
              </button>
          </div>
          <!-- Seleção em Massa -->
          <div v-if="selectedIds.length > 0" class="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
             <div class="h-8 w-px bg-white/10 mx-2"></div>
             <div class="px-3 py-1.5 bg-kros-blue/10 rounded-xl border border-kros-blue/20 flex items-center gap-3">
                <span class="text-[10px] font-black text-kros-blue uppercase tracking-widest">{{ selectedIds.length }} selecionados</span>
                <div class="flex items-center gap-1.5">
                   <button 
                     @click="batchAction('whatsapp-api')"
                     class="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all"
                     title="Cobrar Selecionados (WhatsApp Template)"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
                   </button>
                   <button 
                     @click="batchAction('auto-billing-on')"
                     class="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all"
                     title="Ativar Cobrança Automática em Massa"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/></svg>
                   </button>
                   <button 
                     @click="batchAction('auto-billing-off')"
                     class="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                     title="Desativar Cobrança Automática"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 10-7 7-7-7"/></svg>
                   </button>

                   <!-- Bulk Tags -->
                   <div class="relative">
                      <button 
                        @click="isBatchTagPickerOpen = !isBatchTagPickerOpen"
                        class="p-2 hover:bg-kros-blue/20 text-kros-blue rounded-lg transition-all"
                        title="Adicionar Tag em Massa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>
                      </button>

                      <div v-if="isBatchTagPickerOpen" class="absolute bottom-full right-0 mb-3 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[150] p-1 animate-in slide-in-from-bottom-2 duration-200">
                        <div class="max-h-48 overflow-y-auto custom-scrollbar">
                           <div class="px-3 py-2 border-b border-white/5 mb-1">
                              <p class="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Adicionar Tag</p>
                           </div>
                           <button 
                             v-for="tag in tagDefinitions" 
                             :key="tag.id"
                             @click="addTagToBatch(tag.name)"
                             class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/btag"
                           >
                             <div :style="{ backgroundColor: tag.color }" class="w-1.5 h-1.5 rounded-full shrink-0"></div>
                             <span class="text-[9px] font-bold text-white/50 group-hover/btag:text-white uppercase tracking-widest truncate">{{ tag.name }}</span>
                           </button>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
             <button @click="selectedIds = []" class="text-[9px] font-bold text-white/30 hover:text-white uppercase tracking-widest">Cancelar</button>
          </div>
      </div>
    </div>

    <div class="overflow-x-auto no-scrollbar">
      <table class="w-full min-w-[1000px] text-left border-separate border-spacing-y-3">
        <thead>
          <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
            <th class="px-4 py-3 w-10">
              <div @click="toggleSelectAll" class="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="isAllSelected ? 'bg-kros-blue border-kros-blue' : ''">
                <svg v-if="isAllSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </th>
            <th class="px-4 py-3">Empresa / Parceiro</th>
            <th class="px-4 py-3 text-center">Cadastro</th>
            <th class="px-4 py-3">Vencimento</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">LTV Pago</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Tags</th>
            <th class="px-4 py-3 text-right sticky right-0 bg-[#111112] text-white/50 z-20">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-kros-blue/10"
              :class="selectedIds.includes(payment.id) ? 'bg-kros-blue/5 border-kros-blue/20' : ''"
          >
            <td class="px-4 py-5 first:rounded-l-2xl">
              <div @click="toggleSelect(payment.id)" class="w-5 h-5 rounded-md border border-white/5 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="selectedIds.includes(payment.id) ? 'bg-kros-blue border-kros-blue' : ''">
                <svg v-if="selectedIds.includes(payment.id)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </td>
            <td class="px-4 py-5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-kros-blue/10 flex items-center justify-center text-kros-blue font-bold text-[10px] border border-kros-blue/10">
                  {{ payment.company_name?.charAt(0) }}
                </div>
                <div class="flex flex-col">
                   <p class="font-semibold text-sm text-white uppercase tracking-tight">{{ payment.company_name }}</p>
                   <p class="text-xs text-white/70 font-medium uppercase tracking-tighter">{{ payment.plan_name }}</p>
                   <p class="text-xs text-white/60 font-medium uppercase tracking-widest" v-if="payment.company_rep">REP: {{ payment.company_rep }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-5 text-center">
               <span class="text-xs font-medium text-white/50 uppercase tracking-widest">{{ formatDate(payment.company_created_at) }}</span>
            </td>
            <td class="px-4 py-5 font-medium">
               <span class="text-xs font-semibold tabular-nums text-white/60">{{ formatDate(payment.due_date) }}</span>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-bold tabular-nums text-white/90">{{ formatCurrency(payment.amount) }}</span>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-bold text-white/90 tabular-nums">{{ formatCurrency(payment.company_ltv || 0) }}</span>
            </td>
            <td class="px-4 py-5">
               <div class="flex items-center gap-2.5">
                  <span :class="['w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]', getStatusColor(payment.status)]" :style="{ color: getStatusHex(payment.status) }"></span>
                  <span :class="['text-xs font-bold uppercase tracking-widest', getStatusTextColor(payment.status)]">
                    {{ payment.status }}
                  </span>
               </div>
            </td>
            <td class="px-4 py-5">
              <!-- Gerenciamento de Tags On-the-fly -->
              <div class="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                <div 
                  v-for="tag in payment.tags" 
                  :key="tag"
                  class="group/tag relative"
                >
                  <span 
                    :style="getTagStyle(tag)"
                    class="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 transition-all cursor-help"
                  >
                    {{ tag }}
                    <button 
                      @click="removeTag(payment, tag)"
                      class="hover:text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </span>
                  
                  <!-- Descrição da Tag no Hover -->
                  <div v-if="getTagDescription(tag)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-[8px] text-white font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[110] border border-white/10 shadow-xl">
                    {{ getTagDescription(tag) }}
                  </div>
                </div>

                <!-- Botão Adicionar Tag -->
                <div class="relative">
                  <button 
                    @click="activeTagPicker = activeTagPicker === payment.id ? null : payment.id"
                    class="w-5 h-5 rounded-md border border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
                    title="Adicionar Tag"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>

                  <!-- Picker de Tags -->
                  <div v-if="activeTagPicker === payment.id" class="absolute top-full left-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[120] p-1 animate-in fade-in zoom-in-95 duration-200">
                    <div class="max-h-40 overflow-y-auto custom-scrollbar">
                      <button 
                        v-for="tag in availableTagsForPayment(payment)" 
                        :key="tag.id"
                        @click="addTag(payment, tag.name)"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left"
                      >
                        <div :style="{ backgroundColor: tag.color }" class="w-2 h-2 rounded-sm shrink-0"></div>
                        <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate">{{ tag.name }}</span>
                      </button>
                      <div v-if="availableTagsForPayment(payment).length === 0" class="p-4 text-center text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Sem mais tags</div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-5 text-right sticky right-0 bg-[#161617] group-hover/row:bg-[#1c1c1d] transition-colors z-10 border-l border-white/5">
                <div class="flex items-center justify-end gap-2 pr-1">
                  <!-- 1. Botão Toggle Status do Pagamento -->
                  <button 
                    @click="$emit('toggle-status', payment)"
                    :title="payment.status === 'Pago' ? 'Desfazer Pagamento (Estornar)' : 'Marcar como Pago'"
                    :class="[
                      'p-2.5 rounded-xl transition-all',
                      payment.status === 'Pago' 
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' 
                        : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
                    ]"
                  >
                    <!-- Ícone de Marcar Pago -->
                    <svg v-if="payment.status !== 'Pago'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <!-- Ícone de Desfazer (Undo) -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                  </button>

                  <!-- 2. Botão de Automação de Cobrança (CRON/POST) -->
                  <UiKAutoBillingBtn 
                    :is-active="payment.auto_billing_enabled"
                    @click="toggleAutoBilling(payment)"
                  />

                  <!-- 3. Botão WhatsApp (Mensagem Manual) -->
                  <button 
                    @click="openMsgModal(payment)"
                    title="Cobrar via WhatsApp"
                    class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group/wa"
                  >
                    <!-- Ícone oficial do WhatsApp -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
                    </svg>
                  </button>

                  <!-- 4. Botão de Logs -->
                  <UiKPaymentLogStatusBtn 
                     :payment-id="payment.id"
                     @open-logs="$emit('open-logs', payment.id)"
                  />

                  <!-- 5. Botão Histórico Individual (Extrema Direita) -->
                  <UiKPaymentHistoryBtn 
                    @open-history="$emit('open-history', payment.company_id)"
                  />
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="payments.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/60">Nenhum pagamento registrado</p>
    </div>

    <!-- Modal de Envio via API HTTP -->
    <BlocksKFinanceSendMsgModal 
      v-if="isMsgModalOpen"
      :is-open="isMsgModalOpen"
      :payment="selectedPayment"
      @close="isMsgModalOpen = false"
      @sent="handleMessageSent"
    />

    <!-- Modal de Envio em Massa via API HTTP -->
    <BlocksKFinanceBatchMsgModal 
      v-if="isBatchMsgModalOpen"
      :is-open="isBatchMsgModalOpen"
      :payments="selectedPaymentsForBatch"
      @close="isBatchMsgModalOpen = false"
      @sent="handleBatchSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  payments: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'batch-autobilling', 'open-logs', 'update-company-tags', 'open-history', 'update:activeSubTab', 'sync', 'config'])

const isMsgModalOpen = ref(false)
const isBatchMsgModalOpen = ref(false)
const selectedPayment = ref<any>(null)
const selectedPaymentsForBatch = ref<any[]>([])
const { tags: tagDefinitions, fetchTags } = useTags()

const activeFilter = ref('Todos')
const isTagDropdownOpen = ref(false)
const selectedTags = ref<string[]>([])
const selectedIds = ref<string[]>([])
const activeTagPicker = ref<string | null>(null)
const isBatchTagPickerOpen = ref(false)

const isAllSelected = computed(() => {
  return filteredPayments.value.length > 0 && selectedIds.value.length === filteredPayments.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPayments.value.map(p => p.id)
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const batchAction = async (type: string) => {
  const selectedPayments = props.payments.filter(p => selectedIds.value.includes(p.id))
  
  if (type === 'whatsapp-api') {
    selectedPaymentsForBatch.value = selectedPayments
    isBatchMsgModalOpen.value = true
  } else if (type === 'auto-billing-on') {
    emit('batch-autobilling', selectedPayments)
  } else if (type === 'auto-billing-off') {
    if (!confirm(`Deseja desativar a cobrança automática para as ${selectedIds.value.length} empresas selecionadas?`)) return
    for (const p of selectedPayments) {
      emit('toggle-autobilling', p)
    }
    selectedIds.value = []
  }
}

const addTagToBatch = async (tagName: string) => {
  const selectedPayments = props.payments.filter(p => selectedIds.value.includes(p.id))
  if (selectedPayments.length === 0) return

  if (!confirm(`Deseja adicionar a tag "${tagName}" para as ${selectedPayments.length} empresas selecionadas?`)) return

  for (const p of selectedPayments) {
    const currentTags = [...(p.tags || [])]
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName)
      emit('update-company-tags', { companyId: p.company_id, tags: currentTags })
    }
  }

  isBatchTagPickerOpen.value = false
  selectedIds.value = []
}

const availableTagsForPayment = (payment: any) => {
  return tagDefinitions.value.filter(t => !payment.tags?.includes(t.name))
}

const addTag = (payment: any, tagName: string) => {
  const currentTags = [...(payment.tags || [])]
  if (!currentTags.includes(tagName)) {
    currentTags.push(tagName)
    emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
  }
  activeTagPicker.value = null
}

const removeTag = (payment: any, tagName: string) => {
  if (!confirm(`Deseja remover a tag "${tagName}"?`)) return
  const currentTags = (payment.tags || []).filter((t: string) => t !== tagName)
  emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
}

const filterOptions = [
  { id: 'Todos', label: 'Todos', description: 'Mostra todas as cobranças sem nenhum filtro aplicado.' },
  { id: 'Hoje', label: 'Hoje', description: 'Cobranças que vencem hoje (exclui as já pagas).' },
  { id: 'Crítico', label: 'Crítico (>7d)', description: 'Cobranças atrasadas há mais de uma semana.' },
  { id: 'Sem-WA', label: 'Sem WA', description: 'Empresas que não possuem WhatsApp cadastrado.' },
  { id: 'Pendente', label: 'Pendentes', description: 'Cobranças agendadas que ainda não venceram.' },
  { id: 'Atrasado', label: 'Atrasados', description: 'Todas as cobranças com vencimento ultrapassado.' },
  { id: 'Semana', label: 'Semana', description: 'Todas as cobranças que vencem na semana corrente.' },
  { id: 'Pago', label: 'Pagos', description: 'Histórico completo de cobranças já liquidadas.' }
]

const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index === -1) {
    selectedTags.value.push(tagName)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const toggleAllTags = () => {
  if (selectedTags.value.length === tagDefinitions.value.length) {
    selectedTags.value = []
  } else {
    selectedTags.value = tagDefinitions.value.map(t => t.name)
  }
}

const filteredPayments = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (6 - now.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)

  return props.payments.filter(p => {
    // Filtro por Status
    let matchesStatus = false
    if (activeFilter.value === 'Todos') {
      matchesStatus = true
    } else if (activeFilter.value === 'Hoje') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        matchesStatus = dueDate.toDateString() === now.toDateString() && p.status !== 'Pago'
      }
    } else if (activeFilter.value === 'Crítico') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        const diffTime = now.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        matchesStatus = p.status === 'Atrasado' && diffDays > 7
      }
    } else if (activeFilter.value === 'Sem-WA') {
      matchesStatus = !p.company_whatsapp || p.company_whatsapp.trim() === ''
    } else if (activeFilter.value === 'Semana') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        matchesStatus = dueDate >= startOfWeek && dueDate <= endOfWeek
      }
    } else {
      matchesStatus = p.status === activeFilter.value
    }
    
    // Filtro por Multi-Tags (Se houver tags selecionadas, o registro deve ter PELO MENOS UMA delas)
    const matchesTag = selectedTags.value.length === 0 || 
                       (p.tags && p.tags.some((t: string) => selectedTags.value.includes(t)))
    
    return matchesStatus && matchesTag
  })
})

onMounted(() => {
  fetchTags()
})

const getTagStyle = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  if (def) {
    return {
      backgroundColor: `${def.color}15`,
      color: def.color,
      borderColor: `${def.color}30`
    }
  }
  return {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    color: '#3B82F6',
    borderColor: 'rgba(59, 130, 246, 0.1)'
  }
}

const getTagDescription = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  return def?.description || ''
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const safeDate = date.includes('T') ? date : `${date}T12:00:00`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(safeDate))
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500 ring-emerald-500/10'
    case 'pendente': return 'bg-amber-500 ring-amber-500/10'
    case 'atrasado': return 'bg-red-500 ring-red-500/10'
    default: return 'bg-slate-500 ring-slate-500/10'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'text-emerald-500'
    case 'pendente': return 'text-amber-500'
    case 'atrasado': return 'text-red-500'
    default: return 'text-white/40'
  }
}

const getStatusHex = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return '#10b981'
    case 'pendente': return '#f59e0b'
    case 'atrasado': return '#ef4444'
    default: return '#64748b'
  }
}

const openMsgModal = (payment: any) => {
  if (!payment.company_whatsapp) {
    alert('Empresa sem WhatsApp cadastrado. Não será possível enviar mensagem.')
    return
  }
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  alert('Mensagem enviada com sucesso!')
}

const handleBatchSent = () => {
  isBatchMsgModalOpen.value = false
  selectedIds.value = []
}

const toggleAutoBilling = (payment: any) => {
  emit('toggle-autobilling', payment)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
