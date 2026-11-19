<!-- Portado de lucide-animated.com/icons/menu (MIT) -->
<script setup>
import { motion } from 'motion-v'
import { iconProps, useIconState } from './useIconState'

const props = defineProps(iconProps)
const { state, onEnter, onLeave } = useIconState(props)

const variants = {
  normal: { rotate: 0, y: 0, opacity: 1 },
  animate: (custom) => ({
    rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
    y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
    opacity: custom === 2 ? 0 : 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  }),
}
</script>

<template>
  <span class="inline-flex" aria-hidden="true" @mouseenter="onEnter" @mouseleave="onLeave">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <motion.line v-for="(y, i) in [6, 12, 18]" :key="y" x1="4" x2="20" :y1="y" :y2="y"
        :custom="i + 1" :variants="variants" initial="normal" :animate="state" />
    </svg>
  </span>
</template>
