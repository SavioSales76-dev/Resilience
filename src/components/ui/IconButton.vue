<!-- Figma: ui → "Botão ícone" (117:28). Quadrado 48×48 só com ícone.
     Claro: fundo preto 10%. Escuro (fundos azuis): só borda branca 35%. -->
<script setup>
import { ref } from 'vue'

defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
  tema: { type: String, default: 'claro' },
})

const hovered = ref(false)
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="label"
    class="inline-flex size-12 shrink-0 items-center justify-center rounded-btn transition-colors duration-300"
    :class="
      tema === 'claro'
        ? 'border border-transparent bg-preto/10 text-preto hover:bg-preto/15'
        : 'border border-branco/35 text-branco hover:bg-branco/10'
    "
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focus="hovered = true"
    @blur="hovered = false"
  >
    <slot :active="hovered" />
  </a>
</template>
