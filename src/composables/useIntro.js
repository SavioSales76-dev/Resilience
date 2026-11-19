// Coordena o loader com a entrada da página.
// - introStart: o loader terminou de encher e começou a expandir → as colunas da hero sobem.
// - introRevealed: a janela do símbolo cobriu a tela toda → título e header entram.
// - introEnd: o loader saiu da tela → libera o scroll.
let resolveStart
let resolveRevealed
let resolveEnd
let ended = false

export const introStart = new Promise((r) => (resolveStart = r))
export const introRevealed = new Promise((r) => (resolveRevealed = r))
export const introEnd = new Promise((r) => (resolveEnd = r))

export const startIntro = () => resolveStart()
export const revealIntro = () => resolveRevealed()
export const endIntro = () => {
  ended = true
  // garante a ordem, mesmo se o loader for pulado (movimento reduzido)
  resolveStart()
  resolveRevealed()
  resolveEnd()
}
export const isIntroEnded = () => ended
