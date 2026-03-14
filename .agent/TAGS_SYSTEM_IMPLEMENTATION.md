# Tags System Implementation - SOLVED

## Overview
Tags system for subscriptions (assinaturas) page. Tags are stored in the `companies` table and displayed in real-time on the collection board.

## Architecture

### Data Flow
```
useSubscriptionsManager.ts (fetches subscriptions + tags from companies)
         ↓
subscriptions.value (ref with tags included)
         ↓
assinaturas.vue (adaptedSubscriptions computed)
         ↓
KSubscriptionsContent.vue (passes financialRecords)
         ↓
KFinanceCollectionBoard.vue (renders table with tags)
         ↓
KFinanceCollectionTableRow.vue (renders each row + tag component)
         ↓
KCollectionRowTags.vue (displays tags as colored circles)
```

## Key Components

### 1. useSubscriptionsManager.ts
- Fetches subscriptions with related companies data
- **IMPORTANT**: Includes `tags` from `companies` table in the select:
```typescript
select: `
  *,
  customer:companies!customer_id(id, name, email, tags, representative_name),
  plan:plans!plan_id(id, name, price, billing_cycle)
`
```
- Maps tags to subscription object: `tags: sub.customer?.tags || []`

### 2. assinaturas.vue (Main Page)
- Receives `subscriptions` from composable
- Creates `adaptedSubscriptions` computed that includes tags
- **CRITICAL**: Has a watcher that forces re-render when tags change:
```typescript
watch(() => subscriptions.value.map(s => s.tags?.length || 0).join(','), () => {
  refreshKey.value++
}, { deep: true })
```
- Handler `handleUpdatePayments` updates tags using `Object.assign`:
```typescript
const handleUpdatePayments = (updatedPayments: any[]) => {
  updatedPayments.forEach(updatedPayment => {
    const sub = subscriptions.value.find(s => s.id === updatedPayment.id)
    if (sub) {
      Object.assign(sub, { tags: updatedPayment.tags })
    }
  })
}
```

### 3. KFinanceCollectionBoard.vue (Table Container)
- Receives `payments` prop (which is `adaptedSubscriptions`)
- Handler `handleUpdateTags` creates new array to force reactivity:
```typescript
const handleUpdateTags = (data: { id: string, tags: string[] }) => {
  const index = props.payments.findIndex(p => p.id === data.id)
  if (index !== -1) {
    const updatedPayment = {
      ...props.payments[index],
      tags: data.tags
    }
    const newPayments = [...props.payments]
    newPayments[index] = updatedPayment
    emit('update-payments', newPayments)
  }
}
```
- Emits `update-payments` event to parent

### 4. KFinanceCollectionTableRow.vue (Table Row)
- Receives `payment` with tags
- Handlers for add/remove tags:
  - `handleRemoveTag`: Updates DB, emits `update-tags`
  - `handleAddTag`: Updates DB, emits `update-tags`
- Both update the `companies` table directly

### 5. KCollectionRowTags.vue (Tag Display)
- Receives `tags` array as prop
- Displays tags as colored circles
- Has watcher to detect prop changes:
```typescript
watch(() => props.tags, (newTags) => {
  console.log('👀 [KCollectionRowTags] tags mudou:', newTags?.length || 0)
}, { deep: true })
```
- Emits `remove-tag` and `add-tag` events

## Real-Time Update Flow

### Adding a Tag (Works ✅)
1. User clicks `+` button in KCollectionRowTags
2. Selects tag from dropdown
3. `handleAddTag` in KFinanceCollectionTableRow updates DB
4. Emits `update-tags` event
5. KFinanceCollectionBoard receives and emits `update-payments`
6. assinaturas.vue `handleUpdatePayments` uses `Object.assign` to update
7. Watcher detects tag length change and increments `refreshKey`
8. Component re-renders with new tag immediately ✅

### Removing a Tag (Works ✅)
1. User clicks tag circle to show tooltip
2. Clicks X button to remove
3. `handleRemoveTag` in KFinanceCollectionTableRow updates DB
4. Emits `update-tags` event
5. KFinanceCollectionBoard receives and emits `update-payments`
6. assinaturas.vue `handleUpdatePayments` uses `Object.assign` to update
7. Watcher detects tag length change and increments `refreshKey`
8. Component re-renders without tag immediately ✅

## Critical Implementation Details

### ✅ What Works
- Using `Object.assign()` to update object properties while maintaining reactivity
- Watcher on `subscriptions.value.map(s => s.tags?.length || 0).join(',')` to detect changes
- Incrementing `refreshKey` to force component re-render
- Emitting events through component hierarchy (child → parent → grandparent)

### ❌ What Doesn't Work
- Directly modifying array elements: `subscriptions.value[index].tags = newTags` (Vue doesn't detect)
- Creating new array and replacing: `subscriptions.value = newArray` (breaks other reactivity)
- Using `toRef()` on props passed to composables (causes circular dependency issues)

### ✅ Best Practices Applied
- Tags stored in `companies` table, not `subscriptions`
- Tags fetched via relation in query (efficient)
- Real-time updates without page refresh
- Proper event emission through component hierarchy
- Watcher on computed property to detect changes

## Database Schema
- Tags stored in `companies.tags` (array field)
- Subscriptions linked to companies via `customer_id`
- Tags are company-level, not subscription-level

## Files Modified
- `app/composables/useSubscriptionsManager.ts` - Includes tags in query
- `app/pages/assinaturas.vue` - Main handler + watcher
- `app/components/subscriptions/KSubscriptionsContent.vue` - Event forwarding
- `app/components/blocks/KFinanceCollectionBoard.vue` - Tag update handler
- `app/components/blocks/KFinanceCollectionTableRow.vue` - Add/remove handlers
- `app/components/finance/collection/KCollectionRowTags.vue` - Display + watcher

## Testing Checklist
- [ ] Tags appear when page loads
- [ ] Adding tag appears immediately (ao vivo)
- [ ] Removing tag disappears immediately (ao vivo)
- [ ] No need for F5 refresh
- [ ] Multiple tags work correctly
- [ ] Tag colors display correctly
- [ ] Tag picker shows only available tags
- [ ] Removing tag from picker updates correctly

## Key Takeaway
**Use `Object.assign()` + watcher on tag length to maintain reactivity when updating nested objects in arrays. Increment `refreshKey` to force re-render when needed.**
