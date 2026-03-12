<template>
  <div v-if="isOpen" :class="[
    'fixed z-[200] transition-all duration-500 ease-in-out',
    isMinimized 
      ? 'bottom-8 right-8 w-80 pointer-events-none' 
      : 'inset-0 flex items-center justify-center px-4 pointer-events-auto'
  ]">
    <!-- Overlay só aparece se NÃO estiver minimizado -->
    <div 
      v-if="!isMinimized"
      @click="!submitting ? $emit('close') : isMinimized = true" 
      class="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-500"
    ></div>
    
      <div :class="[
        'relative bg-[#0D0D0E] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] transition-all duration-500 pointer-events-auto flex flex-col',
        isMinimized ? 'rounded-3xl p-5 w-full shadow-2xl h-auto' : 'rounded-[2rem] w-full max-w-xl max-h-[85vh]'
      ]">
        
         <!-- Widget Minimizado (Visual Premium) -->
         <div v-if="isMinimized" class="flex flex-col gap-4">
            <!-- Top: Info + Expand -->
            <div class="flex items-center justify-between">
               <div class="flex items-center gap-3">
                  <!-- Circular Progress SVG -->
                  <div class="relative w-10 h-10 shrink-0">
                     <svg class="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="3" fill="transparent" class="text-white/5" />
                        <circle 
                           cx="20" cy="20" r="18" 
                           stroke="currentColor" 
                           stroke-width="3" 
                           fill="transparent" 
                           :stroke-dasharray="113" 
                           :stroke-dashoffset="113 - (113 * (progress / payments.length))" 
                           class="text-kros-blue transition-all duration-500" 
                        />
                     </svg>
                     <div class="absolute inset-0 flex items-center justify-center text-kros-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                     </div>
                  </div>
                  <div>
                     <p class="text-[11px] font-black text-white uppercase tracking-wider leading-none">Campanha Ativa</p>
                     <p class="text-[10px] text-white/40 font-bold mt-1">{{ progress }} de {{ payments.length }} concluídos</p>
                  </div>
               </div>

               <button @click="isMinimized = false" class="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
               </button>
            </div>

            <!-- Bottom: Anti-Ban status (Compacto) -->
            <Transition name="fade">
               <div v-if="countdown > 0" class="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div class="flex items-center gap-2">
                     <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span class="text-[9px] font-black text-emerald-500 uppercase">Proteção Ativa</span>
                  </div>
                  <span class="text-[10px] font-black text-white tabular-nums">{{ countdown }}s</span>
               </div>
               <div v-else class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-kros-blue transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :style="{ width: (progress / payments.length) * 100 + '%' }"></div>
               </div>
            </Transition>
         </div>

        <!-- Header Full -->
        <div v-if="!isMinimized" class="p-6 pb-2 text-center relative z-10 border-b border-white/5 bg-black/10">
          <button 
            v-if="submitting"
            @click="isMinimized = true"
            class="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-all transition-colors"
            title="Minimizar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v5H3"/><path d="M21 8h-5V3"/><path d="M3 16h5v5"/><path d="M16 21v-5h5"/></svg>
          </button>

          <div class="flex items-center justify-center gap-3">
             <div class="w-10 h-10 bg-kros-blue/10 rounded-xl flex items-center justify-center text-kros-blue border border-kros-blue/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
             </div>
             <div class="text-left leading-tight">
                <h3 class="text-lg font-black italic uppercase tracking-tighter text-white">
                  ENVIAR EM <span class="text-kros-blue">MASSA</span>
                </h3>
                <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ payments.length }} destinatários</p>
             </div>
          </div>
          
          <button @click="showChecklist = !showChecklist" class="mt-4 w-full flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 transition-all">
             <span class="text-[9px] font-black text-white/30 uppercase tracking-widest">Ver Lista de Destinatários</span>
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-300', showChecklist ? 'rotate-180' : '']"><path d="m18 15-6-6-6 6"/></svg>
          </button>
          
          <div v-if="showChecklist" class="mt-2 max-h-32 overflow-y-auto custom-scrollbar bg-black/40 border border-white/5 rounded-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-200">
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
                <div v-else-if="sentStatus[p.id] === 'skipped' || (skipRecent && isWithinSkipLimit(p.id))" class="text-amber-500/50 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
                </div>
                <div v-else class="w-3 h-3 rounded-full border border-white/10 shrink-0"></div>
                <span class="text-[11px] font-bold text-white/70 truncate">{{ p.company_name }}</span>
              </div>
              <span class="text-[10px] font-semibold text-white/20">{{ p.company_whatsapp }}</span>
            </div>
          </div>
        </div>

      <!-- Main Content (Scrollable) -->
      <div v-if="!isMinimized" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
        <div v-if="loading" class="flex justify-center py-10 opacity-30">
           <svg class="animate-spin text-kros-blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>

        <div v-else class="space-y-6">
          <!-- Modelos e Edição -->
          <template v-if="!submitting">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1 flex justify-between items-center">
                <span>Modelos Ativos</span>
                <span v-if="selectedTemplateIds.length > 1" class="text-emerald-500 animate-pulse">ROTAÇÃO ATIVA</span>
              </label>
              
              <div class="flex flex-wrap gap-2 items-center">
                 <!-- Selected Tags -->
                 <button 
                  v-for="id in selectedTemplateIds" 
                  :key="id"
                  @click="toggleTemplate(id)"
                  class="px-3 py-1.5 rounded-lg bg-kros-blue text-white border border-white/20 text-[10px] font-black uppercase transition-all shadow-lg hover:scale-95 flex items-center gap-2"
                 >
                    {{ templates.find(t => t.id === id)?.name || 'Modelo' }}
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>

                 <!-- Add Button -->
                 <div class="relative">
                    <button 
                      @click="showTemplatePicker = !showTemplatePicker"
                      class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                      title="Adicionar mais modelos"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-300', showTemplatePicker ? 'rotate-45' : '']"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>

                    <!-- Popover Dropdown -->
                    <div v-if="showTemplatePicker" class="absolute top-full left-0 mt-2 w-56 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[50] p-2 animate-in zoom-in-95 fade-in duration-200 origin-top-left">
                       <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                          <button 
                             v-for="tmpl in templates.filter(t => !selectedTemplateIds.includes(t.id!))"
                             :key="tmpl.id"
                             @click="toggleTemplate(tmpl.id!); showTemplatePicker = false"
                             class="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-tight"
                          >
                             {{ tmpl.name }}
                          </button>
                          <div v-if="templates.filter(t => !selectedTemplateIds.includes(t.id!)).length === 0" class="p-3 text-center opacity-30 text-[9px] font-bold uppercase italic">
                             Todos selecionados
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Editor de Mensagem</label>
                <textarea 
                  v-model="manualMessage"
                  rows="4"
                  placeholder="Selecione um modelo acima..."
                  class="w-full rounded-xl p-4 text-[13px] leading-relaxed font-medium outline-none transition-all resize-none focus:ring-1 focus:ring-kros-blue/40"
                  style="background:#141416; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.07); caret-color: white;"
                ></textarea>
            </div>

            <div :class="['rounded-xl border transition-all duration-300', skipRecent ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/[0.02] border-white/5']">
               <!-- Top Row -->
               <div class="flex items-center justify-between p-4">
                  <div class="flex items-center gap-3">
                     <!-- Icon -->
                     <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors', skipRecent ? 'bg-amber-500/10' : 'bg-white/5']">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="skipRecent ? '#f59e0b' : 'rgba(255,255,255,0.2)'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                     </div>
                     <!-- Title + subtitle -->
                     <div>
                        <p :class="['text-[11px] font-black uppercase tracking-widest leading-none', skipRecent ? 'text-amber-400' : 'text-white/40']">Pular Recentes</p>
                        <p class="text-[9px] text-white/20 font-medium mt-0.5">Proteção anti-spam de envio</p>
                     </div>
                  </div>

                  <!-- Controls -->
                  <div class="flex items-center gap-3">
                     <Transition name="slide-x">
                        <div v-if="skipRecent" class="flex items-center gap-1.5 bg-black/50 pl-3 pr-2 py-1.5 rounded-lg border border-amber-500/20">
                           <input
                              v-model.number="skipRecentDays"
                              type="number"
                              min="1"
                              class="w-5 bg-transparent text-xs font-black text-amber-400 outline-none text-center"
                           >
                           <span class="text-[9px] font-bold text-amber-500/50 uppercase">dias</span>
                        </div>
                     </Transition>
                     <label class="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" v-model="skipRecent" class="sr-only peer">
                       <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/30 peer-checked:after:bg-amber-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500/20 border border-white/5 peer-checked:border-amber-500/30"></div>
                     </label>
                  </div>
               </div>

               <!-- Description Bar -->
               <div :class="['px-4 pb-4 transition-all']">
                  <div :class="['rounded-lg px-3 py-2 text-[10px] leading-relaxed border', skipRecent ? 'bg-amber-500/5 border-amber-500/10 text-amber-200/60' : 'bg-white/[0.02] border-white/5 text-white/20']">
                     <template v-if="skipRecent">
                        Contatos que receberam cobrança nos últimos
                        <strong class="text-amber-400">{{ skipRecentDays }} {{ skipRecentDays === 1 ? 'dia' : 'dias' }}</strong>
                        serão pulados. Altere o número de dias conforme sua política de cobrança.
                     </template>
                     <template v-else>
                        <strong class="text-white/30">Filtro inativo.</strong>
                        Todos os contatos receberão mensagem independente de cobranças anteriores.
                     </template>
                  </div>
               </div>
            </div>


          </template>

          <!-- Progress -->
          <div v-if="progress > 0" class="space-y-4 pt-2">
             <div class="space-y-2">
                <div class="flex justify-between items-baseline px-1">
                   <span class="text-[10px] font-black text-white/30 uppercase">Status do Envio</span>
                   <span class="text-xs font-black text-kros-blue">{{ Math.round((progress / payments.length) * 100) }}%</span>
                </div>
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div class="h-full bg-kros-blue transition-all duration-300" :style="{ width: (progress / payments.length) * 100 + '%' }"></div>
                </div>
             </div>
             <div v-if="countdown > 0" class="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between">
                <p class="text-[9px] font-black text-emerald-500 uppercase">Resfriamento Anti-Ban</p>
                <span class="text-xs font-black text-white tabular-nums">{{ countdown }}s</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Action Footer (Fixed) -->
      <div v-if="!isMinimized" class="p-6 border-t border-white/5 bg-black/40">
        <div class="flex gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
          >
            Sair
          </button>
          <button 
            v-if="!submitting"
            @click="handleSendBatch"
            :disabled="selectedTemplateIds.length === 0 || !settings?.api_url"
            class="flex-[2] btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
          >
            DISPARAR AGORA
          </button>
          <button 
            v-else
            @click="isMinimized = true"
            class="flex-[2] bg-white/5 py-4 rounded-xl text-xs font-black uppercase text-white/40 hover:text-white transition-all"
          >
            MINIMIZAR
          </button>
        </div>
      </div>

      <!-- Glow (Full only) -->
      <div v-if="!isMinimized" class="absolute -top-20 -left-20 w-48 h-48 bg-kros-blue/10 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCrm } from '~/composables/useCrm'

