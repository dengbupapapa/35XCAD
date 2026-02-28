import {
  usePlanes as usePlanesGeometryManager,
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  //   useConstraintsIncrement as useConstraintsIncrementGeometryManager,
} from './geometry-manager'
import {
  useConstraints as useConstraintsManager,
  //   useConstraintsIncrement as useConstraintsIncrementGeometryManager,
} from './constraint-manager'
import { useSelectPoints, useSelectPointsStrict, useSelectLines } from './interaction-manager.js'
import { cloneDeep } from 'lodash-es'

export function useLoader() {
  let planesGeometryManager = usePlanesGeometryManager()
  let pointsGeometryManager = usePointsGeometryManager()
  let linesGeometryManager = useLinesGeometryManager()
  let polylinesGeometryManager = usePolylinesGeometryManager()
  let arcsGeometryManager = useArcsGeometryManager()
  let constraintsManager = useConstraintsManager()
  return {
    json(data) {
      let { planes, points, lines, polylines, arcs, constraints } = data
      let index = planes.findIndex(({ active }) => active) || 0
      planesGeometryManager.load(cloneDeep(planes))
      planesGeometryManager.active(index)
      planesGeometryManager.visible(index)
      pointsGeometryManager.load(cloneDeep(points))
      linesGeometryManager.load(cloneDeep(lines))
      polylinesGeometryManager.load(cloneDeep(polylines))
      arcsGeometryManager.load(cloneDeep(arcs))
      constraintsManager.load(cloneDeep(constraints))
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
  let constraintsManager = useConstraintsManager()

  let selectPoints = useSelectPoints()
  let selectPointsStrict = useSelectPointsStrict()
  let selectLines = useSelectLines() 

  return {
    all() {
      selectPoints.clear()
      selectPointsStrict.clear()
      selectLines.clear()
      arcsGeometryManager.clear()
      polylinesGeometryManager.clear()
      linesGeometryManager.clear()
      pointsGeometryManager.clear()
      constraintsManager.clear()
      planesGeometryManager.clear()
      /* [问题]
       * 清理应该在架构层,从下至上
       */
    },
    geometry() {
      arcsGeometryManager.clear()
      polylinesGeometryManager.clear()
      linesGeometryManager.clear()
      pointsGeometryManager.clear()
      constraintsManager.clear()
    },
  }
}
