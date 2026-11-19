<!-- Figma: ui → "Botão numerado" (116:28). Usado nos cards de case, sobre fundo azul. -->
<script setup>
import { ref } from 'vue'
import ArrowUpRightIcon from '../icons/ArrowUpRightIcon.vue'
import RollText from './RollText.vue'

defineProps({
  href: { type: String, required: true },
  numero: { type: String, required: true }, // "01", "02", "03"
  label: { type: String, required: true }, // nome acessível, ex.: "Ver o case Cliente 01"
})

const hovered = ref(false)
</script>

<template>
  <a
    :href="href"
    :aria-label="label"
    class="group inline-flex shrink-0 items-center gap-1 rounded-btn border border-branco bg-branco py-1 pr-1 pl-3 text-azul"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focus="hovered = true"
    @blur="hovered = false"
  >
    <RollText :text="numero" :active="hovered" class="text-label" aria-hidden="true" />
    <span class="flex size-7 items-center justify-center rounded-icon bg-branco transition-transform duration-200 group-hover:scale-108">
      <ArrowUpRightIcon :size="16" :active="hovered" />
    </span>
  </a>
</template>
