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

// Paths do asset do Figma (src/assets/loader.svg), em coordenadas do frame 1440 × 900.
const PATHS = [
  'M668.696 492.111L537.623 444.354C536.127 443.808 534.624 445.147 534.993 446.696L565.46 574.621C565.622 575.299 566.125 575.845 566.788 576.06L719.882 625.799C720.284 625.93 720.716 625.93 721.118 625.799L874.212 576.06C874.875 575.845 875.378 575.299 875.54 574.621L906.007 446.696C906.376 445.147 904.873 443.808 903.377 444.354L772.304 492.111L721.228 512.06C720.76 512.243 720.24 512.243 719.772 512.06L668.696 492.111Z',
  'M659.764 333.857L505.544 274.367C504.042 273.788 502.506 275.129 502.878 276.695L538.779 427.812C538.938 428.479 539.427 429.019 540.075 429.241L719.85 490.995C720.271 491.14 720.729 491.14 721.15 490.995L900.925 429.241C901.573 429.019 902.062 428.479 902.221 427.812L938.122 276.695C938.494 275.129 936.958 273.788 935.456 274.367L781.236 333.857L721.229 357.352C720.76 357.535 720.24 357.535 719.771 357.352L659.764 333.857Z',
]
// Caixa do símbolo no frame.
const BOX = { x: 502.5, y: 273.5, w: 436, h: 353 }
// Centro da peça de cima (origem da expansão), relativo à caixa.
const ORIGIN = { x: 720.5 - BOX.x, y: 424.2 - BOX.y }
// Geometria da peça de cima, para calcular quanto escalar até cobrir a tela.
const HALF_THICKNESS = 66.8 // da origem até o V de cima / de baixo
const BOTTOM_SLOPE = 0.342 // a borda de baixo sobe em direção às laterais

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
  const s0 = gsap.utils.clamp(150, BOX.w, W * (BOX.w / 1440)) / BOX.w
  // ponto da tela que fica parado durante a expansão
  const P = { x: W / 2, y: H / 2 - (BOX.h / 2 - ORIGIN.y) * s0 }
  const s1 =
    1.15 *
    Math.max(P.y / HALF_THICKNESS, (H - P.y + (BOTTOM_SLOPE * W) / 2) / HALF_THICKNESS, W / 2 / ORIGIN.x)
  return { s0, s1, P }
}

function setTransform(P, s) {
  const tx = P.x - ORIGIN.x * s
  const ty = P.y - ORIGIN.y * s
  const t = `translate(${tx} ${ty}) scale(${s}) translate(${-BOX.x} ${-BOX.y})`
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
