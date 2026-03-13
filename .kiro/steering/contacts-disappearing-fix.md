# Contacts Disappearing Issue - SOLVED

## Problem Summary
Contacts were disappearing from the clients table after being loaded. The issue was a **broken reactivity chain** caused by passing a plain array to a composable instead of a ref.

## Root Cause
**Location:** `app/components/clients/KClientsTable.vue`

```typescript
// ❌ WRONG - Breaks reactivity
const { ... } = useClientsFilters(props.companies)
```

When `props.companies` (a plain array) is passed to `useClientsFilters`:
1. The composable captures the array reference at initialization
2. When parent updates `companies.value`, a NEW array is created
3. The old reference in the composable is never updated
4. Vue's reactivity doesn't track plain array references passed to composables
5. Result: `filteredCompanies` computed property returns empty array

## Solution
**Use `toRef()` to convert the prop to a reactive ref:**

```typescript
// ✅ CORRECT - Maintains reactivity
import { toRef } from 'vue'

const companiesRef = toRef(props, 'companies')
const { ... } = useClientsFilters(companiesRef)
```

## Files Modified
- `app/components/clients/KClientsTable.vue` - Changed to use `toRef(props, 'companies')`
- `app/composables/useClientsFilters.ts` - Updated to use `isRef()` for proper detection

## How It Works Now
```
useCompanies.ts (companies.value = [...])
         ↓
KCompaniesManagement.vue (:companies="companies")
         ↓
KClientsTable.vue (companiesRef = toRef(props, 'companies'))
         ↓
useClientsFilters(companiesRef) ← MAINTAINS REACTIVITY
         ↓
filteredCompanies computed ← RE-RUNS WHEN companies.value CHANGES
         ↓
paginatedCompanies ← ALWAYS HAS CURRENT DATA
         ↓
v-for="company in paginatedCompanies" ← RENDERS ALL ITEMS
```

## Prevention Checklist
When passing data to composables:
- [ ] Use `toRef()` for props: `toRef(props, 'propertyName')`
- [ ] Use `computed()` for derived values
- [ ] Never pass plain arrays/objects directly
- [ ] Test that data persists after updates
- [ ] Check console logs for "length: 0" warnings

## Related Issues to Avoid
1. **Duplicate watches** - Remove redundant watch statements
2. **Polling workarounds** - Don't add polling to mask reactivity issues
3. **Deep watchers** - Use sparingly, they're expensive
4. **Async race conditions** - Ensure proper error handling in async operations

## Testing
To verify the fix works:
1. Open clients page
2. Check DevTools Console for logs
3. Verify contacts appear in table
4. Add/edit/delete a contact
5. Verify table updates without data disappearing
6. Refresh page - contacts should still appear

## Key Takeaway
**Always use `toRef()` when passing props to composables that need reactivity.**
