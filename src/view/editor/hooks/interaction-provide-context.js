import { provide, inject, ref, shallowRef, onMounted, onUnmounted } from 'vue'

export default function useRegistry() {
  const selectPoints = ref([])
  const selectPointsStrict = ref([])
  const selectLines = ref([])
  const selectLinesStrict = ref([])
  provide(selectPointsSymbol, selectPoints)
  provide(selectPointsStrictSymbol, selectPointsStrict)
  provide(selectLinesSymbol, selectLines)
  provide(selectLinesStrictSymbol, selectLinesStrict)

  const selectableConstraints = ref([])
  provide(selectableConstraintsSymbol, selectableConstraints)

  const activeElement = shallowRef()
  provide(activeElementSymbol, activeElement)
  function onMousedownSaveActiveElement(event) {
    activeElement.value = event.target
  }
  onMounted(() => {
    document.addEventListener('mousedown', onMousedownSaveActiveElement)
  })
  onUnmounted(() => {
    document.removeEventListener('mousedown', onMousedownSaveActiveElement)
  })
}

const selectPointsSymbol = Symbol('selectPoints')
const selectPointsStrictSymbol = Symbol('selectPointsStrict')
const selectLinesSymbol = Symbol('selectLines')
const selectLinesStrictSymbol = Symbol('selectLinesStrict')
const selectableConstraintsSymbol = Symbol('selectableConstraints')
const activeElementSymbol = Symbol('activeElement')
export function useSelectPoints() {
  return inject(selectPointsSymbol)
}
export function useSelectPointsStrict() {
  return inject(selectPointsStrictSymbol)
}
export function useSelectLines() {
  return inject(selectLinesSymbol)
}
export function useSelectLinesStrict() {
  return inject(selectLinesStrictSymbol)
}
export function useSelectableConstraints() {
  return inject(selectableConstraintsSymbol)
}

export function useActiveElement() {
  return inject(activeElementSymbol)
}
