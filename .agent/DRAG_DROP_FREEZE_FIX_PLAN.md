# Drag-and-Drop Card Freeze Bug - Fix Plan (UPDATED)

## Problem Summary - CONFIRMED BEHAVIOR
**CRITICAL BUG**: When dragging a task card for the **first time**, the preview gets stuck in the air and doesn't follow the cursor. The card must be dragged again, but the starting position for the second drag is from where it was frozen (in the air), NOT from the actual card position.

**User Confirmation**: "ainda ta, o engraçado é que no primeiro arrastar, ele sempre trava, ai tenho que arrastar denovo porem a posição inicial de arrastar ele denovo é a partir daqui do ar"

## Root Cause Analysis - REFINED
The issue occurs because:
1. **`isDragging` state is not being properly reset** after the first drag completes
2. **The `dragX` and `dragY` coordinates are cached** and not recalculated correctly on subsequent drags
3. **The `cardWidth` is captured but may be stale** on first drag start
4. **Global listeners (mouseup/pointerup) are NOT firing reliably** - they may not fire at all or fire too late
5. **The `@dragend` event on the card element is not being triggered** - this is the real culprit
6. **State persists between drags** - the frozen position becomes the new "origin" for the next drag

## Symptoms - CONFIRMED
- **First drag**: Card preview appears but gets stuck mid-air, doesn't follow cursor
- **Second drag**: Starts from the frozen position (in the air) instead of the actual card position
- **Pattern**: This ALWAYS happens on the first drag, every single time
- **Workaround**: Dragging a second time "unsticks" it, but from wrong position

## Files to Investigate
1. **`app/components/tasks/KTaskCard.vue`** - Main drag logic (PRIMARY ISSUE)
   - `handleDragStart()` - cardWidth capture timing
   - `handleDrag()` - position calculation logic
   - `handleDragEnd()` - state reset mechanism
   - Global listeners (mouseup/pointerup) - NOT WORKING RELIABLY
   - **CRITICAL**: The `@dragend` event is not being triggered properly

2. **`app/composables/useTaskDragDrop.ts`** - Drag-drop composable
   - Check if draggedTask state is being cleared properly
   - Verify dragSource is reset
   - May need to add global state reset mechanism

3. **`app/pages/tarefas.vue`** - Page-level drag handling
   - Check handleDragEndWithScroll() function
   - Verify scroll interval cleanup
   - May need to add page-level drag end listener

## Solution Approach - CRITICAL FIXES REQUIRED

### Step 1: Understand the Real Problem
The `@dragend` event on the card element is NOT firing reliably. This is why global listeners (mouseup/pointerup) were added as a workaround, but they're also not working. The state is getting stuck because:
- `isDragging` remains `true` after first drag
- `dragX` and `dragY` are cached at the frozen position
- On second drag, these cached values become the new "origin"

### Step 2: Create Reliable State Reset Function
Create a dedicated `resetDragState()` function that MUST be called:
```typescript
const resetDragState = () => {
  console.log('🔄 RESETTING DRAG STATE')
  isDragging.value = false
  dragX.value = 0
  dragY.value = 0
  cardWidth.value = 0
}
```

### Step 3: Fix handleDragStart - Capture Width FIRST
```typescript
const handleDragStart = (e: DragEvent) => {
  console.log('🎯 DRAG START - Capturing cardWidth')
  
  // CRITICAL: Capture width BEFORE setting isDragging
  if (cardElement.value) {
    cardWidth.value = cardElement.value.offsetWidth
    console.log('📏 Card width captured:', cardWidth.value)
  } else {
    console.warn('⚠️ cardElement is null!')
    cardWidth.value = 300 // Fallback
  }
  
  isDragging.value = true
  
  // Set initial position
  dragX.value = e.clientX - (cardWidth.value / 2)
  dragY.value = e.clientY - 20
  
  console.log('📍 Initial position:', { dragX: dragX.value, dragY: dragY.value })
  
  // Remove default drag image
  const emptyImage = new Image()
  e.dataTransfer?.setDragImage(emptyImage, 0, 0)
  
  emit('dragstart', props.task)
}
```

### Step 4: Fix handleDrag - Ensure Position Updates
```typescript
const handleDrag = (e: DragEvent) => {
  // CRITICAL: Only update if we have valid coordinates
  if (e.clientX !== 0 && e.clientY !== 0) {
    dragX.value = e.clientX - (cardWidth.value / 2)
    dragY.value = e.clientY - 20
    console.log('🎯 Drag position:', { dragX: dragX.value, dragY: dragY.value })
  }
}
```

### Step 5: Fix handleDragEnd - MUST Reset State
```typescript
const handleDragEnd = () => {
  console.log('🛑 DRAG END - Resetting state')
  resetDragState()
  emit('dragend')
}
```

### Step 6: Replace Global Listeners with Reliable Approach
**REMOVE** the current mouseup/pointerup listeners. Instead:

