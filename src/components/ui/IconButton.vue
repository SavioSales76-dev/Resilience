<!-- Figma: ui → "Botão ícone" (117:28). Quadrado 48×48 só com ícone. -->
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
    class="inline-flex size-12 shrink-0 items-center justify-center rounded-btn transition-colors"
    :class="tema === 'claro' ? 'bg-preto/10 text-preto hover:bg-preto/15' : 'bg-branco/15 text-branco hover:bg-branco/25'"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focus="hovered = true"
    @blur="hovered = false"
  >
    <slot :active="hovered" />
  </a>
</template>
