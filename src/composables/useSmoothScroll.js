import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { introEnd, isIntroEnded } from './useIntro'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance = null

// Rola até uma posição: suave com Lenis, nativo sem ele.
export function scrollToY(y) {
  if (lenisInstance) lenisInstance.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Lenis sincronizado com o ticker do GSAP, para o ScrollTrigger ler o scroll certo.
// Desligado com movimento reduzido e em telas de toque.
export function useSmoothScroll() {
  let lenis = null
  let tick = null

  onMounted(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    // Animações em tempo real mesmo quando o aparelho perde quadros (loader,
    // sincronia com o Lenis). Sem isso, num celular lento o loader se arrasta.
    gsap.ticker.lagSmoothing(0)

    if (!prefersReducedMotion() && !isTouch) {
      lenis = new Lenis({ lerp: 0.1 })
      lenisInstance = lenis
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      // Sem rolagem enquanto o loader estiver na tela.
      if (!isIntroEnded()) {
        lenis.stop()
        introEnd.then(() => lenis.start())
      }
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    if (tick) gsap.ticker.remove(tick)
    lenis?.destroy()
    lenisInstance = null
    ScrollTrigger.getAll().forEach((t) => t.kill())
  })

  return { getLenis: () => lenis }
}
