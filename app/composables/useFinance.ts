import { ref } from 'vue'

export interface FinancialRecord {
  id: string
  company_id: string
  company_name: string
  plan_name: string
  due_date: string
  amount: number
  status: 'Pago' | 'Pendente' | 'Atrasado'
  company_whatsapp: string
  company_ltv: number
  company_created_at: string
  company_rep: string
  tags: string[]
  auto_billing_enabled: boolean
}

export const useFinance = () => {
  const supabase = useSupabaseClient()
  const { fetchStats } = useAnalytics()
  const loading = ref(false)

  const saveExpense = async (data: any) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          { 
            description: data.description,
            amount: data.amount,
            type: 'expense',
            category: data.category,
            is_recurring: data.is_recurring,
            created_at: new Date(data.date).toISOString()
          }
        ] as any)
      
      if (error) throw error
      await fetchStats()
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao salvar despesa:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const confirmPayment = async (paymentId: string, currentStatus: string, data?: { amount?: number; notes?: string }) => {
    const isPaid = currentStatus === 'Pago'
    loading.value = true
    try {
      const updatePayload: any = {
        status: isPaid ? 'pending' : 'paid',
        paid_at: isPaid ? null : new Date().toISOString()
      }

      // Se estiver marcando como PAGO e houver dados extras (parcial/notas)
      if (!isPaid && data) {
        if (data.amount !== undefined) updatePayload.amount = data.amount
        if (data.notes !== undefined) updatePayload.notes = data.notes
      }

      const { error } = await (supabase.from('payments') as any)
        .update(updatePayload)
        .eq('id', paymentId)

      if (error) throw error
      await fetchStats(true)
      return { success: true, isPaid: !isPaid }
    } catch (err: any) {
      console.error('Erro ao processar pagamento:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const toggleAutoBilling = async (paymentId: string, enabled: boolean, cronMessage?: string) => {
    loading.value = true
    try {
      const updateData: any = { auto_billing_enabled: enabled }
      if (cronMessage !== undefined) {
        updateData.cron_message = cronMessage
      }

      const { error } = await (supabase.from('payments') as any)
        .update(updateData)
        .eq('id', paymentId)

      if (error) throw error
      await fetchStats(true)
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao alternar automação de cobrança:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const processRecords = (paymentsList: any[]): FinancialRecord[] => {
    return paymentsList.map(payment => {
      let currentStatus: 'Pago' | 'Pendente' | 'Atrasado' = payment.status === 'paid' ? 'Pago' : 'Pendente'
      
      if (currentStatus === 'Pendente' && payment.due_date) {
        const dueDate = new Date(payment.due_date + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (dueDate < today) {
          currentStatus = 'Atrasado'
        }
      }

      return {
        id: payment.id,
        company_id: payment.company_id,
        company_name: payment.companies?.name || 'Empresa desconhecida',
        plan_name: payment.plan_name || 'Individual',
        due_date: payment.due_date,
        amount: payment.amount || 0,
        status: currentStatus,
        company_whatsapp: payment.companies?.whatsapp || '',
        company_ltv: payment.company_ltv || 0,
        company_created_at: payment.company_created_at || payment.due_date,
        company_rep: payment.company_rep || '',
        tags: payment.companies?.tags || [],
        auto_billing_enabled: !!payment.auto_billing_enabled
      }
    })
  }

  return {
    loading,
    saveExpense,
    confirmPayment,
    toggleAutoBilling,
    processRecords
  }
}
