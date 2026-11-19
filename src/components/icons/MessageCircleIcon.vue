<!-- Portado de lucide-animated.com/icons/message-circle (MIT) -->
<script setup>
import { motion } from 'motion-v'
import { iconProps, useIconState } from './useIconState'

const props = defineProps(iconProps)
const { state, onEnter, onLeave } = useIconState(props)

const variants = {
  normal: { scale: 1, rotate: 0 },
  animate: {
    scale: 1.05,
    rotate: [0, -7, 7, 0],
    transition: {
      rotate: { duration: 0.5, ease: 'easeInOut' },
      scale: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
}
</script>

<template>
  <span class="inline-flex" aria-hidden="true" @mouseenter="onEnter" @mouseleave="onLeave">
    <motion.svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      :variants="variants" initial="normal" :animate="state">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </motion.svg>
  </span>
</template>
