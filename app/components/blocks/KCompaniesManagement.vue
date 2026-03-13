<template>
  <div class="space-y-8 animate-in slide-in-from-bottom duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold text-white tracking-tight uppercase">Base de Clientes</h3>
        <p class="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Gerenciamento de parceiros e faturamento ativo</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="handleBatchImport"
          class="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Importar
        </button>
        <button 
          @click="openAddModal"
          class="px-6 py-3 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Novo Cliente
        </button>
      </div>
    </div>

    <ClientsKClientsTable 
      :companies="companies" 
      @edit="openEditModal" 
      @delete="handleDelete"
      @batch-export-csv="handleBatchExportCSV"
      @batch-export-xlsx="handleBatchExportXLSX"
      @batch-import="handleBatchImport"
      @batch-delete="handleBatchDelete"
    />

    <!-- Modal de Cadastro/Edição -->
    <BlocksKCompanyModal 
      :is-open="isModalOpen" 
      :company="selectedCompany"
      :loading="loading"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCompanies } from '~/composables/useCompanies'
import { useToast } from '~/composables/useToast'

const { companies, loading, fetchCompanies, upsertCompany, deleteCompany } = useCompanies()
const { confirm, success } = useToast()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isModalOpen = ref(false)
const selectedCompany = ref<any>(null)

const openAddModal = () => {
  selectedCompany.value = null
  isModalOpen.value = true
}

const openEditModal = (company: any) => {
  selectedCompany.value = { ...company }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCompany.value = null
}

const handleSave = async (formData: any) => {
  const result = await upsertCompany(formData)
  if (result.success) {
    closeModal()
    // Recarregar imediatamente após salvar
    await fetchCompanies()
  } else {
    alert('Erro ao salvar empresa: ' + result.error)
  }
}

const handleDelete = async (id: string) => {
  const confirmed = await confirm('Tem certeza que deseja excluir esta empresa? Todos os dados vinculados serão perdidos.', 'Excluir empresa')
  if (confirmed) {
    const result = await deleteCompany(id)
    if (!result.success) {
      alert('Erro ao excluir empresa: ' + result.error)
    } else {
      // Recarregar imediatamente após deletar
      await fetchCompanies()
    }
  }
}

const handleBatchExportCSV = async (ids: string[]) => {
  const selectedCompanies = companies.value.filter(c => ids.includes(c.id))
  exportToCSV(selectedCompanies)
  success('Exportado com sucesso', `${selectedCompanies.length} contato(s) exportado(s) em CSV`)
}

const handleBatchExportXLSX = async (ids: string[]) => {
  const selectedCompanies = companies.value.filter(c => ids.includes(c.id))
  exportToXLSX(selectedCompanies)
  success('Exportado com sucesso', `${selectedCompanies.length} contato(s) exportado(s) em XLSX`)
}

const handleBatchImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv,.xlsx,.xls'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      const imported = await importFromFile(file)
      if (imported.length > 0) {
        // Validar que todos têm WhatsApp
        const validCompanies = imported.filter(c => c.whatsapp && c.whatsapp.trim())
        
        if (validCompanies.length === 0) {
          alert('Nenhum contato com WhatsApp válido para importar')
          return
        }
        
        if (validCompanies.length < imported.length) {
          alert(`${imported.length - validCompanies.length} contato(s) ignorado(s) por falta de WhatsApp`)
        }
        
        // Importar em massa
        await importCompaniesInBatch(validCompanies)
        await fetchCompanies()
        success('Importado com sucesso', `${validCompanies.length} contato(s) importado(s)`)
      }
    } catch (err: any) {
      alert('Erro ao importar: ' + err.message)
    }
  }
  input.click()
}

const handleBatchDelete = async (ids: string[]) => {
  const confirmed = await confirm(`Tem certeza que deseja excluir ${ids.length} empresa(s)? Todos os dados vinculados serão perdidos.`, 'Excluir empresas')
  if (confirmed) {
    try {
      // Deletar em massa
      await deleteBatchCompanies(ids)
      await fetchCompanies()
      success('Deletado com sucesso', `${ids.length} empresa(s) deletada(s)`)
    } catch (err: any) {
      alert('Erro ao deletar: ' + err.message)
    }
  }
}

// Funções de exportação/importação
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  // Remove caracteres especiais
  let cleaned = phone.replace(/\D/g, '')
  
  // Se não começa com 55, adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  
  return cleaned
}

