<script setup>
import { MotionConfig } from 'motion-v'
import { useSmoothScroll } from './composables/useSmoothScroll'
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
    <main>
      <!-- header, hero e Manifesto: cena fixa ligada ao scroll -->
      <IntroScene />
      <CasesSection />
      <ContatoSection />
    </main>
    <SiteFooter />
  </MotionConfig>
</template>
