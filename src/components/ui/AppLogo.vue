<!-- Logo horizontal positivo. TODO: trocar pelo SVG exportado de "entregáveis" (site/resilience-header-positivo.svg). -->
<script setup>
import simbolo from '../../assets/simbolo.svg'
</script>

<template>
  <a href="#inicio" class="inline-flex items-center gap-[3px]" aria-label="Resilience, voltar ao início">
    <img :src="simbolo" alt="" width="36" height="29" class="h-[29px] w-9" />
    <span class="font-display text-[24.7px] leading-none font-semibold tracking-[-0.02em] text-preto">Resilience</span>
  </a>
</template>
