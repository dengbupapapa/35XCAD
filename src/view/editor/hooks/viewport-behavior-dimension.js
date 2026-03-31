import { onUnmounted, watch } from 'vue'
import { useCamera, useRenderer, useRaycaster } from './viewport-provide-context'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query.js'
import { useDimensionDistances as useDimensionDistancesGeometryDispatch } from './geometry-dispatch.js'
import {
  useDimensionDistances as useDimensionDistancesGeometryMapper,
  useHelpers as useHelpersGeometryMapper,
} from './geometry-mapper'
import useModesManagerInteractions from './modes-manager-interactions.js'
import { useSelectPointsStrict as useSelectPointsStrictInteractionManager } from './interaction-manager.js'
import {
  useSelectPointsStrict as useSelectPointsStrictInteractionQuery,
  useSelectGeometrysStrict as useSelectGeometrysStrictInteractionQuery,
  useSelectGeometrys as useSelectGeometrysInteractionQuery,
} from './interaction-query'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './interaction-dispatch'
import { viewport2ndc } from '../utils/simple'

/*
 * 选中
 */
export function useSelect() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
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
    if (!selectPoints.onMousedown(state, event) && !selectLines.onMousedown(state, event)) {
      selectGeometrysInteractionDispatch.clear()
    }
    // selectLines.onMousedown(state, event)
    if (dimensionDistancePonit2Point.onMousedown()) {
      selectPointsStrictInteractionManager.clear()
    }
  }

  function onMousemove(event) {
    selectPoints.onMousemove({}, event)
    selectLines.onMousemove({}, event)
  }
  function onMouseup(event) {
    selectPoints.onMouseup({}, event)
    selectLines.onMouseup({}, event)
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
    canvas.addEventListener('mousemove', onMousemove)
    canvas.addEventListener('mouseup', onMouseup)
  }
  function removeEventListener() {
    canvas.removeEventListener('mousedown', onMousedown)
    canvas.removeEventListener('mousemove', onMousemove)
    canvas.removeEventListener('mouseup', onMouseup)
  }
  onUnmounted(removeEventListener)
}

import { useSelectPoints as useSelectPointsViewportBehaviorCursor } from './viewport-behavior-cursor'
function useSelectPoints() {
  const raycaster = useRaycaster()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  const selectPointsViewportBehaviorCursor = useSelectPointsViewportBehaviorCursor()
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'point')?.index
      if (typeof index !== 'number' || !~index) {
        return false //不存在点
      }

      //如果选择的是长度约束
      let point = pointsGeometryQuery.getByIndex(index)
      if (dimensionDistancesGeometryMapper.hasFormPoint(point)) {
        selectPointsViewportBehaviorCursor.onMousedown({ x, y }, event)
        return true
      }

      selectPointsStrictInteractionManager.add(point.id)
      selectGeometrysInteractionDispatch.push(point.id)

      return true
    },
    onMousemove({ x, y }, event) {
      selectPointsViewportBehaviorCursor.onMousemove({ x, y }, event)
    },
    onMouseup({ x, y }, event) {
      selectPointsViewportBehaviorCursor.onMouseup({ x, y }, event)
    },
  }
}
import { useSelectLines as useSelectLinesViewportBehaviorCursor } from './viewport-behavior-cursor'
function useSelectLines() {
  const raycaster = useRaycaster()
  const linesGeometryQuery = useLinesGeometryQuery()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  const selectLinesViewportBehaviorCursor = useSelectLinesViewportBehaviorCursor()
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'line')?.index
      if (typeof index !== 'number' || !~index) {
        return false
      }
      let line = linesGeometryQuery.getByIndex(index)
      if (dimensionDistancesGeometryMapper.hasFormLine(line)) {
        selectLinesViewportBehaviorCursor.onMousedown({ x, y }, event)
        return true
      }
      //之后用到做线之间距离的时候后面的逻辑可补充，可能要考虑严格选择线的情况了
      // selectGeometrysInteractionDispatch.push([line.id, line.start, line.end])
      return true
    },
    onMousemove({ x, y }, event) {
      selectLinesViewportBehaviorCursor.onMousemove({ x, y }, event)
    },
    onMouseup({ x, y }, event) {
      selectLinesViewportBehaviorCursor.onMouseup({ x, y }, event)
    },
  }
}

function useDimensionDistancePonit2Point() {
  const selectPointsStrictInteractionQuery = useSelectPointsStrictInteractionQuery()
  const dimensionDistancesGeometryDispatch = useDimensionDistancesGeometryDispatch()
  const dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  return {
    onMousedown() {
      let selectPointsStrict = selectPointsStrictInteractionQuery.get()
      if (selectPointsStrict.length !== 2) return false
      if (selectPointsStrict.some((id) => dimensionDistancesGeometryMapper.hasFormPointId(id))) {
        return false
      }
      let dimensionDistance = dimensionDistancesGeometryDispatch.addPonit2Point(
        ...selectPointsStrict,
      )
      dimensionDistancesGeometryDispatch.activate(dimensionDistance.lines[0])
      return true
    },
  }
}

/*
 * 移动
 */
import { useMove as useMoveViewportBehaviorCursor } from './viewport-behavior-cursor'
export function useMove() {
  const modesManagerInteractions = useModesManagerInteractions()
  const moveViewportBehaviorCursor = useMoveViewportBehaviorCursor(false)
  const selectGeometrysInteractionQuery = useSelectGeometrysInteractionQuery()
  const helpersGeometryMapper = useHelpersGeometryMapper()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const renderer = useRenderer()
  const canvas = renderer.element()

  function onMousedown(event) {
    // let selectedHelpersGeometry = selectGeometrysInteractionQuery.get().filter((id) => {
    //   return helpersGeometryMapper.hasFormPointId(id) || helpersGeometryMapper.hasFormLineId(id)
    // })
    let selectedNonHelpersGeometry = selectGeometrysInteractionQuery.get().filter((id) => {
      return !helpersGeometryMapper.hasFormPointId(id) && !helpersGeometryMapper.hasFormLineId(id)
    })
    if (selectedNonHelpersGeometry.length > 0) {
      selectGeometrysInteractionDispatch.set(selectedNonHelpersGeometry)
      return
    }
    moveViewportBehaviorCursor.onMousedown(event)
  }
  function onMousemove(event) {
    moveViewportBehaviorCursor.onMousemove(event)
  }
  function onMouseup(event) {
    moveViewportBehaviorCursor.onMouseup(event)
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
    canvas.addEventListener('mousemove', onMousemove)
    canvas.addEventListener('mouseup', onMouseup)
  }
  function removeEventListener() {
    canvas.removeEventListener('mousedown', onMousedown)
    canvas.removeEventListener('mousemove', onMousemove)
    canvas.removeEventListener('mouseup', onMouseup)
  }
  onUnmounted(removeEventListener)
}
