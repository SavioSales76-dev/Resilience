<!--
  Loader (Figma: prototype → "Landing / Loader", 124:764).
  1. Tela azul com o símbolo vazio (contorno apagado), que vai enchendo de branco
     de baixo para cima conforme a página carrega (fontes + recursos).
  2. Cheio, o símbolo vira uma janela para a hero e cresce até tomar a tela
     (o branco do símbolo é o fundo da hero). A hero entra durante a expansão.
  Com prefers-reduced-motion, o loader não aparece.
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { endIntro, startIntro } from '../../composables/useIntro'
import { SYMBOL_BOX, SYMBOL_PATHS, symbolLayout, symbolTransform } from '../ui/symbolGeometry'

// Geometria compartilhada com a transição Manifesto → Cases.
const PATHS = SYMBOL_PATHS
const BOX = SYMBOL_BOX

const FILL_EMPTY_OPACITY = 0.16 // símbolo "vazio"
const MIN_FILL_TIME = 1.3 // s: tempo mínimo enchendo, mesmo se a página carregar antes

const visible = ref(!prefersReducedMotion())
const symbolGroup = ref(null)
const holeGroup = ref(null)
const fillRect = ref(null)
let tl

// Tamanho do símbolo na tela: 437 px em 1440, proporcional, com mínimo no mobile.
function layout() {
  const W = window.innerWidth
  const H = window.innerHeight
  return symbolLayout(W, H, gsap.utils.clamp(150, BOX.w, W * (BOX.w / 1440)))
}

function setTransform(P, s) {
  const t = symbolTransform(P, s)
  symbolGroup.value?.setAttribute('transform', t)
  holeGroup.value?.setAttribute('transform', t)
}

function setFill(p) {
  fillRect.value?.setAttribute('y', BOX.y + BOX.h * (1 - p))
  fillRect.value?.setAttribute('height', BOX.h * p)
}

const pageLoaded = () =>
  new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))

onMounted(() => {
  if (!visible.value) {
    endIntro()
    return
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  document.documentElement.style.overflow = 'hidden'

  let { s0, s1, P } = layout()
  const state = { fill: 0, scale: s0 }
  setTransform(P, s0)
  setFill(0)

  let expanding = false
  const onResize = () => {
    ;({ s0, s1, P } = layout())
    if (!expanding) state.scale = s0 // durante a expansão, o tween segue até o novo s1
    setTransform(P, state.scale)
  }
  window.addEventListener('resize', onResize)

  const finish = () => {
    window.removeEventListener('resize', onResize)
    document.documentElement.style.overflow = ''
    visible.value = false
    endIntro()
  }

  // 1. Enche até 85% no tempo mínimo.
  const fillToMin = gsap.to(state, {
    fill: 0.85,
    duration: MIN_FILL_TIME,
    ease: 'power1.inOut',
    onUpdate: () => setFill(state.fill),
  })

  // 2. Com a página pronta (e o tempo mínimo cumprido): completa, vira janela e expande.
  Promise.all([document.fonts.ready, pageLoaded(), fillToMin.then()]).then(() => {
    tl = gsap.timeline({ onComplete: finish })
    tl.to(state, { fill: 1, duration: 0.45, ease: 'power2.out', onUpdate: () => setFill(state.fill) })
    // Troca o símbolo desenhado pela janela (mesmo branco: a troca não aparece).
    tl.call(() => {
      // A janela sempre abre no topo da hero, mesmo se a página tiver rolado
      // durante o loader (no celular, o overflow: hidden nem sempre segura o toque).
      window.scrollTo(0, 0)
      holeGroup.value.style.display = ''
      symbolGroup.value.style.display = 'none'
      expanding = true
      startIntro()
    })
    tl.to(state, {
      scale: () => s1,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => setTransform(P, state.scale),
    })
  })

  tl = fillToMin
})

onBeforeUnmount(() => {
  tl?.kill()
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50" role="status" aria-live="polite">
    <span class="sr-only">Carregando</span>
    <svg class="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <mask id="loader-janela" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="white" />
          <g ref="holeGroup" style="display: none">
            <path v-for="d in PATHS" :key="d" :d="d" fill="black" />
          </g>
        </mask>
        <clipPath id="loader-enchimento">
          <rect ref="fillRect" :x="BOX.x - 1" :y="BOX.y + BOX.h" :width="BOX.w + 2" height="0" />
        </clipPath>
      </defs>

      <rect width="100%" height="100%" class="fill-azul" mask="url(#loader-janela)" />

      <g ref="symbolGroup">
        <path v-for="d in PATHS" :key="d" :d="d" class="fill-branco" :fill-opacity="FILL_EMPTY_OPACITY" />
        <g clip-path="url(#loader-enchimento)">
          <path v-for="d in PATHS" :key="d" :d="d" class="fill-branco" />
        </g>
      </g>
    </svg>
  </div>
</template>
