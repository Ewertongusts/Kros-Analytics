# 📚 Kroz Project Documentation

Bem-vindo à documentação centralizada do projeto Kroz!

## 🚀 Comece Aqui

**Novo no projeto?** Leia em ordem:
1. [docs/INDEX.md](./docs/INDEX.md) - Índice completo
2. [docs/KANBAN_ARCHITECTURE.md](./docs/KANBAN_ARCHITECTURE.md) - Como funciona
3. [docs/DRAG_DROP_DEBUGGING.md](./docs/DRAG_DROP_DEBUGGING.md) - Como debugar

## 📁 Estrutura

```
.kiro/
├── README.md                      # Este arquivo
├── docs/                          # 📖 Documentação técnica
│   ├── INDEX.md                   # Índice central
│   ├── KANBAN_ARCHITECTURE.md     # Arquitetura do kanban
│   ├── DRAG_DROP_DEBUGGING.md     # Debugging de drag-drop
│   ├── LOG_FILTERING.md           # Como usar logs
│   ├── DATABASE_SCHEMA.md         # Schema do banco
│   ├── MIGRATIONS.md              # Guia de migrações
│   └── WEBHOOKS_GUIDE.md          # Webhooks
├── steering/                      # 🎯 Guias de implementação
│   ├── kanban2-implementation.md
│   ├── contacts-disappearing-fix.md
│   └── payment-history-implementation.md
├── specs/                         # 📋 Especificações de features
└── migrations/                    # 🗄️ Scripts SQL
```

## 🎯 Tópicos Rápidos

### Kanban
- **Como funciona?** → [KANBAN_ARCHITECTURE.md](./docs/KANBAN_ARCHITECTURE.md)
- **Como debugar?** → [DRAG_DROP_DEBUGGING.md](./docs/DRAG_DROP_DEBUGGING.md)
- **Como ler logs?** → [LOG_FILTERING.md](./docs/LOG_FILTERING.md)

### Database
- **Qual é o schema?** → [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
- **Como fazer migrações?** → [MIGRATIONS.md](./docs/MIGRATIONS.md)

### Implementação
- **Padrões de código?** → [steering/kanban2-implementation.md](./steering/kanban2-implementation.md)
- **Reatividade em composables?** → [steering/contacts-disappearing-fix.md](./steering/contacts-disappearing-fix.md)

## 🔍 Procurando Algo?

| Pergunta | Resposta |
|----------|----------|
| Como o kanban funciona? | [KANBAN_ARCHITECTURE.md](./docs/KANBAN_ARCHITECTURE.md) |
| Por que meu drag-drop não funciona? | [DRAG_DROP_DEBUGGING.md](./docs/DRAG_DROP_DEBUGGING.md) |
| Como debugar com logs? | [LOG_FILTERING.md](./docs/LOG_FILTERING.md) |
| Qual é o schema do banco? | [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) |
| Como fazer migrações? | [MIGRATIONS.md](./docs/MIGRATIONS.md) |
| Como usar webhooks? | [WEBHOOKS_GUIDE.md](./docs/WEBHOOKS_GUIDE.md) |
| Quais são os padrões de código? | [steering/kanban2-implementation.md](./steering/kanban2-implementation.md) |

## 📊 Últimas Mudanças

### 2026-03-16
- ✅ Fixado cross-column drag-drop positioning
- ✅ Reorganizado documentação em estrutura clara
- ✅ Deletados 45+ arquivos obsoletos
- ✅ Criada documentação centralizada

## 💡 Dicas

1. **Antes de começar** - Leia o arquivo relevante em `docs/`
2. **Ao debugar** - Use os filtros de log em [LOG_FILTERING.md](./docs/LOG_FILTERING.md)
3. **Ao implementar** - Siga o padrão em `steering/`
4. **Ao encontrar bug** - Procure em [DRAG_DROP_DEBUGGING.md](./docs/DRAG_DROP_DEBUGGING.md)

## 🚀 Próximas Melhorias

- [ ] Virtualização de cards (performance)
- [ ] Indicador de progresso por coluna
- [ ] Atalhos de teclado
- [ ] Bulk actions melhoradas
- [ ] Swimlanes por usuário

Ver [steering/kanban-improvements.md](../steering/kanban-improvements.md) para detalhes.

## 📞 Precisa de Ajuda?

1. Procure no [INDEX.md](./docs/INDEX.md)
2. Leia o arquivo relevante em `docs/`
3. Procure por "Troubleshooting" no arquivo
4. Verifique os logs usando [LOG_FILTERING.md](./docs/LOG_FILTERING.md)

---

**Última atualização:** 2026-03-16
**Mantido por:** Kiro Agent
