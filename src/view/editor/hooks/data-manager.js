import {
  usePlanes as usePlanesGeometryManager,
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  useTexts as useTextsGeometryManager,
  useDimensionDistances as useDimensionDistancesGeometryManager,
} from './geometry-manager'
import {
  useConstraints as useConstraintsManager,
  useConstraintsRelation as useConstraintsRelationManager,
  useConstraintsIncrement as useConstraintsIncrementManager,
} from './constraint-manager'
import { useSelectPoints, useSelectPointsStrict, useSelectLines } from './interaction-manager.js'
import { cloneDeep } from 'lodash-es'

export function useLoader() {
  let planesGeometryManager = usePlanesGeometryManager()
  let pointsGeometryManager = usePointsGeometryManager()
  let linesGeometryManager = useLinesGeometryManager()
  let polylinesGeometryManager = usePolylinesGeometryManager()
  let arcsGeometryManager = useArcsGeometryManager()
  let textsGeometryManager = useTextsGeometryManager()
  let dimensionDistancesGeometryManager = useDimensionDistancesGeometryManager()
  let constraintsManager = useConstraintsManager({ effectDdebounce: true })
  let constraintsIncrementManager = useConstraintsIncrementManager()
  let constraintsRelationManager = useConstraintsRelationManager()
  return {
    json(data) {
      let {
        planes = [],
        points = [],
        lines = [],
        polylines = [],
        arcs = [],
        texts = [],
        dimensionDistances = [],
        constraints = [],
        constraintsIncrement = [],
        constraintsRelation = [],
      } = data
      let index = planes.findIndex(({ active }) => active) || 0
      planesGeometryManager.load(cloneDeep(planes))
      planesGeometryManager.active(index)
      // planesGeometryManager.visible(index)
      pointsGeometryManager.load(cloneDeep(points))
      linesGeometryManager.load(cloneDeep(lines))
      polylinesGeometryManager.load(cloneDeep(polylines))
      arcsGeometryManager.load(cloneDeep(arcs))
      textsGeometryManager.load(cloneDeep(texts))
      dimensionDistancesGeometryManager.load(cloneDeep(dimensionDistances))
      constraintsManager.load(cloneDeep(constraints))
      constraintsIncrementManager.set(constraintsIncrement)
      constraintsRelationManager.load(constraintsRelation)
    },
    empty() {
      planesGeometryManager.add([0, 0, 1], 0)
      planesGeometryManager.active(0)
      planesGeometryManager.visible(0)
    },
  }
}

export function useClear() {
  let planesGeometryManager = usePlanesGeometryManager()
  let pointsGeometryManager = usePointsGeometryManager()
  let linesGeometryManager = useLinesGeometryManager()
  let polylinesGeometryManager = usePolylinesGeometryManager()
  let arcsGeometryManager = useArcsGeometryManager()
  let textsGeometryManager = useTextsGeometryManager()
  let dimensionDistancesGeometryManager = useDimensionDistancesGeometryManager()
  let constraintsManager = useConstraintsManager()
  let constraintsIncrementManager = useConstraintsIncrementManager()
  let constraintsRelationManager = useConstraintsRelationManager()

  let selectPoints = useSelectPoints()
  let selectPointsStrict = useSelectPointsStrict()
  let selectLines = useSelectLines()

  return {
    all() {
      selectPoints.clear()
      selectPointsStrict.clear()
      selectLines.clear()
      dimensionDistancesGeometryManager.clear()
      textsGeometryManager.clear()
      arcsGeometryManager.clear()
      polylinesGeometryManager.clear()
      linesGeometryManager.clear()
      pointsGeometryManager.clear()
      constraintsManager.clear()
      planesGeometryManager.clear()
      constraintsRelationManager.clear()
      constraintsIncrementManager.set(0)
      /* [问题]
       * 清理应该在架构层,从下至上
       */
    },
    geometry() {
      dimensionDistancesGeometryManager.clear()
      textsGeometryManager.clear()
      arcsGeometryManager.clear()
      polylinesGeometryManager.clear()
      linesGeometryManager.clear()
      pointsGeometryManager.clear()
      constraintsManager.clear()
    },
  }
}

export function empty() {
  return {
    planes: [],
    points: [],
    lines: [],
    polylines: [],
    arcs: [],
    texts: [],
    dimensionDistances: [],
    constraints: [],
    constraintsIncrement: 0,
    constraintsRelation: [],
  }
}

import {
  usePlanes as usePlanesGeometryDerived,
  usePoints as usePointsGeometryDerived,
  useLines as useLinesGeometryDerived,
  usePolylines as usePolylinesGeometryDerived,
  useArcs as useArcsGeometryDerived,
  // useDimensionDistances as useDimensionDistancesGeometryDerived,
} from './geometry-derived'
import {
  useConstraints as useConstraintsDerived,
  useConstraintsRelation as useConstraintsRelationDerived,
  useConstraintsIncrement as useConstraintsIncrementDerived,
} from './constraint-derived'
import {
  usePointsHash as usePointsHashGCSDerived,
  useNumeralsHash as useNumeralsHashGCSDerived,
  useUnknownsSetJSON as useUnknownsSetJSONGCSDerived,
} from './solver-gcs-derived'
import { watchEffect, toRaw, ref } from 'vue'
export function useDependencyGraph() {
  let pointsGeometryDerived = usePointsGeometryDerived()
  let pointsHashGCSDerived = usePointsHashGCSDerived()
  let numeralsHashGCSDerived = useNumeralsHashGCSDerived()
  let unknownsSetJSONGCSDerived = useUnknownsSetJSONGCSDerived()
  let graph = ref({})
  watchEffect(() => {
    let points = pointsGeometryDerived.value.map((point) => {
      point = { ...point }
      point.gcs = { ...pointsHashGCSDerived[point.gcs] }
      point.gcs.u = { ...numeralsHashGCSDerived[point.gcs.u] }
      point.gcs.v = { ...numeralsHashGCSDerived[point.gcs.v] }
      return toRaw(point)
    })
    graph.value = {
      points,
      unknowns: toRaw(Object.values(unknownsSetJSONGCSDerived.value)[0]),
    }
  })
  return graph
}
