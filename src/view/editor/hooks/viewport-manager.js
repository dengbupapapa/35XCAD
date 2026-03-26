import {
  usePoints as usePointsViewport,
  useLines as useLinesViewport,
} from './viewport-provide-context'
import { useDimensionDistances as useDimensionDistancesGeometryMapper } from './geometry-mapper'
import {
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
} from './geometry-query'
import configGLStyle from '../config-gl-style.json'
export function usePoints() {
  let pointsViewport = usePointsViewport()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    add(id, position) {
      setTimeout(() => {
        if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
          let pointGeometry = pointsGeometryQuery.get(id)
          return pointsViewport.add(
            [pointGeometry.x, pointGeometry.y, pointGeometry.z],
            configGLStyle['dimension-distance-point-size'],
            configGLStyle['dimension-distance-point-color'],
          )
        }
        pointsViewport.add(position)
      })
    },
    remove(index) {
      pointsViewport.remove(index)
    },
    translation(index, position) {
      pointsViewport.translation(index, position)
    },
    activate(id) {
      let pointsGeometry = pointsGeometryQuery.get(id)
      let index = pointsGeometryQuery.indexOf(pointsGeometry)
      if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
        pointsViewport.color(index, configGLStyle['dimension-distance-point-color-activated'])
        pointsViewport.size(index, configGLStyle['dimension-distance-point-size-activated'])
        return
      }
      pointsViewport.color(index, configGLStyle['point-color-activated'])
      pointsViewport.size(index, configGLStyle['point-size-activated'])
    },
    deactivate(id) {
      let pointsGeometry = pointsGeometryQuery.get(id)
      let index = pointsGeometryQuery.indexOf(pointsGeometry)
      if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
        pointsViewport.color(index, configGLStyle['dimension-distance-point-color'])
        pointsViewport.size(index, configGLStyle['dimension-distance-point-size'])
        return
      }
      pointsViewport.color(index, configGLStyle['point-color'])
      pointsViewport.color(index, configGLStyle['point-size'])
    },
    hover() {},
  }
}

export function useLines() {
  let linesViewport = useLinesViewport()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    add(id, start, end) {
      setTimeout(() => {
        if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
          let lineGeometry = linesGeometryQuery.get(id)
          let pointGeometryStart = pointsGeometryQuery.get(lineGeometry.start)
          let pointGeometryEnd = pointsGeometryQuery.get(lineGeometry.end)
          return linesViewport.add(
            [pointGeometryStart.x, pointGeometryStart.y, pointGeometryStart.z],
            [pointGeometryEnd.x, pointGeometryEnd.y, pointGeometryEnd.z],
            configGLStyle['dimension-distance-line-width'],
            configGLStyle['dimension-distance-line-color'],
          )
        }
        linesViewport.add(start, end)
      })
    },
    remove(index) {
      linesViewport.remove(index)
    },
    translation(index, start, end) {
      linesViewport.translation(index, start, end)
    },
    activate(id) {
      let lineGeometry = linesGeometryQuery.get(id)
      let index = linesGeometryQuery.indexOf(lineGeometry)
      if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
        linesViewport.lineColor(index, configGLStyle['dimension-distance-line-color-activated'])
        linesViewport.lineWidth(index, configGLStyle['dimension-distance-line-width-activated'])
        return
      }
      linesViewport.lineColor(index, configGLStyle['line-color-activated'])
      linesViewport.lineWidth(index, configGLStyle['line-width-activated'])
    },
    deactivate(id) {
      let lineGeometry = linesGeometryQuery.get(id)
      let index = linesGeometryQuery.indexOf(lineGeometry)
      if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
        linesViewport.lineColor(index, configGLStyle['dimension-distance-line-color'])
        linesViewport.lineWidth(index, configGLStyle['dimension-distance-line-width'])
        return
      }
      linesViewport.lineColor(index, configGLStyle['line-color'])
      linesViewport.lineWidth(index, configGLStyle['line-width'])
    },
    hover() {},
  }
}
