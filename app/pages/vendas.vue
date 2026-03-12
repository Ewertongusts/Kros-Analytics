<template>
  <LayoutsKPageLayout>
    <!-- Skeleton Loading -->
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Vendas" subtitle="Produtos, Serviços e Projetos Especiais">
        <template #actions>
          <UiKButtonPrimary 
            icon="plus"
            @click="openNewSaleModal"
          >
            Nova Venda
          </UiKButtonPrimary>
          <SalesTableKSaleFilterTabs v-model="activeFilter" />
        </template>
      </BlocksKPageHeader>

        <!-- RESUMO -->
        <SalesTableKSaleSummaryCards :summary="summary" />

        <!-- TABELA -->
        <SalesTableKSaleTable
          :sales="filteredSales"
          @edit="editSale"
          @whatsapp="shareViaWhatsApp"
          @copy="copySaleInfo"
          @delete="deleteSale"
        />

      <BlocksKGlobalFooter />
    </div>

    <!-- Modal de Seleção de Tipo de Venda -->
    <SalesModalKSaleTypeSelector
      :is-open="isSelectTypeModalOpen"
      @close="isSelectTypeModalOpen = false"
      @select="selectSaleType"
    />

    <!-- Modal de Nova Venda -->
    <BlocksKSaleModal
      :is-open="isSaleModalOpen"
      :sale-type="selectedSaleType"
      :sale-data="editingSale"
      @close="closeSaleModal"
      @save="handleSaveSale"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSaleActions } from '~/composables/useSaleActions'

definePageMeta({
  middleware: 'auth'
})

interface Sale {
  id?: number
  [key: string]: any
}

const supabase = useSupabaseClient()
const { shareViaWhatsApp, copySaleInfo } = useSaleActions()
const { success, error, confirm } = useToast()
const loading = ref(false)
const activeFilter = ref('todos')
const searchQuery = ref('')
const statusFilter = ref('todos')
const salesData = ref<Sale[]>([])
const isSelectTypeModalOpen = ref(false)
const isSaleModalOpen = ref(false)
const selectedSaleType = ref('')
const editingSale = ref<Sale | null>(null)

const openNewSaleModal = () => {
  isSelectTypeModalOpen.value = true
}

const selectSaleType = (type: string) => {
  selectedSaleType.value = type
  isSelectTypeModalOpen.value = false
  isSaleModalOpen.value = true
}

const closeSaleModal = () => {
  isSaleModalOpen.value = false
  selectedSaleType.value = ''
  editingSale.value = null
}

const editSale = (sale: any) => {
  console.log('Editando venda:', sale)
  editingSale.value = sale
  selectedSaleType.value = sale.sale_type
  isSaleModalOpen.value = true
}

const deleteSale = async (sale: any) => {
  const confirmed = await confirm(`Tem certeza que deseja deletar a venda de ${sale.representative_name || sale.name}?`, 'Deletar venda')
  if (!confirmed) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', sale.id)
    
    if (error) throw error
    
    await fetchSales()
    success('Venda deletada', 'Operação concluída com sucesso')
  } catch (err) {
    console.error('Erro ao deletar venda:', err)
    error('Erro ao deletar', 'Não foi possível deletar a venda')
  }
}

const handleSaveSale = async (saleData: any) => {
  try {
    console.log('Dados da venda a serem salvos:', saleData)
    console.log('Tipo de venda:', selectedSaleType.value)
    console.log('Editando?', editingSale.value ? 'Sim' : 'Não')
    
    if (editingSale.value) {
      // UPDATE - Editar venda existente
      const updateData = {
        ...saleData,
        sale_type: selectedSaleType.value,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await (supabase.from('companies') as any)
        .update(updateData)
        .eq('id', editingSale.value?.id)
        .select()
      
      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }
      
      console.log('Venda atualizada com sucesso:', data)
      success('Venda atualizada', 'Alterações salvas com sucesso')
    } else {
      // INSERT - Criar nova venda
      const insertData = {
        ...saleData,
        sale_type: selectedSaleType.value,
        is_active: true
      }
      
      const { data, error } = await supabase
        .from('companies')
        .insert(insertData as any)
        .select()
      
      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }
      
      console.log('Venda salva com sucesso:', data)
      success('Venda criada', 'Nova venda registrada com sucesso')
    }
    
    await fetchSales()
    closeSaleModal()
  } catch (err: any) {
    console.error('Erro ao salvar venda:', err)
    error('Erro ao salvar', err.message || 'Não foi possível salvar a venda')
  }
}

const fetchSales = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .in('sale_type', ['produto', 'servico', 'personalizado'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    salesData.value = data || []
  } catch (err) {
    console.error('Erro ao buscar vendas:', err)
  } finally {
    loading.value = false
  }
}

const filteredSales = computed(() => {
  if (activeFilter.value === 'todos') return salesData.value
  return salesData.value.filter((s) => s.sale_type === activeFilter.value)
})

const summary = computed(() => {
  const produtos = salesData.value.filter((s) => s.sale_type === 'produto')
  const servicos = salesData.value.filter((s) => s.sale_type === 'servico')
  const personalizados = salesData.value.filter((s) => s.sale_type === 'personalizado')

  return {
    produtos: {
      count: produtos.length,
      total: produtos.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
    },
    servicos: {
      count: servicos.length,
      total: servicos.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
    },
    personalizados: {
      count: personalizados.length,
      total: personalizados.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
    },
    total: {
      count: salesData.value.length,
      total: salesData.value.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
    }
  }
})

onMounted(async () => {
  await fetchSales()
})
</script>
