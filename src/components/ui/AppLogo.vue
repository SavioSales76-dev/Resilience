<!--
  Logo horizontal. tema: 'positivo' (símbolo azul + escrita preta, fundos claros)
  ou 'negativo' (tudo branco, fundos azuis/escuros).
  TODO: trocar pelos SVGs exportados de "entregáveis" (site/resilience-header-*.svg).
-->
<script setup>
import simboloPositivo from '../../assets/simbolo.svg'
import simboloNegativo from '../../assets/simbolo-negativo.svg'

defineProps({
  tema: { type: String, default: 'positivo' },
  tamanho: { type: String, default: 'header' }, // 'header' (Figma 158 × 32) | 'footer' (207 × 40)
})
</script>

<template>
  <a href="#inicio" class="inline-flex items-center" :class="tamanho === 'footer' ? 'gap-1' : 'gap-[3px]'" aria-label="Resilience, voltar ao início">
    <img
      :src="tema === 'negativo' ? simboloNegativo : simboloPositivo"
      alt=""
      :width="tamanho === 'footer' ? 47 : 36"
      :height="tamanho === 'footer' ? 38 : 29"
      :class="tamanho === 'footer' ? 'h-[38px] w-[47px]' : 'h-[29px] w-9'"
    />
    <span
      class="font-display leading-none font-semibold tracking-[-0.02em]"
      :class="[tema === 'negativo' ? 'text-branco' : 'text-preto', tamanho === 'footer' ? 'text-[32.4px]' : 'text-[24.7px]']"
    >Resilience</span>
  </a>
</template>
