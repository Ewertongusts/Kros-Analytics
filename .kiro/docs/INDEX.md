# 📚 Documentação do Projeto Kroz

Bem-vindo! Este é o índice central de toda a documentação do projeto.

## 🎯 Comece Aqui

- **[KANBAN_ARCHITECTURE.md](./KANBAN_ARCHITECTURE.md)** - Como o kanban funciona, estrutura de dados, fluxo de drag-drop
- **[DRAG_DROP_DEBUGGING.md](./DRAG_DROP_DEBUGGING.md)** - Como debugar problemas de drag-drop usando logs
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Estrutura do banco de dados

## 🔧 Guias Técnicos

### Kanban
- **[KANBAN_ARCHITECTURE.md](./KANBAN_ARCHITECTURE.md)** - Arquitetura completa do kanban
- **[DRAG_DROP_DEBUGGING.md](./DRAG_DROP_DEBUGGING.md)** - Guia de debugging para drag-drop
- **[LOG_FILTERING.md](./LOG_FILTERING.md)** - Como filtrar e ler logs no console

### Database
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema do banco de dados
- **[MIGRATIONS.md](./MIGRATIONS.md)** - Guia de migrações

### Webhooks
- **[WEBHOOKS_GUIDE.md](./WEBHOOKS_GUIDE.md)** - Configuração e uso de webhooks

## 🚀 Implementações Recentes

### Fixes Aplicados
- **Cross-Column Drag-Drop** - Cards agora ficam na posição exata onde são soltos
  - Problema: `@dragend` limpava estado antes de `moveTask()` usar
  - Solução: Remover `@dragend` e chamar `handleDragEnd()` após drop completar
  - Verificação: Ver logs com `[TAREFAS-PAGE]` e `[MOVE-TASK]`

## 📋 Steering Files (Guias de Implementação)

Estes arquivos guiam a implementação de novas features:

- **[steering/kanban2-implementation.md](../steering/kanban2-implementation.md)** - Padrões e arquitetura do Kanban 2
- **[steering/contacts-disappearing-fix.md](../steering/contacts-disappearing-fix.md)** - Como manter reatividade em composables
- **[steering/payment-history-implementation.md](../steering/payment-history-implementation.md)** - Implementação de histórico de pagamentos

## 🐛 Troubleshooting

### Problema: Cards desaparecem após drag-drop
**Solução:** Ver [DRAG_DROP_DEBUGGING.md](./DRAG_DROP_DEBUGGING.md)

### Problema: Logs não aparecem no console
**Solução:** Ver [LOG_FILTERING.md](./LOG_FILTERING.md)

### Problema: Contatos desaparecem da tabela
**Solução:** Ver [steering/contacts-disappearing-fix.md](../steering/contacts-disappearing-fix.md)

## 📊 Estrutura de Pastas

```
.kiro/
├── docs/                          # Documentação técnica
│   ├── INDEX.md                   # Este arquivo
│   ├── KANBAN_ARCHITECTURE.md     # Como o kanban funciona
│   ├── DRAG_DROP_DEBUGGING.md     # Debugging de drag-drop
│   ├── LOG_FILTERING.md           # Como usar logs
│   ├── DATABASE_SCHEMA.md         # Schema do banco
│   ├── MIGRATIONS.md              # Guia de migrações
│   └── WEBHOOKS_GUIDE.md          # Webhooks
├── steering/                      # Guias de implementação
│   ├── kanban2-implementation.md
│   ├── contacts-disappearing-fix.md
│   └── payment-history-implementation.md
├── specs/                         # Especificações de features
└── migrations/                    # Scripts SQL
```

## 🔍 Últimas Mudanças

### 2026-03-16
- ✅ Fixado cross-column drag-drop positioning
- ✅ Adicionado logging detalhado para debugging
- ✅ Reorganizado documentação em estrutura clara

## 💡 Dicas

1. **Antes de começar a trabalhar** - Leia o arquivo relevante em `docs/`
2. **Ao debugar** - Use os filtros de log em [LOG_FILTERING.md](./LOG_FILTERING.md)
3. **Ao implementar feature nova** - Siga o padrão em `steering/`
4. **Ao encontrar bug** - Procure em Troubleshooting acima

## 📞 Referências Rápidas

| Tópico | Arquivo |
|--------|---------|
| Como funciona o kanban? | [KANBAN_ARCHITECTURE.md](./KANBAN_ARCHITECTURE.md) |
| Como debugar drag-drop? | [DRAG_DROP_DEBUGGING.md](./DRAG_DROP_DEBUGGING.md) |
| Como ler logs? | [LOG_FILTERING.md](./LOG_FILTERING.md) |
| Qual é o schema do banco? | [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| Como fazer migrações? | [MIGRATIONS.md](./MIGRATIONS.md) |
| Como usar webhooks? | [WEBHOOKS_GUIDE.md](./WEBHOOKS_GUIDE.md) |

---

**Última atualização:** 2026-03-16
**Mantido por:** Kiro Agent
