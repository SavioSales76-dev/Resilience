// Geometria do símbolo (paths do asset do Figma "Landing / Loader", src/assets/loader.svg),
// em coordenadas do frame 1440 × 900. Usada pelo loader e pela transição Manifesto → Cases.

export const SYMBOL_PATHS = [
  'M668.696 492.111L537.623 444.354C536.127 443.808 534.624 445.147 534.993 446.696L565.46 574.621C565.622 575.299 566.125 575.845 566.788 576.06L719.882 625.799C720.284 625.93 720.716 625.93 721.118 625.799L874.212 576.06C874.875 575.845 875.378 575.299 875.54 574.621L906.007 446.696C906.376 445.147 904.873 443.808 903.377 444.354L772.304 492.111L721.228 512.06C720.76 512.243 720.24 512.243 719.772 512.06L668.696 492.111Z',
  'M659.764 333.857L505.544 274.367C504.042 273.788 502.506 275.129 502.878 276.695L538.779 427.812C538.938 428.479 539.427 429.019 540.075 429.241L719.85 490.995C720.271 491.14 720.729 491.14 721.15 490.995L900.925 429.241C901.573 429.019 902.062 428.479 902.221 427.812L938.122 276.695C938.494 275.129 936.958 273.788 935.456 274.367L781.236 333.857L721.229 357.352C720.76 357.535 720.24 357.535 719.771 357.352L659.764 333.857Z',
]

// Caixa do símbolo no frame.
export const SYMBOL_BOX = { x: 502.5, y: 273.5, w: 436, h: 353 }
// Centro da peça de cima (origem do crescimento), relativo à caixa.
export const SYMBOL_ORIGIN = { x: 720.5 - SYMBOL_BOX.x, y: 424.2 - SYMBOL_BOX.y }

// Geometria da peça de cima, para saber quanto escalar até ela cobrir a área toda.
const HALF_THICKNESS = 66.8 // da origem até o V de cima / de baixo
const BOTTOM_SLOPE = 0.342 // a borda de baixo sobe em direção às laterais

/**
 * Layout do símbolo centralizado numa área W × H.
 * @param widthPx largura do símbolo na tela no tamanho inicial
 * @returns s0 (escala inicial), s1 (escala que cobre a área inteira), P (ponto fixo do crescimento)
 */
export function symbolLayout(W, H, widthPx) {
  const s0 = widthPx / SYMBOL_BOX.w
  const P = { x: W / 2, y: H / 2 - (SYMBOL_BOX.h / 2 - SYMBOL_ORIGIN.y) * s0 }
  const s1 =
    1.15 *
    Math.max(P.y / HALF_THICKNESS, (H - P.y + (BOTTOM_SLOPE * W) / 2) / HALF_THICKNESS, W / 2 / SYMBOL_ORIGIN.x)
  return { s0, s1, P }
}

// Atributo `transform` que desenha o símbolo com escala `s`, mantendo P parado.
export function symbolTransform(P, s) {
  const tx = P.x - SYMBOL_ORIGIN.x * s
  const ty = P.y - SYMBOL_ORIGIN.y * s
  return `translate(${tx} ${ty}) scale(${s}) translate(${-SYMBOL_BOX.x} ${-SYMBOL_BOX.y})`
}
