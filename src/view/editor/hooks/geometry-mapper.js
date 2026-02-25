import {
  useArcs as useArcsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
} from './geometry-query.js'

export function useArcs() {
  let arcsGeometryQuery = useArcsGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    getFormPointIndex(index) {
      let point = pointsGeometryQuery.getByIndex(index)
      let arc = arcsGeometryQuery.getFormPoint(point)
      return arc
    },
  }
}

export function useLines() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    getFormPointIndex(index) {
      let point = pointsGeometryQuery.getByIndex(index)
      let line = linesGeometryQuery.getFormPoint(point)
      return line
    },
  }
}
