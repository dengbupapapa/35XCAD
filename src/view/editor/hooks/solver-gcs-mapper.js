import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './geometry-query'
import {
  usePoints as usePointsGCSQuery,
  useLines as useLinesGCSQuery,
  useArcs as useArcsGCSQuery,
} from './solver-gcs-query'

export function usePoints() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  return {
    getByGeometry(geometry) {
      let pointsGeometry = pointsGeometryQuery.get(geometry)
      let pointsGCS = pointsGCSQuery.get(pointsGeometry.gcs)
      return pointsGCS
    },
  }
}

export function useLines() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let linesGCSQuery = useLinesGCSQuery()
  return {
    getByGeometry(geometry) {
      let linesGeometry = linesGeometryQuery.get(geometry)
      let linesGCS = linesGCSQuery.get(linesGeometry.gcs)
      return linesGCS
    },
  }
}

export function useArcs() {
  let arcsGeometryQuery = useArcsGeometryQuery()
  let arcsGCSQuery = useArcsGCSQuery()
  return {
    getByGeometry(geometry) {
      let arcsGeometry = arcsGeometryQuery.get(geometry)
      let arcsGCS = arcsGCSQuery.get(arcsGeometry.gcs)
      return arcsGCS
    },
  }
}
