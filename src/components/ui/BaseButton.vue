<!-- Figma: ui → "Botão" (71:31). Por enquanto: tipo Primário / WhatsApp, temas Claro e Escuro. -->
<script setup>
import { computed, ref } from 'vue'
import ArrowUpRightIcon from '../icons/ArrowUpRightIcon.vue'
import MessageCircleIcon from '../icons/MessageCircleIcon.vue'

const props = defineProps({
  href: { type: String, required: true },
  label: { type: String, default: 'Solicitar orçamento' },
  tipo: { type: String, default: 'primario' }, // 'primario' | 'whatsapp'
  tema: { type: String, default: 'claro' }, // 'claro' (fundo claro) | 'escuro'
  compacto: { type: Boolean, default: false }, // só a caixa do ícone (nav mobile)
  external: { type: Boolean, default: true },
})

const hovered = ref(false)
const icon = computed(() => (props.tipo === 'whatsapp' ? MessageCircleIcon : ArrowUpRightIcon))
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    :aria-label="compacto ? label : undefined"
    class="group inline-flex h-12 shrink-0 items-center gap-4 rounded-btn p-2 transition-colors"
    :class="[
      compacto ? 'pl-2' : 'pl-5',
      tema === 'claro' ? 'bg-preto text-branco' : 'bg-branco text-preto',
    ]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focus="hovered = true"
    @blur="hovered = false"
  >
    <span v-if="!compacto" class="text-botao whitespace-nowrap">{{ label }}</span>
    <span
      class="flex size-8 items-center justify-center overflow-hidden rounded-icon bg-azul text-branco transition-transform duration-200 group-hover:scale-108"
    >
      <component :is="icon" :size="18" :active="hovered" />
    </span>
  </a>
</template>
