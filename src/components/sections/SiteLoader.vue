<!--
  Loader (Figma: prototype → "Landing / Loader", 124:764).
  0. O index.html já mostra uma cópia estática (#boot: fundo azul + símbolo vazio)
     no primeiro desenho da página, antes do JavaScript.
  1. Quando a página termina de carregar e montar (fontes, recursos e o trabalho
     pesado das seções), o símbolo enche de branco de baixo para cima. Começar só
     depois evita o "pulo": com o navegador ocupado, o enchimento andava sem ser
     desenhado e já aparecia pela metade.
  2. Cheio, o símbolo vira uma janela para a hero e cresce até tomar a tela
     (o branco do símbolo é o fundo da hero). A hero entra durante a expansão.
  Com prefers-reduced-motion, o loader não aparece.
-->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { endIntro, revealIntro, startIntro } from '../../composables/useIntro'
import { SYMBOL_BOX, SYMBOL_PATHS, symbolLayout, symbolTransform } from '../ui/symbolGeometry'

// Geometria compartilhada com a transição Manifesto → Cases.
const PATHS = SYMBOL_PATHS
const BOX = SYMBOL_BOX

const FILL_EMPTY_OPACITY = 0.16 // símbolo "vazio"
const FILL_TIME = 1.0 // s: enchimento completo, depois que a página está pronta
const EXPAND_TIME = 1.0 // s: expansão do símbolo até cobrir a tela

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

// Espera n quadros (dá tempo de as seções terminarem o trabalho pesado do carregamento).
const frames = (n) => new Promise((r) => (function next(k) { k ? requestAnimationFrame(() => next(k - 1)) : r() })(n))
const removeBoot = () => document.getElementById('boot')?.remove()

const pageLoaded = () =>
  new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))

onMounted(() => {
  if (!visible.value) {
    removeBoot()
    document.documentElement.style.overflow = ''
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

  // Com a página pronta (fontes, recursos e 2 quadros livres): enche, vira janela e expande.
  Promise.all([document.fonts.ready, pageLoaded()])
    .then(() => frames(2))
    .then(() => {
      removeBoot() // o SiteLoader, idêntico, já está por baixo
      tl = gsap.timeline({ onComplete: finish })
      tl.to(state, { fill: 1, duration: FILL_TIME, ease: 'power1.inOut', onUpdate: () => setFill(state.fill) })
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
        duration: EXPAND_TIME,
        // acelera até o fim: sem a "cauda" lenta com a tela já quase toda revelada
        ease: 'power2.in',
        onUpdate: () => {
          setTransform(P, state.scale)
          // s1 tem 15% de folga: em s1 / 1,15 a janela já cobre a tela inteira
          if (state.scale >= s1 / 1.15) revealIntro()
        },
      })
    })
})

onBeforeUnmount(() => {
  tl?.kill()
  removeBoot()
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
