import { provide, inject, ref } from 'vue'

export default function useRegistry() {
  const interactions = ref([])
  provide(interactionsSymbol, interactions)
}

const interactionsSymbol = Symbol('interactions')
export function useInteractions() {
  return inject(interactionsSymbol)
}