1. **Add dragend listener directly on card element** (already in template via @dragend)
2. **Add dragover listener to detect if drag is still active**:
```typescript
const handleDragOver = (e: DragEvent) => {
  // Drag is still active, keep updating position
  if (isDragging.value && e.clientX !== 0 && e.clientY !== 0) {
    dragX.value = e.clientX - (cardWidth.value / 2)
    dragY.value = e.clientY - 20
  }
}
```

3. **Add timeout-based fallback** (500ms) to force reset if dragend doesn't fire:
```typescript
let dragTimeoutId: ReturnType<typeof setTimeout> | null = null

const handleDragStart = (e: DragEvent) => {
  // ... existing code ...
  
  // Set timeout to force reset if dragend doesn't fire
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
  dragTimeoutId = setTimeout(() => {
    console.warn('⚠️ Drag timeout - forcing reset')
    resetDragState()
  }, 1000)
}

const handleDragEnd = () => {
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
  resetDragState()
  emit('dragend')
}
```

4. **Add document-level dragend listener** as final fallback:
```typescript
const handleDocumentDragEnd = () => {
  if (isDragging.value) {
    console.warn('⚠️ Document dragend fired - resetting')
    resetDragState()
  }
}

onMounted(() => {
  document.addEventListener('dragend', handleDocumentDragEnd)
})

onUnmounted(() => {
  document.removeEventListener('dragend', handleDocumentDragEnd)
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
})
```

### Step 7: Add Comprehensive Debug Logging
Add console logs at every state change to track the bug:
```typescript
console.log('🎯 dragstart:', { isDragging: isDragging.value, cardWidth: cardWidth.value, dragX: dragX.value, dragY: dragY.value })
console.log('🎯 drag:', { dragX: dragX.value, dragY: dragY.value, clientX: e.clientX, clientY: e.clientY })
console.log('🎯 dragend:', { isDragging: isDragging.value })
console.log('🔄 resetDragState called')
```

## Implementation Steps for Next Agent

### CRITICAL: The Problem is State Not Resetting
The core issue is that `isDragging`, `dragX`, and `dragY` are NOT being reset after the first drag. This causes:
1. First drag: Works initially but gets stuck
2. Second drag: Starts from the frozen position because the old coordinates are still in memory

### Implementation Order (MUST FOLLOW THIS):

1. **Add resetDragState function** in KTaskCard.vue (FIRST)
   ```typescript
   const resetDragState = () => {
     console.log('🔄 RESETTING DRAG STATE')
     isDragging.value = false
     dragX.value = 0
     dragY.value = 0
     cardWidth.value = 0
   }
   ```

2. **Update handleDragStart** to capture width BEFORE setting isDragging
   - Add console logs
   - Add fallback for cardWidth
   - Set timeout-based reset

3. **Update handleDragEnd** to call resetDragState()
   - Clear timeout if set
   - Call resetDragState()
   - Emit dragend event

4. **Remove unreliable global listeners** (mouseup/pointerup)
   - Delete the handleGlobalMouseUp function
   - Delete the onMounted/onUnmounted listeners

5. **Add document-level dragend listener** as final fallback
   - Add in onMounted
   - Remove in onUnmounted

6. **Add dragover handler** to keep updating position during drag
   - Add @dragover="handleDragOver" to template
   - Implement handleDragOver function

7. **Test thoroughly**
   - First drag should work without freezing
   - Second drag should start from correct position
   - Rapid successive drags should all work
   - Check console logs for state changes

## Testing Checklist
- [ ] **First drag works without freezing** - CRITICAL
- [ ] **Second drag starts from correct card position** - CRITICAL
- [ ] **Rapid successive drags work** - CRITICAL
- [ ] Drag between different columns works
- [ ] Drag to orphan column works
- [ ] No console errors
- [ ] No memory leaks from listeners
- [ ] Console logs show state changes correctly
- [ ] Timeout-based reset fires if dragend doesn't

## Debug Output Expected
When dragging a card, console should show:
```
🎯 DRAG START - Capturing cardWidth
📏 Card width captured: 280
📍 Initial position: { dragX: 100, dragY: 50 }
🎯 Drag position: { dragX: 105, dragY: 55 }
🎯 Drag position: { dragX: 110, dragY: 60 }
... (more drag updates)
🛑 DRAG END - Resetting state
🔄 RESETTING DRAG STATE
```

## Key Differences from Previous Attempts
1. **Timeout-based reset** - Forces reset if dragend doesn't fire (1000ms)
2. **Document-level dragend listener** - Catches dragend events that bubble up
3. **Comprehensive logging** - Every state change is logged
4. **Fallback cardWidth** - If element is null, use 300px default
5. **Removed unreliable mouseup/pointerup** - These were not firing reliably

## Notes
- The issue is 100% a state management problem, not visual/CSS
- The fact it works on second attempt confirms state is cached incorrectly
- The frozen position becoming the new origin confirms coordinates are not reset
- The timeout-based reset is a safety net for when dragend doesn't fire
- Document-level listener catches edge cases where dragend doesn't bubble to card element
