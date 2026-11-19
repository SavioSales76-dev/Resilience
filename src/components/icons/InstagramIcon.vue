<!-- Portado de lucide-animated.com/icons/instagram (MIT) -->
<script setup>
import { motion } from 'motion-v'
import { iconProps, useIconState } from './useIconState'

const props = defineProps(iconProps)
const { state, onEnter, onLeave } = useIconState(props)

const draw = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: { duration: 0.4, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: { duration: 0.6, ease: 'linear', opacity: { duration: 0.1 } },
  },
}
</script>

<template>
  <span class="inline-flex" aria-hidden="true" @mouseenter="onEnter" @mouseleave="onLeave">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <motion.rect x="2" y="2" width="20" height="20" rx="5" ry="5"
        :variants="draw" initial="normal" :animate="state" />
      <motion.path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        :variants="draw" initial="normal" :animate="state" />
      <motion.line x1="17.5" x2="17.51" y1="6.5" y2="6.5"
        :variants="draw" initial="normal" :animate="state" />
    </svg>
  </span>
</template>
