import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { introEnd, isIntroEnded } from './useIntro'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance = null

// Curva com começo e fim bem suaves (easeInOutCubic).
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Rola até uma posição: suave com Lenis, nativo sem ele.
// A duração cresce com a distância (1,2 s a 3,2 s): voltar do footer ao topo
// atravessa a página inteira e as cenas fixas, e rápido demais parece um corte.
export function scrollToY(y) {
  if (lenisInstance) {
    const distance = Math.abs(y - lenisInstance.scroll)
    const duration = gsap.utils.clamp(1.2, 3.2, 0.9 + distance / 5000)
    lenisInstance.scrollTo(y, { duration, easing: easeInOutCubic })
  } else {
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
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
      if (import.meta.env.DEV) window.__lenis = lenis // só para testes no navegador
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
    // O loader trava a rolagem (sem barra de rolagem: página 15 px mais larga).
    // Quando ele sai, a barra volta: recalcula pins e tamanhos com a largura real.
    introEnd.then(() => requestAnimationFrame(() => ScrollTrigger.refresh()))
  })

  onBeforeUnmount(() => {
    if (tick) gsap.ticker.remove(tick)
    lenis?.destroy()
    lenisInstance = null
    ScrollTrigger.getAll().forEach((t) => t.kill())
  })

  return { getLenis: () => lenis }
}
