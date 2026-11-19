import { computed, ref } from 'vue'

// Mesmo contrato dos ícones do Lucide Animated (lucide-animated.com):
// sem a prop `active`, o ícone anima no próprio hover;
// com `active`, quem controla é o componente pai (ex.: hover do botão inteiro).
export function useIconState(props) {
  const hovered = ref(false)
  const isActive = computed(() => (props.active === undefined ? hovered.value : props.active))
  const state = computed(() => (isActive.value ? 'animate' : 'normal'))
  return {
    state,
    onEnter: () => (hovered.value = true),
    onLeave: () => (hovered.value = false),
  }
}

export const iconProps = {
  size: { type: Number, default: 28 },
  active: { type: Boolean, default: undefined },
}
