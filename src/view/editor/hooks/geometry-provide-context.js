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
  const dimensionDistances = ref([])
  const dimensionDistancesHash = ref({})
  const dimensionDistancesCreatorHash = ref({})
  const dimensionAngles = ref([])
  const dimensionAnglesHash = ref({})
  const increment = ref(0)
  const texts = ref([])
  const textsHash = ref({})

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
  provide(dimensionDistancesSymbol, dimensionDistances)
  provide(dimensionDistancesHashSymbol, dimensionDistancesHash)
  provide(dimensionDistancesCreatorHashSymbol, dimensionDistancesCreatorHash)
  provide(dimensionAnglesSymbol, dimensionAngles)
  provide(dimensionAnglesHashSymbol, dimensionAnglesHash)
  provide(incrementSymbol, increment)
  provide(textsSymbol, texts)
  provide(textsHashSymbol, textsHash)
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
const dimensionDistancesSymbol = Symbol('dimensionDistances')
const dimensionDistancesHashSymbol = Symbol('dimensionDistances-hash')
const dimensionDistancesCreatorHashSymbol = Symbol('dimensionDistances-creator-hash')

const dimensionAnglesSymbol = Symbol('dimensionAngles')
const dimensionAnglesHashSymbol = Symbol('dimensionAngles-hash')
const incrementSymbol = Symbol('increment')

const textsSymbol = Symbol('texts')
const textsHashSymbol = Symbol('textsHash')
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
export function useDimensionDistances() {
  return inject(dimensionDistancesSymbol)
}
export function useDimensionDistancesHash() {
  return inject(dimensionDistancesHashSymbol)
}
export function useDimensionDistancesCreatorHash() {
  return inject(dimensionDistancesCreatorHashSymbol)
}
export function useDimensionAngles() {
  return inject(dimensionAnglesSymbol)
}
export function useDimensionAnglesHash() {
  return inject(dimensionAnglesHashSymbol)
}
export function useIncrement() {
  return inject(incrementSymbol)
}
export function useTexts() {
  return inject(textsSymbol)
}
export function useTextsHash() {
  return inject(textsHashSymbol)
}
