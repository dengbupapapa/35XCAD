import { provide, inject, ref, shallowRef } from 'vue'
import gcs from 'gcs'

export default function useRegistry() {
  let status = ref('pending')
  let Module
  function ModuleCallback() {
    // console.log(Module)
    return Module
  }
  const systems = []
  const unknownsSet = []
  const unknownsSetJSON = ref({})
  const numerals = []
  const numeralsHash = {}
  const numeralsPtrHash = {}
  const numeralsTemp = []
  const points = []
  const pointsHash = {}
  const lines = []
  const linesHash = {}
  const arcs = []
  const arcsHash = {}
  const constraints = []
  const constraintsHash = {}
  const results = ref([])
  const resultsHash = ref({})
  provide(moduleSymbol, ModuleCallback)
  provide(systemsSymbol, systems)
  provide(unknownsSetSymbol, unknownsSet)
  provide(unknownsSetJSONSymbol, unknownsSetJSON)
  provide(numeralsSymbol, numerals)
  provide(numeralsHashSymbol, numeralsHash)
  provide(numeralsPtrHashSymbol, numeralsPtrHash)
  provide(numeralsTempSymbol, numeralsTemp)
  provide(pointsSymbol, points)
  provide(pointsHashSymbol, pointsHash)
  provide(linesSymbol, lines)
  provide(linesHashSymbol, linesHash)
  provide(arcsSymbol, arcs)
  provide(arcsHashSymbol, arcsHash)
  provide(constraintsSymbol, constraints)
  provide(constraintsHashSymbol, constraintsHash)
  provide(resultsSymbol, results)
  provide(resultsHashSymbol, resultsHash)
  gcs()
    .then((M) => {
      Module = M
      status.value = 'resolve'
    })
    .catch((e) => {
      console.error(e)
      status.value = 'reject'
    })
  return {
    status,
  }
}

const statusSymbol = Symbol('status')
const moduleSymbol = Symbol('module')
const unknownsSetSymbol = Symbol('unknownsSet')
const unknownsSetJSONSymbol = Symbol('unknownsSetJSON')
const systemsSymbol = Symbol('systems')
const numeralsSymbol = Symbol('numerals')
const numeralsHashSymbol = Symbol('numeralsHash')
const numeralsPtrHashSymbol = Symbol('numeralsPtrHash')
const numeralsTempSymbol = Symbol('numeralsTemp')
const pointsSymbol = Symbol('points')
const pointsHashSymbol = Symbol('pointsHash')
const linesSymbol = Symbol('lines')
const linesHashSymbol = Symbol('linesHash')
const arcsSymbol = Symbol('arcs')
const arcsHashSymbol = Symbol('arcsHash')
const constraintsSymbol = Symbol('constraints')
const constraintsHashSymbol = Symbol('constraintsHash')
const resultsHashSymbol = Symbol('resultsHash')
const resultsSymbol = Symbol('results')
export function useStatus() {
  return inject(statusSymbol)
}
export function useModule() {
  return inject(moduleSymbol)()
}
export function useSystems() {
  return inject(systemsSymbol)
}
export function useUnknownsSet() {
  return inject(unknownsSetSymbol)
}
export function useUnknownsSetJSON() {
  return inject(unknownsSetJSONSymbol)
}
export function useNumerals() {
  return inject(numeralsSymbol)
}
export function useNumeralsHash() {
  return inject(numeralsHashSymbol)
}
export function useNumeralsPtrHash() {
  return inject(numeralsPtrHashSymbol)
}
export function useNumeralsTemp() {
  return inject(numeralsTempSymbol)
}
export function usePoints() {
  return inject(pointsSymbol)
}
export function usePointsHash() {
  return inject(pointsHashSymbol)
}
export function useLines() {
  return inject(linesSymbol)
}
export function useLinesHash() {
  return inject(linesHashSymbol)
}
export function useArcs() {
  return inject(arcsSymbol)
}
export function useArcsHash() {
  return inject(arcsHashSymbol)
}
export function useConstraints() {
  return inject(constraintsSymbol)
}
export function useConstraintsHash() {
  return inject(constraintsHashSymbol)
}
export function useResults() {
  return inject(resultsSymbol)
}
export function useResultsHash() {
  return inject(resultsHashSymbol)
}
