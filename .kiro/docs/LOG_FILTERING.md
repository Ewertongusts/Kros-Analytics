# Log Filtering Guide - DevTools Console

## 🎯 Quick Start

Open DevTools Console (`F12` → Console tab) and use these filters to track drag-drop flow.

## 🔍 Filter by Component

### Filter 1: See All Drag-Drop Logs
```
[TAREFAS-PAGE] OR [TASK-DRAG-DROP] OR [MOVE-TASK]
```

### Filter 2: Only Page-Level Events
```
[TAREFAS-PAGE]
```

### Filter 3: Only Drag-Drop State
```
[TASK-DRAG-DROP]
```

### Filter 4: Only Task Movement
```
[MOVE-TASK]
```

## 📊 Filter by Event Type

### Filter 5: Track Drag Start
```
handleDragStart
```

### Filter 6: Track Drag Over (Positioning)
```
handleDragOver OR Position changed
```

### Filter 7: Track Drop Events
```
handleTaskDropWithPosition OR 💧
```

### Filter 8: Track Move Task
```
moveTask CALLED OR Position calculated
```

### Filter 9: Track Drag End
```
handleDragEnd CALLED OR Drag ended
```

## 🎨 Filter by Status

### Filter 10: See All Errors
```
❌
```

### Filter 11: See All Warnings
```
⚠️
```

### Filter 12: See All Success Messages
```
✅
```

### Filter 13: See All Info Messages
```
ℹ️
```

## 🔄 Filter by Scenario

### Scenario 1: Same-Column Reordering
```
[TAREFAS-PAGE] ℹ️ Same column
```

Expected logs:
```
[TAREFAS-PAGE] ℹ️ Same column - just reordering
[MOVE-TASK] 📌 Using target task positioning
[MOVE-TASK] ✅ Position calculated from target
```

### Scenario 2: Cross-Column Move
```
[TAREFAS-PAGE] 🔄 Different column
```

Expected logs:
```
[TAREFAS-PAGE] 🔄 Different column - starting animation sequence
[TAREFAS-PAGE] 📍 About to call moveTask with captured positioning
[MOVE-TASK] 📌 Using target task positioning
[MOVE-TASK] ✅ Position calculated from target
```

### Scenario 3: Cross-Column Without Target
```
[MOVE-TASK] 📌 Moving between columns without target
```

Expected logs:
```
[MOVE-TASK] 📌 Moving between columns without target - placing at end
[MOVE-TASK] ✅ Position calculated for end of column
```

## 📈 Complete Flow Logs

### Full Same-Column Reorder Flow
```
1. [TASK-DRAG-DROP] 🚀 handleDragStart
2. [TASK-DRAG-DROP] ✅ Drag started
3. [TASK-DRAG-DROP] 📍 handleDragOver
4. [TASK-DRAG-DROP] 🔄 Position changed
5. [TASK-DRAG-DROP] ✅ Drag over state updated
6. [TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
7. [TAREFAS-PAGE] 📤 Task data parsed
8. [TAREFAS-PAGE] ℹ️ Same column - just reordering
9. [MOVE-TASK] 🚀 moveTask CALLED
10. [MOVE-TASK] 📍 Task found
11. [MOVE-TASK] 🔍 Analyzing move
12. [MOVE-TASK] 📌 Using target task positioning
13. [MOVE-TASK] ✅ Position calculated from target
14. [MOVE-TASK] 💾 Updating local state
15. [MOVE-TASK] 🔄 Persisting to database
16. [MOVE-TASK] ✅ Database update successful
17. [TASK-DRAG-DROP] 🏁 handleDragEnd CALLED
18. [TASK-DRAG-DROP] ✅ Drag ended - state reset
```

### Full Cross-Column Move Flow
```
1. [TASK-DRAG-DROP] 🚀 handleDragStart
2. [TASK-DRAG-DROP] ✅ Drag started
3. [TASK-DRAG-DROP] 📍 handleDragOver
4. [TASK-DRAG-DROP] 🔄 Position changed
5. [TASK-DRAG-DROP] ✅ Drag over state updated
6. [TAREFAS-PAGE] 💧 handleTaskDropWithPosition START
7. [TAREFAS-PAGE] 📤 Task data parsed
8. [TAREFAS-PAGE] 🔄 Different column - starting animation sequence
9. [TAREFAS-PAGE] 📍 About to call moveTask with captured positioning
10. [MOVE-TASK] 🚀 moveTask CALLED
11. [MOVE-TASK] 📍 Task found
12. [MOVE-TASK] 🔍 Analyzing move
13. [MOVE-TASK] 📌 Using target task positioning
14. [MOVE-TASK] ✅ Position calculated from target
15. [MOVE-TASK] 💾 Updating local state
16. [MOVE-TASK] 🔄 Persisting to database
17. [MOVE-TASK] ✅ Database update successful
18. [TAREFAS-PAGE] 🏁 Calling handleDragEndWithScroll after cross-column move
19. [TASK-DRAG-DROP] 🏁 handleDragEnd CALLED
20. [TASK-DRAG-DROP] ✅ Drag ended - state reset
```

## 🛠️ How to Use Filters in DevTools

### Method 1: Filter Box
1. Open DevTools Console
2. Look for the filter icon (funnel) or search box
3. Type your filter
4. Press Enter

### Method 2: Search in Console
1. Open DevTools Console
2. Press `Ctrl+F` (or `Cmd+F` on Mac)
3. Type your search term
4. Navigate with arrow keys

### Method 3: Copy-Paste Filter
1. Copy the filter from this guide
2. Paste into DevTools filter box
3. Logs will be filtered automatically

## 💡 Pro Tips

1. **Clear Console Before Testing**
   - Press `Ctrl+L` or click the clear button
   - This removes old logs and makes it easier to see new ones

2. **Use Multiple Filters**
   - Combine filters with `OR` to see related logs
   - Example: `[TAREFAS-PAGE] OR [MOVE-TASK]`

3. **Watch for Timing**
   - Look at timestamps to see how long each step takes
   - If there's a big gap, something might be slow

4. **Check dragOverTaskId Values**
   - Search for `dragOverTaskId:`
   - Should NOT be `null` when `moveTask()` is called
   - If it's `null`, the positioning info was lost

5. **Monitor Database Updates**
   - Look for `Database update successful` or `Database update failed`
   - If failed, check Supabase logs

## 🎯 What to Look For

### ✅ Good Signs
- `dragOverTaskId` has a value (not null)
- `dragOverPosition` is either 'above' or 'below'
- `Position calculated from target` appears
- `Database update successful` appears
- No `❌` error messages

### ❌ Bad Signs
- `dragOverTaskId: null` when moveTask is called
- `dragOverPosition: null` when moveTask is called
- `Database update failed` appears
- Multiple `❌` error messages
- `Already processing drop, ignoring` appears

## 📞 Need Help?

If logs don't match expected flow:
1. Check [DRAG_DROP_DEBUGGING.md](./DRAG_DROP_DEBUGGING.md) for detailed explanation
2. Look at the "Troubleshooting" section
3. Compare your logs with the "Complete Flow Logs" section above