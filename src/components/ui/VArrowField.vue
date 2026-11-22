<!--
  Pattern de v-arrows subindo (Figma: Contato → "Pattern / v-arrows subindo", 112:49).
  Cada v-arrow nasce abaixo do container e sobe até sair pelo topo, em loop.

  Rastro denso: a v-arrow vai "deixando" cópias que encolhem e se apagam. Como ela sobe
  em velocidade constante, a cópia a uma distância d dela tem sempre a mesma idade
  (d ÷ velocidade), logo sempre a mesma opacidade e escala. Por isso o rastro é
  desenhado uma vez, junto da v-arrow, e o conjunto inteiro se move num único
  elemento por transform (feito pela placa de vídeo, sem redesenhar o SVG).
  Antes eram ~15 animações de opacidade/escala por v-arrow, redesenhando a cada quadro.

  Com prefers-reduced-motion, fica tudo parado na posição `y`, com o rastro do Figma.
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { V_ARROW_PATHS, V_ARROW_VIEWBOX } from './vArrowPaths'

const props = defineProps({
  // x: centro em % da largura; y: topo em % (posição parada, só com movimento reduzido);
  // w: largura em px na referência de 1440; o: opacidade (0–1)
  arrows: { type: Array, required: true },
  // velocidade em px/s da menor (34px) e da maior (112px): as maiores, mais "perto", sobem mais rápido
  speed: { type: Array, default: () => [45, 110] },
  // quantas cópias formam o rastro.
  // Comprimento do rastro ≈ trailLength × TRAIL_SPACING alturas (14 × 0.15 ≈ 2,1).
  trailLength: { type: Number, default: 14 },
})

const MAIN = V_ARROW_PATHS[0]
// Rastro estático do Figma, usado só com movimento reduzido.
const STATIC_TRAIL = V_ARROW_PATHS.slice(1)
// Altura da peça (sem rastro) no viewBox de 112 de largura.
const ARROW_HEIGHT_UNITS = 56
// × altura da v-arrow. Pequeno = rastro denso e contínuo (as cópias se sobrepõem).
const TRAIL_SPACING = 0.15
// Opacidade da cópia mais nova. Baixa porque, com o rastro denso,
// várias cópias se sobrepõem e as opacidades se somam.
const TRAIL_START_OPACITY = 0.12
const TRAIL_END_SCALE = 0.86 ** 4 // encolhe como a 4ª cópia do Figma

// Cópias do rastro, da mais nova (k = 1) à mais velha. p = idade relativa (0–1).
// Mesmas curvas de antes: opacidade e escala com power1.out ao longo da vida da cópia.
const CENTER_X = V_ARROW_VIEWBOX.width / 2
const trail = Array.from({ length: props.trailLength - 1 }, (_, i) => {
  const k = i + 1
  const p = k / props.trailLength
  const eased = 1 - (1 - p) ** 2 // power1.out
  const scale = 1 + (TRAIL_END_SCALE - 1) * eased
  const y = k * TRAIL_SPACING * ARROW_HEIGHT_UNITS
  return {
    k,
    opacity: +(TRAIL_START_OPACITY * (1 - eased)).toFixed(4),
    // encolhe a partir do topo, no centro (como o transformOrigin '50% 0%' de antes)
    transform: `translate(${CENTER_X} ${y.toFixed(2)}) scale(${scale.toFixed(4)}) translate(${-CENTER_X} 0)`,
  }
}).reverse() // as mais velhas primeiro, para a v-arrow e as mais novas ficarem por cima

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
    const loops = []

    root.value.querySelectorAll('[data-v-arrow]').forEach((el, i) => {
      const box = el.getBoundingClientRect()
      if (!box.width) return // campo escondido (ex.: versão mobile no desktop)

      const t = gsap.utils.clamp(0, 1, (Number(el.dataset.w) - 34) / (112 - 34))
      const speed = gsap.utils.interpolate(props.speed[0], props.speed[1], t) // px/s
      // Do pé do container (top: 100%) até a v-arrow e o rastro passarem do topo.
      const travelPx = containerH + box.height + 16

      const rise = gsap.fromTo(
        el,
        { y: 0 },
        { y: -travelPx, duration: travelPx / speed, ease: 'none', repeat: -1, force3D: true },
      )
      rise.progress((i * 0.618) % 1) // espalha as v-arrows ao longo do caminho
      loops.push(rise)
    })

    // Pausa fora da tela.
    ScrollTrigger.create({
      trigger: root.value,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: ({ isActive }) => loops.forEach((a) => (isActive ? a.resume() : a.pause())),
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
      :class="{ 'will-change-transform': !reduced }"
      :style="{ left: `${a.x}%`, top: reduced ? `${a.y}%` : '100%', width: widthFor(a.w), opacity: a.o }"
      fill="none"
    >
      <template v-if="reduced">
        <path v-for="p in STATIC_TRAIL" :key="p.id" :d="p.d" class="fill-azul" :fill-opacity="p.opacity" />
      </template>
      <template v-else>
        <path
          v-for="g in trail"
          :key="g.k"
          :d="MAIN.d"
          class="fill-azul"
          :fill-opacity="g.opacity"
          :transform="g.transform"
        />
      </template>
      <path :d="MAIN.d" class="fill-azul" />
    </svg>
  </div>
</template>
