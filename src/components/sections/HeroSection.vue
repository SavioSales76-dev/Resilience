<!-- Figma: prototype → "Landing / Hero — desktop (gráfico)" (76:20) -->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { site } from '../../config/site'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { introRevealed, introStart } from '../../composables/useIntro'
import BaseButton from '../ui/BaseButton.vue'
import VArrowField from '../ui/VArrowField.vue'

// V-arrows voando atrás do gráfico (não está no Figma da hero; mesmo pattern do Contato).
// Nascem abaixo da hero, saem de trás das colunas e sobem até sair da tela.
// x: centro em %, w: largura em 1440, o: opacidade,
// y: topo em % só para a posição parada com movimento reduzido.
const desktopArrows = [
  { x: 6.5, y: 26, w: 96, o: 1 },
  { x: 9, y: 56, w: 40, o: 0.35 },
  { x: 17, y: 62, w: 56, o: 0.55 },
  { x: 24, y: 30, w: 34, o: 0.3 },
  { x: 91, y: 26, w: 112, o: 1 },
  { x: 80, y: 66, w: 50, o: 0.5 },
  { x: 95, y: 62, w: 72, o: 0.7 },
  { x: 86, y: 82, w: 36, o: 0.3 },
]
// Mobile: no máximo 4, menores e nas bordas.
const mobileArrows = [
  // (larguras maiores aqui porque o tamanho mínimo é 55% de w)
  { x: 12, y: 24, w: 80, o: 1 },
  { x: 88, y: 22, w: 96, o: 0.8 },
  { x: 84, y: 46, w: 56, o: 0.45 },
  { x: 18, y: 46, w: 56, o: 0.35 },
]

// Alturas em % da hero. Cai na 2ª coluna e depois só cresce.
const desktopBars = [34, 21, 36, 46, 55, 64, 72]
// Mobile: 5 colunas mantendo a queda inicial.
const mobileBars = [34, 21, 46, 60, 72]

const root = ref(null)
let ctx

// Onda: cada coluna oscila em torno da sua altura base, com a fase
// deslocada pela posição, criando uma onda que corre da esquerda para a direita.
const WAVE = {
  amplitude: 10, // pontos percentuais da altura da hero
  period: 3.6, // segundos por ciclo
  phase: 0.9, // defasagem entre colunas (rad): ~1 comprimento de onda nas 7 colunas
  rampIn: 1.2, // segundos para a onda atingir a amplitude total
}

// Colunas. Desempenho: as colunas têm a altura da hero inteira e só se movem
// com transform (translateY). Mudar a altura (height) a cada quadro recalculava
// o layout da página toda; transform é feito pela placa de vídeo.
// - rise (0–1): entrada, quando o loader expande
// - grow (0–1): controlado pela IntroScene no scroll; 1 = altura da tela toda
let bars = []
let active = [] // só as colunas do layout visível (desktop 7 / mobile 5)
let ticking = true // a IntroScene desliga quando a hero já saiu da tela

onMounted(() => {
  if (prefersReducedMotion()) return

  bars = [...root.value.querySelectorAll('[data-bar]')].map((el) => ({
    el,
    base: Number(el.dataset.h),
    index: Number(el.dataset.i),
    grow: 0,
    rise: 0,
  }))
  const pickActive = () => (active = bars.filter((b) => b.el.offsetParent !== null))
  pickActive()
  const desktop = window.matchMedia('(min-width: 768px)')
  desktop.addEventListener('change', pickActive)

  let waveStart = null

  const tick = (time) => {
    if (!ticking) return
    const t = waveStart === null ? 0 : time - waveStart
    const amp = waveStart === null ? 0 : WAVE.amplitude * Math.min(1, t / WAVE.rampIn)
    const w = (2 * Math.PI) / WAVE.period
    for (const bar of active) {
      // seno começa em 0: entra na onda sem salto
      const wave = bar.base + amp * Math.sin(w * t - bar.index * WAVE.phase)
      const h = (wave + (100 - wave) * bar.grow) * bar.rise
      bar.el.style.transform = `translate3d(0, ${100 - h}%, 0)`
    }
  }

  ctx = gsap.context(() => {
    // Entrada das colunas: sobem quando o símbolo do loader começa a expandir
    // (dentro da "janela" do símbolo), uma a uma.
    const intro = gsap.timeline({ paused: true })
    intro.to(
      bars,
      {
        rise: 1,
        duration: 1.1,
        ease: 'power3.out',
        stagger: (i, bar) => bar.index * 0.08,
        onComplete: () => (waveStart = gsap.ticker.time),
      },
      0.3,
    )
    introStart.then(() => intro.play())

    // Título e rodapé: entram assim que a janela do loader cobre a tela inteira.
    const text = gsap.from('[data-intro]', {
      opacity: 0,
      y: 32,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      paused: true,
      clearProps: 'opacity,transform',
    })
    introRevealed.then(() => text.play())
  }, root.value)

  gsap.ticker.add(tick)
  ctx.add(() => () => {
    gsap.ticker.remove(tick)
    desktop.removeEventListener('change', pickActive)
  })
})

onBeforeUnmount(() => ctx?.revert())

defineExpose({
  root,
  getBars: () => bars,
  setTicking: (on) => (ticking = on),
})
</script>

<template>
  <section
    id="inicio"
    ref="root"
    aria-labelledby="hero-titulo"
    class="relative isolate flex min-h-[640px] h-svh flex-col overflow-hidden bg-branco px-gutter"
  >
    <!-- V-arrows: camada mais ao fundo, atrás das colunas -->
    <VArrowField :arrows="desktopArrows" class="-z-20 hidden md:block" />
    <VArrowField :arrows="mobileArrows" class="-z-20 md:hidden" />

    <!-- Gráfico de colunas -->
    <div class="pointer-events-none absolute inset-0 -z-10 hidden grid-cols-7 items-end md:grid" aria-hidden="true">
      <div v-for="(h, i) in desktopBars" :key="i" :data-h="h" :data-i="i" data-bar class="h-full border border-preto/12 bg-branco will-change-transform" :style="{ transform: `translateY(${100 - h}%)` }" />
    </div>
    <div class="pointer-events-none absolute inset-0 -z-10 grid grid-cols-5 items-end md:hidden" aria-hidden="true">
      <div v-for="(h, i) in mobileBars" :key="i" :data-h="h" :data-i="i" data-bar class="h-full border border-preto/12 bg-branco will-change-transform" :style="{ transform: `translateY(${100 - h}%)` }" />
    </div>

    <h1
      id="hero-titulo"
      data-intro
      class="text-hero mt-auto pt-32 text-preto md:absolute md:inset-x-0 md:top-1/2 md:mx-auto md:mt-0 md:max-w-[1100px] md:-translate-y-1/2 md:pt-0 md:text-center"
    >
      Redes sociais que <br class="hidden md:inline" />fazem sua marca <br class="hidden md:inline" />crescer.
    </h1>

    <div data-intro class="mt-8 mb-10 flex flex-col-reverse items-start gap-6 md:mt-auto md:mb-[60px] md:flex-row md:items-center">
      <BaseButton :href="site.whatsappUrl" label="Solicitar orçamento" />
      <p class="text-corpo max-w-[380px] text-preto/65">
        Gestão de redes sociais, conteúdo e estratégia para pequenas e médias empresas da região.
      </p>
    </div>
  </section>
</template>
