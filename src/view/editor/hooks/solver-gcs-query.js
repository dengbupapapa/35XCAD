import {
  usePoints as usePointsGCS,
  usePointsHash as usePointsHashGCS,
  useArcs as useArcsGCS,
  useArcsHash as useArcsHashGCS,
  useNumerals as useNumeralsGCS,
  useNumeralsHash as useNumeralsHashGCS,
  useNumeralsPtrHash as useNumeralsPtrHashGCS,
  useConstraints as useConstraintsGCS,
  useConstraintsHash as useConstraintsHashGCS,
  useResults as useResultsGCS,
  useResultsHash as useResultsHashGCS,
  useSystems as useSystemsGCS,
  useUnknownsSet as useUnknownsSetGCS,
  useUnknownsSetJSON as useUnknownsSetJSONGCS,
} from './solver-gcs-provide-context.js'

export function usePoints() {
  let points = usePointsGCS()
  let pointsHash = usePointsHashGCS()
  return {
    get(id) {
      return pointsHash[id]
    },
    getByIndex(index) {
      return points[index]
    },
    indexOf(point) {
      return points.indexOf(point)
    },
  }
}

export function useArcs() {
  let arcsHashGCS = useArcsHashGCS()
  let arcsGCS = useArcsGCS()
  return {
    get(id) {
      return arcsHashGCS[id]
    },
    getByIndex(index) {
      return arcsGCS[index]
    },
    indexOf(arc) {
      return arcsGCS.indexOf(arc)
    },
  }
}

export function useNumerals() {
  let numeralsHash = useNumeralsHashGCS()
  let numeralsPtrHash = useNumeralsPtrHashGCS()
  let numerals = useNumeralsGCS()
  return {
    get(id) {
      return numeralsHash[id]
    },
    getByPtr(ptr) {
      return numeralsPtrHash[ptr]
    },
    getByIndex(index) {
      return numerals[index]
    },
    indexOf(numeral) {
      return numerals.indexOf(numeral)
    },
  }
}
export function useConstraints() {
  let constraints = useConstraintsGCS()
  let constraintsHash = useConstraintsHashGCS()
  return {
    get(id) {
      return constraintsHash[id]
    },
    getByIndex(index) {
      return constraints[index]
    },
    indexOf(system) {
      return constraints.indexOf(system)
    },
  }
}

export function useSystems() {
  let systems = useSystemsGCS()
  return {
    getByIndex(index) {
      return systems[index]
    },
    indexOf(system) {
      return systems.indexOf(system)
    },
    get(id) {
      return systems.find((system) => system.id === id)
    },
    get active() {
      return systems.find(({ active }) => active)
    },
  }
}
export function useResults() {
  let results = useResultsGCS()
  let resultsHash = useResultsHashGCS()
  return {
    get(id) {
      return resultsHash.value[id]
    },
    getByIndex(index) {
      return results.value[index]
    },
    indexOf(result) {
      return results.value.indexOf(result)
    },
    backup(id) {
      return this.get(id).snapshot
    },
  }
}

export function useUnknownsSet() {
  let unknownsSetJSONGCS = useUnknownsSetJSONGCS()
  let unknownsSet = useUnknownsSetGCS()
  let numeralsQuery = useNumerals()
  let systemsQuery = useSystems()
  let resultsQuery = useResults()
  return {
    stable() {
      let unknowns = this.active
      let unknownsJSON = unknownsSetJSONGCS.value[unknowns.id]
      let numerls = unknownsJSON.map((id) => numeralsQuery.get(id))
      let system = systemsQuery.get(unknowns.creator)
      let result = resultsQuery.get(system.result)
      let stables = numerls.filter(({ ptr }) => !result.dependents.includes(ptr))
      return stables
    },
    get active() {
      return unknownsSet.find(({ active }) => active)
    },
  }
}
