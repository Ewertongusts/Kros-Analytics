---
inclusion: auto
---

# Steering - Kros

## 🎯 Propósito
Estamos desenvolvendo um sistema de gestão de tarefas, vendas de produtos e serviços e assinaturas através de catálogos.

## 🏗️ Arquitetura
- Frontend: Nuxt 4 + Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Padrão: 100% componentizado

## 📋 Regras de Desenvolvimento

1. **Componentização Total**: Todo código deve ser componentizado
2. **Composables**: Lógica de negócio em composables reutilizáveis
3. **Documentação**: Sempre atualizar database-schema.md ao mexer no banco
4. **Commits**: Mensagens descritivas seguindo conventional commits

## ✅ Checklist de Fases

### Fase 1: Setup Inicial
- [x] Configuração do projeto
- [x] Estrutura de pastas
- [x] Arquivos de documentação

### Fase 2: Autenticação
- [ ] Sistema de login
- [ ] Registro de usuários
- [ ] Recuperação de senha

### Fase 3: [Próxima Feature]
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## 🔍 Verificações de Qualidade

Antes de cada commit, verificar:
- [ ] Código está componentizado?
- [ ] Composables estão sendo usados?
- [ ] Database-schema.md está atualizado?
- [ ] Steering.md está atualizado?
- [ ] Código segue os padrões do projeto?

## 📊 Progresso
- **Fase Atual**: [Nome da fase]
- **Última Atualização**: [Data]
- **Próximos Passos**: [Descrever]

## 📐 Padrões de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `UserProfile.vue`)
- **Composables**: camelCase com prefixo `use` (ex: `useAuth.ts`)
- **Páginas**: kebab-case (ex: `user-profile.vue`)
- **Variáveis**: camelCase (ex: `userName`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_URL`)

### Estrutura de Componentes
```vue
<template>
<!-- UI aqui -->
</template>

<script setup lang="ts">
// Imports
// Props/Emits
// Composables
// Refs/Reactive
// Computed
// Functions
// Lifecycle hooks
</script>

<style scoped>
/* Estilos específicos */
</style>
```

### Composables
- Um composable por arquivo
- Sempre retornar objeto com funções e estados
- Usar TypeScript para tipagem
- Documentar parâmetros e retornos

### Componentização
- **Regra de Ouro**: Se um bloco de código tem mais de 50 linhas, componentize
- **Reutilização**: Se algo é usado 2+ vezes, vira componente
- **Responsabilidade Única**: Cada componente faz UMA coisa bem feita

## 🗄️ Banco de Dados

### Regras
- Sempre atualizar `.kiro/database-schema.md` ao criar/modificar tabelas
- Usar UUID para IDs
- Sempre ter `created_at` e `updated_at`
- Documentar relacionamentos e foreign keys
- Registrar ações importantes em tabelas de histórico

### Convenções
- Nomes de tabelas: plural, snake_case (ex: `user_profiles`)
- Nomes de colunas: snake_case (ex: `first_name`)
- Foreign keys: `[tabela]_id` (ex: `user_id`)

## 📦 Commits

### Conventional Commits
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `style:` - Formatação, espaços
- `test:` - Testes
- `chore:` - Tarefas de manutenção

### Exemplos
```
feat: adiciona sistema de login
fix: corrige validação de email
refactor: componentiza página de dashboard
docs: atualiza database-schema.md
```

## 🔍 Checklist Antes de Commit
- [ ] Código está componentizado?
- [ ] Composables estão sendo usados corretamente?
- [ ] TypeScript sem erros?
- [ ] Database-schema.md atualizado (se mexeu no banco)?
- [ ] Steering.md atualizado (se completou fase)?
- [ ] Código segue nomenclatura padrão?
- [ ] Commit message segue conventional commits?

## 🤖 Instruções para o Kiro

**Você DEVE automaticamente:**
1. Atualizar `database-schema.md` sempre que criar/modificar tabelas
2. Seguir 100% as regras de componentização
3. Usar composables para lógica de negócio
4. Seguir padrões de nomenclatura
5. Sugerir melhorias de arquitetura quando relevante

**Você NÃO deve:**
1. Criar código monolítico (sempre componentizar)
2. Esquecer de atualizar documentação
3. Ignorar as regras deste arquivo

## 🎯 Comandos Úteis Durante o Desenvolvimento

### Verificar Componentização
```
"Analise o projeto e me diga se há algo que precisa ser componentizado"
```

### Atualizar Checklist
```
"Atualize o steering.md marcando a fase [X] como concluída"
```

### Revisar Código
```
"Revise o código e verifique se está seguindo as regras do project-rules.md"
```

### Criar Feature Completa
```
"Crie feature [NOME] seguindo as regras do projeto:
- Componentes necessários
- Composables para lógica
- Páginas
- Atualizar banco se necessário
- Atualizar documentação"
```

### Commit e Push
```
"Commit e push com mensagem: [tipo]: [descrição]"
```

## 🚨 Troubleshooting

### Kiro não está seguindo as regras?
1. Verifique se os arquivos `.kiro/*.md` têm `inclusion: auto` no topo
2. Lembre o Kiro: "Consulte o project-rules.md antes de continuar"
3. Reinicie a conversa se necessário

### Database-schema.md não está sendo atualizado?
1. Peça explicitamente: "Atualize o database-schema.md com as mudanças"
2. Verifique se o arquivo tem `inclusion: auto`
3. Lembre o Kiro da regra: "Sempre atualize o schema ao mexer no banco"

### Código não está componentizado?
1. Peça revisão: "Confira se está tudo componentizado"
2. Peça refatoração: "Refatore [arquivo] para ser 100% componentizado"

## 📚 Recursos Adicionais

### Documentação Oficial
- [Nuxt 4](https://nuxt.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)

### Padrões de Código
- [Conventional Commits](https://www.conventionalcommits.org)
- [Vue Style Guide](https://vuejs.org/style-guide/)

## 💡 Dicas Finais

1. **Sempre comece com o setup completo** - Não pule etapas
2. **Mantenha a documentação atualizada** - É seu mapa do projeto
3. **Confie no Kiro** - Ele vai atualizar o schema automaticamente
4. **Revise regularmente** - Peça para verificar componentização
5. **Commit frequente** - Pequenos commits são melhores

---

**Criado em**: 16 de Março de 2026  
**Última Atualização**: 16 de Março de 2026  
**Versão**: 1.0