const props = defineProps<{
  isOpen: boolean
  payments: any[]
}>()

const emit = defineEmits(['close', 'sent'])

const { settings, templates, loading, fetchCrmData } = useCrm()
const submitting = ref(false)
const isMinimized = ref(false)
const showChecklist = ref(false)
const progress = ref(0)
const countdown = ref(0)
const currentCompanyName = ref('')
const errors = ref<{company: string, error: string}[]>([])
const selectedTemplateIds = ref<string[]>([])
const manualMessage = ref('')
const sentStatus = ref<Record<string, 'pending' | 'sending' | 'success' | 'error' | 'skipped'>>({})
const lastSentRecords = ref<Record<string, any>>({})
const skipRecent = ref(true)
const skipRecentDays = ref(3)
const showTemplatePicker = ref(false)

const isWithinSkipLimit = (paymentId: string) => {
   const record = lastSentRecords.value[paymentId]
   if (!record) return false
   
   const lastDate = new Date(record.created_at)
   const now = new Date()
   const diffTime = Math.abs(now.getTime() - lastDate.getTime())
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
   
   return diffDays <= skipRecentDays.value
}

const fetchBatchLastSent = async () => {
   if (props.payments.length === 0) return
   const supabase = useSupabaseClient()
   
   for (const p of props.payments) {
      try {
         const { data } = await (supabase as any)
            .from('message_logs')
            .select('created_at')
            .eq('company_name', p.company_name)
            .or('status.ilike.%Sucesso%,status.ilike.%Enviado%')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
         
         if (data) lastSentRecords.value[p.id] = data
      } catch (e) {}
   }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const compileTemplate = (tmplBody: string, payment: any) => {
  let msg = tmplBody || ''
  msg = msg.replace(/\{\{empresa\}\}/g, payment.company_name)
  msg = msg.replace(/\{\{valor\}\}/g, formatCurrency(payment.amount))
  msg = msg.replace(/\{\{vencimento\}\}/g, formatDate(payment.due_date))
  msg = msg.replace(/\{\{plano\}\}/g, payment.plan_name)
  return msg
}

const toggleTemplate = (id: string | undefined) => {
   if (!id) return
   const tmpl = templates.value.find(t => t.id === id)
   if (tmpl) {
      manualMessage.value = tmpl.body
   }
   
   const idx = selectedTemplateIds.value.indexOf(id)
   if (idx === -1) {
      selectedTemplateIds.value.push(id)
   } else {
      selectedTemplateIds.value.splice(idx, 1)
   }
}

onMounted(async () => {
  await fetchCrmData()
  
  // Seleciona o padrão automaticamente
  if (templates.value && templates.value.length > 0) {
     const defaultTmpl = templates.value.find(t => t.is_default)
     if (defaultTmpl && defaultTmpl.id) {
        selectedTemplateIds.value = [defaultTmpl.id]
        manualMessage.value = defaultTmpl.body
     } else {
        const first = templates.value[0]
        if (first && first.id) {
           selectedTemplateIds.value = [first.id]
           manualMessage.value = first.body
        }
     }
  }

  // Inicializa status
  props.payments.forEach(p => {
    sentStatus.value[p.id] = 'pending'
  })
  fetchBatchLastSent()
})

const handleSendBatch = async () => {
  if (!settings.value?.api_url || selectedTemplateIds.value.length === 0) return
  
  const activeTemplates = templates.value.filter(t => t && t.id && selectedTemplateIds.value.includes(t.id))
  if (activeTemplates.length === 0 && !manualMessage.value) return

  submitting.value = true
  progress.value = 0
  errors.value = []
  countdown.value = 0
  currentCompanyName.value = ''
  
  const supabase = useSupabaseClient()
  let messagesSentInCurrentBatch = 0

  for (let i = 0; i < props.payments.length; i++) {
    const payment = props.payments[i]
    currentCompanyName.value = payment.company_name

    // Check Skip Filter
    if (skipRecent.value && isWithinSkipLimit(payment.id)) {
       sentStatus.value[payment.id] = 'skipped'
       progress.value++
       continue
    }

    sentStatus.value[payment.id] = 'sending'
    
    // Check for Long Break
    const breakAfter = settings.value.break_after || 10
    if (messagesSentInCurrentBatch > 0 && messagesSentInCurrentBatch % breakAfter === 0) {
       const bMin = (settings.value.break_delay_min || 5) * 60
       const bMax = (settings.value.break_delay_max || 10) * 60
       const breakTime = Math.floor(Math.random() * (bMax - bMin + 1)) + bMin
       
       for (let c = breakTime; c > 0; c--) {
          countdown.value = c
          await new Promise(resolve => setTimeout(resolve, 1000))
          if (!props.isOpen) return // Interrompe se fechar
       }
       countdown.value = 0
       messagesSentInCurrentBatch = 0
    }

    let bodyToUse = manualMessage.value
    if (selectedTemplateIds.value.length > 1) {
       const tmpl = activeTemplates[Math.floor(Math.random() * activeTemplates.length)]
       if (tmpl) bodyToUse = tmpl.body
    }
    
    try {
      const rawNum = payment.company_whatsapp?.replace(/\D/g, '') || ''
      
      // Validação: Verificar se tem número válido
      if (!rawNum || rawNum.length < 10) {
        throw new Error('Número de WhatsApp inválido ou não cadastrado')
      }
      
      const compiledMessage = compileTemplate(bodyToUse, payment)
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: rawNum, body: compiledMessage })
      })

      if (!response.ok) {
        throw new Error(await response.text() || 'Erro na resposta da API')
      }

      await (supabase as any).from('message_logs').insert({
         company_name: payment.company_name,
         whatsapp: rawNum,
         message_body: compiledMessage,
         status: 'Sucesso - Batch HTTP',
         is_cron: false,
         payment_id: payment.id
      })

      messagesSentInCurrentBatch++
      sentStatus.value[payment.id] = 'success'

    } catch (err: any) {
      console.error(`Erro ao enviar para ${payment.company_name}:`, err)
      errors.value.push({ company: payment.company_name, error: err.message })
      sentStatus.value[payment.id] = 'error'
      
      await (supabase as any).from('message_logs').insert({
         company_name: payment.company_name,
         whatsapp: payment.company_whatsapp || 'M/A',
         message_body: bodyToUse,
         status: `Falha (Batch HTTP): ${err.message}`,
         is_cron: false,
         payment_id: payment.id
      })
    } finally {
      progress.value++
    }
    
    // Delay randômico entre mensagens (se não for a última)
    if (i < props.payments.length - 1) {
       const dMin = settings.value.delay_min || 15
       const dMax = settings.value.delay_max || 30
       const randomDelay = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin
       
       for (let c = randomDelay; c > 0; c--) {
          countdown.value = c
          await new Promise(resolve => setTimeout(resolve, 1000))
          if (!props.isOpen) return // Parar se fechar
       }
       countdown.value = 0
    }
  }

  submitting.value = false
  isMinimized.value = false // Volta ao modo normal ao acabar
  currentCompanyName.value = ''
  
  if (errors.value.length === 0) {
    alert('Campanha finalizada com sucesso!')
  } else {
    alert(`Campanha finalizada com ${errors.value.length} erros. Verifique os alertas.`)
  }
  emit('sent')
}
</script>

<style scoped>
.text-glow-blue {
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
