<!--
  Pattern de v-arrows subindo (Figma: Contato → "Pattern / v-arrows subindo", 112:49).
  Cada v-arrow nasce abaixo do container, sobe até sair pelo topo e recomeça.
  As 4 cópias do rastro seguem com atraso de ~0,08s.
  Com prefers-reduced-motion, ficam paradas na posição `y`.
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { V_ARROW_PATHS, V_ARROW_VIEWBOX } from './vArrowPaths'

const props = defineProps({
  // x: centro em % da largura; y: topo em % (posição estática, só com movimento reduzido);
  // w: largura em px na referência de 1440; o: opacidade (0–1)
  arrows: { type: Array, required: true },
  trailDelay: { type: Number, default: 0.08 },
  // velocidade em px/s da menor (34px) e da maior (112px): as maiores, mais "perto", sobem mais rápido
  speed: { type: Array, default: () => [45, 110] },
})

const root = ref(null)
const reduced = ref(false)
let ctx
let resizeTimer

// Largura acompanha a tela (referência 1440), sem passar do tamanho do Figma.
const widthFor = (w) => `clamp(${Math.round(w * 0.55)}px, ${(w / 14.4).toFixed(3)}vw, ${w}px)`

function build() {
  ctx?.revert()
  ctx = gsap.context(() => {
    const containerH = root.value.offsetHeight
    const timelines = []

    root.value.querySelectorAll('[data-v-arrow]').forEach((svg, i) => {
      const box = svg.getBoundingClientRect()
      if (!box.width) return // campo escondido (ex.: versão mobile no desktop)

      const t = gsap.utils.clamp(0, 1, (Number(svg.dataset.w) - 34) / (112 - 34))
      const speed = gsap.utils.interpolate(props.speed[0], props.speed[1], t)
      // Do pé do container (top: 100%) até o rastro inteiro passar do topo.
      const travelPx = containerH + box.height + 16
      const travelUnits = (travelPx * V_ARROW_VIEWBOX.width) / box.width
      const duration = travelPx / speed

      const tl = gsap.timeline({ repeat: -1 })
      svg.querySelectorAll('path').forEach((path, k) => {
        tl.fromTo(path, { y: 0 }, { y: -travelUnits, duration, ease: 'none' }, k * props.trailDelay)
      })
      tl.progress((i * 0.618) % 1) // espalha as v-arrows ao longo do caminho
      timelines.push(tl)
    })

    // Pausa fora da tela.
    ScrollTrigger.create({
      trigger: root.value,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: ({ isActive }) => timelines.forEach((tl) => (isActive ? tl.resume() : tl.pause())),
    })
  }, root.value)
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(build, 200)
}

onMounted(() => {
  if (prefersReducedMotion()) {
    reduced.value = true
    return
  }
  build()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  clearTimeout(resizeTimer)
  ctx?.revert()
})
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
      :style="{ left: `${a.x}%`, top: reduced ? `${a.y}%` : '100%', width: widthFor(a.w), opacity: a.o }"
      fill="none"
    >
      <path v-for="p in V_ARROW_PATHS" :key="p.id" :d="p.d" class="fill-azul" :fill-opacity="p.opacity" />
    </svg>
  </div>
</template>
