<!--
  Pattern de v-arrows subindo (Figma: Contato → "Pattern / v-arrows subindo", 112:49).
  Cada v-arrow nasce abaixo do container e sobe até sair pelo topo, em loop.
  Rastro: enquanto sobe, ela deixa cópias no caminho (a cada ~0,95× a própria altura,
  como no Figma). Cada cópia fica parada onde nasceu, encolhe e se apaga,
  então ~4 ficam visíveis atrás dela.
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
  // quantas cópias do rastro ficam visíveis ao mesmo tempo
  trailLength: { type: Number, default: 4 },
})

const MAIN = V_ARROW_PATHS[0]
// Rastro estático do Figma, usado só com movimento reduzido.
const STATIC_TRAIL = V_ARROW_PATHS.slice(1)
// Altura da peça (sem rastro) no viewBox de 112 de largura.
const ARROW_HEIGHT_UNITS = 56
const TRAIL_SPACING = 0.95 // × altura da v-arrow, como no Figma
const TRAIL_START_OPACITY = 0.32 // 1ª cópia do Figma
const TRAIL_END_SCALE = 0.86 ** 4 // encolhe como a 4ª cópia do Figma

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

    root.value.querySelectorAll('[data-v-arrow]').forEach((svg, i) => {
      const box = svg.getBoundingClientRect()
      if (!box.width) return // campo escondido (ex.: versão mobile no desktop)

      const unitsPerPx = V_ARROW_VIEWBOX.width / box.width
      const t = gsap.utils.clamp(0, 1, (Number(svg.dataset.w) - 34) / (112 - 34))
      const speed = gsap.utils.interpolate(props.speed[0], props.speed[1], t) // px/s

      // Do pé do container (top: 100%) até passar do topo, com folga para o rastro sumir.
      const arrowPx = ARROW_HEIGHT_UNITS / unitsPerPx
      const travelPx = containerH + arrowPx + 16
      const duration = travelPx / speed

      const main = svg.querySelector('[data-main]')
      const ghosts = [...svg.querySelectorAll('[data-ghost]')]
      const spacingUnits = TRAIL_SPACING * ARROW_HEIGHT_UNITS
      // Cada cópia vive o tempo de a v-arrow andar `trailLength` espaçamentos.
      const ghostLife = ((TRAIL_SPACING * arrowPx) / speed) * props.trailLength

      // Solta uma cópia na posição `y`; as cópias se revezam num pool.
      let next = 0
      const spawnAt = (y) => {
        const ghost = ghosts[next]
        next = (next + 1) % ghosts.length
        gsap.killTweensOf(ghost)
        gsap.fromTo(
          ghost,
          { y, opacity: TRAIL_START_OPACITY, scale: 1, transformOrigin: '50% 0%' },
          { opacity: 0, scale: TRAIL_END_SCALE, duration: ghostLife, ease: 'power1.out' },
        )
      }

      // Solta por distância percorrida (não por tempo): o espaçamento fica
      // certo mesmo se o navegador perder quadros.
      let lastY = null
      const rise = gsap.fromTo(
        main,
        { y: 0 },
        {
          y: -travelPx * unitsPerPx,
          duration,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            const y = gsap.getProperty(main, 'y')
            if (lastY === null || y > lastY) lastY = y // início ou recomeço do loop
            while (lastY - y >= spacingUnits) {
              lastY -= spacingUnits
              spawnAt(lastY)
            }
          },
        },
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
      :style="{ left: `${a.x}%`, top: reduced ? `${a.y}%` : '100%', width: widthFor(a.w), opacity: a.o }"
      fill="none"
    >
      <template v-if="reduced">
        <path v-for="p in STATIC_TRAIL" :key="p.id" :d="p.d" class="fill-azul" :fill-opacity="p.opacity" />
      </template>
      <!-- pool de cópias do rastro (uma a mais que o visível, para a troca não piscar) -->
      <template v-else>
        <path v-for="n in trailLength + 1" :key="`g${n}`" data-ghost :d="MAIN.d" class="fill-azul" opacity="0" />
      </template>
      <path data-main :d="MAIN.d" class="fill-azul" />
    </svg>
  </div>
</template>
