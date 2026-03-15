# Magnetic Drag Effect - Implementado ✨

## O que mudou

O sistema de drag-and-drop agora usa um **efeito magnético** que simula uma força de atração entre o card e a coluna de destino.

## Efeitos Visuais

### 1. **Card Sendo Arrastado** (Levitação)
- Aumenta de tamanho (1.05x)
- Brilho azul intenso ao redor
- Rotação suave (3deg)
- Sombra profunda com cor azul
- Mais brilhante (brightness 1.1)

### 2. **Coluna de Origem** (Repelente)
- Fica mais escura (brightness 0.9)
- Overlay vermelho sutil
- Animação de repulsão pulsante
- Cards saem com blur e rotação negativa

### 3. **Coluna de Destino** (Imã)
- Brilha com glow azul intenso
- Animação de atração magnética pulsante
- Escala aumenta (1.03x)
- Sombra interna forte
- Cards entram com brilho

### 4. **Colunas Inativas**
- Ficam mais escuras (brightness 0.85)
- Opacidade reduzida (0.4)
- Indicam que não são o alvo

### 5. **Ao Soltar o Card** (Snap Magnético)
- Card faz um "snap" suave para a coluna
- Rotação volta ao normal
- Escala volta gradualmente
- Efeito de "encaixe" satisfatório

## Animações Keyframes

### `repel-pulse` (Coluna de origem)
- Pulsa com opacidade e escala
- Simula repulsão do card

### `magnetic-pull` (Coluna de destino)
- Pulsa com sombra interna
- Simula atração magnética

### `magnetic-snap` (Ao soltar)
- Suaviza a entrada do card
- Rotação volta ao normal
- Efeito de "encaixe" satisfatório

## Cores Utilizadas

- **Azul (Destino)**: `rgba(59, 130, 246, ...)`
- **Vermelho (Origem)**: `rgba(255, 59, 48, ...)`
- **Brilho**: Filtro `brightness()` para destaque

## Timing

- **Drag**: 0.15s (rápido e responsivo)
- **Transições**: 0.25s (suave)
- **Animações**: 0.6-0.8s (pulsante)
- **Snap**: 0.5s (satisfatório)

## Resultado

O efeito magnético cria uma sensação de:
- ✨ Levitação do card
- 🧲 Atração para a coluna de destino
- 🎯 Encaixe satisfatório ao soltar
- 🎨 Visual moderno e tecnológico
