import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Lenis sincronizado com o ticker do GSAP, para o ScrollTrigger ler o scroll certo.
// Desligado com movimento reduzido e em telas de toque.
export function useSmoothScroll() {
  let lenis = null
  let tick = null

  onMounted(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    if (!prefersReducedMotion() && !isTouch) {
      lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    if (tick) gsap.ticker.remove(tick)
    lenis?.destroy()
    ScrollTrigger.getAll().forEach((t) => t.kill())
  })

  return { getLenis: () => lenis }
}
