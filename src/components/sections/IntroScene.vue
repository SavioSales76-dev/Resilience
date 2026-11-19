<!--
  Cena fixa (pin) que liga a hero ao Manifesto (seção Sobre), controlada pelo scroll:
  1. O título e o rodapé da hero saem; as colunas crescem, uma a uma, até cobrir a tela.
  2. A hero inteira (com o header) sobe e sai pelo topo, revelando o Manifesto,
     que já está parado embaixo dela.
  3. Text scroll: as palavras do Manifesto passam de cinza para preto, na ordem
     de leitura; "voltar mais forte" vira azul.
  4. O símbolo azul aparece no centro e cresce até a tela ficar azul, com o texto
     branco dentro dele. O fim da cena (tela toda azul) emenda com o início dos Cases.

  Com prefers-reduced-motion: sem pin; hero e Manifesto ficam um embaixo do outro.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { registerAnchor } from '../../composables/useAnchors'
import SiteHeader from './SiteHeader.vue'
import HeroSection from './HeroSection.vue'
import ManifestoSection from './ManifestoSection.vue'

gsap.registerPlugin(ScrollTrigger)

// Duração de cada fase, em alturas de tela de rolagem.
const PHASES = {
  grow: 1.1, // colunas crescendo
  exit: 1.0, // hero subindo e saindo
  text: 1.6, // text scroll
  read: 0.4, // respiro com o texto completo
  symbol: 2.2, // símbolo crescendo até a tela ficar azul
  hold: 0.2, // tela azul antes de liberar
}
const TOTAL = Object.values(PHASES).reduce((a, b) => a + b, 0)

const animated = !prefersReducedMotion()
const scene = ref(null)
const heroLayer = ref(null)
const hero = ref(null)
const manifesto = ref(null)
let ctx
let unregister

onMounted(() => {
  if (!animated) return

  // Espera as fontes: a divisão do texto em palavras depende da largura delas.
  document.fonts.ready.then(() => {
    if (!scene.value) return
    ctx = gsap.context(() => {
      const bars = hero.value.getBars()
      const intros = hero.value.root.querySelectorAll('[data-intro]')
      const words = manifesto.value.getWords()
      const exitStart = PHASES.grow
      const textStart = PHASES.grow + PHASES.exit
      const symbolStart = textStart + PHASES.text + PHASES.read

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene.value,
          start: 'top top',
          end: () => `+=${window.innerHeight * TOTAL}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          // a onda das colunas para quando a hero já saiu da tela
          onUpdate: () => hero.value?.setTicking(tl.time() < textStart),
        },
      })

      // 1. Título e rodapé saem; colunas crescem até cobrir a tela.
      // Não brigar com a entrada da hero (título escondido até o loader sair):
      // fromTo + immediateRender: false e posição 0.01 (não 0). No 0, a cena desenharia
      // o estado inicial "visível" já ao ser montada, com a rolagem parada no topo.
      tl.fromTo(
        intros,
        { y: 0, opacity: 1 },
        { y: -80, opacity: 0, duration: 0.45, ease: 'power1.in', stagger: 0.06, immediateRender: false },
        0.01,
      )
      tl.to(
        bars,
        { grow: 1, duration: 0.75, ease: 'power2.inOut', stagger: (i, bar) => bar.index * 0.05 },
        0.05,
      )

      // 2. A hero sobe inteira e revela o Manifesto.
      tl.fromTo(
        heroLayer.value,
        { yPercent: 0 },
        { yPercent: -100, duration: PHASES.exit, ease: 'power2.inOut', immediateRender: false },
        exitStart,
      )

      // 3. Text scroll, palavra por palavra.
      tl.to(
        words.map((w) => w.el),
        {
          color: (i) => words[i].to,
          duration: 0.25,
          stagger: (PHASES.text - 0.25) / words.length,
        },
        textStart,
      )

      // 4. Símbolo crescendo até a tela ficar azul.
      tl.add(manifesto.value.buildSymbol().duration(PHASES.symbol), symbolStart)
      tl.to({}, { duration: PHASES.hold })

      // Link "Sobre" do menu: leva ao ponto em que o Manifesto acabou de ser revelado.
      const st = tl.scrollTrigger
      unregister = registerAnchor('sobre', () => st.start + (st.end - st.start) * (textStart / TOTAL))
    }, scene.value)

    ScrollTrigger.refresh()
  })
})

onBeforeUnmount(() => {
  unregister?.()
  ctx?.revert()
})
</script>

<template>
  <div ref="scene" class="relative" :class="animated && 'h-svh min-h-[640px] overflow-hidden'">
    <!-- hero + header: camada de cima, que sai pelo topo -->
    <div ref="heroLayer" class="relative z-10">
      <SiteHeader />
      <HeroSection ref="hero" />
    </div>
    <!-- Manifesto: parado embaixo da hero durante a cena -->
    <div :class="animated && 'absolute inset-0 z-0'">
      <ManifestoSection ref="manifesto" :animated="animated" />
    </div>
  </div>
</template>
