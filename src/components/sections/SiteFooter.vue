<!--
  Figma: prototype → "Landing / Footer — desktop" (113:66); nota 109:134 (reveal).
  Reveal: o footer fica grudado no fim da tela (sticky bottom), uma camada abaixo de
  tudo (-z-10), e o Contato sobe por cima dele, descobrindo-o. A ponta em V branca do
  Contato cobre o topo do footer (-mt de 16,2vw), por isso o conteúdo começa abaixo dela.
  Só com tela larga e alta o bastante para o footer caber: no celular e em telas
  baixas, vira um footer comum (sem o reveal).
-->
<script setup>
import { ref } from 'vue'
import { site } from '../../config/site'
import { goToAnchor } from '../../composables/useAnchors'
import AppLogo from '../ui/AppLogo.vue'
import BaseButton from '../ui/BaseButton.vue'
import RollText from '../ui/RollText.vue'
import ArrowUpIcon from '../icons/ArrowUpIcon.vue'

const ano = new Date().getFullYear()
const topoHover = ref(false)

function onNav(event, href) {
  if (goToAnchor(href.slice(1))) event.preventDefault()
}
</script>

<template>
  <footer
    class="relative -z-10 -mt-[16.2vw] bg-azul px-gutter pt-[calc(16.2vw+64px)] pb-6 text-branco md:pt-[calc(16.2vw+96px)] [@media(min-width:768px)_and_(min-height:740px)]:sticky [@media(min-width:768px)_and_(min-height:740px)]:bottom-0"
  >
    <!-- Topo: marca, colunas e botão -->
    <div class="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div class="flex flex-col gap-6 lg:w-[380px]">
        <AppLogo tema="negativo" tamanho="footer" />
        <p class="text-corpo text-branco/60">
          Gestão de redes sociais, conteúdo e estratégia para marcas que querem crescer.
        </p>
      </div>

      <nav aria-label="Rodapé" class="grid grid-cols-2 gap-x-8 gap-y-10 sm:flex sm:gap-24 lg:pt-1.5">
        <div class="flex flex-col gap-4">
          <p class="text-label text-branco/45">Navegação</p>
          <ul class="flex flex-col gap-4">
            <li v-for="item in site.nav" :key="item.href">
              <a :href="item.href" class="text-nav-footer text-branco/90 hover:text-branco" @click="onNav($event, item.href)">
                <RollText :text="item.label" />
              </a>
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-4">
          <p class="text-label text-branco/45">Redes</p>
          <ul class="flex flex-col gap-4">
            <li>
              <a :href="site.instagramUrl" target="_blank" rel="noopener" class="text-nav-footer text-branco/90 hover:text-branco">
                <RollText text="Instagram" />
              </a>
            </li>
            <li>
              <a :href="site.whatsappUrl" target="_blank" rel="noopener" class="text-nav-footer text-branco/90 hover:text-branco">
                <RollText text="WhatsApp" />
              </a>
            </li>
          </ul>
        </div>
        <div class="col-span-2 flex flex-col gap-4 sm:col-span-1">
          <p class="text-label text-branco/45">Atuação</p>
          <ul class="text-nav-footer flex flex-col gap-4 text-branco/90">
            <li v-for="linha in site.atuacao" :key="linha">{{ linha }}</li>
          </ul>
        </div>
      </nav>

      <div>
        <BaseButton :href="site.whatsappUrl" label="Chamar no WhatsApp" tipo="whatsapp" tema="escuro" />
      </div>
    </div>

    <!-- "Resilience" gigante, ocupando a largura útil (TODO: trocar pelo SVG do logotipo) -->
    <p
      class="mt-11 font-display leading-[1.23] font-semibold tracking-[-0.02em] whitespace-nowrap select-none text-[calc((100vw-48px)*0.2085)]"
      aria-hidden="true"
    >
      Resilience
    </p>

    <!-- Barra inferior -->
    <div class="mt-6 border-t border-branco/25 pt-6 md:mt-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-label text-branco/50">© {{ ano }} Resilience. Todos os direitos reservados.</p>
        <a
          href="#inicio"
          class="group text-label inline-flex items-center gap-2 text-branco/85 hover:text-branco"
          @click="onNav($event, '#inicio')"
          @mouseenter="topoHover = true"
          @mouseleave="topoHover = false"
          @focus="topoHover = true"
          @blur="topoHover = false"
        >
          <RollText text="Voltar ao topo" :active="topoHover" />
          <span class="flex size-7 items-center justify-center rounded-icon bg-branco text-azul transition-transform duration-200 group-hover:scale-108">
            <ArrowUpIcon :size="16" :active="topoHover" />
          </span>
        </a>
      </div>
    </div>
  </footer>
</template>
