import { computed, unref } from 'vue'
import {
  usePlanes as usePlanesGeometry,
  usePoints as usePointsGeometry,
  useLines as useLinesGeometry,
  useArcs as useArcsGeometry,
  // useConstraints as useConstraintsGeometry,
  usePlanesHash as usePlanesHashGeometry,
  usePointsHash as usePointsHashGeometry,
  useLinesHash as useLinesHashGeometry,
  useArcsHash as useArcsHashGeometry,
  usePolylines as usePolylinesGeometry,
  // useConstraintsHash as useConstraintsHashGeometry,
  // useConstraintsIncrement as useConstraintsIncrementGeometry,
} from './geometry-provide-context.js'
export function usePlane(id) {
  let planes = usePlanesHashGeometry()
  return computed(() => {
    return planes.value[id]
  })
}
export function usePoint(id) {
  let points = usePointsHashGeometry()
  return computed(() => {
    return points.value[id]
  })
}
export function useLine(id) {
  let lines = useLinesHashGeometry()
  return computed(() => {
    return lines.value[id]
  })
}
export function useArc(id) {
  let arcs = useArcsHashGeometry()
  return computed(() => {
    return arcs.value[id]
  })
}
// export function useConstraint(id) {
//   let constraints = useConstraintsHashGeometry()
//   return computed(() => {
//     return constraints.value[id]
//   })
// }
export function useLinePoints(id) {
  let line = useLine(id)
  let pointsHash = usePointsHashGeometry()
  return computed(() => {
    let { start, end } = line.value
    let pointStart = pointsHash.value[start]
    let pointEnd = pointsHash.value[end]
    return [pointStart, pointEnd]
  })
}
export function useArcPoints(id) {
  let arc = useArc(id)
  let pointsHash = usePointsHashGeometry()
  return computed(() => {
    let { center, start, end } = arc.value
    let pointCenter = pointsHash.value[center]
    let pointStart = pointsHash.value[start]
    let pointEnd = pointsHash.value[end]
    return [pointCenter, pointStart, pointEnd]
  })
}

export function usePlanes() {
  let plane = usePlanesGeometry()
  return computed(() => {
    return plane.value
  })
}
export function usePoints() {
  let points = usePointsGeometry()
  return computed(() => {
    return points.value
  })
}
export function useLines() {
  let lines = useLinesGeometry()
  return computed(() => {
    return lines.value
  })
}
export function useArcs() {
  let arcs = useArcsGeometry()
  return computed(() => {
    return arcs.value
  })
}
export function usePolylines() {
  let polylinesGeometry = usePolylinesGeometry()
  return computed(() => {
    return polylinesGeometry.value
  })
}

// export function useConstraints() {
//   let constraintsGeometry = useConstraintsGeometry()
//   return computed(() => {
//     return constraintsGeometry.value
//   })
// }
// export function useConstraintsIncrement() {
//   let constraintsIncrementGeometry = useConstraintsIncrementGeometry()
//   return computed(() => {
//     return constraintsIncrementGeometry.value
//   })
// }
export function usePlanesHash() {
  let planesHash = usePlanesHashGeometry()
  return computed(() => {
    return planesHash.value
  })
}
export function usePointsHash() {
  let pointsHash = usePointsHashGeometry()
  return computed(() => {
    return pointsHash.value
  })
}
export function useLinesHash() {
  let linesHash = useLinesHashGeometry()
  return computed(() => {
    return linesHash.value
  })
}
export function useArcsHash() {
  let arcsHash = useArcsHashGeometry()
  return computed(() => {
    return arcsHash.value
  })
}

export function usePlaneActivaed() {
  let planesGeometry = usePlanesGeometry()
  return computed(() => {
    return planesGeometry.value.find(({ active }) => active)
  })
}
export function usePlaneByIndex(index) {
  let planesGeometry = usePlanesGeometry()
  return computed(() => {
    return planesGeometry.value[index]
  })
}

import {
  useDimensionDistances as useDimensionDistancesGeometryMapper,
  useHelpers as useHelpersGeometryMapper,
} from './geometry-mapper.js'
export function useIsAllDimensionDistances(ids) {
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  return computed(() => {
    return (
      ids.value.every((id) => {
        return (
          dimensionDistancesGeometryMapper.hasFormLineId(id) ||
          dimensionDistancesGeometryMapper.hasFormPointId(id)
        )
      }) && ids.value.length > 0
    )
  })
}

export function useDimensionDistances(ids) {
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  return computed(() => {
    return new Set(
      ids.value
        .filter((id) => {
          return (
            dimensionDistancesGeometryMapper.hasFormLineId(id) ||
            dimensionDistancesGeometryMapper.hasFormPointId(id)
          )
        })
        .map((id) => {
          return (
            dimensionDistancesGeometryMapper.getFormLineId(id) ||
            dimensionDistancesGeometryMapper.getFormPointId(id)
          )
        }),
    )
      .values()
      .toArray()
  })
}

export function useDimensionDistancesLength(ids) {
  let dimensionDistancesGeometryDerived = useDimensionDistances(ids)
  return computed(() => {
    return dimensionDistancesGeometryDerived.value.values().toArray().length
  })
}

export function useNotHelpers(ids) {
  let helpersGeometryMapper = useHelpersGeometryMapper()
  return computed(() => {
    return (
      ids.value.every((id) => {
        return !helpersGeometryMapper.hasFormLineId(id) && !helpersGeometryMapper.hasFormPointId(id)
      }) && ids.value.length > 0
    )
  })
}
