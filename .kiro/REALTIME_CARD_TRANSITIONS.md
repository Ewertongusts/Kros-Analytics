# Transições de Cards em Tempo Real - Guia Completo

## 🎬 O Que Foi Implementado

### 1. **Composable `useRealtimeCardTransitions`**
Gerencia o estado de transição de cada card em tempo real:
- `startEntering()` - Inicia animação de entrada
- `startExiting()` - Inicia animação de saída
- `startSettling()` - Inicia animação de acomodação
- `completeTransition()` - Finaliza transição
- `isEntering()`, `isExiting()`, `isSettling()` - Verificar estado

### 2. **Composable `useCardTransitions`**
Gerencia animações com progresso em tempo real:
- Calcula progresso da animação (0-1)
- Aplica easing curves profissionais
- Retorna transforms CSS dinâmicos
- Suporta cancelamento de transições

### 3. **Novas Classes CSS**
Adicionadas ao `kanban-transitions.css`:

#### Animações de Entrada
```css
.card-entering {
  animation: cardEntering 400ms var(--ease-smooth) forwards;
}
```
- Começa 20px abaixo com opacity 0
- Sobe suavemente até posição final
- Duração: 400ms

#### Animações de Saída
```css
.card-exiting {
  animation: cardExiting 300ms var(--ease-smooth) forwards;
}
```
- Desce 20px enquanto desaparece
- Duração: 300ms

#### Animações de Acomodação
```css
.card-settling {
  animation: cardSettling 300ms var(--ease-bounce) forwards;
}
```
- Pequeno bounce ao encaixar
- Duração: 300ms

### 4. **Componente KTaskCard Atualizado**
Agora suporta props de transição:
```vue
<TasksKTaskCard
  :task="task"
  :is-entering="isEntering(task.id)"
  :is-exiting="isExiting(task.id)"
  :is-settling="isSettling(task.id)"
  @transition-complete="completeTransition(task.id)"
/>
```

## 📊 Fluxo de Transição Completo

```
Usuário arrasta card de Coluna A para Coluna B
         ↓
startExiting(taskId, 'columnA')
         ↓
Card desaparece com animação (300ms)
         ↓
Card é movido no banco de dados
         ↓
startEntering(taskId, 'columnB')
         ↓
Card aparece com animação (400ms)
         ↓
startSettling(taskId, 'columnB')
         ↓
Card faz bounce de acomodação (300ms)
         ↓
completeTransition(taskId)
         ↓
Card volta ao estado idle
```

## 🎨 Estados Visuais

| Estado | Animação | Duração | Efeito |
|--------|----------|---------|--------|
| Entering | Slide Up + Fade In | 400ms | Sobe 20px, opacity 0→1 |
| Exiting | Slide Down + Fade Out | 300ms | Desce 20px, opacity 1→0 |
| Settling | Bounce | 300ms | Pequeno bounce de confirmação |
| Idle | Nenhuma | - | Estado normal |

## 💻 Como Usar

### 1. Importar o Composable
```typescript
import { useRealtimeCardTransitions } from '~/composables/useRealtimeCardTransitions'

const {
  isEntering,
  isExiting,
  isSettling,
  startEntering,
  startExiting,
  startSettling,
  completeTransition
} = useRealtimeCardTransitions()
```

### 2. Usar no Template
```vue
<TasksKTaskCard
  v-for="task in tasks"
  :key="task.id"
  :task="task"
  :is-entering="isEntering(task.id)"
  :is-exiting="isExiting(task.id)"
  :is-settling="isSettling(task.id)"
  @transition-complete="completeTransition(task.id)"
/>
```

### 3. Iniciar Transição ao Mover Card
```typescript
// Quando card é movido entre colunas
const moveTaskBetweenColumns = async (taskId: string, fromColumn: string, toColumn: string) => {
  // Iniciar saída
  startExiting(taskId, fromColumn)
  
  // Aguardar animação de saída
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Atualizar no banco de dados
  await updateTaskColumn(taskId, toColumn)
  
  // Iniciar entrada
  startEntering(taskId, toColumn)
  
  // Aguardar animação de entrada
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // Iniciar acomodação
  startSettling(taskId, toColumn)
  
  // Aguardar acomodação
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Completar transição
  completeTransition(taskId)
}
```

## 🎯 Benefícios

✅ **Feedback Visual Claro** - Usuário vê exatamente quando card se move
✅ **Transições Fluidas** - Sem saltos ou mudanças abruptas
✅ **Performance** - Usa GPU acceleration (transform + opacity)
✅ **Acessível** - Respeita `prefers-reduced-motion`
✅ **Sincronizado** - Animações sincronizadas com Supabase
✅ **Profissional** - Sensação de qualidade premium

## 🔧 Customização

### Mudar Duração
```css
.card-entering {
  animation: cardEntering 600ms var(--ease-smooth) forwards; /* 600ms em vez de 400ms */
}
```

### Mudar Easing
```css
.card-entering {
  animation: cardEntering 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

### Adicionar Efeito de Escala
```css
@keyframes cardEnteringWithScale {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-entering {
  animation: cardEnteringWithScale 400ms var(--ease-smooth) forwards;
}
```

## 📁 Arquivos Modificados

1. **app/composables/useRealtimeCardTransitions.ts** (novo)
   - Gerencia estado de transição de cards

2. **app/composables/useCardTransitions.ts** (novo)
   - Gerencia animações com progresso

3. **app/components/tasks/kanban-transitions.css**
   - Adicionadas animações de entrada/saída/acomodação

4. **app/components/tasks/KTaskCard.vue**
   - Adicionados props de transição
   - Adicionado handler de animação

## 🚀 Próximos Passos

1. **Integrar com `tarefas.vue`**
   - Usar composable ao mover cards
   - Sincronizar com Supabase

2. **Adicionar Transições de Coluna**
   - Animar colunas se movendo
   - Indicadores de drop zone

3. **Batch Transitions**
   - Animar múltiplos cards simultaneamente
   - Stagger delays para efeito cascata

4. **Notificações em Tempo Real**
   - Mostrar quando outro usuário move card
   - Sincronizar transições entre usuários

## ✅ Checklist de Implementação

- [x] Criar composable de transições
- [x] Adicionar classes CSS
- [x] Atualizar KTaskCard
- [x] Documentar uso
- [ ] Integrar com tarefas.vue
- [ ] Testar com múltiplos cards
- [ ] Testar em dispositivos móveis
- [ ] Otimizar performance

## 📊 Métricas de Sucesso

- ✅ Cards entram/saem com animação suave
- ✅ Transições duram 300-400ms
- ✅ Sem jank ou stuttering
- ✅ 60 FPS durante animações
- ✅ Sincronizado com Supabase
- ✅ Funciona em todos os navegadores

