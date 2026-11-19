# Resilience

Landing page da Resilience, agência de marketing focada em gestão de redes sociais.

## Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) com os tokens da marca em `src/styles/main.css`
- [GSAP](https://gsap.com/) (`ScrollTrigger`, `SplitText`) e [Lenis](https://lenis.darkroom.engineering/) para o scroll suave
- Ícones: `lucide-vue-next`

## Scripts

```bash
npm install
npm run dev      # servidor local
npm run build    # build de produção em dist/
npm run preview  # serve o build
```

## Estrutura

```
src/
  main.js                       # entrada
  App.vue                       # raiz
  styles/main.css               # Tailwind + tokens (cores, fontes, raios)
  composables/useSmoothScroll.js# Lenis + GSAP ScrollTrigger
public/                         # favicon e assets estáticos
```

A paleta padrão do Tailwind está desligada. Só existem `azul`, `preto` e `branco` (ex.: `bg-azul`, `text-preto/65`).
