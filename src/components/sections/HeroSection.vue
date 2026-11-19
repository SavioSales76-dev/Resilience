<!-- Figma: prototype → "Landing / Hero — desktop (gráfico)" (76:20) -->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { site } from '../../config/site'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import BaseButton from '../ui/BaseButton.vue'

// Alturas em % da hero. Cai na 2ª coluna e depois só cresce.
const desktopBars = [34, 21, 36, 46, 55, 64, 72]
// Mobile: 5 colunas mantendo a queda inicial.
const mobileBars = [34, 21, 46, 60, 72]

const root = ref(null)
let ctx

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    // Revela de baixo para cima com clip-path: não mexe na altura em %
    // (continua responsiva) nem distorce a borda de 1px.
    gsap.from('[data-bar]', {
      clipPath: 'inset(100% 0% 0% 0%)',
      clearProps: 'clipPath',
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.08,
    })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section
    id="inicio"
    ref="root"
    aria-labelledby="hero-titulo"
    class="relative isolate flex min-h-[640px] h-svh flex-col overflow-hidden px-gutter"
  >
    <!-- Gráfico de colunas -->
    <div class="pointer-events-none absolute inset-0 -z-10 hidden grid-cols-7 items-end md:grid" aria-hidden="true">
      <div v-for="(h, i) in desktopBars" :key="i" data-bar class="border border-preto/12" :style="{ height: `${h}%` }" />
    </div>
    <div class="pointer-events-none absolute inset-0 -z-10 grid grid-cols-5 items-end md:hidden" aria-hidden="true">
      <div v-for="(h, i) in mobileBars" :key="i" data-bar class="border border-preto/12" :style="{ height: `${h}%` }" />
    </div>

    <h1
      id="hero-titulo"
      class="text-hero mt-auto pt-32 text-preto md:absolute md:inset-x-0 md:top-1/2 md:mx-auto md:mt-0 md:max-w-[1100px] md:-translate-y-1/2 md:pt-0 md:text-center"
    >
      Redes sociais que <br class="hidden md:inline" />fazem sua marca <br class="hidden md:inline" />crescer.
    </h1>

    <div class="mt-8 mb-10 flex flex-col-reverse items-start gap-6 md:mt-auto md:mb-[60px] md:flex-row md:items-center">
      <BaseButton :href="site.whatsappUrl" label="Solicitar orçamento" />
      <p class="text-corpo max-w-[380px] text-preto/65">
        Gestão de redes sociais, conteúdo e estratégia para pequenas e médias empresas da região.
      </p>
    </div>
  </section>
</template>
