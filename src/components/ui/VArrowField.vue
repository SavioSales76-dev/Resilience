<!--
  Pattern de v-arrows subindo (Figma: Contato → "Pattern / v-arrows subindo", 112:49).
  Cada v-arrow tem 4 cópias de rastro que seguem com atraso de ~0,08s.
  Usado também fora do Contato (ex.: atrás do gráfico da hero).
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { V_ARROW_PATHS, V_ARROW_VIEWBOX } from './vArrowPaths'

const props = defineProps({
  // x: centro em % da largura; y: topo em % da altura;
  // w: largura em px na referência de 1440; o: opacidade (0–1)
  arrows: { type: Array, required: true },
  trailDelay: { type: Number, default: 0.08 },
})

const root = ref(null)
let ctx

// Largura acompanha a tela (referência 1440), sem passar do tamanho do Figma.
const widthFor = (w) => `clamp(${Math.round(w * 0.55)}px, ${(w / 14.4).toFixed(3)}vw, ${w}px)`

onMounted(() => {
  if (prefersReducedMotion()) return

  ctx = gsap.context(() => {
    const tweens = []

    root.value.querySelectorAll('[data-v-arrow]').forEach((svg, i) => {
      const px = svg.getBoundingClientRect().width || Number(svg.dataset.w)
      // Parallax: as maiores (mais "perto") sobem mais. 34px → 40px, 112px → 120px.
      const t = gsap.utils.clamp(0, 1, (Number(svg.dataset.w) - 34) / (112 - 34))
      const distPx = gsap.utils.interpolate(40, 120, t)
      const distUnits = (distPx * V_ARROW_VIEWBOX.width) / px
      const duration = gsap.utils.interpolate(3.6, 2.8, t)
      const offset = ((i * 0.37) % 1) * duration // desencontra os ciclos entre as v-arrows

      svg.querySelectorAll('path').forEach((path, k) => {
        tweens.push(
          gsap.to(path, {
            y: -distUnits,
            duration,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: offset + k * props.trailDelay,
          }),
        )
      })
    })

    // Pausa fora da tela.
    ScrollTrigger.create({
      trigger: root.value,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: ({ isActive }) => tweens.forEach((tw) => (isActive ? tw.resume() : tw.pause())),
    })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <svg
      v-for="(a, i) in arrows"
      :key="i"
      data-v-arrow
      :data-w="a.w"
      :viewBox="`0 0 ${V_ARROW_VIEWBOX.width} ${V_ARROW_VIEWBOX.height}`"
      class="absolute h-auto -translate-x-1/2 overflow-visible"
      :style="{ left: `${a.x}%`, top: `${a.y}%`, width: widthFor(a.w), opacity: a.o }"
      fill="none"
    >
      <path v-for="p in V_ARROW_PATHS" :key="p.id" :d="p.d" class="fill-azul" :fill-opacity="p.opacity" />
    </svg>
  </div>
</template>
