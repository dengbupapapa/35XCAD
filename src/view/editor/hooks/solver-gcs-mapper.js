import {
  usePoints as usePointsGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './geometry-query'
import { usePoints as usePointsGCSQuery, useArcs as useArcsGCSQuery } from './solver-gcs-query'

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
