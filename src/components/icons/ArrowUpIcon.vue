<!-- Portado de lucide-animated.com/icons/arrow-up (MIT) -->
<script setup>
import { motion } from 'motion-v'
import { iconProps, useIconState } from './useIconState'

const props = defineProps(iconProps)
const { state, onEnter, onLeave } = useIconState(props)

const head = {
  normal: { d: 'm5 12 7-7 7 7', y: 0 },
  animate: { d: 'm5 12 7-7 7 7', y: [0, 3, 0], transition: { duration: 0.4 } },
}
const stem = {
  normal: { d: 'M12 19V5' },
  animate: { d: ['M12 19V5', 'M12 19V10', 'M12 19V5'], transition: { duration: 0.4 } },
}
</script>

<template>
  <span class="inline-flex" aria-hidden="true" @mouseenter="onEnter" @mouseleave="onLeave">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <motion.path d="m5 12 7-7 7 7" :variants="head" initial="normal" :animate="state" />
      <motion.path d="M12 19V5" :variants="stem" initial="normal" :animate="state" />
    </svg>
  </span>
</template>
