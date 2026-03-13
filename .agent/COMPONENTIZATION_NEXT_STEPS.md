# Componentization Analysis - Next Steps

## Current Status
✅ **assinaturas.vue** - DONE (300 lines, batch operations extracted)

## Pages to Componentize (by priority)

### 1. **vendas.vue** (245 lines) - HIGH PRIORITY
**Logic to extract:**
- Timeline modal logic (`openSalesTimeline`, `timelineHistory`, `timelineLoading`)
- Receipt modal logic (`generateSaleReceipt`, `handleReceiptExport`, `receiptSale`)
- Sale type selector logic (`isSelectTypeModalOpen`, `selectedSaleType`, `selectSaleType`)
- Sale CRUD handlers (`editSale`, `handleSaveSale`, `handleDelete`, `closeSaleModal`)
- Export logic (`handleExport`)
- WhatsApp share wrapper (`handleWhatsAppShare`)

**Suggested composables:**
- `useSaleModals.ts` - Modal state management (timeline, receipt, type selector)
- `useSaleHandlers.ts` - CRUD and action handlers

---

### 2. **ajustes.vue** (155 lines) - MEDIUM PRIORITY
**Logic to extract:**
- Profile save logic (`handleSaveProfile`)
- White Label save logic (`handleSaveWhiteLabel`)
- File upload logic (`handleFileUpload`)
- Tab management (already using tabs, but handlers could be extracted)

**Suggested composables:**
- `useSettingsHandlers.ts` - Profile, white label, and file upload handlers

---

### 3. **tarefas.vue** (132 lines) - MEDIUM PRIORITY
**Logic to extract:**
- Task modal logic (`openTaskModal`, `closeTaskModal`, `selectedTask`)
- Task CRUD handlers (`handleSaveTask`, `moveTask`, `deleteTask`)
- Task filtering (already using computed, but could be in composable)

**Suggested composables:**
- `useTaskHandlers.ts` - Task CRUD and modal management

---

### 4. **despesas.vue** (122 lines) - MEDIUM PRIORITY
**Logic to extract:**
- Auto-billing modal logic (`isAutoBillingModalOpen`, `autoBillingTargetPayment`)
- Logs modal logic (`isLogsModalOpen`, `logsTargetPaymentId`)
- Payment status toggle (`handleTogglePaymentStatus`)
- Auto-billing handlers (`handleToggleAutoBilling`, `handleConfirmAutoBilling`)
- Expense save logic (`handleSaveExpense`)

**Suggested composables:**
- `useExpenseHandlers.ts` - Expense and payment handlers

---

### 5. **calendario.vue** (108 lines) - LOW PRIORITY
**Status:** Mostly placeholder/stub page
**Logic to extract:**
- Same as despesas.vue (appears to be duplicated code)
- Should be refactored to use shared composables

---

## Componentization Strategy

### Phase 1: Extract Modal Management
Create composables for modal state management across pages:
- `useModalState.ts` - Generic modal state management
- `useSaleModals.ts` - Sale-specific modals
- `useExpenseModals.ts` - Expense-specific modals

### Phase 2: Extract CRUD Handlers
Create composables for common CRUD patterns:
- `useSaleHandlers.ts` - Sale CRUD operations
- `useTaskHandlers.ts` - Task CRUD operations
- `useExpenseHandlers.ts` - Expense CRUD operations

### Phase 3: Extract Settings Handlers
- `useSettingsHandlers.ts` - Profile, white label, file uploads

### Phase 4: Consolidate Duplicates
- `calendario.vue` and `despesas.vue` share similar code
- Extract shared logic to `useFinanceHandlers.ts`

---

## Expected Results After Componentization

| Page | Current | After | Reduction |
|------|---------|-------|-----------|
| assinaturas.vue | 600+ | 300 | 50% ✅ |
| vendas.vue | 245 | ~120 | 51% |
| ajustes.vue | 155 | ~80 | 48% |
| tarefas.vue | 132 | ~70 | 47% |
| despesas.vue | 122 | ~60 | 51% |
| calendario.vue | 108 | ~50 | 54% |

**Total reduction: ~400 lines of duplicated/extractable logic**

---

## Benefits
1. **Reusability** - Modal and CRUD logic can be shared across pages
2. **Maintainability** - Easier to update handlers in one place
3. **Testability** - Composables can be unit tested independently
4. **Consistency** - Same patterns across all pages
5. **Reduced page complexity** - Pages focus on layout and data flow
