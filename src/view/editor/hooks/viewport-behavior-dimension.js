import { onUnmounted, watch } from 'vue'
import { useCamera, useRenderer, useRaycaster } from './viewport-provide-context'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query.js'
import { useDimensionDistances as useDimensionDistancesGeometryDispatch } from './geometry-dispatch.js'
import { useDimensionDistances as useDimensionDistancesGeometryMapper } from './geometry-mapper'
import useModesManagerInteractions from './modes-manager-interactions.js'
import { useSelectPointsStrict as useSelectPointsStrictInteractionManager } from './interaction-manager.js'
import { useSelectPointsStrict as useSelectPointsStrictInteractionQuery } from './interaction-query'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './interaction-dispatch'
import { viewport2ndc } from '../utils/simple'

/*
 * 选中
 */
export function useDimension() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const selectPoints = useSelectPoints()
  const selectLines = useSelectLines()
  const dimensionDistancePonit2Point = useDimensionDistancePonit2Point()

  function onMousedown(event) {
    if (event.button !== 0) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromRenderer(renderer)
    raycaster.setFromCamera([x, y], camera)
    let state = { x, y }
    selectPoints.onMousedown(state, event)
    // selectLines.onMousedown(state, event)
    if (dimensionDistancePonit2Point.onMousedown()) {
      selectGeometrysInteractionDispatch.clear()
    }
  }

  watch(
    () => modesManagerInteractions.enable.dimensionAdd,
    (enable) => {
      if (enable) {
        addEventListener()
      } else {
        removeEventListener()
      }
    },
    { immediate: true },
  )

  function addEventListener() {
    canvas.addEventListener('mousedown', onMousedown)
  }
  function removeEventListener() {
    canvas.removeEventListener('mousedown', onMousedown)
  }
  onUnmounted(removeEventListener)
}

function useSelectPoints() {
  const raycaster = useRaycaster()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'point')?.index
      if (typeof index !== 'number' || !~index) {
        return false //不存在点
      }
      let point = pointsGeometryQuery.getByIndex(index)
      if (dimensionDistancesGeometryMapper.hasFormPoint(point)) {
        return //不能选尺寸相关的
      }

      selectPointsStrictInteractionManager.add(point.id)
      selectGeometrysInteractionDispatch.push(point.id)

      return true
    },
  }
}
function useSelectLines() {
  const raycaster = useRaycaster()
  const linesGeometryQuery = useLinesGeometryQuery()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'line')?.index
      if (typeof index !== 'number' || !~index) {
        return false
      }
      let line = linesGeometryQuery.getByIndex(index)
      selectGeometrysInteractionDispatch.push([line.id, line.start, line.end])
      return true
    },
  }
}

function useDimensionDistancePonit2Point() {
  const selectPointsStrictInteractionQuery = useSelectPointsStrictInteractionQuery()
  const dimensionDistancesGeometryDispatch = useDimensionDistancesGeometryDispatch()
  return {
    onMousedown() {
      let selectPointsStrict = selectPointsStrictInteractionQuery.get()
      if (selectPointsStrict.length !== 2) return false
      dimensionDistancesGeometryDispatch.addPonit2Point(...selectPointsStrict)
      return true
    },
  }
}
