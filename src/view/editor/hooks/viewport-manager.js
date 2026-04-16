import {
  usePoints as usePointsViewport,
  useLines as useLinesViewport,
  useTexts as useTextsViewport,
} from './viewport-provide-context'
import {
  useDimensionDistances as useDimensionDistancesGeometryMapper,
  useTexts as useTextsGeometryMapper,
} from './geometry-mapper'
import {
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  useTexts as useTextsGeometryQuery,
  usePlanes as usePlanesGeometryQuery,
} from './geometry-query'
import { useTexts as useTextsGeometryManager } from './geometry-manager'
import configGLStyle from '../config-ui.json'
export function usePoints() {
  let pointsViewport = usePointsViewport()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let textsGeometryMapper = useTextsGeometryMapper()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    async add(id) {
      // setTimeout(() => {
      let pointGeometry = pointsGeometryQuery.get(id)
      if (textsGeometryMapper.hasFormPointId(id)) {
        let text = textsGeometryMapper.getFormPointId(id)
        if (dimensionDistancesGeometryMapper.hasFormText(text)) {
          return pointsViewport.add(
            [pointGeometry.x, pointGeometry.y, pointGeometry.z],
            configGLStyle['dimension-distance-numerical-point-size'],
            configGLStyle['dimension-distance-numerical-point-color'],
          )
        }
      }
      if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
        return pointsViewport.add(
          [pointGeometry.x, pointGeometry.y, pointGeometry.z],
          configGLStyle['dimension-distance-point-size'],
          configGLStyle['dimension-distance-point-color'],
        )
      }

      pointsViewport.add([pointGeometry.x, pointGeometry.y, pointGeometry.z])
      // })
    },
    remove(index) {
      pointsViewport.remove(index)
    },
    translation(index, position) {
      pointsViewport.translation(index, position)
    },
    async activate(id) {
      let pointsGeometry = pointsGeometryQuery.get(id)
      let index = pointsGeometryQuery.indexOf(pointsGeometry)
      // setTimeout(() => {
      if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
        pointsViewport.color(index, configGLStyle['dimension-distance-point-color-activated'])
        pointsViewport.size(index, configGLStyle['dimension-distance-point-size-activated'])
        return
      }
      pointsViewport.color(index, configGLStyle['point-color-activated'])
      pointsViewport.size(index, configGLStyle['point-size-activated'])
      // })
    },
    async deactivate(id) {
      let pointsGeometry = pointsGeometryQuery.get(id)
      let index = pointsGeometryQuery.indexOf(pointsGeometry)
      // setTimeout(() => {
      if (dimensionDistancesGeometryMapper.hasFormPointId(id)) {
        pointsViewport.color(index, configGLStyle['dimension-distance-point-color'])
        pointsViewport.size(index, configGLStyle['dimension-distance-point-size'])
        return
      }
      pointsViewport.color(index, configGLStyle['point-color'])
      pointsViewport.color(index, configGLStyle['point-size'])
      // })
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
    async add(id) {
      let lineGeometry = linesGeometryQuery.get(id)
      let pointGeometryStart = pointsGeometryQuery.get(lineGeometry.start)
      let pointGeometryEnd = pointsGeometryQuery.get(lineGeometry.end)
      // setTimeout(() => {
      if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
        return linesViewport.add(
          [pointGeometryStart.x, pointGeometryStart.y, pointGeometryStart.z],
          [pointGeometryEnd.x, pointGeometryEnd.y, pointGeometryEnd.z],
          configGLStyle['dimension-distance-line-width'],
          configGLStyle['dimension-distance-line-color'],
        )
      }
      linesViewport.add(
        [pointGeometryStart.x, pointGeometryStart.y, pointGeometryStart.z],
        [pointGeometryEnd.x, pointGeometryEnd.y, pointGeometryEnd.z],
      )
      // })
    },
    remove(index) {
      linesViewport.remove(index)
    },
    translation(index, start, end) {
      linesViewport.translation(index, start, end)
    },
    async activate(id) {
      let lineGeometry = linesGeometryQuery.get(id)
      let index = linesGeometryQuery.indexOf(lineGeometry)
      // setTimeout(() => {
      if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
        linesViewport.lineColor(index, configGLStyle['dimension-distance-line-color-activated'])
        linesViewport.lineWidth(index, configGLStyle['dimension-distance-line-width-activated'])
        return
      }
      linesViewport.lineColor(index, configGLStyle['line-color-activated'])
      linesViewport.lineWidth(index, configGLStyle['line-width-activated'])
      // })
    },
    async deactivate(id) {
      let lineGeometry = linesGeometryQuery.get(id)
      let index = linesGeometryQuery.indexOf(lineGeometry)
      // setTimeout(() => {
      if (dimensionDistancesGeometryMapper.hasFormLineId(id)) {
        linesViewport.lineColor(index, configGLStyle['dimension-distance-line-color'])
        linesViewport.lineWidth(index, configGLStyle['dimension-distance-line-width'])
        return
      }
      linesViewport.lineColor(index, configGLStyle['line-color'])
      linesViewport.lineWidth(index, configGLStyle['line-width'])
      // })
    },
    hover() {},
  }
}

export function useTexts() {
  let textsViewport = useTextsViewport()
  let textsGeometryQuery = useTextsGeometryQuery()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  // let textsGeometryManager = useTextsGeometryManager()
  return {
    add(id) {
      let textGeometry = textsGeometryQuery.get(id)
      let planeGeometry = planesGeometryQuery.get(textGeometry.plane)
      let pointGeometry = pointsGeometryQuery.get(textGeometry.point)
      let lineGeometry = linesGeometryQuery.get(textGeometry.line)
      let pointStart = pointsGeometryQuery.get(lineGeometry.start)
      let pointEnd = pointsGeometryQuery.get(lineGeometry.end)

      return textsViewport.add(
        textGeometry.content,
        [pointGeometry.x, pointGeometry.y, pointGeometry.z],
        [pointEnd.x - pointStart.x, pointEnd.y - pointStart.y, pointEnd.z - pointStart.z],
        planeGeometry,
      )
    },
    transform(indexs, position, direction, plane) {
      textsViewport.transform(indexs, position, direction, plane)
    },
    content(indexs, value) {
      textsViewport.content(indexs, value)
    },
    remove(id) {
      let textGeometry = textsGeometryQuery.get(id)
      let indexs = textGeometry.indexs
      let changeMap = textsViewport.remove(indexs)

      return changeMap
    },
  }
}
