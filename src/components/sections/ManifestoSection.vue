<!--
  Figma: prototype → "Landing / Manifesto (text scroll) — desktop" (81:15).
  O text scroll (palavras de cinza para preto, "voltar mais forte" em azul) é
  controlado pela IntroScene, que pede as palavras por getWords().
  Sem animação (prefers-reduced-motion), o texto já aparece no estado final.
-->
<script setup>
import { ref } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const props = defineProps({
  animated: { type: Boolean, default: false },
})

// Cores do text scroll (hex: o GSAP interpola cores sólidas).
const COR_APAGADA = '#C5C5CC' // preto a 20% sobre o branco (Figma)
const COR_TEXTO = '#080812'
const COR_DESTAQUE = '#3D3BF3'

const TEXTO_ANTES = 'Toda marca pode cair, se adaptar e '
const DESTAQUE = 'voltar mais forte'
const TEXTO_DEPOIS =
  '. A gente cuida das suas redes com estratégia, constância e atenção de perto, para o seu negócio aparecer, atrair e vender todos os dias.'

let split = null
const visual = ref(null)

// Divide em palavras e devolve cada uma com a cor final dela.
function getWords() {
  if (!split) split = SplitText.create(visual.value, { type: 'words', aria: 'none' })
  return split.words.map((el) => ({
    el,
    to: el.closest('[data-destaque]') ? COR_DESTAQUE : COR_TEXTO,
  }))
}

defineExpose({ getWords, COR_APAGADA })
</script>

<template>
  <section id="sobre" aria-labelledby="sobre-titulo" class="relative flex h-svh min-h-[640px] items-center justify-center bg-branco px-gutter">
    <div class="absolute inset-x-gutter top-0 h-px bg-preto/10" aria-hidden="true" />

    <div class="flex max-w-[1120px] flex-col items-center gap-8 text-center md:gap-10">
      <p id="sobre-titulo" class="flex items-center gap-2.5 text-botao text-preto/70">
        <span class="size-2.5 rounded-[1px] bg-azul" aria-hidden="true" />
        Sobre a Resilience
      </p>

      <!-- texto lido pelos leitores de tela (uma vez, sem a divisão em palavras) -->
      <p class="sr-only">{{ TEXTO_ANTES }}{{ DESTAQUE }}{{ TEXTO_DEPOIS }}</p>
      <p
        ref="visual"
        class="text-manifesto"
        aria-hidden="true"
        :style="animated ? { color: COR_APAGADA } : undefined"
        :class="{ 'text-preto': !animated }"
      >
        {{ TEXTO_ANTES }}<span data-destaque :class="{ 'text-azul': !animated }">{{ DESTAQUE }}</span>{{ TEXTO_DEPOIS }}
      </p>
    </div>
  </section>
</template>
