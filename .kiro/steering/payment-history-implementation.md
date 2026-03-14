---
inclusion: manual
---

# Payment History Implementation - Roadmap

## Overview
Complete implementation of payment history feature with proper tracking of recurring and one-time expenses, including filters and comprehensive data display.

## Project Status: IN PROGRESS

---

## Phase 1: Add Due Date Column ⏳ CURRENT
**Goal:** Add due date tracking to expenses and display in history tab

### Tasks:
- [ ] Add `due_date` column to `transactions` table in Supabase
- [ ] Update `Expense` interface to include `due_date`
- [ ] Update expense form to accept due date input
- [ ] Add due date column to payment history table
- [ ] Display due date in history tab

**Files to Modify:**
- `app/composables/useExpenses.ts` - Add due_date to interface and queries
- `app/components/blocks/KExpensesManagement.vue` - Add due_date input and column
- Database migration - Add due_date column

**Status:** Not Started

---

## Phase 2: Create Payment History Table 📋 PENDING
**Goal:** Create dedicated payment_history table to track all payments

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

**Files to Modify:**
- `app/composables/useExpenses.ts` - Add payment recording logic
- Database migration - Create payment_history table

**Status:** Not Started

---

## Phase 3: Add Filters to History Tab 🔍 PENDING
**Goal:** Implement comprehensive filtering for payment history

### Filters to Add:
- [ ] Search by description
- [ ] Filter by category
- [ ] Filter by expense type (Único/Mensal/Trimestral/etc)
- [ ] Filter by date range (start_date, end_date)
- [ ] Filter by payment status (all/pending/paid)

**Files to Modify:**
- `app/components/blocks/KExpensesManagement.vue` - Add filter UI and logic

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
**Goal:** Add summary and analytics to payment history

### Tasks:
- [ ] Add payment summary card (total paid, count, average)
- [ ] Add payment breakdown by category
- [ ] Add date range selector
- [ ] Add export to CSV functionality

**Files to Modify:**
- `app/components/blocks/KExpensesManagement.vue` - Add summary cards

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

## Notes
- Keep reactivity in mind when updating components (use toRef() for props)
- Test each phase before moving to next
- Update this steering file after each phase completion
- Commit changes after each phase

