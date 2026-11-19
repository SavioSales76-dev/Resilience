<!-- Figma: Hero → "Nav" (76:30) -->
<script setup>
import { ref } from 'vue'
import { site } from '../../config/site'
import AppLogo from '../ui/AppLogo.vue'
import BaseButton from '../ui/BaseButton.vue'
import IconButton from '../ui/IconButton.vue'
import InstagramIcon from '../icons/InstagramIcon.vue'
import MenuIcon from '../icons/MenuIcon.vue'

const menuOpen = ref(false)
</script>

<template>
  <header class="absolute inset-x-0 top-5 z-20 px-gutter">
    <nav class="flex items-center justify-between gap-4" aria-label="Principal">
      <AppLogo />

      <ul class="hidden items-center gap-8 lg:flex">
        <li v-for="(item, i) in site.nav" :key="item.href">
          <a
            :href="item.href"
            class="text-nav text-preto/70 transition-colors hover:text-preto"
            :class="{ 'font-medium text-preto': i === 0 }"
            :aria-current="i === 0 ? 'page' : undefined"
          >{{ item.label }}</a>
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
        <a :href="item.href" class="block px-3 py-3 text-nav text-preto/80" @click="menuOpen = false">{{ item.label }}</a>
      </li>
    </ul>
  </header>
</template>
