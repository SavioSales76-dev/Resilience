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
  // atraso TOTAL distribuído entre as letras (não por letra): textos longos não ficam mais lentos
  stagger: { type: Number, default: 0.12 },
  duration: { type: Number, default: 0.32 }, // de cada letra
  leaveSpeed: { type: Number, default: 1.5 }, // a volta é mais rápida que a ida
})

const root = ref(null)
const front = ref(null)
const back = ref(null)

let splits = []
let host = null
let tl = null
let pending = null // estado pedido antes do SplitText ficar pronto

// Uma única timeline, criada uma vez: entrar toca para frente, sair toca de trás
// para frente a partir do ponto exato onde parou. Assim, passar o mouse rápido
// nunca deixa letras em posições misturadas (o que acontecia criando tweens novos
// a cada hover).
function build() {
  const distance = () => root.value.offsetHeight // a cópia de baixo está exatamente a essa distância
  const letter = {
    y: () => -distance(),
    duration: props.duration,
    ease: 'power2.inOut', // simétrico: fica igual na ida e na volta
    stagger: { amount: props.stagger },
  }
  tl = gsap.timeline({ paused: true })
  tl.to(splits[0].chars, letter, 0)
  tl.to(splits[1].chars, letter, 0)
}

function roll(on) {
  if (!tl) {
    pending = on
    return
  }
  if (on) tl.timeScale(1).play()
  else tl.timeScale(props.leaveSpeed).reverse()
}

// A altura pode mudar (fonte fluida, zoom): recalcula a distância.
const onResize = () => tl?.invalidate()

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
    build()
    if (pending !== null) roll(pending)
  })
  window.addEventListener('resize', onResize)

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
  window.removeEventListener('resize', onResize)
  tl?.kill()
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
