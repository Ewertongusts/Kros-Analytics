export const useSaleFormatters = () => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(val)
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  return {
    formatCurrency,
    formatDate
  }
}