const exportToCSV = (companies: any[]) => {
  // Filtrar apenas contatos com WhatsApp
  const companiesWithPhone = companies.filter(c => c.whatsapp || c.phone)
  
  if (companiesWithPhone.length === 0) {
    alert('Nenhum contato com número de WhatsApp para exportar')
    return
  }
  
  const headers = ['name', 'number', 'email', 'tags']
  const rows = companiesWithPhone.map(c => [
    c.representative_name || c.name || '',
    formatPhoneNumber(c.whatsapp || c.phone || ''),
    c.email || '',
    (c.tags || []).join(';')
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  downloadFile(csv, `contatos-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

const exportToXLSX = async (companies: any[]) => {
  // Filtrar apenas contatos com WhatsApp
  const companiesWithPhone = companies.filter(c => c.whatsapp || c.phone)
  
  if (companiesWithPhone.length === 0) {
    alert('Nenhum contato com número de WhatsApp para exportar')
    return
  }
  
  // Usar biblioteca XLSX se disponível, caso contrário usar CSV
  try {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(companiesWithPhone.map(c => ({
      name: c.representative_name || c.name || '',
      number: formatPhoneNumber(c.whatsapp || c.phone || ''),
      email: c.email || '',
      tags: (c.tags || []).join(';')
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contatos')
    XLSX.writeFile(wb, `contatos-${new Date().toISOString().split('T')[0]}.xlsx`)
  } catch (err) {
    // Fallback para CSV
    exportToCSV(companiesWithPhone)
  }
}

const importFromFile = async (file: File): Promise<any[]> => {
  const text = await file.text()
  
  if (file.name.endsWith('.csv')) {
    return parseCSV(text)
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    return parseXLSX(file)
  }
  
  throw new Error('Formato de arquivo não suportado')
}

const parseCSV = (text: string): any[] => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
  const companies: any[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const company: any = {}
    
    headers.forEach((header, idx) => {
      const value = values[idx] || ''
      
      if (header === 'número' || header === 'number') {
        company['whatsapp'] = value
      } else if (header === 'nome' || header === 'name') {
        company['representative_name'] = value
        company['name'] = value
      } else if (header === 'email') {
        company['email'] = value
      } else if (header === 'status') {
        company['is_active'] = value.toLowerCase() === 'ativa' || value.toLowerCase() === 'active'
      } else if (header === 'data de criação' || header === 'created_at') {
        company['created_at'] = value
      } else if (header === 'última atualização' || header === 'updated_at') {
        company['updated_at'] = value
      }
    })
    
    if (company.whatsapp) {
      companies.push(company)
    }
  }
  
  return companies
}

const parseXLSX = async (file: File): Promise<any[]> => {
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    return data.map((row: any) => {
      const company: any = {
        representative_name: row['Nome'] || row['name'] || '',
        name: row['Nome'] || row['name'] || '',
        whatsapp: row['Número'] || row['number'] || '',
        email: row['Email'] || row['email'] || '',
        is_active: (row['Status'] || row['status'] || '').toLowerCase() === 'ativa' || (row['Status'] || row['status'] || '').toLowerCase() === 'active'
      }
      
      if (row['Data de Criação'] || row['created_at']) {
        company.created_at = row['Data de Criação'] || row['created_at']
      }
      
      if (row['Última Atualização'] || row['updated_at']) {
        company.updated_at = row['Última Atualização'] || row['updated_at']
      }
      
      return company
    }).filter(c => c.whatsapp)
  } catch (err) {
    throw new Error('Erro ao ler arquivo XLSX')
  }
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const importCompaniesInBatch = async (companies: any[]) => {
  const BATCH_SIZE = 100 // Importar em lotes de 100
  
  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE)
    
    // Preparar dados para insert em massa
    const payload = batch.map(c => ({
      name: c.name || '',
      representative_name: c.representative_name || c.name || '',
      email: c.email || null,
      whatsapp: c.whatsapp,
      phone: c.phone || null,
      tags: c.tags || [],
      is_active: c.is_active !== undefined ? c.is_active : true,
      user_id: user.value?.id,
      document: c.document || null,
      birthday: c.birthday || null,
      segment: c.segment || null,
      sales_rep: c.sales_rep || null,
      website: c.website || null,
      address_zipcode: c.address_zipcode || null,
      address_street: c.address_street || null,
      address_number: c.address_number || null,
      address_complement: c.address_complement || null,
      address_neighborhood: c.address_neighborhood || null,
      address_city: c.address_city || null,
      address_state: c.address_state || null,
      notes: c.notes || null
    }))
    
    // Insert em massa
    const { error } = await supabase.from('companies').insert(payload)
    
    if (error) {
      throw new Error(`Erro ao importar lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
    }
  }
}

const deleteBatchCompanies = async (ids: string[]) => {
  const BATCH_SIZE = 100 // Deletar em lotes de 100
  
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    
    // 1. Deletar pagamentos em massa
    await supabase.from('payments').delete().in('company_id', batch)
    
    // 2. Registrar no histórico em massa
    const historyEntries = batch.map(id => ({
      company_id: id,
      action_type: 'company_deleted',
      description: `Cliente foi excluído`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        deleted_at: new Date().toISOString()
      }
    }))
    
    await supabase.from('payment_history').insert(historyEntries)
    
    // 3. Deletar empresas em massa
    const { error } = await supabase.from('companies').delete().in('id', batch)
    
    if (error) {
      throw new Error(`Erro ao deletar lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
    }
  }
}

onMounted(() => {
  console.log('📱 [KCompaniesManagement] Componente montado')
  console.log('📱 [KCompaniesManagement] Chamando fetchCompanies...')
  fetchCompanies()
  
  // Log periódico para monitorar se os dados desaparecem
  const interval = setInterval(() => {
    console.log('📊 [KCompaniesManagement] Status atual - companies.length:', companies.value?.length || 0)
    if (companies.value && companies.value.length > 0) {
      console.log('  Primeiro:', companies.value[0]?.name)
    }
  }, 5000)
  
  onBeforeUnmount(() => clearInterval(interval))
})
</script>
