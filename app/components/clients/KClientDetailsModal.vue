<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="$emit('close')"></div>

        <!-- Modal Premium -->
        <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[750px] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col">
          
          <!-- Coluna Principal (Conteúdo) -->
          <div class="flex flex-col">
            <!-- Header -->
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white uppercase tracking-tight">{{ company.representative_name || company.name }}</h2>
                <p class="text-xs text-white/50 mt-0.5">{{ company.name }}</p>
              </div>
              <div class="flex items-center gap-3">
                <!-- Botão Exportar PDF -->
                <button
                  @click="exportToPDF"
                  :disabled="loading"
                  class="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-all"
                  title="Exportar relatório em PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 hover:text-white">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="19" x2="12" y2="11"></line>
                    <polyline points="9 14 12 11 15 14"></polyline>
                  </svg>
                </button>
                <!-- Botão Reload -->
                <button
                  @click="refreshData"
                  :disabled="loading"
                  class="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-all"
                  title="Atualizar dados"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 hover:text-white">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                  </svg>
                </button>
                <!-- iOS Toggle Switch para Status -->
                <button
                  @click="$emit('toggle-status')"
                  :class="[
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                    company.is_active ? 'bg-emerald-500' : 'bg-red-500'
                  ]"
                  title="Ativar/Desativar empresa"
                >
                  <span
                    :class="[
                      'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                      company.is_active ? 'translate-x-7' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex items-center gap-0 border-b border-white/10 mb-4 -mx-8 px-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'flex-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 text-center',
                  activeTab === tab.id
                    ? 'text-kros-blue border-kros-blue'
                    : 'text-white/50 border-transparent hover:text-white/70'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Conteúdo -->
            <div class="space-y-1.5">
              <!-- Resumo Tab -->
              <div v-if="activeTab === 'resumo'" class="space-y-2">
                <!-- Informações Básicas -->
                <div class="grid grid-cols-1 gap-2 text-sm">
                  <div v-if="company.whatsapp" class="p-2 bg-white/5 rounded-lg flex items-center justify-between gap-2">
                    <div class="flex-1">
                      <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">WhatsApp</p>
                      <p class="text-white/70 text-xs">{{ company.whatsapp }}</p>
                    </div>
                    <button 
                      @click="openWhatsApp"
                      class="group/whats relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex-shrink-0"
                      title="Abrir WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/whats:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                        <p class="text-[9px] font-bold text-white uppercase tracking-wider">Abrir WhatsApp</p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Vendas & Assinaturas Grid -->
                <div class="pt-2 border-t border-white/10">
                  <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Resumo Financeiro</p>
                  <div class="grid grid-cols-3 gap-2">
                    <!-- Pagos - Produtos -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl hover:border-emerald-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">Produtos</p>
                          <div class="p-1.5 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                            <svg class="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.paidProductValue) }}</p>
                        <p class="text-xs text-emerald-400/60 mt-1">Pagos</p>
                      </div>
                    </div>

                    <!-- Pagos - Serviços -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-blue-400/80 uppercase tracking-widest">Serviços</p>
                          <div class="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                            <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.paidServiceValue) }}</p>
                        <p class="text-xs text-blue-400/60 mt-1">Pagos</p>
                      </div>
                    </div>

                    <!-- Pendentes - Produtos -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl hover:border-amber-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-amber-400/80 uppercase tracking-widest">Produtos</p>
                          <div class="p-1.5 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                            <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.5H7a1 1 0 100 2h4a1 1 0 100-2h-1V7z" clip-rule="evenodd"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.pendingProductValue) }}</p>
                        <p class="text-xs text-amber-400/60 mt-1">Pendentes</p>
                      </div>
                    </div>

                    <!-- Pendentes - Serviços -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent border border-orange-500/30 rounded-xl hover:border-orange-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-orange-400/80 uppercase tracking-widest">Serviços</p>
                          <div class="p-1.5 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                            <svg class="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.pendingServiceValue) }}</p>
                        <p class="text-xs text-orange-400/60 mt-1">Pendentes</p>
                      </div>
                    </div>

                    <!-- Assinaturas Ativas -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-purple-400/80 uppercase tracking-widest">Ativas</p>
                          <div class="p-1.5 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <svg class="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2h1a1 1 0 000-2h-.5A2.5 2.5 0 013 7.5V17a2 2 0 002 2h10a2 2 0 002-2v-9.5A2.5 2.5 0 0012.5 5h-.5a1 1 0 000 2h1a2 2 0 012 2v9a1 1 0 11-2 0V7a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 11-2 0V5z" clip-rule="evenodd"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ clientHistory.stats.activeSubscriptions }}</p>
                        <p class="text-xs text-purple-400/60 mt-1">Assinaturas</p>
                      </div>
                    </div>

                    <!-- LTV Total -->
                    <div class="group relative overflow-hidden p-3 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border border-rose-500/30 rounded-xl hover:border-rose-500/50 transition-all duration-300">
                      <div class="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/5 group-hover:to-rose-500/0 transition-all duration-300"></div>
                      <div class="relative">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-xs font-bold text-rose-400/80 uppercase tracking-widest">LTV</p>
                          <div class="p-1.5 bg-rose-500/20 rounded-lg group-hover:bg-rose-500/30 transition-colors">
                            <svg class="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8.16 2.75a.75.75 0 00-1.32 0l-3.5 9.5A.75.75 0 004.5 13h11a.75.75 0 00.66-1.25l-3.5-9.5z"/><path d="M12.25 15a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
                          </div>
                        </div>
                        <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.subscriptionLTV) }}</p>
                        <p class="text-xs text-rose-400/60 mt-1">Total</p>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <!-- Assinaturas Tab -->
              <div v-if="activeTab === 'assinaturas'" class="space-y-2">
                <div v-if="loading" class="text-center py-3 text-white/50 text-sm">Carregando...</div>
                <div v-else-if="clientHistory.subscriptions?.length > 0" class="space-y-2">
                  <div v-for="sub in clientHistory.subscriptions.slice(0, 10)" :key="sub.id" class="p-3 bg-gradient-to-br from-white/5 to-white/2 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <p class="font-bold text-white text-sm mb-1">{{ sub.plan_name || sub.plan?.name || 'Plano' }}</p>
                        <p class="text-white/70 text-xs">{{ formatCurrency(sub.amount) }}/mês</p>
                      </div>
                    </div>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white/60 uppercase tracking-widest">Status Assinatura</p>
                        <span :class="['px-2 py-1 rounded text-xs font-bold', sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : sub.status === 'paused' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400']">
                          {{ sub.status === 'active' ? 'Ativa' : sub.status === 'paused' ? 'Pausada' : 'Cancelada' }}
                        </span>
                      </div>
                      <div v-if="sub.payment_status" class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white/60 uppercase tracking-widest">Status Pagamento</p>
                        <span :class="['px-2 py-1 rounded text-xs font-bold', sub.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : sub.payment_status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400']">
                          {{ sub.payment_status === 'paid' ? 'Pago' : sub.payment_status === 'pending' ? 'Pendente' : 'Vencido' }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-white/10">
                        <p class="text-xs font-bold text-white/60 uppercase tracking-widest">Próximo Vencimento</p>
                        <p class="text-white text-xs">{{ sub.due_day ? `Dia ${sub.due_day}` : 'Sem data' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-6 text-white/50 text-sm">
                  <p>Nenhuma assinatura</p>
                </div>
              </div>

              <!-- Pagamentos Tab -->
              <div v-if="activeTab === 'pagamentos'" class="space-y-2">
                <div v-if="loading" class="text-center py-3 text-white/50 text-sm">Carregando...</div>
                <div v-else-if="clientHistory.payments?.length > 0" class="space-y-2">
                  <div v-for="payment in clientHistory.payments.slice(0, 10)" :key="payment.id" class="p-3 bg-gradient-to-br from-white/5 to-white/2 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <p class="font-bold text-white text-sm mb-1">{{ payment.plan_name || 'Plano' }}</p>
                        <p class="text-xs text-white/60 uppercase tracking-widest mb-2">Data de Pagamento</p>
                        <p class="text-white text-sm">{{ formatDate(payment.payment_date || payment.created_at) }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-white/60 uppercase tracking-widest mb-2">Valor</p>
                        <p class="font-bold text-emerald-400 text-sm">{{ formatCurrency(payment.amount) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-6 text-white/50 text-sm">
                  <p>Nenhum pagamento registrado</p>
                </div>
              </div>

              <!-- Vendas Tab -->
              <div v-if="activeTab === 'vendas'" class="space-y-3">
                <div v-if="loading" class="text-center py-3 text-white/50 text-sm">Carregando...</div>
                <div v-else class="space-y-3">
                  <!-- Produtos -->
                  <div>
                    <p class="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Produtos</p>
                    <div v-if="paidProducts.length > 0" class="space-y-2">
                      <div v-for="product in paidProducts.slice(0, 5)" :key="product.id" class="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-sm">
                        <div class="flex items-start justify-between mb-1">
                          <p class="font-bold text-white text-sm">{{ product.plan_name || product.custom_name }}</p>
                          <span :class="['px-2 py-0.5 rounded text-xs font-bold', product.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400']">
                            {{ product.payment_status === 'paid' ? 'Pago' : 'Pendente' }}
                          </span>
                        </div>
                        <p class="text-white/70 text-sm">{{ formatCurrency(product.monthly_price) }}</p>
                      </div>
                    </div>
                    <div v-else class="text-center py-2 text-white/50 text-sm">Nenhum produto</div>
                  </div>

                  <!-- Serviços -->
                  <div class="pt-3 border-t border-white/10">
                    <p class="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Serviços</p>
                    <div v-if="paidServices.length > 0" class="space-y-2">
                      <div v-for="service in paidServices.slice(0, 5)" :key="service.id" class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm">
                        <div class="flex items-start justify-between mb-1">
                          <p class="font-bold text-white text-sm">{{ service.plan_name || service.custom_name }}</p>
                          <span :class="['px-2 py-0.5 rounded text-xs font-bold', service.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400']">
                            {{ service.payment_status === 'paid' ? 'Pago' : 'Pendente' }}
                          </span>
                        </div>
                        <p class="text-white/70 text-sm">{{ formatCurrency(service.monthly_price) }}</p>
                      </div>
                    </div>
                    <div v-else class="text-center py-2 text-white/50 text-sm">Nenhum serviço</div>
                  </div>
                </div>
              </div>

              <!-- Contato Tab -->
              <div v-if="activeTab === 'contato'" class="space-y-3">
                <!-- WhatsApp -->
                <div v-if="company.whatsapp" class="p-3 bg-white/5 rounded-lg">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex-1">
                      <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">WhatsApp</p>
                      <p class="text-white/70 text-xs">{{ company.whatsapp }}</p>
                    </div>
                    <button 
                      @click="openWhatsApp"
                      class="group/whats relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex-shrink-0"
                      title="Abrir WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/whats:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                        <p class="text-[9px] font-bold text-white uppercase tracking-wider">Abrir WhatsApp</p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Website -->
                <div v-if="company.website" class="p-3 bg-white/5 rounded-lg">
                  <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Website</p>
                  <a :href="company.website" target="_blank" class="text-kros-blue hover:underline break-all text-xs">{{ company.website }}</a>
                </div>

                <!-- Endereço -->
                <div v-if="company.address_city" class="p-3 bg-white/5 rounded-lg">
                  <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Endereço</p>
                  <div class="text-xs text-white/70 space-y-1">
                    <p v-if="company.address_street">{{ company.address_street }}, {{ company.address_number }}</p>
                    <p v-if="company.address_neighborhood">{{ company.address_neighborhood }}</p>
                    <p v-if="company.address_city">{{ company.address_city }}, {{ company.address_state }}</p>
                  </div>
                </div>

                <!-- Notas -->
                <div v-if="company.notes" class="p-3 bg-white/5 rounded-lg">
                  <p class="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Notas</p>
                  <p class="text-xs text-white/70">{{ company.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-4 pt-3 border-t border-white/10 flex gap-3 justify-end">
            <button 
              @click="$emit('close')"
              class="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all text-white font-bold uppercase tracking-widest text-sm"
            >
              Fechar
            </button>
            <button 
              @click="$emit('edit')"
              class="px-6 py-2.5 bg-kros-blue hover:bg-kros-blue/80 rounded-lg text-white font-bold uppercase tracking-widest text-sm transition-all"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useClientHistory } from '~/composables/useClientHistory'
import { useSaleCrud } from '~/composables/useSaleCrud'

const props = defineProps<{
  isOpen: boolean
  company: any
}>()

const emit = defineEmits<{
  close: []
  edit: []
  'toggle-status': []
  'refresh-sales': []
}>()

const activeTab = ref('resumo')
const { fetchClientHistory, loading } = useClientHistory()
const clientHistory = ref<any>({
  subscriptions: [],
  payments: [],
  paymentHistory: [],
  sales: [],
  allSales: [],
  tasks: [],
  stats: {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    totalPaid: 0,
    totalPending: 0,
    activeTasks: 0,
    totalProductValue: 0,
    totalServiceValue: 0,
    totalPaidSubscriptions: 0,
    subscriptionLTV: 0,
    paidProductValue: 0,
    paidServiceValue: 0,
    pendingProductValue: 0,
    pendingServiceValue: 0
  },
  subscriptionLTV: 0
})

const tabs = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'vendas', label: 'Vendas' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'contato', label: 'Contato' }
]

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const openWhatsApp = () => {
  if (!props.company.whatsapp) {
    alert('WhatsApp não informado para este contato')
    return
  }
  
  const phoneNumber = props.company.whatsapp.replace(/\D/g, '')
  window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank')
}

const paidProducts = computed(() => {
  return clientHistory.value.allSales?.filter((s: any) => s.sale_type === 'produto') || []
})

const paidServices = computed(() => {
  return clientHistory.value.allSales?.filter((s: any) => s.sale_type === 'servico') || []
})

const exportToPDF = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 15
    const lineHeight = 7
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    
    // Cores
    const primaryColor = [0, 123, 255]
    const textColor = [50, 50, 50]
    const lightGray = [200, 200, 200]
    
    // Título
    doc.setFontSize(20)
    doc.setTextColor(...primaryColor)
    doc.text('RELATÓRIO DO CLIENTE', margin, yPosition)
    yPosition += 12
    
    // Informações básicas
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    doc.text(`Nome: ${props.company.representative_name || props.company.name}`, margin, yPosition)
    yPosition += lineHeight
    doc.text(`Empresa: ${props.company.name}`, margin, yPosition)
    yPosition += lineHeight
    doc.text(`Status: ${props.company.is_active ? 'Ativo' : 'Inativo'}`, margin, yPosition)
    yPosition += lineHeight
    
    if (props.company.whatsapp) {
      doc.text(`WhatsApp: ${props.company.whatsapp}`, margin, yPosition)
      yPosition += lineHeight
    }
    
    yPosition += 5
    
    // Resumo Financeiro
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text('RESUMO FINANCEIRO', margin, yPosition)
    yPosition += 8
    
    doc.setFontSize(9)
    doc.setTextColor(...textColor)
    const financialData = [
      ['Produtos Pagos', formatCurrency(clientHistory.value.stats.paidProductValue)],
      ['Serviços Pagos', formatCurrency(clientHistory.value.stats.paidServiceValue)],
      ['Produtos Pendentes', formatCurrency(clientHistory.value.stats.pendingProductValue)],
      ['Serviços Pendentes', formatCurrency(clientHistory.value.stats.pendingServiceValue)],
      ['Assinaturas Ativas', clientHistory.value.stats.activeSubscriptions.toString()],
      ['LTV Total', formatCurrency(clientHistory.value.stats.subscriptionLTV)]
    ]
    
    financialData.forEach(([label, value]) => {
      doc.text(`${label}:`, margin, yPosition)
      doc.text(value, pageWidth - margin - 40, yPosition, { align: 'right' })
      yPosition += lineHeight
    })
    
    yPosition += 5
    
    // Vendas
    if (paidProducts.value.length > 0 || paidServices.value.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text('VENDAS', margin, yPosition)
      yPosition += 8
      
      if (paidProducts.value.length > 0) {
        doc.setFontSize(10)
        doc.setTextColor(...textColor)
        doc.text('Produtos:', margin, yPosition)
        yPosition += 6
        
        paidProducts.value.slice(0, 5).forEach((product: any) => {
          doc.setFontSize(9)
          doc.text(`• ${product.plan_name || product.custom_name}`, margin + 5, yPosition)
          doc.text(formatCurrency(product.monthly_price), pageWidth - margin - 30, yPosition, { align: 'right' })
          yPosition += lineHeight
        })
        
        yPosition += 3
      }
      
      if (paidServices.value.length > 0) {
        doc.setFontSize(10)
        doc.setTextColor(...textColor)
        doc.text('Serviços:', margin, yPosition)
        yPosition += 6
        
        paidServices.value.slice(0, 5).forEach((service: any) => {
          doc.setFontSize(9)
          doc.text(`• ${service.plan_name || service.custom_name}`, margin + 5, yPosition)
          doc.text(formatCurrency(service.monthly_price), pageWidth - margin - 30, yPosition, { align: 'right' })
          yPosition += lineHeight
        })
      }
      
      yPosition += 5
    }
    
    // Assinaturas
    if (clientHistory.value.subscriptions?.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text('ASSINATURAS', margin, yPosition)
      yPosition += 8
      
      clientHistory.value.subscriptions.slice(0, 5).forEach((sub: any) => {
        doc.setFontSize(9)
        doc.setTextColor(...textColor)
        doc.text(`• ${sub.plan?.name || 'Plano'}`, margin, yPosition)
        doc.text(formatCurrency(sub.amount) + '/mês', pageWidth - margin - 30, yPosition, { align: 'right' })
        yPosition += lineHeight
      })
      
      yPosition += 5
    }
    
    // Contato
    if (props.company.website || props.company.address_city || props.company.notes) {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.text('INFORMAÇÕES DE CONTATO', margin, yPosition)
      yPosition += 8
      
      doc.setFontSize(9)
      doc.setTextColor(...textColor)
      
      if (props.company.website) {
        doc.text(`Website: ${props.company.website}`, margin, yPosition)
        yPosition += lineHeight
      }
      
      if (props.company.address_city) {
        doc.text('Endereço:', margin, yPosition)
        yPosition += lineHeight
        if (props.company.address_street) {
          doc.text(`${props.company.address_street}, ${props.company.address_number}`, margin + 5, yPosition)
          yPosition += lineHeight
        }
        if (props.company.address_neighborhood) {
          doc.text(props.company.address_neighborhood, margin + 5, yPosition)
          yPosition += lineHeight
        }
        doc.text(`${props.company.address_city}, ${props.company.address_state}`, margin + 5, yPosition)
        yPosition += lineHeight
      }
      
      if (props.company.notes) {
        yPosition += 2
        doc.text('Notas:', margin, yPosition)
        yPosition += lineHeight
        const noteLines = doc.splitTextToSize(props.company.notes, contentWidth - 5)
        noteLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPosition)
          yPosition += lineHeight
        })
      }
    }
    
    // Rodapé
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, pageHeight - 10)
    
    // Salvar
    doc.save(`relatorio_${props.company.name.replace(/\s+/g, '_')}.pdf`)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF')
  }
}

const refreshData = async () => {
  if (props.company?.id) {
    console.log('🔄 [KClientDetailsModal] Iniciando refresh de dados...')
    
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
      
      const pendingSales = clientHistory.value.allSales?.filter((s: any) => s.payment_status === 'pending') || []
      
      if (pendingSales.length > 0) {
        console.log(`📝 [KClientDetailsModal] Encontradas ${pendingSales.length} vendas pendentes para atualizar`)
        
        const { updateSaleStatus } = useSaleCrud()
        
        for (const sale of pendingSales) {
          console.log(`💾 [KClientDetailsModal] Atualizando venda ${sale.id} para "paid"`)
          await updateSaleStatus(sale.id, 'paid')
        }
      }
      
      console.log('✅ [KClientDetailsModal] Dados atualizados, emitindo evento refresh-sales')
      emit('refresh-sales')
    }
  }
}

onMounted(async () => {
  if (props.isOpen && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
    }
  }
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
    }
  }
}, { immediate: true })

watch(() => props.company?.id, async (newId) => {
  if (newId && props.isOpen) {
    const result = await fetchClientHistory(newId)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
    }
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
</style>
