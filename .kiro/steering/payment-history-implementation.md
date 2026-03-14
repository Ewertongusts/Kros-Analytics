---
inclusion: manual
---

# Payment History Implementation - Roadmap

## Overview
Complete implementation of payment history feature with proper tracking of recurring and one-time expenses, including filters and comprehensive data display.

---

## 🏗️ STACK & ARCHITECTURE GUIDELINES

### Framework & Setup
- **Nuxt 4** with Vue 3 Composition API
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** (PostgreSQL + Auth + RLS policies)

### Componentization Strategy (MANDATORY)
**All new features MUST be componentized. Do NOT add logic directly to pages.**

#### Component Structure:
```
app/components/
├── blocks/              # Large page-level components
│   ├── KExpensesManagement.vue
│   ├── KPaymentHistory.vue (NEW - extract from KExpensesManagement)
│   └── KPaymentHistoryFilters.vue (NEW)
├── finance/
│   ├── payment/         # NEW - Payment history sub-components
│   │   ├── KPaymentHistoryTable.vue
│   │   ├── KPaymentHistorySummary.vue
│   │   └── KPaymentHistoryRow.vue
│   └── ...
├── ui/                  # Generic UI components
│   ├── KModal.vue
│   ├── KButton.vue
│   └── ...
└── ...
```

#### Naming Convention:
- Components start with `K` prefix
- PascalCase: `KPaymentHistoryTable.vue`
- Descriptive names: `KPaymentHistoryFilters.vue` not `KFilters.vue`

#### Composables (Business Logic):
```
app/composables/
├── useExpenses.ts       # Expense CRUD + queries
├── usePaymentHistory.ts (NEW - payment history logic)
└── ...
```

### Key Principles:
1. **Separation of Concerns**: UI in components, logic in composables
2. **Reusability**: Extract common patterns into separate components
3. **Props & Emits**: Pass data down, emit events up
4. **Reactivity**: Use `toRef()` when passing props to composables (see contacts-disappearing-fix.md)
5. **RLS Security**: All queries must respect Row Level Security policies
6. **Type Safety**: Always use TypeScript interfaces

### Component Extraction Rules:
- If a component file exceeds 400 lines, extract sub-components
- If logic is reused in 2+ places, create a composable
- Each component should have a single responsibility
- Props should be typed with interfaces

### Example Pattern:
```typescript
// ✅ CORRECT - Componentized
// KPaymentHistoryTable.vue (presentation)
<template>
  <table>
    <tr v-for="payment in payments">
      <KPaymentHistoryRow :payment="payment" @edit="$emit('edit', $event)" />
    </tr>
  </table>
</template>

// usePaymentHistory.ts (logic)
export const usePaymentHistory = () => {
  const fetchPayments = async () => { ... }
  const filterPayments = (filters) => { ... }
  return { payments, fetchPayments, filterPayments }
}

// ❌ WRONG - Monolithic
// KExpensesManagement.vue (everything mixed)
// - 800+ lines
// - All logic inline
// - Hard to test/reuse
```

## Project Status: IN PROGRESS

---

## Phase 1: Add Due Date Column ✅ COMPLETED
**Goal:** Add due date tracking to expenses and display in history tab

### Tasks:
- [x] Add `due_date` column to `transactions` table in Supabase
- [x] Update `Expense` interface to include `due_date`
- [x] Update expense form to accept due date input
- [x] Add due date column to payment history table
- [x] Display due date in history tab

**Files Modified:**
- `app/composables/useExpenses.ts` - Added due_date to Expense interface and upsertExpense function
- `app/components/blocks/KExpensesManagement.vue` - Added due_date input field and column to payment history table

**Implementation Details:**
- Added `due_date?: string` to Expense interface
- Updated formData to include `due_date` field
- Added "Data de Vencimento" input field in expense form
- Updated payment history table to show:
  - Data de Vencimento (due date)
  - Data de Pagamento (payment date)
  - Tipo (Único/Recorrente)
- Updated editExpense() to load due_date
- Updated resetForm() to reset due_date

**Status:** ✅ COMPLETED

---

## Phase 2: Create Payment History Table 📋 PENDING
**Goal:** Create dedicated payment_history table to track all payments + componentize payment history UI

### Tasks:
- [ ] Create `payment_history` table in Supabase with fields:
  - `id` (UUID, primary key)
  - `expense_id` (FK to transactions)
  - `user_id` (FK to auth.users)
  - `amount` (numeric)
  - `paid_date` (timestamp)
  - `payment_method` (text, optional)
  - `notes` (text, optional)
  - `created_at` (timestamp)
- [ ] Create RLS policies for payment_history
- [ ] Update `useExpenses.ts` to record payments in payment_history
- [ ] Modify `markExpenseAsPaid()` to create payment_history entry
- [ ] **COMPONENTIZE**: Extract payment history UI into separate components:
  - [ ] Create `usePaymentHistory.ts` composable
  - [ ] Create `KPaymentHistoryTable.vue` component
  - [ ] Create `KPaymentHistorySummary.vue` component
  - [ ] Create `KPaymentHistoryRow.vue` component
  - [ ] Create `KPaymentHistoryFilters.vue` component
  - [ ] Update `KExpensesManagement.vue` to use new components

**Files to Create:**
- `app/composables/usePaymentHistory.ts` - Payment history logic
- `app/components/finance/payment/KPaymentHistoryTable.vue`
- `app/components/finance/payment/KPaymentHistorySummary.vue`
- `app/components/finance/payment/KPaymentHistoryRow.vue`
- `app/components/finance/payment/KPaymentHistoryFilters.vue`

