import { provide, inject, ref, shallowRef } from 'vue'

export default function useRegistry() {
  const planes = ref([])
  const points = ref([])
  const lines = ref([])
  const polylines = ref([])
  const arcs = ref([])
  const planesHash = ref({})
  const pointsHash = ref({})
  const linesHash = ref({})
  const polylinesHash = ref({})
  const arcsHash = ref({})
  // const constraints = ref([])
  // const constraintsHash = ref({})
  // const constraintsPlaneHash = ref({})
  // const constraintsIncrement = ref(0)
  const increment = ref(0)

  provide(pointsSymbol, points)
  provide(planesSymbol, planes)
  provide(linesSymbol, lines)
  provide(polylinesSymbol, polylines)
  provide(arcsSymbol, arcs)
  provide(pointsHashSymbol, pointsHash)
  provide(planesHashSymbol, planesHash)
  provide(linesHashSymbol, linesHash)
  provide(polylinesHashSymbol, polylinesHash)
  provide(arcsHashSymbol, arcsHash)
  // provide(constraintsSymbol, constraints)
  // provide(constraintsHashSymbol, constraintsHash)
  // provide(constraintsPlaneHashSymbol, constraintsPlaneHash)
  // provide(constraintsIncrementSymbol, constraintsIncrement)
  provide(incrementSymbol, increment)
}

const planesSymbol = Symbol('planes')
const pointsSymbol = Symbol('points')
const linesSymbol = Symbol('lines')
const polylinesSymbol = Symbol('polylines')
const arcsSymbol = Symbol('arcs')
const planesHashSymbol = Symbol('planes-hash')
const pointsHashSymbol = Symbol('points-hash')
const linesHashSymbol = Symbol('lines-hash')
const polylinesHashSymbol = Symbol('polylines-hash')
const arcsHashSymbol = Symbol('arcs-hash')
// const constraintsSymbol = Symbol('constraints')
// const constraintsHashSymbol = Symbol('constraintsHash')
// const constraintsPlaneHashSymbol = Symbol('constraintsPlaneHash')
// const constraintsIncrementSymbol = Symbol('constraintsIncrement')
const incrementSymbol = Symbol('increment')
export function usePlanes() {
  return inject(planesSymbol)
}
export function usePoints() {
  return inject(pointsSymbol)
}
export function useLines() {
  return inject(linesSymbol)
}
export function usePolylines() {
  return inject(polylinesSymbol)
}
export function useArcs() {
  return inject(arcsSymbol)
}
export function usePlanesHash() {
  return inject(planesHashSymbol)
}
export function usePointsHash() {
  return inject(pointsHashSymbol)
}
export function useLinesHash() {
  return inject(linesHashSymbol)
}
export function usePolylinesHash() {
  return inject(polylinesHashSymbol)
}
export function useArcsHash() {
  return inject(arcsHashSymbol)
}
// export function useConstraints() {
//   return inject(constraintsSymbol)
// }
// export function useConstraintsHash() {
//   return inject(constraintsHashSymbol)
// }
// export function useConstraintsPlaneHash() {
//   return inject(constraintsPlaneHashSymbol)
// }
// export function useConstraintsIncrement() {
//   return inject(constraintsIncrementSymbol)
// }
export function useIncrement() {
  return inject(incrementSymbol)
}
