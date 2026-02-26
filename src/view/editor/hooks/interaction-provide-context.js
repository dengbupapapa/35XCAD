import { provide, inject, ref } from 'vue'

export default function useRegistry() {
  const selectPoints = ref([])
  const selectPointsStrict = ref([])
  const selectLines = ref([])
  provide(selectPointsSymbol, selectPoints)
  provide(selectPointsStrictSymbol, selectPointsStrict)
  provide(selectLinesSymbol, selectLines)

  const selectableConstraints = ref([])
  provide(selectableConstraintsSymbol, selectableConstraints)
}

const selectPointsSymbol = Symbol('selectPoints')
const selectPointsStrictSymbol = Symbol('selectPointsStrict')
const selectLinesSymbol = Symbol('selectLines')
const selectableConstraintsSymbol = Symbol('selectableConstraints')
export function useSelectPoints() {
  return inject(selectPointsSymbol)
}
export function useSelectPointsStrict() {
  return inject(selectPointsStrictSymbol)
}
export function useSelectLines() {
  return inject(selectLinesSymbol)
}
export function useSelectableConstraints() {
  return inject(selectableConstraintsSymbol)
}
