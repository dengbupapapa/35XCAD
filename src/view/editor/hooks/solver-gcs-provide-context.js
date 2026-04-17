import { provide, inject, ref, shallowRef } from 'vue'
import gcs from 'gcs'
import { throttle } from 'lodash-es'

export default function useRegistry() {
  let status = ref('pending')
  let Module
  function ModuleCallback() {
    // console.log(Module)
    return Module
  }
  let unknowns
  function unknownsCallback() {
    return unknowns
  }
  const systems = []
  const unknownsSet = []
  const unknownsSetJSON = ref({})
  const drivenParamsSet = []
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
  const solverResult = ref({})
  provide(moduleSymbol, ModuleCallback)
  provide(unknownsSymbol, unknownsCallback)
  provide(systemsSymbol, systems)
  provide(unknownsSetSymbol, unknownsSet)
  provide(unknownsSetJSONSymbol, unknownsSetJSON)
  provide(drivenParamsSetSymbol, drivenParamsSet)

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
  provide(solverResultSymbol, solverResult)
  gcs()
    .then((M) => {
      Module = M
      unknowns = new Module.Unknowns()
      // let solveThrottle = throttle(function (...args) {
      //   return this.solve.apply(this, args)
      // }, 0)
      // M.System.prototype.solveThrottle = function (...args) {
      //   return solveThrottle.apply(this, args)
      // }
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
const unknownsSymbol = Symbol('unknowns')
const unknownsSetSymbol = Symbol('unknownsSet')
const unknownsSetJSONSymbol = Symbol('unknownsSetJSON')
const drivenParamsSetSymbol = Symbol('drivenParamsSet')
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
const solverResultSymbol = Symbol('solverResult')
export function useStatus() {
  return inject(statusSymbol)
}
export function useModule() {
  return inject(moduleSymbol)()
}
export function useUnknowns() {
  return inject(unknownsSymbol)()
}
export function useSystems() {
  return inject(systemsSymbol)
}
export function useUnknownsSet() {
  return inject(unknownsSetSymbol)
}
export function useDrivenParamsSet() {
  return inject(drivenParamsSetSymbol)
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
export function useSolverResult() {
  return inject(solverResultSymbol)
}
