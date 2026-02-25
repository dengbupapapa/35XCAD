import {
  usePlanes as usePlanesGeometryManager,
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  useConstraints as useConstraintsGeometryManager,
  //   useConstraintsIncrement as useConstraintsIncrementGeometryManager,
} from './geometry-manager'
import { useSelectPoints } from './interaction-manager.js'
import { cloneDeep } from 'lodash-es'

export function useLoader() {
  let planesGeometryManager = usePlanesGeometryManager()
  let pointsGeometryManager = usePointsGeometryManager()
  let linesGeometryManager = useLinesGeometryManager()
  let polylinesGeometryManager = usePolylinesGeometryManager()
  let arcsGeometryManager = useArcsGeometryManager()
  let constraintsGeometryManager = useConstraintsGeometryManager()
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
      constraintsGeometryManager.load(cloneDeep(constraints))
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
  let constraintsGeometryManager = useConstraintsGeometryManager()

  let selectPoints = useSelectPoints()

  return {
    all() {
      arcsGeometryManager.clear()
      polylinesGeometryManager.clear()
      linesGeometryManager.clear()
      pointsGeometryManager.clear()
      constraintsGeometryManager.clear()
      selectPoints.clear()
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
      constraintsGeometryManager.clear()
    },
  }
}
