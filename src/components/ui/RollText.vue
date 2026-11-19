<!--
  Micro-interação de texto: no hover, as letras sobem uma a uma e uma cópia
  idêntica entra por baixo (GSAP SplitText).
  - Sem a prop `active`, reage ao hover/foco do link ou botão onde está.
  - Com `active`, quem controla é o pai.
  Leitores de tela leem só o texto escondido (as duas cópias animadas são aria-hidden).
  Com prefers-reduced-motion, o texto fica parado.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'

gsap.registerPlugin(SplitText)

const props = defineProps({
  text: { type: String, required: true },
  active: { type: Boolean, default: undefined },
  stagger: { type: Number, default: 0.018 }, // s entre letras
  duration: { type: Number, default: 0.45 },
})

const root = ref(null)
const front = ref(null)
const back = ref(null)

let splits = []
let host = null
let ready = false

function roll(on) {
  if (!ready) return
  const distance = root.value.offsetHeight // a cópia de baixo está exatamente a essa distância
  for (const s of splits) {
    gsap.to(s.chars, {
      y: on ? -distance : 0,
      duration: props.duration,
      ease: 'power3.out',
      stagger: props.stagger,
      overwrite: true,
    })
  }
}

const enter = () => props.active === undefined && roll(true)
const leave = () => props.active === undefined && roll(false)

watch(
  () => props.active,
  (on) => on !== undefined && roll(on),
)

onMounted(() => {
  if (prefersReducedMotion()) return

  // Divide só depois das fontes, para as letras ficarem com a largura certa.
  document.fonts.ready.then(() => {
    if (!root.value) return
    splits = [front.value, back.value].map((el) =>
      SplitText.create(el, { type: 'words,chars', aria: 'none', wordsClass: 'inline-block', charsClass: 'inline-block' }),
    )
    ready = true
  })

  host = root.value.closest('a, button')
  host?.addEventListener('mouseenter', enter)
  host?.addEventListener('mouseleave', leave)
  host?.addEventListener('focus', enter)
  host?.addEventListener('blur', leave)
})

onBeforeUnmount(() => {
  host?.removeEventListener('mouseenter', enter)
  host?.removeEventListener('mouseleave', leave)
  host?.removeEventListener('focus', enter)
  host?.removeEventListener('blur', leave)
  splits.forEach((s) => s.revert())
})
</script>

<template>
  <!-- padding/margem negativos: espaço para acentos e descendentes (ç, g) sem cortar no overflow -->
  <span ref="root" class="relative inline-block overflow-hidden py-[0.15em] -my-[0.15em] align-top">
    <span class="sr-only">{{ text }}</span>
    <span ref="front" class="block whitespace-nowrap" aria-hidden="true">{{ text }}</span>
    <!-- a cópia fica uma altura inteira abaixo da original (100% + o mesmo padding de cima) -->
    <span ref="back" class="absolute inset-x-0 top-[calc(100%+0.15em)] block whitespace-nowrap" aria-hidden="true">{{ text }}</span>
  </span>
</template>
