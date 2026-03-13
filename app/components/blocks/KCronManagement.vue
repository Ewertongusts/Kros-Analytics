<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">Automação de Mensagens (CRON)</h2>
        <p class="text-sm text-white/50 mt-1">Gerencie horários e segmentação de envios automáticos</p>
      </div>
      <button
        @click="refreshData"
        :disabled="loading"
        class="px-4 py-2 bg-kros-blue hover:bg-kros-blue/80 rounded-lg text-white text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
      >
        Atualizar
      </button>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-4 gap-4">
      <div class="p-4 bg-white/5 rounded-lg border border-white/10">
        <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Execuções</p>
        <p class="text-2xl font-bold text-white">{{ cronStats.totalExecutions }}</p>
      </div>
      <div class="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
        <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Enviadas</p>
        <p class="text-2xl font-bold text-white">{{ cronStats.totalSent }}</p>
      </div>
      <div class="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
        <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Falhadas</p>
        <p class="text-2xl font-bold text-white">{{ cronStats.totalFailed }}</p>
      </div>
      <div class="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Taxa de Sucesso</p>
        <p class="text-2xl font-bold text-white">{{ cronStats.successRate }}%</p>
      </div>
    </div>

    <!-- Configurações de Horários -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-white">Horários de Envio</h3>

      <div v-if="loading" class="text-center py-8 text-white/50">
        <p>Carregando configurações...</p>
      </div>

      <div v-else class="space-y-3">
        <!-- Morning Reminder -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Lembrete Matinal</h4>
              <p class="text-xs text-white/50 mt-1">Pagamentos vencendo HOJE</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-kros-blue">09:00</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked @change="toggleSchedule('morning-reminder', $event)">
                <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kros-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kros-blue"></div>
              </label>
            </div>
          </div>
          <p class="text-xs text-white/70 mb-3">Envia lembretes para pagamentos vencendo hoje</p>
          <button
            @click="executeSchedule('morning-reminder')"
            :disabled="loading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Executar Agora
          </button>
        </div>

        <!-- Afternoon Warning -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Aviso Intermediário</h4>
              <p class="text-xs text-white/50 mt-1">Pagamentos vencendo em 1-3 dias</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-kros-blue">14:00</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked @change="toggleSchedule('afternoon-warning', $event)">
                <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kros-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kros-blue"></div>
              </label>
            </div>
          </div>
          <p class="text-xs text-white/70 mb-3">Envia avisos para pagamentos próximos</p>
          <button
            @click="executeSchedule('afternoon-warning')"
            :disabled="loading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Executar Agora
          </button>
        </div>

        <!-- Evening Urgent -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Aviso Urgente</h4>
              <p class="text-xs text-white/50 mt-1">Pagamentos vencendo amanhã</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-kros-blue">18:00</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked @change="toggleSchedule('evening-urgent', $event)">
                <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kros-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kros-blue"></div>
              </label>
            </div>
          </div>
          <p class="text-xs text-white/70 mb-3">Envia avisos urgentes para pagamentos vencendo amanhã</p>
          <button
            @click="executeSchedule('evening-urgent')"
            :disabled="loading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Executar Agora
          </button>
        </div>

        <!-- Overdue Collection -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Cobrança de Atraso</h4>
              <p class="text-xs text-white/50 mt-1">Pagamentos atrasados 1-7 dias</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-kros-blue">10:00</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked @change="toggleSchedule('overdue-collection', $event)">
                <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kros-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kros-blue"></div>
              </label>
            </div>
          </div>
          <p class="text-xs text-white/70 mb-3">Envia cobranças para pagamentos atrasados</p>
          <button
            @click="executeSchedule('overdue-collection')"
            :disabled="loading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Executar Agora
          </button>
        </div>

        <!-- Severe Overdue -->
        <div class="p-4 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Cobrança Severa</h4>
              <p class="text-xs text-white/50 mt-1">Pagamentos atrasados 7+ dias</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-kros-blue">11:00</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked @change="toggleSchedule('severe-overdue', $event)">
                <div class="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kros-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kros-blue"></div>
              </label>
            </div>
          </div>
          <p class="text-xs text-white/70 mb-3">Envia cobranças severas para pagamentos muito atrasados</p>
          <button
            @click="executeSchedule('severe-overdue')"
            :disabled="loading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Executar Agora
          </button>
        </div>
      </div>
    </div>

    <!-- Últimas Execuções -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-white">Últimas Execuções</h3>

      <div v-if="cronReports.length === 0" class="text-center py-8 text-white/50">
        <p>Nenhuma execução registrada</p>
      </div>

      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <div v-for="report in cronReports.slice(0, 10)" :key="report.id" class="p-3 bg-white/5 rounded-lg border border-white/10">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-bold text-white">{{ report.schedule_name }}</p>
              <p class="text-xs text-white/50">{{ formatDate(report.created_at) }}</p>
            </div>
            <span :class="['px-2 py-1 rounded text-[9px] font-bold uppercase', report.sent_count > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white/50']">
              {{ report.sent_count }} enviadas
            </span>
          </div>
          <div class="grid grid-cols-4 gap-2 text-[10px]">
            <div>
              <p class="text-white/50">Processadas</p>
              <p class="text-white font-bold">{{ report.processed_count }}</p>
            </div>
            <div>
              <p class="text-white/50">Falhadas</p>
              <p class="text-white font-bold">{{ report.failed_count }}</p>
            </div>
            <div>
              <p class="text-white/50">Puladas</p>
              <p class="text-white font-bold">{{ report.skipped_count }}</p>
            </div>
            <div>
              <p class="text-white/50">Tempo</p>
              <p class="text-white font-bold">{{ formatExecutionTime(report.execution_time_ms) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCronManagement } from '~/composables/useCronManagement'
import { useToast } from '~/composables/useToast'

const { loading, cronReports, cronStats, fetchCronReports, executeCronManually, formatExecutionTime } = useCronManagement()
const { success, error } = useToast()

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const refreshData = async () => {
  await fetchCronReports()
  success('Dados atualizados', 'Relatórios recarregados com sucesso')
}

const executeSchedule = async (scheduleId: string) => {
  const result = await executeCronManually(scheduleId)
  if (result) {
    success('CRON executado', `${result.sent_count} mensagens enviadas`)
  } else {
    error('Erro ao executar', 'Não foi possível executar o CRON')
  }
}

const toggleSchedule = (scheduleId: string, event: any) => {
  const enabled = event.target.checked
  console.log(`Schedule ${scheduleId} ${enabled ? 'ativado' : 'desativado'}`)
  // TODO: Implementar atualização no banco
}

onMounted(() => {
  fetchCronReports()
})
</script>
