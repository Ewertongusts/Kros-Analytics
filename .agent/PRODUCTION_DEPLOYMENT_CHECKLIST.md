# 🚀 Production Deployment Checklist - Expenses Restructure

**Date**: March 14, 2026  
**Status**: READY FOR DEPLOYMENT  
**Estimated Time**: 30-45 minutes

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### Code Changes
- [x] `app/pages/despesas.vue` - Updated with tab-based structure
- [x] All expense components exist and are ready:
  - [x] `KMetricsTab.vue`
  - [x] `KAllOccurrencesTab.vue`
  - [x] `KRecurringExpensesTab.vue`
  - [x] `KUniqueExpensesTab.vue`
  - [x] `KPaymentHistoryTab.vue`
- [x] All composables created:
  - [x] `useExpenses.ts`
  - [x] `useExpenseOccurrences.ts`
  - [x] `usePaymentRecords.ts`
  - [x] `usePaymentHistory.ts`
- [x] No syntax errors in updated files

### Database Scripts Ready
- [x] PHASE 1 SQL (tables + RLS) - `.kiro/DATABASE_MIGRATION_PHASE1.md`
- [x] PHASE 2 SQL (functions + triggers) - `.kiro/DATABASE_MIGRATION_PHASE2.md`

---

## 🔧 DEPLOYMENT STEPS

### STEP 1: Execute SQL Scripts (5-10 minutes)

#### 1.1 Open Supabase SQL Editor
- [ ] Go to your Supabase project
- [ ] Click "SQL Editor"
- [ ] Click "New Query"

#### 1.2 Execute PHASE 1 (Tables & RLS)
- [ ] Open `.kiro/DATABASE_MIGRATION_PHASE1.md`
- [ ] Copy ALL content (Steps 1-3)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify no errors

**Verification Checklist:**
- [ ] Table `expenses` created
- [ ] Table `expense_occurrences` created
- [ ] Table `payment_records` created
- [ ] RLS policies applied to all tables
- [ ] Indices created for performance

#### 1.3 Execute PHASE 2 (Functions & Triggers)
- [ ] Open `.kiro/DATABASE_MIGRATION_PHASE2.md`
- [ ] Copy ALL content (Steps 1-6)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify no errors

**Verification Checklist:**
- [ ] Function `generate_expense_occurrences()` created
- [ ] Function `mark_occurrence_as_paid()` created
- [ ] Function `update_occurrence_status()` created
- [ ] Function `create_next_recurrence()` created
- [ ] Trigger `trigger_expenses_generate_occurrences` created
- [ ] Function `update_overdue_occurrences()` created

#### 1.4 Verify in Supabase Dashboard
- [ ] Go to "Table Editor"
- [ ] Verify 3 tables appear:
  - [ ] `expenses`
  - [ ] `expense_occurrences`
  - [ ] `payment_records`
- [ ] Click each table and verify columns are correct

---

### STEP 2: Verify Code Integration (2-3 minutes)

#### 2.1 Check despesas.vue
- [ ] Open `app/pages/despesas.vue`
- [ ] Verify all imports are present
- [ ] Verify tab structure is correct
- [ ] No syntax errors (should show 0 diagnostics)

#### 2.2 Verify Component Files Exist
- [ ] `app/components/expenses/KMetricsTab.vue` exists
- [ ] `app/components/expenses/KAllOccurrencesTab.vue` exists
- [ ] `app/components/expenses/KRecurringExpensesTab.vue` exists
- [ ] `app/components/expenses/KUniqueExpensesTab.vue` exists
- [ ] `app/components/expenses/KPaymentHistoryTab.vue` exists

#### 2.3 Verify Composables Exist
- [ ] `app/composables/useExpenses.ts` exists
- [ ] `app/composables/useExpenseOccurrences.ts` exists
- [ ] `app/composables/usePaymentRecords.ts` exists
- [ ] `app/composables/usePaymentHistory.ts` exists

---

### STEP 3: Test Functionality (10-15 minutes)

#### 3.1 Open Expenses Page
- [ ] Navigate to `/despesas`
- [ ] Page loads without errors
- [ ] All 5 tabs appear:
  - [ ] Métricas
  - [ ] Todos
  - [ ] Recorrentes
  - [ ] Únicos
  - [ ] Histórico

#### 3.2 Test: Create Recurring Expense
- [ ] Click "Recorrentes" tab
- [ ] Click "Nova Despesa" button
- [ ] Fill form:
  - [ ] Descrição: "Servidor"
  - [ ] Categoria: Select one
  - [ ] Valor: 330.00
  - [ ] Tipo: Recorrente
  - [ ] Frequência: Mensal
  - [ ] Data Início: 01/01/2024
- [ ] Click "Salvar"
- [ ] ✅ Expense appears in table

#### 3.3 Test: Verify Occurrences Generated
- [ ] Click "Todos" tab
- [ ] ✅ Verify 12 occurrences appear (one per month)
- [ ] ✅ Verify sorted by due date

