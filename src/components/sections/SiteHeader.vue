<!--
  Figma: Hero → "Nav" (76:30).
  Fixo no topo da página inteira, com fundo branco translúcido e blur.
  Esconde ao rolar para baixo e volta ao rolar para cima (sempre visível perto do
  topo, com o menu mobile aberto e quando algo dentro dele recebe foco pelo teclado).
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
  hideTween?.kill()
})
</script>

<template>
  <header
    ref="header"
    role="banner"
    class="fixed inset-x-0 top-0 z-40 border-b border-preto/6 bg-branco/70 px-gutter py-3 backdrop-blur-md"
    @focusin="show"
  >
    <nav ref="nav" class="flex items-center justify-between gap-4" aria-label="Principal">
      <AppLogo />

      <ul class="hidden items-center gap-8 lg:flex">
        <li v-for="(item, i) in site.nav" :key="item.href">
          <a
            :href="item.href"
            class="text-nav text-preto/70 transition-colors hover:text-preto"
            :class="{ 'font-medium text-preto': i === 0 }"
            :aria-current="i === 0 ? 'page' : undefined"
            @click="onNav($event, item.href)"
          ><RollText :text="item.label" /></a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <IconButton :href="site.instagramUrl" label="Instagram da Resilience" v-slot="{ active }">
          <InstagramIcon :size="20" :active="active" />
        </IconButton>
        <span class="hidden sm:contents">
          <BaseButton :href="site.whatsappUrl" label="Contato" />
        </span>
        <span class="contents sm:hidden">
          <BaseButton :href="site.whatsappUrl" label="Contato pelo WhatsApp" tipo="whatsapp" compacto />
        </span>
        <button
          type="button"
          class="inline-flex size-12 items-center justify-center rounded-btn bg-preto/10 text-preto lg:hidden"
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
      class="mt-3 flex flex-col rounded-btn border border-preto/12 bg-branco p-2 lg:hidden"
    >
      <li v-for="item in site.nav" :key="item.href">
        <a :href="item.href" class="block px-3 py-3 text-nav text-preto/80" @click="onNav($event, item.href)">{{ item.label }}</a>
      </li>
    </ul>
  </header>
</template>
