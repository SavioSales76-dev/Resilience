<!--
  Figma: prototype → "Landing / Contato — desktop" (109:58); nota "ponta do símbolo e camadas" (109:134).
  - Começa por baixo da ponta azul dos Cases (que fica uma camada acima: z-30 > z-20).
  - Pattern de v-arrows subindo nas laterais, atrás do conteúdo, fora da coluna central.
  - Termina com a mesma ponta em V, em branco, que vai ficar por cima do footer
    (camadas: Cases > Contato > Footer).
  - Entrada: as letras do título surgem do desfoque (como nos Cases) e o resto sobe com fade.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { site } from '../../config/site'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import BaseButton from '../ui/BaseButton.vue'
import VArrowField from '../ui/VArrowField.vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Posições do Figma (frame de 1440 × 1000 do pattern), convertidas para %:
// x = centro / 1440, y = topo / 1000, w = largura em 1440, o = opacidade.
const desktopArrows = [
  { x: 6.25, y: 43, w: 96, o: 1 },
  { x: 15.97, y: 66, w: 56, o: 0.55 },
  { x: 8.33, y: 84, w: 40, o: 0.35 },
  { x: 20.83, y: 33, w: 34, o: 0.3 },
  { x: 86.81, y: 39, w: 112, o: 1 },
  { x: 78.47, y: 61, w: 50, o: 0.5 },
  { x: 90.28, y: 78, w: 72, o: 0.7 },
  { x: 82.64, y: 90, w: 36, o: 0.3 },
]
// Mobile: no máximo 4, menores, nas bordas (larguras maiores aqui porque o mínimo é 55% de w).
const mobileArrows = [
  { x: 9, y: 30, w: 64, o: 1 },
  { x: 91, y: 40, w: 72, o: 0.7 },
  { x: 12, y: 85, w: 48, o: 0.4 },
  { x: 88, y: 92, w: 48, o: 0.35 },
]

const root = ref(null)
const title = ref(null)
let ctx

onMounted(() => {
  if (prefersReducedMotion()) return
  document.fonts.ready.then(() => {
    if (!root.value) return
    ctx = gsap.context(() => {
      // refreshPriority -1: posição calculada depois dos pins acima (cena e Cases)
      const st = { trigger: '[data-chamada]', start: 'top 75%', refreshPriority: -1 }
      const split = SplitText.create(title.value, { type: 'chars', aria: 'auto' })
      gsap.from(split.chars, {
        filter: 'blur(20px)',
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: { each: 0.02, from: 'random' },
        scrollTrigger: st,
      })
      gsap.from('[data-sobe]', {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2,
        scrollTrigger: st,
      })
    }, root.value)
    ScrollTrigger.refresh()
  })
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <!-- -mt: entra por baixo da ponta azul dos Cases; pt: o conteúdo começa abaixo dela -->
  <section
    id="contato"
    ref="root"
    aria-labelledby="contato-titulo"
    class="relative isolate z-20 -mt-[16.2vw]"
  >
    <!-- isolate: as v-arrows (-z-10) ficam entre o fundo branco e o conteúdo -->
    <div class="relative isolate bg-branco px-gutter pt-[calc(16.2vw+80px)] pb-28 md:pt-[calc(16.2vw+133px)] md:pb-[207px]">
      <!-- pattern de v-arrows, atrás do conteúdo -->
      <div class="absolute inset-0 -z-10" aria-hidden="true">
        <VArrowField :arrows="desktopArrows" class="hidden md:block" />
        <VArrowField :arrows="mobileArrows" class="md:hidden" />
      </div>

      <div data-chamada class="mx-auto flex max-w-[1100px] flex-col items-center gap-8 text-center">
        <p data-sobe class="text-label flex items-center gap-2.5 text-preto/70">
          <span class="size-2.5 rounded-[1px] bg-azul" aria-hidden="true" />
          Contato
        </p>

        <h2 id="contato-titulo" ref="title" class="text-h2 text-preto">
          Vamos fazer sua <br />
          <span class="text-[#A1A1A9]">marca crescer?</span>
        </h2>

        <p data-sobe class="text-corpo max-w-[620px] text-preto/65">
          Chama a gente no WhatsApp e conta um pouco sobre o seu negócio. A conversa começa por lá.
        </p>

        <div data-sobe>
          <BaseButton :href="site.whatsappUrl" label="Chamar no WhatsApp" tipo="whatsapp" />
        </div>

        <p data-sobe class="text-label flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-preto/55">
          <span>{{ site.phoneLabel }}</span>
          <span class="size-1 rounded-full bg-preto/30" aria-hidden="true" />
          <a :href="site.instagramUrl" target="_blank" rel="noopener" class="transition-colors hover:text-preto">
            {{ site.instagramHandle }} no Instagram
          </a>
        </p>
      </div>
    </div>

    <!-- Ponta em V branca (mesma geometria dos Cases), por cima do footer -->
    <svg
      class="-mt-px block h-[16.2vw] w-full fill-branco"
      viewBox="0 0 1440 233.3"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 0H1440L726.491 231.89C722.272 233.26 717.728 233.26 713.509 231.89L0 0Z" />
    </svg>
  </section>
</template>
