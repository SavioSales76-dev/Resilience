// Coordena o loader com a entrada da página.
// - introStart: o loader terminou de encher e começou a expandir → a hero entra.
// - introEnd: o loader saiu da tela → libera o scroll.
let resolveStart
let resolveEnd
let ended = false

export const introStart = new Promise((r) => (resolveStart = r))
export const introEnd = new Promise((r) => (resolveEnd = r))

export const startIntro = () => resolveStart()
export const endIntro = () => {
  ended = true
  resolveStart() // garante a ordem, mesmo se o loader for pulado
  resolveEnd()
}
export const isIntroEnded = () => ended
