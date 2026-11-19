<script setup>
import { MotionConfig } from 'motion-v'
import { useSmoothScroll } from './composables/useSmoothScroll'
import SiteHeader from './components/sections/SiteHeader.vue'
import HeroSection from './components/sections/HeroSection.vue'

useSmoothScroll()
</script>

<template>
  <MotionConfig reduced-motion="user">
    <SiteHeader />
    <main>
      <HeroSection />
    </main>
  </MotionConfig>
</template>
