<!-- Portado de lucide-animated.com/icons/arrow-up-right (MIT) -->
<script setup>
import { motion } from 'motion-v'
import { iconProps, useIconState } from './useIconState'

const props = defineProps(iconProps)
const { state, onEnter, onLeave } = useIconState(props)

const variants = {
  normal: { scale: 1, x: 0, y: 0 },
  animate: {
    scale: [1, 0.85, 1],
    x: [0, -4, 0],
    y: [0, 4, 0],
    originX: 1,
    originY: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}
</script>

<template>
  <span class="inline-flex" aria-hidden="true" @mouseenter="onEnter" @mouseleave="onLeave">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <motion.g :variants="variants" initial="normal" :animate="state">
        <path d="M7 7H17" />
        <path d="M17 7V17" />
        <path d="M7 17L17 7" />
      </motion.g>
    </svg>
  </span>
</template>
