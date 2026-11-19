<!--
  Figma: Hero → "Nav" (76:30).
  Fixo no topo da página inteira, com fundo branco translúcido e blur.
  Esconde ao rolar para baixo e volta ao rolar para cima (sempre visível perto do
  topo, com o menu mobile aberto e quando algo dentro dele recebe foco pelo teclado).
  Tema: sobre as seções azuis (marcadas com data-header-tema="escuro": Cases, footer
  e o fim da transição do Manifesto), troca para as versões "Escuro" do Figma:
  logo negativo, links brancos, botão ícone com borda branca e botão primário branco.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import { introRevealed } from '../../composables/useIntro'
import { goToAnchor } from '../../composables/useAnchors'
import { site } from '../../config/site'
import AppLogo from '../ui/AppLogo.vue'
import BaseButton from '../ui/BaseButton.vue'
import IconButton from '../ui/IconButton.vue'
import InstagramIcon from '../icons/InstagramIcon.vue'
import MenuIcon from '../icons/MenuIcon.vue'
import RollText from '../ui/RollText.vue'

const menuOpen = ref(false)

function onNav(event, href) {
  menuOpen.value = false
  if (goToAnchor(href.slice(1))) event.preventDefault()
}
const header = ref(null)
const nav = ref(null)
const tema = ref('claro') // 'claro' | 'escuro'

// Lê o tema do que está atrás do header em três pontos (logo, centro e botões)
// e segue a maioria: as pontas em V das seções deixam o centro de uma cor e as
// laterais de outra quando passam por baixo dele.
function detectTheme() {
  if (!header.value) return
  const y = header.value.offsetHeight / 2
  const W = window.innerWidth
  const escuros = [0.1, 0.5, 0.9].filter((fx) => {
    // Ignora o próprio header e o <svg> "raiz" das pontas em V: ele responde ao ponto
    // até nas partes transparentes (o desenho em si é o <path> dentro dele). Nesse
    // caso pula também quem só envolve a ponta (a seção dela), para chegar ao que
    // está realmente pintado atrás (ex.: o footer).
    const skip = new Set()
    const el = document.elementsFromPoint(W * fx, y).find((e) => {
      if (header.value.contains(e) || skip.has(e)) return false
      if (e.tagName.toLowerCase() === 'svg') {
        for (let p = e.parentElement; p; p = p.parentElement) skip.add(p)
        return false
      }
      return true
    })
    return el?.closest('[data-header-tema]')?.getAttribute('data-header-tema') === 'escuro'
  }).length
  tema.value = escuros >= 2 ? 'escuro' : 'claro'
}
// Verifica a cada 150 ms, e não só no evento de rolagem: a cena fixa acompanha a
// rolagem com suavização (~1 s), então o azul do fim da transição pode mudar
// depois que a rolagem já parou.
let lastCheck = 0
const themeTick = (time) => {
  if (time - lastCheck < 0.15) return
  lastCheck = time
  detectTheme()
}

const TOPO = 80 // px: até aqui o header fica sempre visível
let hideTween
let watcher

const show = () => hideTween?.reverse()
const hide = () => !menuOpen.value && hideTween?.play()

onMounted(() => {
  const reduced = prefersReducedMotion()

  // Esconder/mostrar: o header sobe inteiro para fora da tela.
  hideTween = gsap.to(header.value, {
    yPercent: -100,
    duration: reduced ? 0 : 0.4,
    ease: 'power2.out',
    paused: true,
  })
  // Ouve a rolagem da janela direto (o Lenis também move a rolagem nativa).
  // Não usar um ScrollTrigger de 0 a "max": o "max" era calculado antes de a cena
  // fixa somar o espaço dela e parava de avisar antes do fim da página.
  // O sentido vem da posição atual × anterior.
  let lastY = window.scrollY
  watcher = () => {
    const y = window.scrollY
    if (y < TOPO || y < lastY - 2) show()
    else if (y > lastY + 2) hide()
    lastY = y
  }
  window.addEventListener('scroll', watcher, { passive: true })
  gsap.ticker.add(themeTick)
  detectTheme()

  if (reduced) return
  // Entra junto com o título da hero, quando a janela do loader cobre a tela.
  const tween = gsap.from(header.value, { opacity: 0, duration: 0.8, ease: 'power3.out', paused: true, clearProps: 'opacity' })
  const navTween = gsap.from(nav.value, { y: -16, duration: 0.8, ease: 'power3.out', paused: true, clearProps: 'transform' })
  introRevealed.then(() => {
    tween.play()
    navTween.play()
  })
})

onBeforeUnmount(() => {
  if (watcher) window.removeEventListener('scroll', watcher)
  gsap.ticker.remove(themeTick)
  hideTween?.kill()
})
</script>

<template>
  <header
    ref="header"
    role="banner"
    class="fixed inset-x-0 top-0 z-40 border-b px-gutter py-3 backdrop-blur-md transition-colors duration-300"
    :class="tema === 'escuro' ? 'border-branco/10 bg-azul/70' : 'border-preto/6 bg-branco/70'"
    @focusin="show"
  >
    <nav ref="nav" class="flex items-center justify-between gap-4" aria-label="Principal">
      <AppLogo :tema="tema === 'escuro' ? 'negativo' : 'positivo'" />

      <ul class="hidden items-center gap-8 lg:flex">
        <li v-for="(item, i) in site.nav" :key="item.href">
          <a
            :href="item.href"
            class="text-nav transition-colors duration-300"
            :class="[
              tema === 'escuro' ? 'text-branco/70 hover:text-branco' : 'text-preto/70 hover:text-preto',
              i === 0 && ['font-medium', tema === 'escuro' ? 'text-branco' : 'text-preto'],
            ]"
            :aria-current="i === 0 ? 'page' : undefined"
            @click="onNav($event, item.href)"
          ><RollText :text="item.label" /></a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <IconButton :href="site.instagramUrl" label="Instagram da Resilience" :tema="tema" v-slot="{ active }">
          <InstagramIcon :size="20" :active="active" />
        </IconButton>
        <span class="hidden sm:contents">
          <BaseButton :href="site.whatsappUrl" label="Contato" :tema="tema" />
        </span>
        <span class="contents sm:hidden">
          <BaseButton :href="site.whatsappUrl" label="Contato pelo WhatsApp" tipo="whatsapp" compacto :tema="tema" />
        </span>
        <button
          type="button"
          class="inline-flex size-12 items-center justify-center rounded-btn border transition-colors duration-300 lg:hidden"
          :class="tema === 'escuro' ? 'border-branco/35 text-branco' : 'border-transparent bg-preto/10 text-preto'"
          :aria-expanded="menuOpen"
          aria-controls="menu-mobile"
          :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
          @click="menuOpen = !menuOpen"
        >
          <MenuIcon :size="20" :active="menuOpen" />
        </button>
      </div>
    </nav>

    <ul
      v-show="menuOpen"
      id="menu-mobile"
      class="mt-3 flex flex-col rounded-btn border p-2 lg:hidden"
      :class="tema === 'escuro' ? 'border-branco/20 bg-azul' : 'border-preto/12 bg-branco'"
    >
      <li v-for="item in site.nav" :key="item.href">
        <a
          :href="item.href"
          class="block px-3 py-3 text-nav"
          :class="tema === 'escuro' ? 'text-branco/85' : 'text-preto/80'"
          @click="onNav($event, item.href)"
        >{{ item.label }}</a>
      </li>
    </ul>
  </header>
</template>