**Files to Modify:**
- `app/composables/useExpenses.ts` - Add payment recording logic
- `app/components/blocks/KExpensesManagement.vue` - Use new components
- Database migration - Create payment_history table

**Status:** Not Started

---

## Phase 3: Add Filters to History Tab 🔍 PENDING
**Goal:** Implement comprehensive filtering for payment history + componentize filters

### Filters to Add:
- [ ] Search by description
- [ ] Filter by category
- [ ] Filter by expense type (Único/Mensal/Trimestral/etc)
- [ ] Filter by date range (start_date, end_date)
- [ ] Filter by payment status (all/pending/paid)

### Componentization:
- [ ] Create `KPaymentHistoryFilters.vue` component with all filter inputs
- [ ] Create `usePaymentHistoryFilters.ts` composable for filter logic
- [ ] Emit filter changes from component to parent
- [ ] Use computed properties for filtered results

**Files to Create:**
- `app/components/finance/payment/KPaymentHistoryFilters.vue`
- `app/composables/usePaymentHistoryFilters.ts`

**Files to Modify:**
- `app/components/blocks/KExpensesManagement.vue` - Use KPaymentHistoryFilters
- `app/composables/usePaymentHistory.ts` - Add filter methods

**Status:** Not Started

---

## Phase 4: Recurring Expense Logic 🔄 PENDING
**Goal:** Properly handle recurring expenses in payment history

### Tasks:
- [ ] Add logic to show recurring expenses as paid each month
- [ ] Ensure payment_history shows all monthly occurrences
- [ ] Add "Expense Type" column to distinguish recurring from one-time
- [ ] Implement monthly reset for recurring expenses

**Files to Modify:**
- `app/composables/useExpenses.ts` - Add recurring logic
- `app/components/blocks/KExpensesManagement.vue` - Display type column

**Status:** Not Started

---

## Phase 5: Enhanced Visualization 📊 PENDING
**Goal:** Add summary and analytics to payment history + componentize analytics

### Tasks:
- [ ] Create `KPaymentHistorySummary.vue` component with:
  - Total paid amount
  - Payment count
  - Average payment
  - Breakdown by category
- [ ] Add date range selector component
- [ ] Add export to CSV functionality
- [ ] Create `KPaymentHistoryChart.vue` for visual analytics

**Files to Create:**
- `app/components/finance/payment/KPaymentHistorySummary.vue`
- `app/components/finance/payment/KPaymentHistoryChart.vue`
- `app/components/finance/payment/KPaymentHistoryExport.vue`

**Files to Modify:**
- `app/components/blocks/KExpensesManagement.vue` - Use new components
- `app/composables/usePaymentHistory.ts` - Add summary calculations

**Status:** Not Started

---

## Current Implementation Status

### ✅ Completed:
- Basic payment history tab created
- Tab shows paid expenses
- Edit/Delete actions available

### ⏳ In Progress:
- Phase 1: Due date column

### ❌ Not Started:
- Phase 2: Payment history table
- Phase 3: Filters
- Phase 4: Recurring logic
- Phase 5: Enhanced visualization

---

## Database Schema Changes Needed

```sql
-- Phase 1: Add due_date to transactions
ALTER TABLE transactions ADD COLUMN due_date TIMESTAMP;

-- Phase 2: Create payment_history table
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  paid_date TIMESTAMP NOT NULL DEFAULT NOW(),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RLS Policies for payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment history entries"
  ON payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment history"
  ON payment_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment history"
  ON payment_history FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Componentization Checklist (MANDATORY FOR ALL PHASES)

Before implementing each phase, ensure:

- [ ] **Component Responsibility**: Each component has ONE clear purpose
- [ ] **Props Typed**: All props have TypeScript interfaces
- [ ] **Emits Defined**: All events are properly typed with `defineEmits`
- [ ] **Composable Logic**: Business logic is in composables, NOT in components
- [ ] **Reusability**: Can this component be used in other pages/features?
- [ ] **File Size**: Component file < 400 lines (extract if larger)
- [ ] **Naming**: Component name clearly describes its purpose (K prefix)
- [ ] **Documentation**: Add JSDoc comments for complex logic
- [ ] **Testing**: Component works in isolation with mock data
- [ ] **Reactivity**: Using `toRef()` for props passed to composables

### Component Template:
```typescript
// ✅ CORRECT - Well-structured component
<template>
  <div class="payment-history">
    <KPaymentHistoryFilters 
      :filters="filters"
      @update:filters="handleFilterChange"
    />
    <KPaymentHistorySummary :payments="filteredPayments" />
    <KPaymentHistoryTable 
      :payments="filteredPayments"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaymentHistory } from '~/composables/usePaymentHistory'

interface Props {
  expenseId?: string
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  edit: [payment: Payment]
  delete: [paymentId: string]
}>()

const { payments, loading, fetchPayments } = usePaymentHistory()
const filters = ref({ search: '', category: '', dateRange: null })

const filteredPayments = computed(() => {
  // Filter logic here
})

const handleFilterChange = (newFilters) => {
  filters.value = newFilters
}
</script>
```

---

## Notes
- Keep reactivity in mind when updating components (use toRef() for props)
- Test each phase before moving to next
- Update this steering file after each phase completion
- Commit changes after each phase

