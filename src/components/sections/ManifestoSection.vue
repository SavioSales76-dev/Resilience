<!--
  Figma: prototype → "Landing / Manifesto (text scroll) — desktop" (81:15).
  O text scroll (palavras de cinza para preto, "voltar mais forte" em azul) é
  controlado pela IntroScene, que pede as palavras por getWords().
  Transição para os Cases (Figma: "Manifesto → azul" 83:14 a 83:50; nota 88:14):
  o símbolo azul aparece pequeno (80 px) no centro e cresce com o scroll até a tela
  ficar azul. O texto que fica dentro dele aparece branco: é uma cópia do conteúdo,
  recortada pelo mesmo formato do símbolo (clip-path), escalada junto.
  Também controlado pela IntroScene, por buildSymbol().
  Sem animação (prefers-reduced-motion), o texto já aparece no estado final e não há símbolo.
-->
<script setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

import { SYMBOL_PATHS, symbolLayout, symbolTransform } from '../ui/symbolGeometry'

gsap.registerPlugin(SplitText)

const props = defineProps({
  animated: { type: Boolean, default: false },
})

// Cores do text scroll (hex: o GSAP interpola cores sólidas).
const COR_APAGADA = '#C5C5CC' // preto a 20% sobre o branco (Figma)
const COR_TEXTO = '#080812'
const COR_DESTAQUE = '#3D3BF3'

const TEXTO_ANTES = 'Toda marca pode cair, se adaptar e '
const DESTAQUE = 'voltar mais forte'
const TEXTO_DEPOIS =
  '. A gente cuida das suas redes com estratégia, constância e atenção de perto, para o seu negócio aparecer, atrair e vender todos os dias.'

let split = null
const root = ref(null)
const visual = ref(null)
const copyText = ref(null)
const symbolGroup = ref(null)
const clipShapes = ref([]) // <clipPath> não aceita <g>: a transformação vai em cada forma

// Divide em palavras e devolve cada uma com a cor final dela.
function getWords() {
  if (!split) split = SplitText.create(visual.value, { type: 'words', aria: 'none' })
  return split.words.map((el) => ({
    el,
    to: el.closest('[data-destaque]') ? COR_DESTAQUE : COR_TEXTO,
  }))
}

// Símbolo: 80 px de largura em 1440, proporcional, entre 60 e 80 px.
function layout() {
  const W = root.value.clientWidth
  const H = root.value.clientHeight
  return symbolLayout(W, H, gsap.utils.clamp(60, 80, (W * 80) / 1440))
}

function applyScale(s) {
  const t = symbolTransform(layout().P, s)
  symbolGroup.value.setAttribute('transform', t)
  clipShapes.value.forEach((el) => el.setAttribute('transform', t))
}

// Timeline do símbolo (sem duração própria de scroll: a IntroScene encaixa na cena).
function buildSymbol() {
  // A cópia branca quebra as linhas igual ao original (também dividido em palavras).
  SplitText.create(copyText.value, { type: 'words', aria: 'none' })
  const state = { s: 0.0001 }
  const update = () => applyScale(state.s)
  const tl = gsap.timeline()
  // aparece pequeno no centro...
  tl.fromTo(state, { s: 0.0001 }, { s: () => layout().s0, duration: 0.25, ease: 'back.out(1.6)', onUpdate: update })
  // ...e cresce até cobrir a tela; acelera no fim (power3.in)
  tl.to(state, { s: () => layout().s1, duration: 1.75, ease: 'power3.in', onUpdate: update })
  return tl
}

// Começa invisível (escala ~0), antes de qualquer scroll.
onMounted(() => props.animated && applyScale(0.0001))

defineExpose({ getWords, buildSymbol, COR_APAGADA })
</script>

<template>
  <section ref="root" id="sobre" aria-labelledby="sobre-titulo" class="relative flex h-svh min-h-[640px] items-center justify-center bg-branco px-gutter">
    <div class="absolute inset-x-gutter top-0 h-px bg-preto/10" aria-hidden="true" />

    <div class="flex max-w-[1120px] flex-col items-center gap-8 text-center md:gap-10">
      <p id="sobre-titulo" class="flex items-center gap-2.5 text-botao text-preto/70">
        <span class="size-2.5 rounded-[1px] bg-azul" aria-hidden="true" />
        Sobre a Resilience
      </p>

      <!-- texto lido pelos leitores de tela (uma vez, sem a divisão em palavras) -->
      <p class="sr-only">{{ TEXTO_ANTES }}{{ DESTAQUE }}{{ TEXTO_DEPOIS }}</p>
      <p
        ref="visual"
        class="text-manifesto"
        aria-hidden="true"
        :style="animated ? { color: COR_APAGADA } : undefined"
        :class="{ 'text-preto': !animated }"
      >
        {{ TEXTO_ANTES }}<span data-destaque :class="{ 'text-azul': !animated }">{{ DESTAQUE }}</span>{{ TEXTO_DEPOIS }}
      </p>
    </div>

    <template v-if="animated">
      <!-- símbolo azul, por cima do texto -->
      <svg class="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id="manifesto-simbolo">
            <path v-for="d in SYMBOL_PATHS" :key="d" ref="clipShapes" :d="d" />
          </clipPath>
        </defs>
        <g ref="symbolGroup"><path v-for="d in SYMBOL_PATHS" :key="d" :d="d" class="fill-azul" /></g>
      </svg>
      <!-- cópia branca do conteúdo, visível só dentro do símbolo -->
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center px-gutter text-branco"
        style="clip-path: url(#manifesto-simbolo)"
        aria-hidden="true"
      >
        <div class="flex max-w-[1120px] flex-col items-center gap-8 text-center md:gap-10">
          <p class="flex items-center gap-2.5 text-botao">
            <span class="size-2.5 rounded-[1px] bg-branco" />
            Sobre a Resilience
          </p>
          <p ref="copyText" class="text-manifesto">{{ TEXTO_ANTES }}{{ DESTAQUE }}{{ TEXTO_DEPOIS }}</p>
        </div>
      </div>
    </template>
  </section>
</template>
