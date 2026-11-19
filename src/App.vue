<script setup>
import { MotionConfig } from 'motion-v'
import { useSmoothScroll } from './composables/useSmoothScroll'
import SiteHeader from './components/sections/SiteHeader.vue'
import IntroScene from './components/sections/IntroScene.vue'
import SiteLoader from './components/sections/SiteLoader.vue'
import CasesSection from './components/sections/CasesSection.vue'
import ContatoSection from './components/sections/ContatoSection.vue'
import SiteFooter from './components/sections/SiteFooter.vue'

useSmoothScroll()
</script>

<template>
  <MotionConfig reduced-motion="user">
    <SiteLoader />
    <!-- header fixo: acima do main (z-10) e abaixo do loader (z-50) -->
    <SiteHeader />
    <!-- z-10: o main fica acima do footer (reveal), sem tirar o footer do alcance do mouse -->
    <main class="relative z-10">
      <!-- hero e Manifesto: cena fixa ligada ao scroll -->
      <IntroScene />
      <CasesSection />
      <ContatoSection />
    </main>
    <SiteFooter />
  </MotionConfig>
</template>
