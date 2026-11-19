<!--
  Figma: prototype → "Landing / Cases — desktop" (92:62); nota "animação dos cases" (92:129).
  Começa no azul em que termina a transição do Manifesto.

  Cards (ref.: grupowebhub.com.br):
  - Sobem com 60% do tamanho final, cantos de 6vw e imagem em P&B, e crescem com o
    scroll até a tela menos 24 px de cada lado, com cantos de 16 px e a imagem colorida.
    A legenda aparece quando o card chega ao tamanho final.
  - Desktop: os cards ficam fixos (sticky) e se empilham. O de baixo encolhe (0,92) e
    escurece (brightness 0,5) enquanto o próximo sobe por cima.
  - Mobile: mantém a expansão, sem o empilhamento.
  Título: as letras surgem do desfoque, em ordem aleatória.
  A seção termina com a ponta da peça de baixo do símbolo (V), uma camada acima
  da próxima seção.
  Com prefers-reduced-motion: tudo no estado final, sem animação.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { site } from '../../config/site'
import { prefersReducedMotion } from '../../composables/useSmoothScroll'
import NumberedButton from '../ui/NumberedButton.vue'

gsap.registerPlugin(ScrollTrigger, SplitText)

const root = ref(null)
const title = ref(null)
let ctx
let mm

const numero = (i) => String(i + 1).padStart(2, '0')

onMounted(() => {
  if (prefersReducedMotion()) return

  // Espera as fontes (o título é dividido em letras) e roda depois da cena fixa
  // acima (refreshPriority -1): a posição dos gatilhos depende do pin dela.
  document.fonts.ready.then(() => {
    if (!root.value) return
    const st = { refreshPriority: -1, invalidateOnRefresh: true }

    ctx = gsap.context(() => {
      // Título: letras surgem do desfoque, em ordem aleatória.
      const split = SplitText.create(title.value, { type: 'chars', aria: 'auto' })
      gsap.from(split.chars, {
        filter: 'blur(20px)',
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: { each: 0.02, from: 'random' },
        scrollTrigger: { ...st, trigger: title.value, start: 'top 80%' },
      })
    }, root.value)

    mm = gsap.matchMedia()
    // Desktop: expansão + empilhamento. Mobile: só expansão.
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767.98px)' }, ({ conditions }) => {
      const margin = conditions.desktop ? 48 : 32 // 24 px de cada lado / 16 px no mobile
      const slots = gsap.utils.toArray('[data-slot]', root.value)

      slots.forEach((slot, i) => {
        const card = slot.querySelector('[data-card]')
        const media = slot.querySelector('[data-media]')
        const legenda = slot.querySelector('[data-legenda]')
        const finalW = () => slot.clientWidth - margin
        const finalH = () => slot.clientHeight

        // Expansão: de 60% a 100%, cantos de 6vw a 16 px.
        const expand = {
          ...st,
          trigger: slot,
          start: 'top bottom',
          end: conditions.desktop ? 'top 24px' : 'center center',
          scrub: 1,
        }
        gsap.fromTo(
          card,
          { width: () => finalW() * 0.6, height: () => finalH() * 0.6, borderRadius: () => window.innerWidth * 0.06 },
          { width: finalW, height: finalH, borderRadius: 16, ease: 'none', scrollTrigger: expand },
        )
        // Imagem: P&B → cor.
        gsap.fromTo(
          media,
          { filter: 'saturate(0)' },
          { filter: 'saturate(1)', ease: 'none', scrollTrigger: { ...expand, start: 'top 70%' } },
        )
        // Legenda: aparece no fim da expansão.
        gsap.fromTo(
          legenda,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: 'none', scrollTrigger: { ...expand, start: conditions.desktop ? 'top 20%' : 'top 40%' } },
        )

        // Empilhamento (desktop): o card de baixo encolhe e escurece.
        if (conditions.desktop && i > 0) {
          const prev = slots[i - 1].querySelector('[data-card]')
          gsap.fromTo(
            prev,
            { scale: 1, filter: 'brightness(1)' },
            {
              scale: 0.92,
              filter: 'brightness(0.5)',
              ease: 'none',
              scrollTrigger: { ...st, trigger: slot, start: 'top bottom', end: 'top 24px', scrub: 1 },
            },
          )
        }
      })
    })

    ScrollTrigger.refresh()
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  ctx?.revert()
})
</script>

<template>
  <section id="cases" ref="root" aria-labelledby="cases-titulo" class="relative z-30 -mt-px text-branco">
    <!-- -mt-px: sobrepõe 1 px ao fim azul da cena acima, para não aparecer linha na emenda -->
    <div class="bg-azul px-gutter pt-[clamp(96px,11.2vw,161px)] pb-[clamp(96px,11vw,160px)]">
      <header class="mx-auto flex max-w-[1100px] flex-col gap-8 text-center">
        <h2 id="cases-titulo" ref="title" class="text-h2">
          Marcas que voltaram <br />
          <span class="text-branco/45">mais fortes.</span>
        </h2>
        <p class="text-corpo text-branco/75">
          Alguns dos negócios que cresceram com estratégia, conteúdo e constância.
        </p>
      </header>

      <!-- Cada card fica num "slot" de altura fixa (a expansão não mexe no layout).
           No desktop os slots são sticky e, como são irmãos, os cards se empilham. -->
      <ol class="mt-14 flex flex-col gap-6 md:gap-[40svh] md:pb-[30svh]">
        <li
          v-for="(item, i) in site.cases"
          :key="item.name"
          data-slot
          class="-mx-gutter flex h-[70svh] items-center justify-center md:sticky md:top-6 md:h-[calc(100svh-48px)]"
        >
          <article
            data-card
            class="relative h-full w-[calc(100%-32px)] overflow-hidden rounded-card bg-azul will-change-[width,height] md:w-[calc(100%-48px)]"
          >
            <!-- imagem (ou placeholder do Figma) -->
            <div data-media class="absolute inset-0 bg-branco/16">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="`Trabalho para ${item.name}`"
                :loading="i === 0 ? 'eager' : 'lazy'"
                class="size-full object-cover object-center"
              />
              <div v-else class="flex size-full flex-col items-center justify-center gap-2.5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span class="text-label text-branco/60">Imagem do case 16:9</span>
              </div>
            </div>

            <!-- legenda -->
            <div
              data-legenda
              class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 md:inset-x-8 md:bottom-7"
            >
              <div class="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-2">
                <h3 class="text-h3 whitespace-nowrap">{{ item.name }}</h3>
                <span class="text-label rounded-btn border border-branco/35 px-2.5 py-1.5">{{ item.segment }}</span>
              </div>
              <NumberedButton :href="item.href" :numero="numero(i)" :label="`Ver o case ${item.name}`" />
            </div>
          </article>
        </li>
      </ol>
    </div>

    <!-- Ponta da peça de baixo do símbolo (Figma: "Fundo / ponta do símbolo", src/assets/cases-ponta.svg).
         Fica uma camada acima da próxima seção, que deve entrar por baixo dela. -->
    <svg
      class="block h-[16.2vw] w-full fill-azul"
      viewBox="0 0 1440 233.3"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 0H1440L726.491 231.89C722.272 233.26 717.728 233.26 713.509 231.89L0 0Z" />
    </svg>
  </section>
</template>
