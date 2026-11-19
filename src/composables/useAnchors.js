// Âncoras do menu. Seções dentro de cenas fixas (pin) não ficam na posição
// do DOM, então a cena registra a posição de scroll certa para o id dela.
import { scrollToY } from './useSmoothScroll'

const targets = new Map()

export function registerAnchor(id, getY) {
  targets.set(id, getY)
  return () => targets.delete(id)
}

// Rola até a seção. Retorna false se não houver destino (o link segue o padrão).
export function goToAnchor(id) {
  if (id === 'inicio') {
    scrollToY(0)
    return true
  }
  const getY = targets.get(id)
  const el = document.getElementById(id)
  if (!getY && !el) return false
  scrollToY(getY ? getY() : el.getBoundingClientRect().top + window.scrollY)
  return true
}