#### 3.4 Test: Mark Occurrence as Paid
- [ ] In "Todos" tab, click check icon (mark as paid)
- [ ] Modal opens for payment registration
- [ ] Fill:
  - [ ] Data: Today
  - [ ] Método: Débito
  - [ ] Notas: Pagamento via débito
- [ ] Click "Confirmar"
- [ ] ✅ Status changes to "Pago"

#### 3.5 Test: View Payment History
- [ ] Click "Histórico" tab
- [ ] ✅ Payment appears in table
- [ ] ✅ Shows: Descrição, Categoria, Valor, Data, Método

#### 3.6 Test: View Metrics
- [ ] Click "Métricas" tab
- [ ] ✅ Cards show:
  - [ ] Total Pago: R$ 330.00
  - [ ] Média: R$ 330.00
  - [ ] Maior: R$ 330.00
  - [ ] Menor: R$ 330.00
- [ ] ✅ Category distribution shows expense

#### 3.7 Test: Create Unique Expense
- [ ] Click "Únicos" tab
- [ ] Click "Nova Despesa"
- [ ] Fill:
  - [ ] Descrição: "Compra Equipamento"
  - [ ] Categoria: Select one
  - [ ] Valor: 5000.00
  - [ ] Tipo: Único
  - [ ] Data: Today
- [ ] Click "Salvar"
- [ ] ✅ Expense appears in table
- [ ] Click "Todos" tab
- [ ] ✅ 1 occurrence created

#### 3.8 Test: Edit Expense
- [ ] Click "Recorrentes" tab
- [ ] Click edit icon
- [ ] Change value from 330.00 to 350.00
- [ ] Click "Salvar"
- [ ] ✅ Expense updated

#### 3.9 Test: Pause Expense
- [ ] Click "Recorrentes" tab
- [ ] Click pause icon
- [ ] ✅ Status changes to "Pausada"
- [ ] ✅ Expense disappears from table

#### 3.10 Test: Filters
- [ ] Click "Todos" tab
- [ ] Test each filter:
  - [ ] Search by description
  - [ ] Filter by category
  - [ ] Filter by status
  - [ ] Filter by month/year
  - [ ] Filter by date range
- [ ] ✅ All filters work correctly

---

### STEP 4: Final Verification (5 minutes)

#### 4.1 Reactivity Check
- [ ] Create expense
- [ ] Data appears in real-time
- [ ] Edit expense
- [ ] Changes appear in real-time
- [ ] Delete expense
- [ ] Data disappears in real-time

#### 4.2 Performance Check
- [ ] Open DevTools Network tab
- [ ] Queries complete in < 1 second
- [ ] No N+1 queries
- [ ] No unnecessary requests

#### 4.3 Security Check
- [ ] Each user sees only their data
- [ ] RLS policies working
- [ ] No access to other users' data

#### 4.4 Responsiveness Check
- [ ] Page works on desktop
- [ ] Page works on tablet
- [ ] Page works on mobile

---

## 📊 DEPLOYMENT SUMMARY

### What Was Deployed
✅ **Database Structure**
- 3 new tables: `expenses`, `expense_occurrences`, `payment_records`
- RLS policies for security
- Indices for performance
- 6 SQL functions for automation
- 1 trigger for automatic occurrence generation

✅ **Frontend Components**
- 5 tab-based components for expense management
- Metrics dashboard
- Payment history tracking
- Advanced filtering
- Recurring expense automation

✅ **Business Logic**
- Automatic occurrence generation (12 months ahead)
- Payment tracking and recording
- Status management (pending/paid/overdue)
- Recurring frequency support (daily/weekly/monthly/quarterly/semiannual/yearly)

### Timeline
- **SQL Execution**: 5-10 minutes
- **Code Integration**: 2-3 minutes
- **Testing**: 10-15 minutes
- **Verification**: 5 minutes
- **Total**: 30-45 minutes

### Success Criteria
- [ ] All SQL scripts executed without errors
- [ ] All components load correctly
- [ ] All 9 test scenarios pass
- [ ] No console errors
- [ ] Data persists after page refresh
- [ ] Performance is acceptable (< 1s queries)
- [ ] Security is maintained (RLS working)

---

## 🚨 TROUBLESHOOTING

### SQL Execution Errors
- Verify you're in Supabase SQL Editor
- Verify you copied ALL content
- Check for special characters
- Try executing one step at a time

### Components Not Loading
- Verify imports are correct
- Verify component files exist
- Check DevTools Console for errors
- Verify file paths are correct

### Data Not Appearing
- Verify tables were created
- Verify user is authenticated
- Check DevTools Console for errors
- Verify RLS policies allow access

### Filters Not Working
- Verify composables return data
- Check DevTools Console for errors
- Verify filter logic is correct

---

## ✅ SIGN-OFF

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  
**Status**: ✅ PRODUCTION READY

---

**Next Steps After Deployment:**
1. Monitor for errors (24 hours)
2. Collect user feedback
3. Optimize based on usage patterns
4. Plan Phase 2 enhancements (exports, notifications, etc.)

